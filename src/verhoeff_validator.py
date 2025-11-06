import re


class VerhoeffValidator:
    def __init__(self):
        self.inv = [0, 4, 3, 2, 6, 5, 7, 8, 9, 1]
        
        self.perm = [
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

        self.diag = [
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

    def calculate_checksum(self, number_str):
        number_str = str(number_str).strip()
        
        if not re.match(r'^\d+$', number_str):
            raise ValueError(f"Invalid input: {number_str}. Must contain only digits.")
        
        c = 0
        for i, digit in enumerate(reversed(number_str)):
            c = self.diag[c][self.perm[i % 8][int(digit)]]
        
        return self.inv[c]

    def validate_checksum(self, number_with_checksum):
        number_with_checksum = str(number_with_checksum).strip()
        
        if not re.match(r'^\d+$', number_with_checksum):
            return False
        
        if len(number_with_checksum) < 2:
            return False
        
        number_str = number_with_checksum[:-1]
        check_digit = int(number_with_checksum[-1])
        
        calculated_check = self.calculate_checksum(number_str)
        
        return calculated_check == check_digit

    def validate_aadhaar_uid(self, uid_number):
        uid_str = str(uid_number).strip()
        
        if not re.match(r'^\d{12}$', uid_str):
            return {
                'is_valid': False,
                'error': 'Aadhaar UID must be exactly 12 digits',
                'uid': uid_str
            }
        
        is_valid = self.validate_checksum(uid_str)
        
        return {
            'is_valid': is_valid,
            'uid': uid_str,
            'error': None if is_valid else 'Verhoeff checksum validation failed'
        }


if __name__ == "__main__":
    validator = VerhoeffValidator()
    
    test_uids = [
        "999999999998",
        "123456789012",
        "999999999997",
    ]
    
    for uid in test_uids:
        result = validator.validate_aadhaar_uid(uid)
        print(f"UID: {uid} -> Valid: {result['is_valid']} (Error: {result['error']})")
