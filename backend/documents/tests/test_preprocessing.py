"""
Tests for Image Preprocessing Module
"""
import os
import tempfile
from django.test import TestCase
from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image

from documents.preprocessing import ImagePreprocessor, preprocess_image


class ImagePreprocessorInitTests(TestCase):
    """Tests for ImagePreprocessor initialization"""
    
    def setUp(self):
        """Create a test image for preprocessing tests"""
        self.test_image = Image.new('RGB', (800, 600), color='white')
        self.test_image_path = tempfile.NamedTemporaryFile(
            suffix='.jpg', delete=False
        ).name
        self.test_image.save(self.test_image_path)
    
    def tearDown(self):
        """Clean up test files"""
        if os.path.exists(self.test_image_path):
            os.remove(self.test_image_path)
    
    def test_preprocessor_init_with_file_path(self):
        """TC017: Test that preprocessor can be initialized with file path"""
        preprocessor = ImagePreprocessor(self.test_image_path)
        self.assertIsNotNone(preprocessor.image)
    
    def test_rgba_to_rgb_conversion(self):
        """TC018: Test that RGBA images are converted to RGB"""
        rgba_image = Image.new('RGBA', (100, 100), color=(255, 0, 0, 128))
        rgba_path = tempfile.NamedTemporaryFile(suffix='.png', delete=False).name
        rgba_image.save(rgba_path)
        
        try:
            preprocessor = ImagePreprocessor(rgba_path)
            self.assertEqual(preprocessor.image.mode, 'RGB')
        finally:
            os.remove(rgba_path)


class ImageResizeTests(TestCase):
    """Tests for image resizing functionality"""
    
    def setUp(self):
        """Create test images"""
        self.small_image = Image.new('RGB', (800, 600), color='white')
        self.small_path = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False).name
        self.small_image.save(self.small_path)
    
    def tearDown(self):
        """Clean up test files"""
        if os.path.exists(self.small_path):
            os.remove(self.small_path)
    
    def test_small_image_not_resized(self):
        """TC019: Test that small images are not unnecessarily resized"""
        preprocessor = ImagePreprocessor(self.small_path)
        original_size = preprocessor.image.size
        preprocessor.resize_if_needed()
        self.assertEqual(preprocessor.image.size, original_size)
    
    def test_large_image_resized(self):
        """TC020: Test that large images are resized within limits"""
        large_image = Image.new('RGB', (3000, 2000), color='white')
        large_path = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False).name
        large_image.save(large_path)
        
        try:
            preprocessor = ImagePreprocessor(large_path)
            preprocessor.resize_if_needed()
            
            width, height = preprocessor.image.size
            self.assertLessEqual(width, ImagePreprocessor.MAX_WIDTH)
            self.assertLessEqual(height, ImagePreprocessor.MAX_HEIGHT)
        finally:
            os.remove(large_path)


class ThumbnailCreationTests(TestCase):
    """Tests for thumbnail creation"""
    
    def setUp(self):
        """Create a test image"""
        self.test_image = Image.new('RGB', (800, 600), color='white')
        self.test_path = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False).name
        self.test_image.save(self.test_path)
    
    def tearDown(self):
        """Clean up test files"""
        if os.path.exists(self.test_path):
            os.remove(self.test_path)
    
    def test_thumbnail_creation(self):
        """TC021: Test thumbnail is created successfully"""
        preprocessor = ImagePreprocessor(self.test_path)
        thumbnail = preprocessor.create_thumbnail()
        
        self.assertIsInstance(thumbnail, Image.Image)
    
    def test_thumbnail_size_within_limits(self):
        """TC022: Test thumbnail size is within defined limits"""
        preprocessor = ImagePreprocessor(self.test_path)
        thumbnail = preprocessor.create_thumbnail()
        
        self.assertLessEqual(thumbnail.size[0], ImagePreprocessor.THUMBNAIL_SIZE[0])
        self.assertLessEqual(thumbnail.size[1], ImagePreprocessor.THUMBNAIL_SIZE[1])


class QualityCheckTests(TestCase):
    """Tests for image quality checking"""
    
    def setUp(self):
        """Create a test image"""
        self.test_image = Image.new('RGB', (800, 600), color='white')
        self.test_path = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False).name
        self.test_image.save(self.test_path)
    
    def tearDown(self):
        """Clean up test files"""
        if os.path.exists(self.test_path):
            os.remove(self.test_path)
    
    def test_quality_check_returns_proper_keys(self):
        """TC023: Test quality check returns issues, metrics, and score"""
        preprocessor = ImagePreprocessor(self.test_path)
        quality_report = preprocessor.check_quality()
        
        self.assertIn('issues', quality_report)
        self.assertIn('metrics', quality_report)
        self.assertIn('quality_score', quality_report)
    
    def test_quality_metrics_contains_dimensions(self):
        """TC024: Test quality metrics include width and height"""
        preprocessor = ImagePreprocessor(self.test_path)
        quality_report = preprocessor.check_quality()
        
        self.assertIn('width', quality_report['metrics'])
        self.assertIn('height', quality_report['metrics'])
    
    def test_quality_score_range(self):
        """TC025: Test that quality score is between 0 and 1"""
        preprocessor = ImagePreprocessor(self.test_path)
        quality_report = preprocessor.check_quality()
        
        score = quality_report['quality_score']
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 1.0)


class ProcessAllTests(TestCase):
    """Tests for full preprocessing pipeline"""
    
    def setUp(self):
        """Create a test image"""
        self.test_image = Image.new('RGB', (800, 600), color='white')
        self.test_path = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False).name
        self.test_image.save(self.test_path)
    
    def tearDown(self):
        """Clean up test files"""
        if os.path.exists(self.test_path):
            os.remove(self.test_path)
    
    def test_process_all_returns_required_keys(self):
        """TC026: Test process_all returns processed_image, thumbnail, quality_report"""
        preprocessor = ImagePreprocessor(self.test_path)
        result = preprocessor.process_all()
        
        self.assertIn('processed_image', result)
        self.assertIn('thumbnail', result)
        self.assertIn('quality_report', result)
    
    def test_process_all_returns_image_objects(self):
        """TC027: Test process_all returns PIL Image objects"""
        preprocessor = ImagePreprocessor(self.test_path)
        result = preprocessor.process_all()
        
        self.assertIsInstance(result['processed_image'], Image.Image)
        self.assertIsInstance(result['thumbnail'], Image.Image)
    
    def test_to_django_file_conversion(self):
        """TC028: Test conversion to Django InMemoryUploadedFile"""
        preprocessor = ImagePreprocessor(self.test_path)
        django_file = preprocessor.to_django_file('test.jpg')
        
        self.assertIsInstance(django_file, InMemoryUploadedFile)


class PreprocessImageFunctionTests(TestCase):
    """Tests for convenience function preprocess_image"""
    
    def test_preprocess_image_function(self):
        """TC029: Test convenience function returns expected result"""
        test_image = Image.new('RGB', (800, 600), color='white')
        test_path = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False).name
        test_image.save(test_path)
        
        try:
            result = preprocess_image(test_path)
            
            self.assertIn('processed_image', result)
            self.assertIn('thumbnail', result)
            self.assertIn('quality_report', result)
        finally:
            os.remove(test_path)
