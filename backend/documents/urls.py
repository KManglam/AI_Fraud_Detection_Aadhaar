"""
URL configuration for documents app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AadhaarDocumentViewSet

# Create a router and register our viewsets
router = DefaultRouter()
router.register(r'documents', AadhaarDocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
]
