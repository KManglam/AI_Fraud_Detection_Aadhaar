import cv2
import pytesseract
import re
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging

try:
    from config import TESSERACT_PATH
except ImportError:
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from config import TESSERACT_PATH

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OcrExtractor:
    def __init__(self):
        self.required_fields = ["name", "dob", "gender", "uid_number", "father_name"]
        self.uid_pattern = r'\d{12}'
        self.uid_spaced_pattern = r'\b(\d{4})\s+(\d{4})\s+(\d{4})\b'
        self.dob_pattern = r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})'
        self.year_pattern = r'\b(19\d{2}|20\d{2})\b'
        self.gender_pattern = r'\b([MF]|Male|Female|MALE|FEMALE)\b'
        self.tesseract_config = r'--oem 3 --psm 6 -l eng'

    def load_image(self, image_path: str) -> Optional[np.ndarray]:
        try:
            image = cv2.imread(image_path)
            if image is None:
                logger.error(f"Failed to load image: {image_path}")
                return None
            return image
        except Exception as e:
            logger.error(f"Error loading image: {e}")
            return None

    def upscale_image(self, image: np.ndarray) -> np.ndarray:
        h, w = image.shape[:2]
        if w < 800 or h < 600:
            scale = max(800 / w, 600 / h)
            new_w, new_h = int(w * scale), int(h * scale)
            image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
        return image

    def preprocess_image_v1(self, image: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        _, binary = cv2.threshold(enhanced, 150, 255, cv2.THRESH_BINARY)
        return binary

    def preprocess_image_v2(self, image: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        denoised = cv2.bilateralFilter(gray, 9, 75, 75)
        processed = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 21, 3)
        return processed

    def preprocess_image_v3(self, image: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        opening = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
        processed = cv2.GaussianBlur(opening, (3, 3), 0)
        _, binary = cv2.threshold(processed, 127, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return binary

    def extract_text(self, image: np.ndarray) -> Tuple[str, float]:
        try:
            from PIL import Image
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            data = pytesseract.image_to_data(pil_image, output_type=pytesseract.Output.DICT, config=self.tesseract_config)
            confidences = [float(conf) for conf in data['conf'] if float(conf) > 0]
            avg_conf = np.mean(confidences) / 100.0 if confidences else 0.0
            text = pytesseract.image_to_string(image, config=self.tesseract_config)
            return text, avg_conf
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return "", 0.0

    def extract_uid(self, text: str) -> Optional[str]:
        # First try to find the 4-4-4 spaced pattern (most common in Aadhaar)
        spaced_matches = re.findall(self.uid_spaced_pattern, text)
        if spaced_matches:
            # Join the three groups to form the 12-digit UID
            uid = ''.join(spaced_matches[0])
            if uid[0] not in ['0', '1']:  # Aadhaar shouldn't start with 0 or 1
                return uid
        
        # Try to find 12 consecutive digits
        matches = re.findall(self.uid_pattern, text)
        for match in matches:
            if match[0] not in ['0', '1']:
                return match
        
        return None

    def extract_dob(self, text: str) -> Optional[str]:
        # First try standard date format
        matches = re.findall(self.dob_pattern, text)
        if matches:
            return matches[0]
        
        # Try to extract year of birth
        year_matches = re.findall(self.year_pattern, text)
        if year_matches:
            # Look for context like "Year of Birth" or "DOB"
            for i, line in enumerate(text.split('\n')):
                if 'year' in line.lower() or 'birth' in line.lower() or 'dob' in line.lower():
                    year_in_line = re.findall(self.year_pattern, line)
                    if year_in_line:
                        return year_in_line[0]
            return year_matches[0]
        
        return None

    def extract_gender(self, text: str) -> Optional[str]:
        matches = re.findall(self.gender_pattern, text)
        if matches:
            g = matches[0].upper()
            return 'M' if g in ['M', 'MALE'] else ('F' if g in ['F', 'FEMALE'] else None)
        return None

    def extract_name_from_lines(self, lines: List[str]) -> Optional[str]:
        candidates = []
        
        # Look for name near keywords or in specific positions
        for i, line in enumerate(lines):
            line_lower = line.lower()
            # Check if line contains name-related keywords
            if any(keyword in line_lower for keyword in ['government', 'india']):
                # Look in next few lines for the actual name
                for j in range(i+1, min(i+5, len(lines))):
                    candidate = lines[j].strip()
                    
                    # Try to extract name from line with special characters
                    # Look for patterns like "/ (Name Here" or similar
                    name_match = re.search(r'[/()\[\]]*\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]*){1,3})', candidate)
                    if name_match:
                        extracted_name = name_match.group(1).strip()
                        if 2 <= len(extracted_name.split()) <= 4 and 5 <= len(extracted_name) <= 50:
                            return extracted_name
                    
                    # Standard check
                    words = candidate.split()
                    if candidate and 2 <= len(words) <= 4 and 5 <= len(candidate) <= 50:
                        if re.match(r'^[A-Za-z\s]+$', candidate):
                            # Prefer names with capital letters (proper names)
                            if any(word[0].isupper() for word in words if word):
                                return candidate
                            candidates.append(candidate)
        
        # Return first candidate if found
        if candidates:
            return candidates[0]
        
        # Fallback: look for any line with 2-4 words, only letters, prefer capitalized
        # Also try to extract names from lines with special characters
        capitalized_names = []
        other_names = []
        
        for line in lines:
            # Try to extract capitalized name pattern from any line
            name_match = re.search(r'[/()\[\]]*\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]*){1,3})', line)
            if name_match:
                extracted_name = name_match.group(1).strip()
                if 2 <= len(extracted_name.split()) <= 4 and 5 <= len(extracted_name) <= 50:
                    capitalized_names.append(extracted_name)
            
            cleaned = line.strip()
            words = cleaned.split()
            if cleaned and 2 <= len(words) <= 4 and 5 <= len(cleaned) <= 50:
                if re.match(r'^[A-Za-z\s]+$', cleaned):
                    if any(word[0].isupper() for word in words if word):
                        capitalized_names.append(cleaned)
                    else:
                        other_names.append(cleaned)
        
        # Prefer capitalized names
        if capitalized_names:
            return capitalized_names[0]
        if other_names:
            return other_names[0]
        
        return None

    def extract_data_from_image(self, image_path: str) -> Dict:
        image = self.load_image(image_path)
        if image is None:
            return {'success': False, 'error': 'Failed to load image', 'extracted_data': None, 'confidence': 0.0}

        image = self.upscale_image(image)
        
        strategies = [self.preprocess_image_v1, self.preprocess_image_v2, self.preprocess_image_v3]
        best_text, best_conf = "", 0.0

        for idx, strat in enumerate(strategies):
            try:
                proc_img = strat(image)
                text, conf = self.extract_text(proc_img)
                if len(text) > len(best_text) or conf > best_conf:
                    best_text, best_conf = text, conf
            except:
                pass

        lines = [l.strip() for l in best_text.split('\n') if l.strip()]
        data = {
            'raw_text': best_text,
            'name': self.extract_name_from_lines(lines),
            'dob': self.extract_dob(best_text),
            'gender': self.extract_gender(best_text),
            'uid_number': self.extract_uid(best_text),
            'father_name': None
        }

        for line in lines:
            if 'father' in line.lower():
                m = re.search(r'[:\-]?\s*([A-Za-z\s]{3,50})', line)
                if m:
                    fn = m.group(1).strip()
                    if len(fn) > 2 and not any(c.isdigit() for c in fn):
                        data['father_name'] = fn

        filled = sum(1 for f in self.required_fields if data.get(f))
        conf_score = (filled / len(self.required_fields)) * 100

        return {
            'success': True,
            'extracted_data': data,
            'confidence': conf_score,
            'ocr_confidence': best_conf * 100,
            'error': None
        }

    def batch_extract(self, image_directory: str) -> List[Dict]:
        image_dir = Path(image_directory)
        if not image_dir.exists():
            logger.error(f"Directory not found: {image_directory}")
            return []

        results = []
        exts = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
        for img_file in sorted(image_dir.iterdir()):
            if img_file.suffix.lower() in exts:
                logger.info(f"Processing: {img_file.name}")
                res = self.extract_data_from_image(str(img_file))
                res['image_file'] = img_file.name
                results.append(res)
        return results
