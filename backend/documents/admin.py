from django.contrib import admin
from .models import AadhaarDocument, DocumentMetadata


@admin.register(AadhaarDocument)
class AadhaarDocumentAdmin(admin.ModelAdmin):
    """Admin interface for AadhaarDocument model"""
    
    list_display = [
        'id',
        'file_name',
        'status',
        'batch_id',
        'batch_position',
        'uploaded_at',
        'processed_at',
    ]
    list_filter = ['status', 'uploaded_at', 'batch_id']
    search_fields = ['file_name', 'batch_id']
    readonly_fields = ['uploaded_at', 'processed_at']
    ordering = ['-uploaded_at']


@admin.register(DocumentMetadata)
class DocumentMetadataAdmin(admin.ModelAdmin):
    """Admin interface for DocumentMetadata model"""
    
    list_display = [
        'id',
        'document',
        'name',
        'aadhaar_number',
        'is_authentic',
        'confidence_score',
        'analyzed_at',
    ]
    list_filter = ['is_authentic', 'analyzed_at']
    search_fields = ['name', 'aadhaar_number', 'full_text']
    readonly_fields = ['analyzed_at']
    ordering = ['-analyzed_at']
