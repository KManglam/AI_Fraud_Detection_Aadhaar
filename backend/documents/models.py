from django.db import models
from django.utils import timezone
from django.conf import settings


class AadhaarDocument(models.Model):
    """Model to store uploaded Aadhaar documents"""
    
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    # User association - documents belong to users
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents',
        null=True,
        blank=True,
        help_text="Owner of the document"
    )
    
    # File fields
    original_file = models.ImageField(upload_to='raw/%Y/%m/%d/')
    preprocessed_file = models.ImageField(upload_to='processed/%Y/%m/%d/', null=True, blank=True)
    thumbnail = models.ImageField(upload_to='thumbnails/%Y/%m/%d/', null=True, blank=True)
    
    # Metadata
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField(help_text="File size in bytes")
    uploaded_at = models.DateTimeField(default=timezone.now)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    # Processing status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploaded')
    error_message = models.TextField(null=True, blank=True)
    
    # Batch processing support
    batch_id = models.CharField(max_length=100, null=True, blank=True, db_index=True,
                                help_text="Group ID for batch processing")
    batch_position = models.IntegerField(null=True, blank=True,
                                         help_text="Position in batch")
    
    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['batch_id']),
        ]
    
    def __str__(self):
        return f"{self.file_name} - {self.status}"


class DocumentMetadata(models.Model):
    """Model to store extracted metadata and analysis results"""
    
    document = models.OneToOneField(AadhaarDocument, on_delete=models.CASCADE, related_name='metadata')
    
    # Extracted text and fields
    full_text = models.TextField(blank=True, help_text="Full OCR text extracted from document")
    
    # Aadhaar specific fields
    aadhaar_number = models.CharField(max_length=12, blank=True, null=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    date_of_birth = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Gemini analysis results
    gemini_response = models.TextField(blank=True, help_text="Full Gemini API response")
    confidence_score = models.FloatField(null=True, blank=True,
                                        help_text="Overall confidence score (0-1)")
    
    # Fraud detection
    is_authentic = models.BooleanField(null=True, blank=True)
    fraud_indicators = models.JSONField(default=list, blank=True,
                                       help_text="List of detected fraud indicators")
    quality_issues = models.JSONField(default=list, blank=True,
                                      help_text="Image quality issues detected")
    
    # Additional extracted data
    extracted_fields = models.JSONField(default=dict, blank=True,
                                       help_text="Additional fields extracted from document")
    
    # YOLO fraud detection results
    fraud_detection = models.JSONField(default=dict, blank=True,
                                      help_text="YOLO and CV-based fraud detection results")
    
    analyzed_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Metadata for {self.document.file_name}"
