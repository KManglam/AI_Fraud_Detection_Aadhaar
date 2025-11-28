import re
from django.test import TestCase
from .verhoeff import validate_aadhaar, VerhoeffValidator

class VerhoeffTests(TestCase):
    def test_valid_aadhaar(self):
        # This pattern mathematically passes the Verhoeff check with the standard tables
        self.assertTrue(validate_aadhaar("123412341234"))
        
    def test_invalid_aadhaar(self):
        # The case mentioned by user
        self.assertFalse(validate_aadhaar("000000000000"))
        
    def test_short_aadhaar(self):
        self.assertFalse(validate_aadhaar("12345678901"))
        
    def test_non_digit_aadhaar(self):
        self.assertFalse(validate_aadhaar("12345678901a"))
        
    def test_with_spaces(self):
        # Spaces should be handled
        self.assertTrue(validate_aadhaar("1234 1234 1234"))

class AadhaarFormatTests(TestCase):
    """Tests for the specific format rules requested"""
    
    def test_regex_pattern(self):
        # Regex: ^[2-9]{1}[0-9]{11}$
        pattern = r'^[2-9][0-9]{11}$'
        
        # Valid formats (ignoring checksum for this test)
        self.assertTrue(re.match(pattern, "200000000000"))
        self.assertTrue(re.match(pattern, "999999999999"))
        
        # Invalid first digit
        self.assertFalse(re.match(pattern, "000000000000"))
        self.assertFalse(re.match(pattern, "100000000000"))
        
        # Invalid length
        self.assertFalse(re.match(pattern, "20000000000"))
        self.assertFalse(re.match(pattern, "2000000000000"))


