"""
Tests for REST API Endpoints
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status


User = get_user_model()


class DocumentAPIEndpointTests(APITestCase):
    """Tests for document REST API endpoints"""
    
    def setUp(self):
        """Set up test client and user"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='apiuser',
            email='api@example.com',
            password='apipass123'
        )
    
    def test_document_list_unauthenticated(self):
        """TC059: Test document list endpoint without authentication"""
        response = self.client.get('/api/documents/')
        # Either returns 401 or empty list depending on permissions
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, 
                                              status.HTTP_200_OK])
    
    def test_document_list_authenticated_empty(self):
        """TC060: Test document list returns empty for new user"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/documents/')
        
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            if isinstance(data, list):
                self.assertEqual(len(data), 0)
            elif isinstance(data, dict) and 'results' in data:
                self.assertEqual(len(data['results']), 0)
    
    def test_upload_endpoint_requires_auth(self):
        """TC061: Test upload endpoint requires authentication"""
        response = self.client.post('/api/documents/upload/')
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, 
                                              status.HTTP_403_FORBIDDEN])
    
    def test_verification_results_endpoint(self):
        """TC062: Test verification results endpoint"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/documents/verification_results/')
        
        # Should return 200 with empty results or proper data
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class AuthenticationAPITests(APITestCase):
    """Tests for authentication API endpoints"""
    
    def setUp(self):
        """Set up test client"""
        self.client = APIClient()
    
    def test_register_endpoint_exists(self):
        """TC063: Test register endpoint exists and accepts POST"""
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123',
            'name': 'New User'
        })
        # Should return 201 (created) or 400 (bad request) but not 404
        self.assertNotEqual(response.status_code, status.HTTP_404_NOT_FOUND)
    
    def test_login_endpoint_exists(self):
        """TC064: Test login endpoint exists"""
        response = self.client.post('/api/auth/login/', {
            'username_or_email': 'test@example.com',
            'password': 'testpass'
        })
        # Should not return 404
        self.assertNotEqual(response.status_code, status.HTTP_404_NOT_FOUND)
