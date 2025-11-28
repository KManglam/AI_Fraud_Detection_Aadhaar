"""
Verhoeff algorithm implementation for Aadhaar number validation.
The Verhoeff algorithm is a checksum formula for error detection.
"""

class VerhoeffValidator:
    """
    Helper class to validate numbers using the Verhoeff algorithm.
    Used for Aadhaar number validation.
    """
    
    # Multiplication table (d)
    d = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ]

    # Permutation table (p)
    p = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ]

    # Inverse table (inv)
    inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9]

    @classmethod
    def validate(cls, number: str) -> bool:
        """
        Validate a number using the Verhoeff algorithm.
        
        Args:
            number: The string representation of the number to validate
            
        Returns:
            bool: True if the number is valid, False otherwise
        """
        if not number or not isinstance(number, str):
            return False
            
        # Remove spaces and hyphens
        clean_number = number.replace(" ", "").replace("-", "")
        
        if not clean_number.isdigit():
            return False
            
        # Aadhaar numbers are 12 digits
        if len(clean_number) != 12:
            return False
        
        c = 0
        reversed_number = reversed(clean_number)
        
        for i, item in enumerate(reversed_number):
            c = cls.d[c][cls.p[i % 8][int(item)]]
            
        return c == 0

def validate_aadhaar(number: str) -> bool:
    """
    Convenience function to validate an Aadhaar number.
    """
    return VerhoeffValidator.validate(number)
