import random
import json
from datetime import datetime, timedelta
from pathlib import Path
try:
    from .verhoeff_validator import VerhoeffValidator
except ImportError:
    from verhoeff_validator import VerhoeffValidator


class SyntheticAadhaarGenerator:
    def __init__(self):
        self.validator = VerhoeffValidator()
        
        self.first_names = [
            "Rajesh", "Priya", "Amit", "Neha", "Vikram", "Ananya", "Arjun", "Divya",
            "Sanjay", "Pooja", "Rohan", "Shreya", "Aditya", "Anjali", "Manoj", "Kavya",
            "Ravi", "Sneha", "Suresh", "Meera"
        ]
        
        self.last_names = [
            "Kumar", "Singh", "Patel", "Reddy", "Sharma", "Verma", "Gupta", "Joshi",
            "Nair", "Menon", "Rao", "Ghosh", "Bhat", "Iyer", "Mishra", "Sinha",
            "Desai", "Kulkarni", "Pandey", "Srivastava"
        ]
        
        self.genders = ["M", "F"]
        self.states = [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
            "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
            "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
            "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan",
            "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
            "Uttarakhand", "West Bengal"
        ]

    def generate_uid_without_checksum(self):
        return ''.join([str(random.randint(0, 9)) for _ in range(11)])

    def generate_valid_uid(self):
        uid_without_check = self.generate_uid_without_checksum()
        check_digit = self.validator.calculate_checksum(uid_without_check)
        return uid_without_check + str(check_digit)

    def generate_invalid_uid(self):
        uid_without_check = self.generate_uid_without_checksum()
        wrong_check_digit = random.randint(0, 9)
        correct_check = self.validator.calculate_checksum(uid_without_check)
        while wrong_check_digit == correct_check:
            wrong_check_digit = random.randint(0, 9)
        return uid_without_check + str(wrong_check_digit)

    def generate_dob(self):
        start_date = datetime(1950, 1, 1)
        end_date = datetime(2005, 12, 31)
        random_days = random.randint(0, (end_date - start_date).days)
        dob = start_date + timedelta(days=random_days)
        return dob.strftime("%d/%m/%Y")

    def generate_aadhaar_record(self, is_valid=True, is_duplicate=False, duplicate_uid=None):
        record = {
            "name": f"{random.choice(self.first_names)} {random.choice(self.last_names)}",
            "dob": self.generate_dob(),
            "gender": random.choice(self.genders),
            "uid_number": duplicate_uid if duplicate_uid else (
                self.generate_valid_uid() if is_valid else self.generate_invalid_uid()
            ),
            "father_name": f"{random.choice(self.first_names)} {random.choice(self.last_names)}",
            "state": random.choice(self.states),
            "is_flagged": not is_valid,
            "fraud_type": "invalid_uid" if not is_valid else None
        }
        
        if is_duplicate and duplicate_uid:
            record["fraud_type"] = "duplicate_uid"
            record["is_flagged"] = True
        
        return record

    def generate_dataset(self, num_valid=80, num_invalid=15, num_duplicates=5):
        dataset = []
        duplicate_uids = []
        
        for _ in range(num_valid):
            record = self.generate_aadhaar_record(is_valid=True)
            dataset.append(record)
        
        for _ in range(num_invalid):
            record = self.generate_aadhaar_record(is_valid=False)
            dataset.append(record)
        
        for _ in range(num_duplicates):
            if duplicate_uids:
                uid_to_duplicate = random.choice(duplicate_uids)
            else:
                uid_to_duplicate = self.generate_valid_uid()
                duplicate_uids.append(uid_to_duplicate)
            
            record = self.generate_aadhaar_record(
                is_valid=True,
                is_duplicate=True,
                duplicate_uid=uid_to_duplicate
            )
            dataset.append(record)
        
        random.shuffle(dataset)
        return dataset

    def save_dataset(self, dataset, output_path):
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(dataset, f, indent=2, ensure_ascii=False)
        
        return str(output_file)

    def generate_csv_dataset(self, num_valid=80, num_invalid=15, num_duplicates=5, output_path=None):
        import csv
        
        dataset = self.generate_dataset(num_valid, num_invalid, num_duplicates)
        
        if output_path is None:
            output_path = "synthetic_aadhaar_data.csv"
        
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=dataset[0].keys())
            writer.writeheader()
            writer.writerows(dataset)
        
        return str(output_file), len(dataset)


if __name__ == "__main__":
    generator = SyntheticAadhaarGenerator()
    
    dataset = generator.generate_dataset(num_valid=80, num_invalid=15, num_duplicates=5)
    
    print(f"Generated {len(dataset)} synthetic Aadhaar records")
    print("\nSample records:")
    for i, record in enumerate(dataset[:3]):
        print(f"\nRecord {i+1}:")
        print(json.dumps(record, indent=2, ensure_ascii=False))
    
    print(f"\n\nTotal records: {len(dataset)}")
    print(f"Flagged records: {sum(1 for r in dataset if r['is_flagged'])}")
