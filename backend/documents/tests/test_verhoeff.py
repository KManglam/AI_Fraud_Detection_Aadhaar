"""
Tests for Verhoeff Algorithm - Aadhaar Number Validation
"""
import re
from django.test import TestCase
from documents.verhoeff import validate_aadhaar, VerhoeffValidator


class VerhoeffValidatorTests(TestCase):
    """Tests for VerhoeffValidator class"""
    
    def test_valid_aadhaar_number(self):
        """TC001: Test that a valid 12-digit Aadhaar number passes Verhoeff validation"""
        self.assertTrue(validate_aadhaar("123412341234"))
        
    def test_invalid_aadhaar_all_zeros(self):
        """TC002: Test that Aadhaar with all zeros fails validation"""
        self.assertFalse(validate_aadhaar("000000000000"))
        
    def test_short_aadhaar_number(self):
        """TC003: Test that Aadhaar with less than 12 digits fails"""
        self.assertFalse(validate_aadhaar("12345678901"))
    
    def test_long_aadhaar_number(self):
        """TC004: Test that Aadhaar with more than 12 digits fails"""
        self.assertFalse(validate_aadhaar("1234567890123"))
        
    def test_aadhaar_with_non_digit_characters(self):
        """TC005: Test that Aadhaar containing alphabets fails"""
        self.assertFalse(validate_aadhaar("12345678901a"))
        
    def test_aadhaar_with_spaces(self):
        """TC006: Test that Aadhaar with spaces is processed correctly"""
        self.assertTrue(validate_aadhaar("1234 1234 1234"))

    def test_aadhaar_with_hyphens(self):
        """TC007: Test that Aadhaar with hyphens is processed correctly"""
        self.assertTrue(validate_aadhaar("1234-1234-1234"))
    
    def test_empty_string_aadhaar(self):
        """TC008: Test that empty string returns False"""
        self.assertFalse(validate_aadhaar(""))
    
    def test_none_input_aadhaar(self):
        """TC009: Test that None input returns False"""
        self.assertFalse(validate_aadhaar(None))
    
    def test_aadhaar_with_special_characters(self):
        """TC010: Test that Aadhaar with special chars (except space/hyphen) fails"""
        self.assertFalse(validate_aadhaar("1234.1234.1234"))
        self.assertFalse(validate_aadhaar("1234/1234/1234"))


class AadhaarFormatRegexTests(TestCase):
    """Tests for Aadhaar number format validation using regex"""
    
    def test_regex_valid_first_digit_2_to_9(self):
        """TC011: Test that Aadhaar starting with digits 2-9 matches regex pattern"""
        pattern = r'^[2-9][0-9]{11}$'
        self.assertTrue(bool(re.match(pattern, "200000000000")))
        self.assertTrue(bool(re.match(pattern, "999999999999")))
        
    def test_regex_invalid_first_digit_zero(self):
        """TC012: Test that Aadhaar starting with 0 fails regex"""
        pattern = r'^[2-9][0-9]{11}$'
        self.assertFalse(bool(re.match(pattern, "000000000000")))
    
    def test_regex_invalid_first_digit_one(self):
        """TC013: Test that Aadhaar starting with 1 fails regex"""
        pattern = r'^[2-9][0-9]{11}$'
        self.assertFalse(bool(re.match(pattern, "100000000000")))
        
    def test_regex_invalid_length_short(self):
        """TC014: Test that 11-digit Aadhaar fails regex"""
        pattern = r'^[2-9][0-9]{11}$'
        self.assertFalse(bool(re.match(pattern, "20000000000")))
    
    def test_regex_invalid_length_long(self):
        """TC015: Test that 13-digit Aadhaar fails regex"""
        pattern = r'^[2-9][0-9]{11}$'
        self.assertFalse(bool(re.match(pattern, "2000000000000")))
    
    def test_all_valid_first_digits(self):
        """TC016: Test all valid first digits (2-9) pass pattern matching"""
        pattern = r'^[2-9][0-9]{11}$'
        for digit in range(2, 10):
            aadhaar = f"{digit}00000000000"
            self.assertTrue(bool(re.match(pattern, aadhaar)), 
                          f"Aadhaar starting with {digit} should be valid")
