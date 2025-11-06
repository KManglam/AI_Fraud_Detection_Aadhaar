"""
Multi-OCR Extractor with EasyOCR, PaddleOCR, and Tesseract
Combines results from multiple OCR engines for better accuracy
"""

import cv2
import pytesseract
import re
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import logging

# Import additional OCR engines
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    logging.warning("EasyOCR not installed. Install with: pip install easyocr")

try:
    from paddleocr import PaddleOCR
    PADDLEOCR_AVAILABLE = True
except ImportError:
    PADDLEOCR_AVAILABLE = False
    logging.warning("PaddleOCR not installed. Install with: pip install paddleocr paddlepaddle")

try:
    from config import TESSERACT_PATH
except ImportError:
    import sys
    sys.path.insert(0, str(Path(__file__).parent.parent))
    from config import TESSERACT_PATH

pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MultiOcrExtractor:
    def __init__(self, use_easyocr=True, use_paddleocr=True, use_tesseract=True):
        """
        Initialize Multi-OCR Extractor
        
        Args:
            use_easyocr: Enable EasyOCR (better for multilingual)
            use_paddleocr: Enable PaddleOCR (best for Indian documents)
            use_tesseract: Enable Tesseract (fast and reliable)
        """
        self.required_fields = ["name", "dob", "gender", "uid_number", "father_name"]
        self.uid_pattern = r'\d{12}'
        self.uid_spaced_pattern = r'\b(\d{4})\s+(\d{4})\s+(\d{4})\b'
        self.dob_pattern = r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})'
        self.year_pattern = r'\b(19\d{2}|20\d{2})\b'
        self.gender_pattern = r'\b([MF]|Male|Female|MALE|FEMALE)\b'
        self.tesseract_config = r'--oem 3 --psm 6 -l eng'
        
        # Initialize OCR engines
        self.use_tesseract = use_tesseract
        self.use_easyocr = use_easyocr and EASYOCR_AVAILABLE
        self.use_paddleocr = use_paddleocr and PADDLEOCR_AVAILABLE
        
        # Initialize EasyOCR reader
        if self.use_easyocr:
            try:
                logger.info("Initializing EasyOCR...")
                self.easyocr_reader = easyocr.Reader(['en'], gpu=False, verbose=False)
                logger.info("✓ EasyOCR initialized successfully")
            except Exception as e:
                logger.warning(f"✗ Failed to initialize EasyOCR: {e}")
                logger.warning("  Install with: pip install easyocr")
                self.use_easyocr = False
        
        # Initialize PaddleOCR
        if self.use_paddleocr:
            try:
                logger.info("Initializing PaddleOCR...")
                self.paddle_ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
                logger.info("✓ PaddleOCR initialized successfully")
            except Exception as e:
                logger.warning(f"✗ Failed to initialize PaddleOCR: {e}")
                logger.warning("  Install with: pip install paddleocr paddlepaddle")
                self.use_paddleocr = False
        
        logger.info(f"OCR Engines enabled - Tesseract: {self.use_tesseract}, "
                   f"EasyOCR: {self.use_easyocr}, PaddleOCR: {self.use_paddleocr}")

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

    def deskew_image(self, image: np.ndarray) -> np.ndarray:
        """Straighten tilted images"""
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            gray = cv2.bitwise_not(gray)
            thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
            coords = np.column_stack(np.where(thresh > 0))
            
            if len(coords) == 0:
                return image
            
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
            
            # Only deskew if angle is between -10 and 10 degrees
            # Avoid large rotations that might be incorrect
            if abs(angle) < 0.5:  # Skip if already straight
                return image
            
            if abs(angle) > 10:  # Skip if rotation is too large (likely wrong)
                logger.warning(f"Skipping deskew - angle too large: {angle:.2f} degrees")
                return image
            
            (h, w) = image.shape[:2]
            center = (w // 2, h // 2)
            M = cv2.getRotationMatrix2D(center, angle, 1.0)
            rotated = cv2.warpAffine(image, M, (w, h),
                                    flags=cv2.INTER_CUBIC,
                                    borderMode=cv2.BORDER_REPLICATE)
            logger.info(f"Image deskewed by {angle:.2f} degrees")
            return rotated
        except Exception as e:
            logger.warning(f"Deskewing failed: {e}")
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
        processed = cv2.adaptiveThreshold(denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                         cv2.THRESH_BINARY, 21, 3)
        return processed

    def preprocess_image_v3(self, image: np.ndarray) -> np.ndarray:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        opening = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
        processed = cv2.GaussianBlur(opening, (3, 3), 0)
        _, binary = cv2.threshold(processed, 127, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return binary

    def extract_text_tesseract(self, image: np.ndarray) -> Tuple[str, float]:
        """Extract text using Tesseract OCR"""
        try:
            from PIL import Image
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            data = pytesseract.image_to_data(pil_image, output_type=pytesseract.Output.DICT, 
                                            config=self.tesseract_config)
            confidences = [float(conf) for conf in data['conf'] if float(conf) > 0]
            avg_conf = np.mean(confidences) / 100.0 if confidences else 0.0
            text = pytesseract.image_to_string(image, config=self.tesseract_config)
            return text, avg_conf
        except Exception as e:
            logger.error(f"Tesseract extraction failed: {e}")
            return "", 0.0

    def extract_text_easyocr(self, image: np.ndarray) -> Tuple[str, float]:
        """Extract text using EasyOCR"""
        try:
            results = self.easyocr_reader.readtext(image)
            text_lines = []
            confidences = []
            
            for (bbox, text, conf) in results:
                text_lines.append(text)
                confidences.append(conf)
            
            full_text = '\n'.join(text_lines)
            avg_conf = np.mean(confidences) if confidences else 0.0
            return full_text, avg_conf
        except Exception as e:
            logger.error(f"EasyOCR extraction failed: {e}")
            return "", 0.0

    def extract_text_paddleocr(self, image: np.ndarray) -> Tuple[str, float]:
        """Extract text using PaddleOCR"""
        try:
            result = self.paddle_ocr.ocr(image, cls=True)
            
            if not result or not result[0]:
                return "", 0.0
            
            text_lines = []
            confidences = []
            
            for line in result[0]:
                text = line[1][0]
                conf = line[1][1]
                text_lines.append(text)
                confidences.append(conf)
            
            full_text = '\n'.join(text_lines)
            avg_conf = np.mean(confidences) if confidences else 0.0
            return full_text, avg_conf
        except Exception as e:
            logger.error(f"PaddleOCR extraction failed: {e}")
            return "", 0.0

    def extract_text_multi_ocr(self, image: np.ndarray) -> Tuple[str, float, str]:
        """
        Extract text using multiple OCR engines and return best result
        
        Returns:
            Tuple[str, float, str]: (text, confidence, engine_name)
        """
        results = []
        
        # Try Tesseract
        if self.use_tesseract:
            text, conf = self.extract_text_tesseract(image)
            if text:
                results.append(('Tesseract', text, conf))
                logger.debug(f"Tesseract: {len(text)} chars, conf={conf:.2f}")
        
        # Try EasyOCR
        if self.use_easyocr:
            text, conf = self.extract_text_easyocr(image)
            if text:
                results.append(('EasyOCR', text, conf))
                logger.debug(f"EasyOCR: {len(text)} chars, conf={conf:.2f}")
        
        # Try PaddleOCR
        if self.use_paddleocr:
            text, conf = self.extract_text_paddleocr(image)
            if text:
                results.append(('PaddleOCR', text, conf))
                logger.debug(f"PaddleOCR: {len(text)} chars, conf={conf:.2f}")
        
        if not results:
            return "", 0.0, "None"
        
        # Select best result based on confidence and text length
        best_result = max(results, key=lambda x: (x[2], len(x[1])))
        engine_name, text, conf = best_result
        
        logger.info(f"Best OCR engine: {engine_name} (confidence: {conf:.2%})")
        return text, conf, engine_name

    def correct_uid_ocr_errors(self, uid_str: str) -> str:
        """Fix common OCR mistakes in UID numbers"""
        corrections = {
            'O': '0', 'o': '0',
            'I': '1', 'l': '1', '|': '1',
            'S': '5', 's': '5',
            'Z': '2', 'z': '2',
            'B': '8', 'G': '6', 'D': '0'
        }
        
        corrected = ''
        for char in uid_str:
            corrected += corrections.get(char, char)
        
        # Keep only digits
        return ''.join(filter(str.isdigit, corrected))

    def extract_uid(self, text: str) -> Optional[str]:
        # First try to find the 4-4-4 spaced pattern (most common in Aadhaar)
        spaced_matches = re.findall(self.uid_spaced_pattern, text)
        if spaced_matches:
            uid = ''.join(spaced_matches[0])
            uid = self.correct_uid_ocr_errors(uid)
            if len(uid) == 12 and uid[0] not in ['0', '1']:
                return uid
        
        # Try to find 12 consecutive digits
        matches = re.findall(self.uid_pattern, text)
        for match in matches:
            corrected = self.correct_uid_ocr_errors(match)
            if len(corrected) == 12 and corrected[0] not in ['0', '1']:
                return corrected
        
        return None

    def extract_dob(self, text: str) -> Optional[str]:
        # First try standard date format
        matches = re.findall(self.dob_pattern, text)
        if matches:
            return matches[0]
        
        # Try to extract year of birth
        year_matches = re.findall(self.year_pattern, text)
        if year_matches:
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
            if any(keyword in line_lower for keyword in ['government', 'india']):
                for j in range(i+1, min(i+5, len(lines))):
                    candidate = lines[j].strip()
                    
                    # Try to extract name from line with special characters
                    name_match = re.search(r'[/()\[\]]*\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]*){1,3})', candidate)
                    if name_match:
                        extracted_name = name_match.group(1).strip()
                        if 2 <= len(extracted_name.split()) <= 4 and 5 <= len(extracted_name) <= 50:
                            return extracted_name
                    
                    words = candidate.split()
                    if candidate and 2 <= len(words) <= 4 and 5 <= len(candidate) <= 50:
                        if re.match(r'^[A-Za-z\s]+$', candidate):
                            if any(word[0].isupper() for word in words if word):
                                return candidate
                            candidates.append(candidate)
        
        if candidates:
            return candidates[0]
        
        # Fallback: look for capitalized names
        capitalized_names = []
        
        for line in lines:
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
        
        if capitalized_names:
            return capitalized_names[0]
        
        return None

    def extract_data_from_image(self, image_path: str) -> Dict:
        """
        Extract data from Aadhaar card image using multi-OCR approach
        """
        image = self.load_image(image_path)
        if image is None:
            return {
                'success': False,
                'error': 'Failed to load image',
                'extracted_data': None,
                'confidence': 0.0,
                'ocr_engine': 'None'
            }

        # Upscale and deskew
        image = self.upscale_image(image)
        image = self.deskew_image(image)
        
        # Try different preprocessing strategies
        strategies = [self.preprocess_image_v1, self.preprocess_image_v2, self.preprocess_image_v3]
        best_text, best_conf, best_engine = "", 0.0, "None"

        for idx, strat in enumerate(strategies):
            try:
                proc_img = strat(image)
                text, conf, engine = self.extract_text_multi_ocr(proc_img)
                
                # Pick best result based on confidence and text length
                if conf > best_conf or (conf == best_conf and len(text) > len(best_text)):
                    best_text, best_conf, best_engine = text, conf, engine
                    logger.info(f"Strategy {idx+1}: {engine} - {len(text)} chars, conf={conf:.2%}")
            except Exception as e:
                logger.error(f"Strategy {idx+1} failed: {e}")

        lines = [l.strip() for l in best_text.split('\n') if l.strip()]
        data = {
            'raw_text': best_text,
            'name': self.extract_name_from_lines(lines),
            'dob': self.extract_dob(best_text),
            'gender': self.extract_gender(best_text),
            'uid_number': self.extract_uid(best_text),
            'father_name': None
        }

        # Extract father's name
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
            'ocr_engine': best_engine,
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
