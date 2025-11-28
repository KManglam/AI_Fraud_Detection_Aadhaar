"""
Storage Service for Documents
Supports both local storage and Supabase Storage

Use environment variable USE_SUPABASE_STORAGE=true to enable Supabase Storage
"""
import os
import logging
from io import BytesIO
from datetime import datetime
from django.conf import settings

logger = logging.getLogger(__name__)


class StorageService:
    """
    Unified storage service that can use either local storage or Supabase Storage
    """
    
    def __init__(self):
        self.use_supabase = self._check_supabase_enabled()
        if self.use_supabase:
            self._init_supabase()
    
    def _check_supabase_enabled(self) -> bool:
        """Check if Supabase Storage should be used"""
        use_supabase = os.getenv('USE_SUPABASE_STORAGE', 'true').lower() == 'true'
        has_config = bool(
            getattr(settings, 'SUPABASE_URL', None) and 
            getattr(settings, 'SUPABASE_SERVICE_ROLE_KEY', None)
        )
        return use_supabase and has_config
    
    def _init_supabase(self):
        """Initialize Supabase client"""
        try:
            from aadhaar_system.supabase_client import SupabaseStorage
            self.supabase_storage = SupabaseStorage
            logger.info("Supabase Storage initialized successfully")
        except ImportError as e:
            logger.warning(f"Failed to import Supabase client: {e}. Falling back to local storage.")
            self.use_supabase = False
            self.supabase_storage = None
    
    def _generate_path(self, user_id: int, document_id: int, filename: str, folder: str = 'raw') -> str:
        """
        Generate a unique storage path
        
        Args:
            user_id: ID of the user
            document_id: ID of the document
            filename: Original filename
            folder: Storage folder (raw, processed, thumbnails)
            
        Returns:
            Unique storage path
        """
        date_path = datetime.now().strftime('%Y/%m/%d')
        safe_filename = self._sanitize_filename(filename)
        return f"{folder}/user_{user_id}/{date_path}/{document_id}_{safe_filename}"
    
    def _sanitize_filename(self, filename: str) -> str:
        """Sanitize filename to be safe for storage"""
        # Remove potentially dangerous characters
        safe_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-')
        sanitized = ''.join(c if c in safe_chars else '_' for c in filename)
        return sanitized[:100]  # Limit filename length
    
    def upload_file(self, file_data, user_id: int, document_id: int, filename: str, 
                    folder: str = 'raw', content_type: str = None) -> dict:
        """
        Upload a file to storage
        
        Args:
            file_data: File object or bytes
            user_id: ID of the user
            document_id: ID of the document
            filename: Original filename
            folder: Storage folder
            content_type: MIME type
            
        Returns:
            dict with 'path', 'url', 'storage_type'
        """
        storage_path = self._generate_path(user_id, document_id, filename, folder)
        
        # Convert file object to bytes if needed
        if hasattr(file_data, 'read'):
            file_bytes = file_data.read()
            if hasattr(file_data, 'seek'):
                file_data.seek(0)  # Reset file pointer
        else:
            file_bytes = file_data
        
        if self.use_supabase:
            return self._upload_to_supabase(storage_path, file_bytes, content_type)
        else:
            return self._upload_to_local(storage_path, file_bytes)
    
    def _upload_to_supabase(self, storage_path: str, file_bytes: bytes, content_type: str = None) -> dict:
        """Upload file to Supabase Storage"""
        try:
            self.supabase_storage.upload_file(storage_path, file_bytes, content_type)
            url = self.supabase_storage.get_public_url(storage_path)
            
            return {
                'path': storage_path,
                'url': url,
                'storage_type': 'supabase'
            }
        except Exception as e:
            logger.error(f"Supabase upload error: {e}")
            # Fallback to local storage
            return self._upload_to_local(storage_path, file_bytes)
    
    def _upload_to_local(self, storage_path: str, file_bytes: bytes) -> dict:
        """Upload file to local storage"""
        local_path = os.path.join(settings.MEDIA_ROOT, storage_path)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        with open(local_path, 'wb') as f:
            f.write(file_bytes)
        
        url = f"{settings.MEDIA_URL}{storage_path}"
        
        return {
            'path': storage_path,
            'url': url,
            'storage_type': 'local'
        }
    
    def get_file_url(self, storage_path: str, signed: bool = False, expires_in: int = 3600) -> str:
        """
        Get URL for a file
        
        Args:
            storage_path: Path to the file
            signed: Whether to return a signed URL (for private files)
            expires_in: Expiration time in seconds (for signed URLs)
            
        Returns:
            URL string
        """
        if self.use_supabase:
            if signed:
                return self.supabase_storage.get_signed_url(storage_path, expires_in)
            return self.supabase_storage.get_public_url(storage_path)
        else:
            return f"{settings.MEDIA_URL}{storage_path}"
    
    def download_file(self, storage_path: str) -> bytes:
        """
        Download a file from storage
        
        Args:
            storage_path: Path to the file
            
        Returns:
            File content as bytes
        """
        if self.use_supabase:
            try:
                return self.supabase_storage.download_file(storage_path)
            except Exception as e:
                logger.error(f"Supabase download error: {e}")
                # Fallback to local
                return self._download_from_local(storage_path)
        else:
            return self._download_from_local(storage_path)
    
    def _download_from_local(self, storage_path: str) -> bytes:
        """Download file from local storage"""
        local_path = os.path.join(settings.MEDIA_ROOT, storage_path)
        with open(local_path, 'rb') as f:
            return f.read()
    
    def delete_file(self, storage_path: str) -> bool:
        """
        Delete a file from storage
        
        Args:
            storage_path: Path to the file
            
        Returns:
            True if successful
        """
        if self.use_supabase:
            try:
                self.supabase_storage.delete_file(storage_path)
                return True
            except Exception as e:
                logger.error(f"Supabase delete error: {e}")
                return self._delete_from_local(storage_path)
        else:
            return self._delete_from_local(storage_path)
    
    def _delete_from_local(self, storage_path: str) -> bool:
        """Delete file from local storage"""
        try:
            local_path = os.path.join(settings.MEDIA_ROOT, storage_path)
            if os.path.exists(local_path):
                os.remove(local_path)
            return True
        except Exception as e:
            logger.error(f"Local delete error: {e}")
            return False
    
    def file_exists(self, storage_path: str) -> bool:
        """
        Check if a file exists
        
        Args:
            storage_path: Path to the file
            
        Returns:
            True if file exists
        """
        if self.use_supabase:
            try:
                # Try to get file info
                folder = os.path.dirname(storage_path)
                filename = os.path.basename(storage_path)
                files = self.supabase_storage.list_files(folder)
                return any(f.get('name') == filename for f in files)
            except Exception:
                return False
        else:
            local_path = os.path.join(settings.MEDIA_ROOT, storage_path)
            return os.path.exists(local_path)


# Singleton instance
_storage_service = None


def get_storage_service() -> StorageService:
    """Get the singleton storage service instance"""
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service
