"""
Image preprocessing utilities for Aadhaar documents
"""
from PIL import Image, ImageFilter
import os
from io import BytesIO
from django.core.files.uploadedfile import InMemoryUploadedFile
import sys


class ImagePreprocessor:
    """Handle image preprocessing operations"""
    
    # Standard dimensions for processed images
    MAX_WIDTH = 1920
    MAX_HEIGHT = 1080
    THUMBNAIL_SIZE = (300, 300)
    
    def __init__(self, image_file):
        """
        Initialize preprocessor with an image file
        
        Args:
            image_file: Django UploadedFile or file path
        """
        if isinstance(image_file, str):
            self.image = Image.open(image_file)
        else:
            self.image = Image.open(image_file)
        
        # Convert to RGB if necessary
        if self.image.mode in ('RGBA', 'P', 'LA'):
            self.image = self.image.convert('RGB')
    
    def resize_if_needed(self):
        """Resize image if it exceeds maximum dimensions"""
        width, height = self.image.size
        
        if width > self.MAX_WIDTH or height > self.MAX_HEIGHT:
            # Calculate new dimensions maintaining aspect ratio
            ratio = min(self.MAX_WIDTH / width, self.MAX_HEIGHT / height)
            new_size = (int(width * ratio), int(height * ratio))
            self.image = self.image.resize(new_size, Image.Resampling.LANCZOS)
            
        return self
    
    def enhance_quality(self):
        """Apply basic quality enhancements"""
        # Slight sharpening to improve OCR
        self.image = self.image.filter(ImageFilter.SHARPEN)
        return self
    
    def create_thumbnail(self):
        """Create a thumbnail version of the image"""
        thumb = self.image.copy()
        thumb.thumbnail(self.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
        return thumb
    
    def check_quality(self):
        """
        Perform basic quality checks
        
        Returns:
            dict: Quality metrics and issues
        """
        issues = []
        metrics = {}
        
        # Check image size
        width, height = self.image.size
        metrics['width'] = width
        metrics['height'] = height
        metrics['total_pixels'] = width * height
        
        if width < 300 or height < 300:
            issues.append("Image resolution too low (minimum 300x300)")
        
        # Check brightness
        grayscale = self.image.convert('L')
        pixels = list(grayscale.getdata())
        avg_brightness = sum(pixels) / len(pixels)
        metrics['average_brightness'] = avg_brightness
        
        if avg_brightness < 50:
            issues.append("Image too dark")
        elif avg_brightness > 200:
            issues.append("Image too bright/overexposed")
        
        # Check for blur (very basic check using edge detection)
        edges = self.image.filter(ImageFilter.FIND_EDGES)
        edge_pixels = list(edges.convert('L').getdata())
        edge_strength = sum(edge_pixels) / len(edge_pixels)
        metrics['edge_strength'] = edge_strength
        
        if edge_strength < 10:
            issues.append("Image appears blurry")
        
        return {
            'issues': issues,
            'metrics': metrics,
            'quality_score': self._calculate_quality_score(metrics, issues)
        }
    
    def _calculate_quality_score(self, metrics, issues):
        """Calculate overall quality score (0-1)"""
        score = 1.0
        
        # Deduct points for each issue
        score -= len(issues) * 0.15
        
        # Adjust based on resolution
        if metrics['total_pixels'] < 500000:  # Less than ~700x700
            score -= 0.1
        
        return max(0.0, min(1.0, score))
    
    def save_to_file(self, output_path, format='JPEG', quality=90):
        """
        Save the processed image to a file
        
        Args:
            output_path: Path where to save the image
            format: Image format (JPEG, PNG, etc.)
            quality: Quality setting (1-100)
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        self.image.save(output_path, format=format, quality=quality)
        return output_path
    
    def to_django_file(self, filename, format='JPEG', quality=90):
        """
        Convert PIL Image to Django InMemoryUploadedFile
        
        Args:
            filename: Name for the file
            format: Image format
            quality: Quality setting (1-100)
            
        Returns:
            InMemoryUploadedFile
        """
        output = BytesIO()
        self.image.save(output, format=format, quality=quality)
        output.seek(0)
        
        content_type = f'image/{format.lower()}'
        if format.lower() == 'jpeg':
            content_type = 'image/jpeg'
        
        return InMemoryUploadedFile(
            output,
            'ImageField',
            f"{filename}",
            content_type,
            sys.getsizeof(output),
            None
        )
    
    def to_bytes(self, format='JPEG', quality=90):
        """
        Convert PIL Image to bytes for storage service uploads
        
        Args:
            format: Image format (JPEG, PNG, etc.)
            quality: Quality setting (1-100)
            
        Returns:
            tuple: (bytes, content_type)
        """
        output = BytesIO()
        self.image.save(output, format=format, quality=quality)
        output.seek(0)
        
        content_type = f'image/{format.lower()}'
        if format.lower() == 'jpeg':
            content_type = 'image/jpeg'
        
        return output.getvalue(), content_type
    
    def process_all(self):
        """
        Run all preprocessing steps
        
        Returns:
            dict: Processed image and quality report
        """
        quality_report = self.check_quality()
        self.resize_if_needed()
        self.enhance_quality()
        thumbnail = self.create_thumbnail()
        
        return {
            'processed_image': self.image,
            'thumbnail': thumbnail,
            'quality_report': quality_report
        }


def preprocess_image(image_file):
    """
    Convenience function to preprocess an image
    
    Args:
        image_file: Django UploadedFile or file path
        
    Returns:
        dict: Preprocessing results
    """
    preprocessor = ImagePreprocessor(image_file)
    return preprocessor.process_all()
