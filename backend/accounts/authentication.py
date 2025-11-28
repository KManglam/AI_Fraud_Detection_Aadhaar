"""
JWT Authentication backend for Django REST Framework
Supports both legacy JWT tokens and Supabase JWT tokens
"""
import jwt
import logging
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

logger = logging.getLogger(__name__)
User = get_user_model()


class JWTAuthentication(authentication.BaseAuthentication):
    """
    JWT Authentication for REST Framework
    Supports both legacy tokens and Supabase tokens
    """
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
        
        try:
            prefix, token = auth_header.split(' ')
            
            if prefix.lower() != 'bearer':
                return None
            
        except ValueError:
            return None
        
        return self.authenticate_token(token)
    
    def authenticate_token(self, token):
        # Check if it looks like a Supabase JWT (they have 'supabase' in the payload)
        try:
            # Decode without verification to check the issuer
            import base64
            import json
            payload_part = token.split('.')[1]
            # Add padding if needed
            padding = 4 - len(payload_part) % 4
            if padding != 4:
                payload_part += '=' * padding
            payload = json.loads(base64.urlsafe_b64decode(payload_part))
            
            is_supabase_token = payload.get('iss', '').startswith('https://') and 'supabase' in payload.get('iss', '')
        except Exception:
            is_supabase_token = False
        
        if is_supabase_token:
            # Use Supabase authentication
            result = self._authenticate_supabase_token(token)
            if result:
                return result
            # If Supabase auth failed, don't fall back - raise error
            raise exceptions.AuthenticationFailed('Supabase token validation failed')
        
        # Use legacy token authentication
        return self._authenticate_legacy_token(token)
    
    def _authenticate_supabase_token(self, token):
        """
        Authenticate using Supabase JWT token
        """
        try:
            from aadhaar_system.supabase_client import get_supabase_admin
            
            logger.info(f"Attempting Supabase token auth, token prefix: {token[:50]}...")
            
            # Verify token with Supabase
            client = get_supabase_admin()
            response = client.auth.get_user(token)
            
            logger.info(f"Supabase get_user response: {response}")
            
            if not response or not response.user:
                logger.warning("Supabase returned no user")
                return None
            
            supabase_user = response.user
            logger.info(f"Supabase user found: {supabase_user.email}")
            
            # Get or create local user linked to Supabase user
            user = self._get_or_create_user_from_supabase(supabase_user)
            logger.info(f"Local user: {user.username} (id={user.id})")
            
            if not user.is_active:
                raise exceptions.AuthenticationFailed('User is inactive')
            
            # Store supabase user data in request for later use
            return (user, {'token': token, 'supabase_user': supabase_user})
            
        except exceptions.AuthenticationFailed:
            raise
        except Exception as e:
            logger.error(f"Supabase token auth failed: {type(e).__name__}: {e}")
            import traceback
            logger.error(traceback.format_exc())
            # Return None to indicate failure, let caller decide what to do
            return None
    
    def _authenticate_legacy_token(self, token):
        """
        Authenticate using legacy JWT token (for backward compatibility)
        """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            if payload.get('type') != 'access':
                raise exceptions.AuthenticationFailed('Invalid token type')
            
            user = User.objects.get(id=payload['user_id'])
            
            if not user.is_active:
                raise exceptions.AuthenticationFailed('User is inactive')
            
            return (user, token)
        
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')
        
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')
    
    def _get_or_create_user_from_supabase(self, supabase_user):
        """
        Get or create a local Django user from Supabase user data
        """
        email = supabase_user.email
        supabase_id = supabase_user.id
        user_metadata = supabase_user.user_metadata or {}
        
        # Try to find user by supabase_id first, then by email
        try:
            user = User.objects.get(supabase_id=supabase_id)
            return user
        except (User.DoesNotExist, Exception):
            pass
        
        try:
            user = User.objects.get(email=email)
            # Link existing user to Supabase
            if hasattr(user, 'supabase_id') and not user.supabase_id:
                user.supabase_id = supabase_id
                user.save(update_fields=['supabase_id'])
            return user
        except User.DoesNotExist:
            pass
        
        # Create new user
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User.objects.create(
            username=username,
            email=email,
            name=user_metadata.get('name', ''),
            is_active=True,
        )
        
        # Set supabase_id if field exists
        if hasattr(user, 'supabase_id'):
            user.supabase_id = supabase_id
            user.save(update_fields=['supabase_id'])
        
        return user
    
    def authenticate_header(self, request):
        return 'Bearer'


class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Pure Supabase Authentication for REST Framework
    Only authenticates Supabase JWT tokens
    """
    
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
        
        try:
            prefix, token = auth_header.split(' ')
            
            if prefix.lower() != 'bearer':
                return None
            
        except ValueError:
            return None
        
        return self.authenticate_token(token)
    
    def authenticate_token(self, token):
        try:
            from aadhaar_system.supabase_client import get_supabase_admin
            
            client = get_supabase_admin()
            response = client.auth.get_user(token)
            
            if not response or not response.user:
                raise exceptions.AuthenticationFailed('Invalid Supabase token')
            
            supabase_user = response.user
            
            # Get or create local user
            user = self._get_or_create_user(supabase_user)
            
            if not user.is_active:
                raise exceptions.AuthenticationFailed('User is inactive')
            
            return (user, {'token': token, 'supabase_user': supabase_user})
            
        except exceptions.AuthenticationFailed:
            raise
        except Exception as e:
            logger.error(f"Supabase authentication error: {e}")
            raise exceptions.AuthenticationFailed('Authentication failed')
    
    def _get_or_create_user(self, supabase_user):
        """
        Get or create a local Django user from Supabase user data
        """
        email = supabase_user.email
        supabase_id = supabase_user.id
        user_metadata = supabase_user.user_metadata or {}
        
        # Try to find by supabase_id
        try:
            return User.objects.get(supabase_id=supabase_id)
        except (User.DoesNotExist, Exception):
            pass
        
        # Try to find by email
        try:
            user = User.objects.get(email=email)
            if hasattr(user, 'supabase_id') and not user.supabase_id:
                user.supabase_id = supabase_id
                user.save(update_fields=['supabase_id'])
            return user
        except User.DoesNotExist:
            pass
        
        # Create new user
        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        user = User.objects.create(
            username=username,
            email=email,
            name=user_metadata.get('name', ''),
            is_active=True,
        )
        
        if hasattr(user, 'supabase_id'):
            user.supabase_id = supabase_id
            user.save(update_fields=['supabase_id'])
        
        return user
    
    def authenticate_header(self, request):
        return 'Bearer'
