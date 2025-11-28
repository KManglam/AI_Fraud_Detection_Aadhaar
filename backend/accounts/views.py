"""
Views for user authentication
"""
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

User = get_user_model()


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
