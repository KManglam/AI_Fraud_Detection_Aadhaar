"""
URL configuration for accounts app
Includes both legacy JWT and Supabase Auth endpoints
"""
from django.urls import path
from . import views

urlpatterns = [
    # Legacy JWT Authentication (backward compatibility)
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('refresh/', views.refresh_token, name='refresh_token'),
    
    # Supabase Authentication (recommended)
    path('supabase/register/', views.supabase_register, name='supabase_register'),
    path('supabase/login/', views.supabase_login, name='supabase_login'),
    path('supabase/logout/', views.supabase_logout, name='supabase_logout'),
    path('supabase/refresh/', views.supabase_refresh_token, name='supabase_refresh_token'),
    
    # Debug endpoint
    path('debug-token/', views.debug_token, name='debug_token'),
    
    # User profile endpoints (works with both auth methods)
    path('me/', views.me, name='me'),
    path('profile/', views.update_profile, name='update_profile'),
    path('change-password/', views.change_password, name='change_password'),
]
