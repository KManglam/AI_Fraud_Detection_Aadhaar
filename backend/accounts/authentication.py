"""
JWT Authentication backend for Django REST Framework
"""
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

User = get_user_model()


class JWTAuthentication(authentication.BaseAuthentication):
    """
    JWT Authentication for REST Framework
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
    
    def authenticate_header(self, request):
        return 'Bearer'
