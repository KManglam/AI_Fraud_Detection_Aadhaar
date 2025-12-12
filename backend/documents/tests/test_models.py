"""
Tests for Django Models - AadhaarDocument and DocumentMetadata
"""
from io import BytesIO
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from documents.models import AadhaarDocument, DocumentMetadata


User = get_user_model()


class AadhaarDocumentModelTests(TestCase):
    """Tests for AadhaarDocument model"""
    
    def setUp(self):
        """Set up test user and create test image"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create test image file
        image = Image.new('RGB', (100, 100), color='red')
        image_io = BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)
        
        self.test_image = SimpleUploadedFile(
            name='test_aadhaar.jpg',
            content=image_io.read(),
            content_type='image/jpeg'
        )
    
    def test_document_creation(self):
        """TC030: Test creating an AadhaarDocument instance"""
        doc = AadhaarDocument.objects.create(
            user=self.user,
            original_file=self.test_image,
            file_name='test_aadhaar.jpg',
            file_size=1024,
            status='uploaded'
        )
        
        self.assertEqual(doc.user, self.user)
        self.assertEqual(doc.file_name, 'test_aadhaar.jpg')
        self.assertEqual(doc.status, 'uploaded')
    
    def test_document_str_representation(self):
        """TC031: Test string representation of document"""
        doc = AadhaarDocument.objects.create(
            user=self.user,
            original_file=self.test_image,
            file_name='test_aadhaar.jpg',
            file_size=1024,
            status='uploaded'
        )
        
        self.assertEqual(str(doc), 'test_aadhaar.jpg - uploaded')
    
    def test_document_status_uploaded(self):
        """TC032: Test document with 'uploaded' status"""
        doc = AadhaarDocument.objects.create(
            user=self.user,
            original_file=self.test_image,
            file_name='test.jpg',
            file_size=1024,
            status='uploaded'
        )
        self.assertEqual(doc.status, 'uploaded')
    
    def test_document_status_processing(self):
        """TC033: Test document with 'processing' status"""
        doc = AadhaarDocument.objects.create(
            user=self.user,
            original_file=self.test_image,
            file_name='test.jpg',
            file_size=1024,
            status='processing'
        )
        self.assertEqual(doc.status, 'processing')
    
    def test_document_status_completed(self):
        """TC034: Test document with 'completed' status"""
        doc = AadhaarDocument.objects.create(
            user=self.user,
            original_file=self.test_image,
            file_name='test.jpg',
            file_size=1024,
            status='completed'
        )
        self.assertEqual(doc.status, 'completed')
    
    def test_document_status_failed(self):
        """TC035: Test document with 'failed' status"""
        doc = AadhaarDocument.objects.create(
            user=self.user,
            original_file=self.test_image,
            file_name='test.jpg',
            file_size=1024,
            status='failed'
        )
        self.assertEqual(doc.status, 'failed')
    
    def test_document_default_storage_type(self):
        """TC036: Test document default storage type is 'local'"""
        doc = AadhaarDocument.objects.create(
            user=self.user,
            original_file=self.test_image,
            file_name='test.jpg',
            file_size=1024
        )
        self.assertEqual(doc.storage_type, 'local')


class DocumentMetadataModelTests(TestCase):
    """Tests for DocumentMetadata model"""
    
    def setUp(self):
        """Set up test user and document"""
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        # Create test image file
        image = Image.new('RGB', (100, 100), color='red')
        image_io = BytesIO()
        image.save(image_io, format='JPEG')
        image_io.seek(0)
        
        self.test_image = SimpleUploadedFile(
            name='test_aadhaar.jpg',
            content=image_io.read(),
            content_type='image/jpeg'
        )
        
        self.document = AadhaarDocument.objects.create(
            user=self.user,
            original_file=self.test_image,
            file_name='test_aadhaar.jpg',
            file_size=1024,
            status='uploaded'
        )
    
    def test_metadata_creation(self):
        """TC037: Test creating DocumentMetadata instance"""
        metadata = DocumentMetadata.objects.create(
            document=self.document,
            aadhaar_number='234567890123',
            name='Test User',
            gender='Male',
            is_authentic=True
        )
        
        self.assertEqual(metadata.document, self.document)
        self.assertEqual(metadata.aadhaar_number, '234567890123')
        self.assertTrue(metadata.is_authentic)
    
    def test_metadata_str_representation(self):
        """TC038: Test string representation of metadata"""
        metadata = DocumentMetadata.objects.create(
            document=self.document,
            aadhaar_number='234567890123'
        )
        
        expected = f"Metadata for {self.document.file_name}"
        self.assertEqual(str(metadata), expected)
    
    def test_fraud_indicators_default_empty_list(self):
        """TC039: Test that fraud_indicators defaults to empty list"""
        metadata = DocumentMetadata.objects.create(
            document=self.document
        )
        
        self.assertEqual(metadata.fraud_indicators, [])
    
    def test_fraud_detection_default_empty_dict(self):
        """TC040: Test that fraud_detection defaults to empty dict"""
        metadata = DocumentMetadata.objects.create(
            document=self.document
        )
        
        self.assertEqual(metadata.fraud_detection, {})
    
    def test_extracted_fields_default_empty_dict(self):
        """TC041: Test that extracted_fields defaults to empty dict"""
        metadata = DocumentMetadata.objects.create(
            document=self.document
        )
        
        self.assertEqual(metadata.extracted_fields, {})
    
    def test_quality_issues_default_empty_list(self):
        """TC042: Test that quality_issues defaults to empty list"""
        metadata = DocumentMetadata.objects.create(
            document=self.document
        )
        
        self.assertEqual(metadata.quality_issues, [])
