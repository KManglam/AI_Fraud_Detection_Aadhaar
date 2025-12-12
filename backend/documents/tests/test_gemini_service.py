"""
Tests for Gemini Service Module
"""
from django.test import TestCase
from documents.gemini_service import normalize_bilingual_field


class NormalizeBilingualFieldTests(TestCase):
    """Tests for normalize_bilingual_field function"""
    
    def test_normalize_bilingual_object_with_english(self):
        """TC043: Test normalizing bilingual object returns English value"""
        bilingual = {'hindi': 'राम', 'english': 'Ram'}
        result = normalize_bilingual_field(bilingual)
        self.assertEqual(result, 'Ram')
    
    def test_normalize_bilingual_object_hindi_only(self):
        """TC044: Test bilingual object with only Hindi returns Hindi"""
        bilingual = {'hindi': 'राम'}
        result = normalize_bilingual_field(bilingual)
        self.assertEqual(result, 'राम')
    
    def test_normalize_string_value(self):
        """TC045: Test that string values pass through unchanged"""
        result = normalize_bilingual_field('Test Name')
        self.assertEqual(result, 'Test Name')
    
    def test_normalize_none_value(self):
        """TC046: Test that None returns None (passthrough)"""
        result = normalize_bilingual_field(None)
        self.assertIsNone(result)
    
    def test_normalize_number_value(self):
        """TC047: Test that numbers are converted to string"""
        result = normalize_bilingual_field(12345)
        self.assertEqual(result, '12345')
    
    def test_normalize_empty_string(self):
        """TC048: Test that empty string returns empty string"""
        result = normalize_bilingual_field('')
        self.assertEqual(result, '')
    
    def test_normalize_empty_dict(self):
        """TC049: Test that empty dict returns string representation"""
        result = normalize_bilingual_field({})
        self.assertEqual(result, '{}')
    
    def test_normalize_list_value(self):
        """TC050: Test that list is converted to string"""
        result = normalize_bilingual_field(['value1', 'value2'])
        self.assertIsInstance(result, str)
