"""
Views for user authentication
Supports both legacy JWT authentication and Supabase Auth
"""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
import jwt
from datetime import datetime, timedelta
from django.conf import settings

from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    ChangePasswordSerializer
)

logger = logging.getLogger(__name__)
User = get_user_model()


# =============================================================================
# Supabase Auth Integration
# =============================================================================

def get_supabase_clients():
    """Get Supabase client instances"""
    try:
        from aadhaar_system.supabase_client import SupabaseAuth, get_supabase, get_supabase_admin
        return SupabaseAuth, get_supabase, get_supabase_admin
    except ImportError as e:
        logger.error(f"Failed to import Supabase client: {e}")
        return None, None, None


@api_view(['POST'])
@permission_classes([AllowAny])
def supabase_register(request):
    """
    Register a new user with Supabase Auth
    
    Request body:
    - email: string (required)
    - password: string (required)
    - name: string (optional)
    """
    SupabaseAuth, _, _ = get_supabase_clients()
    if not SupabaseAuth:
        return Response({
            'success': False,
            'message': 'Supabase not configured'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name', '')
    
    if not email or not password:
        return Response({
            'success': False,
            'message': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Register with Supabase
        response = SupabaseAuth.sign_up(
            email=email,
            password=password,
            user_metadata={'name': name}
        )
        
        if response.user:
            # Create local user
            supabase_user = response.user
            username = email.split('@')[0]
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'name': name,
                    'supabase_id': supabase_user.id,
                    'is_active': True,
                }
            )
            
            if not created and not user.supabase_id:
                user.supabase_id = supabase_user.id
                user.save(update_fields=['supabase_id'])
            
            return Response({
                'success': True,
                'message': 'Registration successful. Please check your email for verification.',
                'user': UserSerializer(user).data,
                'session': {
                    'access_token': response.session.access_token if response.session else None,
                    'refresh_token': response.session.refresh_token if response.session else None,
                    'expires_in': response.session.expires_in if response.session else None,
                } if response.session else None
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'message': 'Registration failed'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        logger.error(f"Supabase registration error: {e}")
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def supabase_login(request):
    """
    Login user with Supabase Auth
    
    Request body:
    - email: string (required)
    - password: string (required)
    """
    SupabaseAuth, _, _ = get_supabase_clients()
    if not SupabaseAuth:
        return Response({
            'success': False,
            'message': 'Supabase not configured'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'success': False,
            'message': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        response = SupabaseAuth.sign_in(email=email, password=password)
        
        if response.user and response.session:
            supabase_user = response.user
            
            # Get or create local user
            try:
                user = User.objects.get(supabase_id=supabase_user.id)
            except User.DoesNotExist:
                try:
                    user = User.objects.get(email=email)
                    user.supabase_id = supabase_user.id
                    user.save(update_fields=['supabase_id'])
                except User.DoesNotExist:
                    username = email.split('@')[0]
                    base_username = username
                    counter = 1
                    while User.objects.filter(username=username).exists():
                        username = f"{base_username}{counter}"
                        counter += 1
                    
                    user = User.objects.create(
                        username=username,
                        email=email,
                        name=supabase_user.user_metadata.get('name', '') if supabase_user.user_metadata else '',
                        supabase_id=supabase_user.id,
                        is_active=True,
                    )
            
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access_token': response.session.access_token,
                    'refresh_token': response.session.refresh_token,
                    'expires_in': response.session.expires_in,
                }
            })
        else:
            return Response({
                'success': False,
                'message': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        logger.error(f"Supabase login error: {e}")
        return Response({
            'success': False,
            'message': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def supabase_refresh_token(request):
    """
    Refresh Supabase access token
    
    Request body:
    - refresh_token: string (required)
    """
    SupabaseAuth, _, _ = get_supabase_clients()
    if not SupabaseAuth:
        return Response({
            'success': False,
            'message': 'Supabase not configured'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    refresh_token = request.data.get('refresh_token')
    
    if not refresh_token:
        return Response({
            'success': False,
            'message': 'Refresh token is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        response = SupabaseAuth.refresh_session(refresh_token)
        
        if response.session:
            return Response({
                'success': True,
                'tokens': {
                    'access_token': response.session.access_token,
                    'refresh_token': response.session.refresh_token,
                    'expires_in': response.session.expires_in,
                }
            })
        else:
            return Response({
                'success': False,
                'message': 'Failed to refresh token'
            }, status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        logger.error(f"Supabase token refresh error: {e}")
        return Response({
            'success': False,
            'message': 'Invalid refresh token'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def supabase_logout(request):
    """
    Logout user from Supabase
    """
    SupabaseAuth, _, _ = get_supabase_clients()
    if SupabaseAuth:
        try:
            SupabaseAuth.sign_out()
        except Exception as e:
            logger.warning(f"Supabase logout warning: {e}")
    
    return Response({
        'success': True,
        'message': 'Logout successful'
    })


# =============================================================================
# Debug endpoint for testing Supabase auth
# =============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def debug_token(request):
    """
    Debug endpoint to test token verification
    """
    auth_header = request.headers.get('Authorization', '')
    
    if not auth_header.startswith('Bearer '):
        return Response({
            'success': False,
            'message': 'No Bearer token provided',
            'header': auth_header[:50] if auth_header else 'None'
        })
    
    token = auth_header.split(' ')[1]
    
    try:
        from aadhaar_system.supabase_client import get_supabase_admin
        client = get_supabase_admin()
        response = client.auth.get_user(token)
        
        if response and response.user:
            return Response({
                'success': True,
                'message': 'Token is valid',
                'user_id': response.user.id,
                'email': response.user.email,
            })
        else:
            return Response({
                'success': False,
                'message': 'Supabase returned no user',
                'response': str(response)
            })
    except Exception as e:
        import traceback
        return Response({
            'success': False,
            'message': f'Error: {type(e).__name__}: {str(e)}',
            'traceback': traceback.format_exc()
        })


# =============================================================================
# Legacy JWT Authentication (preserved for backward compatibility)
# =============================================================================


def generate_tokens(user):
    """Generate access and refresh tokens for user"""
    access_token_exp = datetime.utcnow() + timedelta(hours=24)
    refresh_token_exp = datetime.utcnow() + timedelta(days=7)
    
    access_token = jwt.encode({
        'user_id': user.id,
        'username': user.username,
        'email': user.email,
        'exp': access_token_exp,
        'type': 'access'
    }, settings.SECRET_KEY, algorithm='HS256')
    
    refresh_token = jwt.encode({
        'user_id': user.id,
        'exp': refresh_token_exp,
        'type': 'refresh'
    }, settings.SECRET_KEY, algorithm='HS256')
    
    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_in': 24 * 60 * 60  # 24 hours in seconds
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    Register a new user
    
    Request body:
    - username: string (required)
    - email: string (required)
    - name: string (required)
    - password: string (required)
    - password_confirm: string (required)
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.save()
        tokens = generate_tokens(user)
        
        return Response({
            'success': True,
            'message': 'Registration successful',
            'user': UserSerializer(user).data,
            'tokens': tokens
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login user with username/email and password
    
    Request body:
    - username_or_email: string (required)
    - password: string (required)
    """
    serializer = UserLoginSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    username_or_email = serializer.validated_data['username_or_email'].lower()
    password = serializer.validated_data['password']
    
    # Try to find user by username or email
    user = None
    if '@' in username_or_email:
        try:
            user = User.objects.get(email=username_or_email)
        except User.DoesNotExist:
            pass
    else:
        try:
            user = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            pass
    
    if user is None:
        return Response({
            'success': False,
            'message': 'Invalid username/email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check password
    if not user.check_password(password):
        return Response({
            'success': False,
            'message': 'Invalid username/email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    if not user.is_active:
        return Response({
            'success': False,
            'message': 'Account is disabled'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Update last login
    user.last_login = timezone.now()
    user.save(update_fields=['last_login'])
    
    tokens = generate_tokens(user)
    
    return Response({
        'success': True,
        'message': 'Login successful',
        'user': UserSerializer(user).data,
        'tokens': tokens
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout user (client should discard tokens)
    """
    return Response({
        'success': True,
        'message': 'Logout successful'
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    """
    Refresh access token using refresh token
    
    Request body:
    - refresh_token: string (required)
    """
    refresh_token = request.data.get('refresh_token')
    
    if not refresh_token:
        return Response({
            'success': False,
            'message': 'Refresh token is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=['HS256'])
        
        if payload.get('type') != 'refresh':
            raise jwt.InvalidTokenError('Invalid token type')
        
        user = User.objects.get(id=payload['user_id'])
        
        if not user.is_active:
            return Response({
                'success': False,
                'message': 'Account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        tokens = generate_tokens(user)
        
        return Response({
            'success': True,
            'tokens': tokens
        })
    
    except jwt.ExpiredSignatureError:
        return Response({
            'success': False,
            'message': 'Refresh token has expired'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    except (jwt.InvalidTokenError, User.DoesNotExist):
        return Response({
            'success': False,
            'message': 'Invalid refresh token'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    Get current user profile
    """
    return Response({
        'success': True,
        'user': UserSerializer(request.user).data
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Update user profile
    
    Request body:
    - name: string (optional)
    - email: string (optional)
    """
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    
    if serializer.is_valid():
        serializer.save()
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'user': serializer.data
        })
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    
    Request body:
    - old_password: string (required)
    - new_password: string (required)
    - new_password_confirm: string (required)
    """
    serializer = ChangePasswordSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    
    if not user.check_password(serializer.validated_data['old_password']):
        return Response({
            'success': False,
            'message': 'Current password is incorrect'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.set_password(serializer.validated_data['new_password'])
    user.save()
    
    return Response({
        'success': True,
        'message': 'Password changed successfully'
    })
