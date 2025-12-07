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
        Uses local JWT verification first (faster), falls back to Supabase API if needed
        """
        try:
            # Try local JWT verification first (faster - no network call)
            user_data = self._verify_supabase_jwt_locally(token)
            
            if user_data:
                logger.info(f"Supabase user verified locally: {user_data.get('email')}")
                # Get or create local user from decoded token data
                user = self._get_or_create_user_from_token_data(user_data)
            else:
                # Fallback to Supabase API verification (slower - network call)
                logger.info("Local JWT verification failed, falling back to Supabase API")
                from aadhaar_system.supabase_client import get_supabase_admin
                client = get_supabase_admin()
                response = client.auth.get_user(token)
                
                if not response or not response.user:
                    logger.warning("Supabase returned no user")
                    return None
                
                supabase_user = response.user
                logger.info(f"Supabase user found via API: {supabase_user.email}")
                user = self._get_or_create_user_from_supabase(supabase_user)
            
            logger.info(f"Local user: {user.username} (id={user.id})")
            
            if not user.is_active:
                raise exceptions.AuthenticationFailed('User is inactive')
            
            return (user, {'token': token, 'user_data': user_data})
            
        except exceptions.AuthenticationFailed:
            raise
        except Exception as e:
            logger.error(f"Supabase token auth failed: {type(e).__name__}: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return None
    
    def _verify_supabase_jwt_locally(self, token):
        """
        Verify Supabase JWT token locally with cryptographic signature verification.
        Fast local verification - no network call required.
        Returns decoded user data or None if verification fails.
        """
        jwt_secret = settings.SUPABASE_JWT_SECRET
        
        if not jwt_secret:
            logger.warning("SUPABASE_JWT_SECRET not configured, falling back to API verification")
            return None
        
        try:
            # Cryptographically verify and decode the JWT token
            # Supabase uses HS256 algorithm with the JWT secret
            payload = jwt.decode(
                token,
                jwt_secret,
                algorithms=['HS256'],
                options={
                    'verify_signature': True,
                    'verify_exp': True,
                    'verify_iat': True,
                    'require': ['exp', 'sub', 'email']
                },
                audience='authenticated',  # Supabase default audience for authenticated users
            )
            
            logger.debug(f"JWT verified locally for user: {payload.get('email')}")
            
            # Extract user data from verified Supabase JWT payload
            return {
                'id': payload.get('sub'),  # Supabase user ID
                'email': payload.get('email'),
                'user_metadata': payload.get('user_metadata', {}),
                'role': payload.get('role'),
            }
            
        except jwt.ExpiredSignatureError:
            logger.warning("Supabase JWT token has expired")
            return None
        except jwt.InvalidAudienceError:
            # Try without audience verification (some Supabase configs may vary)
            try:
                payload = jwt.decode(
                    token,
                    jwt_secret,
                    algorithms=['HS256'],
                    options={'verify_signature': True, 'verify_exp': True}
                )
                return {
                    'id': payload.get('sub'),
                    'email': payload.get('email'),
                    'user_metadata': payload.get('user_metadata', {}),
                    'role': payload.get('role'),
                }
            except Exception as e:
                logger.warning(f"JWT verification failed after audience retry: {e}")
                return None
        except jwt.InvalidSignatureError:
            logger.warning("Invalid JWT signature - possible token forgery attempt")
            return None
        except jwt.DecodeError as e:
            logger.warning(f"JWT decode error: {e}")
            return None
        except Exception as e:
            logger.warning(f"Local JWT verification failed: {e}")
            return None
    
    def _get_or_create_user_from_token_data(self, user_data):
        """
        Get or create a local Django user from decoded token data
        """
        email = user_data.get('email')
        supabase_id = user_data.get('id')
        user_metadata = user_data.get('user_metadata', {})
        
        if not email:
            raise exceptions.AuthenticationFailed('No email in token')
        
        # Try to find user by supabase_id first, then by email
        try:
            user = User.objects.get(supabase_id=supabase_id)
            return user
        except (User.DoesNotExist, Exception):
            pass
        
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
