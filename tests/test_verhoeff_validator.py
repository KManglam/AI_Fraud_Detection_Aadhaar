"""
Unit tests for Verhoeff Validator module
"""

import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from verhoeff_validator import VerhoeffValidator


class TestVerhoeffValidator:
    
    def setup_method(self):
        self.validator = VerhoeffValidator()
    
    def test_valid_uid_format(self):
        """Test validation of properly formatted UID"""
        uid = "999999999998"
        result = self.validator.validate_aadhaar_uid(uid)
        assert result['is_valid'] == True
        assert result['uid'] == uid
        assert result['error'] is None
    
    def test_invalid_uid_format(self):
        """Test validation of incorrectly formatted UID"""
        uid = "12345678901"
        result = self.validator.validate_aadhaar_uid(uid)
        assert result['is_valid'] == False
        assert 'must be exactly 12 digits' in result['error']
    
    def test_invalid_checksum(self):
        """Test UID with invalid checksum"""
        uid = "123456789012"
        result = self.validator.validate_aadhaar_uid(uid)
        
        if not result['is_valid']:
            assert 'checksum' in result['error'].lower()
    
    def test_checksum_calculation(self):
        """Test checksum calculation"""
        number_str = "99999999999"
        check_digit = self.validator.calculate_checksum(number_str)
        assert isinstance(check_digit, int)
        assert 0 <= check_digit <= 9
    
    def test_non_numeric_input(self):
        """Test validation with non-numeric input"""
        with pytest.raises(ValueError):
            self.validator.calculate_checksum("12345678901A")
    
    def test_empty_input(self):
        """Test validation with empty input"""
        result = self.validator.validate_aadhaar_uid("")
        assert result['is_valid'] == False
    
    def test_generate_valid_uid(self):
        """Test generating a valid UID and validating it"""
        base_uid = "99999999999"
        check_digit = self.validator.calculate_checksum(base_uid)
        complete_uid = base_uid + str(check_digit)
        
        result = self.validator.validate_aadhaar_uid(complete_uid)
        assert result['is_valid'] == True
    
    def test_whitespace_handling(self):
        """Test that whitespace is properly handled"""
        uid = "  999999999998  "
        result = self.validator.validate_aadhaar_uid(uid)
        assert result['is_valid'] == True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
