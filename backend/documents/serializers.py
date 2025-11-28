"""
REST API serializers for documents app
"""
from rest_framework import serializers
from .models import AadhaarDocument, DocumentMetadata


class DocumentMetadataSerializer(serializers.ModelSerializer):
    """Serializer for DocumentMetadata model"""
    
    class Meta:
        model = DocumentMetadata
        fields = [
            'id',
            'full_text',
            'aadhaar_number',
            'name',
            'date_of_birth',
            'gender',
            'address',
            'gemini_response',
            'confidence_score',
            'is_authentic',
            'fraud_indicators',
            'quality_issues',
            'extracted_fields',
            'fraud_detection',
            'analyzed_at',
        ]
        read_only_fields = ['id', 'analyzed_at']


class AadhaarDocumentSerializer(serializers.ModelSerializer):
    """Serializer for AadhaarDocument model"""
    
    metadata = DocumentMetadataSerializer(read_only=True)
    original_file_url = serializers.SerializerMethodField()
    preprocessed_file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = AadhaarDocument
        fields = [
            'id',
            'original_file',
            'original_file_url',
            'preprocessed_file',
            'preprocessed_file_url',
            'thumbnail',
            'thumbnail_url',
            'file_name',
            'file_size',
            'uploaded_at',
            'processed_at',
            'status',
            'error_message',
            'batch_id',
            'batch_position',
            'storage_type',
            'metadata',
        ]
        read_only_fields = [
            'id',
            'uploaded_at',
            'processed_at',
            'preprocessed_file',
            'thumbnail',
            'storage_type',
        ]
    
    def get_original_file_url(self, obj):
        """Get full URL for original file (supports both local and Supabase storage)"""
        url = obj.get_original_url()
        if url:
            # If it's a Supabase URL (starts with http), return as-is
            if url.startswith('http'):
                return url
            # For local URLs, build absolute URI
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return url
        return None
    
    def get_preprocessed_file_url(self, obj):
        """Get full URL for preprocessed file"""
        url = obj.get_processed_url()
        if url:
            if url.startswith('http'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return url
        return None
    
    def get_thumbnail_url(self, obj):
        """Get full URL for thumbnail"""
        url = obj.get_thumbnail_url()
        if url:
            if url.startswith('http'):
                return url
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(url)
            return url
        return None


class DocumentUploadSerializer(serializers.Serializer):
    """Serializer for document upload"""
    
    files = serializers.ListField(
        child=serializers.ImageField(),
        allow_empty=False,
        help_text="List of image files to upload"
    )
    batch_id = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        help_text="Optional batch ID to group uploaded documents"
    )
    auto_analyze = serializers.BooleanField(
        default=True,
        help_text="Automatically run Gemini analysis after upload"
    )


class BatchProcessSerializer(serializers.Serializer):
    """Serializer for batch processing request"""
    
    document_ids = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=False,
        help_text="List of document IDs to process"
    )
