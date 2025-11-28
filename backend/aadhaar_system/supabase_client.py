"""
Supabase Client Configuration for AadhaarAuth System

This module provides singleton Supabase client instances for:
- Authentication (using anon key for client-side operations)
- Admin operations (using service role key for server-side operations)
- Storage operations
"""
import os
from functools import lru_cache
from supabase import create_client, Client
from django.conf import settings


class SupabaseClient:
    """
    Singleton class to manage Supabase client instances
    """
    _client: Client = None
    _admin_client: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        """
        Get Supabase client with anon key (for client-side operations)
        """
        if cls._client is None:
            url = settings.SUPABASE_URL
            key = settings.SUPABASE_ANON_KEY
            if not url or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
            cls._client = create_client(url, key)
        return cls._client
    
    @classmethod
    def get_admin_client(cls) -> Client:
        """
        Get Supabase client with service role key (for server-side operations)
        This client bypasses Row Level Security (RLS)
        """
        if cls._admin_client is None:
            url = settings.SUPABASE_URL
            key = settings.SUPABASE_SERVICE_ROLE_KEY
            if not url or not key:
                raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
            cls._admin_client = create_client(url, key)
        return cls._admin_client
    
    @classmethod
    def reset_clients(cls):
        """
        Reset client instances (useful for testing)
        """
        cls._client = None
        cls._admin_client = None


def get_supabase() -> Client:
    """
    Convenience function to get the default Supabase client
    """
    return SupabaseClient.get_client()


def get_supabase_admin() -> Client:
    """
    Convenience function to get the admin Supabase client
    """
    return SupabaseClient.get_admin_client()


# Storage helper functions
class SupabaseStorage:
    """
    Helper class for Supabase Storage operations
    """
    
    @staticmethod
    def get_bucket_name() -> str:
        """Get the configured storage bucket name"""
        return settings.SUPABASE_STORAGE_BUCKET
    
    @staticmethod
    def upload_file(file_path: str, file_data: bytes, content_type: str = None) -> dict:
        """
        Upload a file to Supabase Storage
        
        Args:
            file_path: Path within the bucket (e.g., 'documents/user_1/file.jpg')
            file_data: File content as bytes
            content_type: MIME type of the file
            
        Returns:
            dict with upload result including path
        """
        client = get_supabase_admin()
        bucket = SupabaseStorage.get_bucket_name()
        
        options = {}
        if content_type:
            options['content-type'] = content_type
        
        result = client.storage.from_(bucket).upload(
            path=file_path,
            file=file_data,
            file_options=options
        )
        return result
    
    @staticmethod
    def get_public_url(file_path: str) -> str:
        """
        Get the public URL for a file
        
        Args:
            file_path: Path within the bucket
            
        Returns:
            Public URL string
        """
        client = get_supabase_admin()
        bucket = SupabaseStorage.get_bucket_name()
        return client.storage.from_(bucket).get_public_url(file_path)
    
    @staticmethod
    def get_signed_url(file_path: str, expires_in: int = 3600) -> str:
        """
        Get a signed URL for private file access
        
        Args:
            file_path: Path within the bucket
            expires_in: URL expiration time in seconds (default: 1 hour)
            
        Returns:
            Signed URL string
        """
        client = get_supabase_admin()
        bucket = SupabaseStorage.get_bucket_name()
        result = client.storage.from_(bucket).create_signed_url(file_path, expires_in)
        return result.get('signedURL', '')
    
    @staticmethod
    def delete_file(file_path: str) -> dict:
        """
        Delete a file from storage
        
        Args:
            file_path: Path within the bucket
            
        Returns:
            Deletion result
        """
        client = get_supabase_admin()
        bucket = SupabaseStorage.get_bucket_name()
        return client.storage.from_(bucket).remove([file_path])
    
    @staticmethod
    def list_files(folder_path: str = '') -> list:
        """
        List files in a folder
        
        Args:
            folder_path: Folder path within the bucket
            
        Returns:
            List of file objects
        """
        client = get_supabase_admin()
        bucket = SupabaseStorage.get_bucket_name()
        return client.storage.from_(bucket).list(folder_path)
    
    @staticmethod
    def download_file(file_path: str) -> bytes:
        """
        Download a file from storage
        
        Args:
            file_path: Path within the bucket
            
        Returns:
            File content as bytes
        """
        client = get_supabase_admin()
        bucket = SupabaseStorage.get_bucket_name()
        return client.storage.from_(bucket).download(file_path)


# Auth helper functions
class SupabaseAuth:
    """
    Helper class for Supabase Authentication operations
    """
    
    @staticmethod
    def sign_up(email: str, password: str, user_metadata: dict = None) -> dict:
        """
        Register a new user with Supabase Auth
        
        Args:
            email: User's email address
            password: User's password
            user_metadata: Optional metadata (name, etc.)
            
        Returns:
            User and session data
        """
        client = get_supabase_admin()
        options = {}
        if user_metadata:
            options['data'] = user_metadata
        
        response = client.auth.sign_up({
            'email': email,
            'password': password,
            'options': options if options else None
        })
        return response
    
    @staticmethod
    def sign_in(email: str, password: str) -> dict:
        """
        Sign in a user with email and password
        
        Args:
            email: User's email address
            password: User's password
            
        Returns:
            User and session data including access_token
        """
        client = get_supabase()
        response = client.auth.sign_in_with_password({
            'email': email,
            'password': password
        })
        return response
    
    @staticmethod
    def sign_out(access_token: str = None) -> None:
        """
        Sign out the current user
        """
        client = get_supabase()
        client.auth.sign_out()
    
    @staticmethod
    def get_user(access_token: str) -> dict:
        """
        Get user data from access token
        
        Args:
            access_token: JWT access token from Supabase
            
        Returns:
            User data
        """
        client = get_supabase_admin()
        response = client.auth.get_user(access_token)
        return response
    
    @staticmethod
    def refresh_session(refresh_token: str) -> dict:
        """
        Refresh the session using refresh token
        
        Args:
            refresh_token: Refresh token from previous session
            
        Returns:
            New session data with new tokens
        """
        client = get_supabase()
        response = client.auth.refresh_session(refresh_token)
        return response
    
    @staticmethod
    def update_user(access_token: str, updates: dict) -> dict:
        """
        Update user data
        
        Args:
            access_token: User's access token
            updates: Dictionary of updates (email, password, user_metadata)
            
        Returns:
            Updated user data
        """
        client = get_supabase_admin()
        # Set the session first
        client.auth.set_session(access_token, '')
        response = client.auth.update_user(updates)
        return response
    
    @staticmethod
    def admin_delete_user(user_id: str) -> None:
        """
        Delete a user (admin operation)
        
        Args:
            user_id: Supabase user UUID
        """
        client = get_supabase_admin()
        client.auth.admin.delete_user(user_id)
    
    @staticmethod
    def admin_list_users() -> list:
        """
        List all users (admin operation)
        
        Returns:
            List of user objects
        """
        client = get_supabase_admin()
        response = client.auth.admin.list_users()
        return response
