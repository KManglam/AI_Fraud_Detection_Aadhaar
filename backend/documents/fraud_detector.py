"""
Aadhaar Fraud Detection using YOLOv8

This module provides fraud detection capabilities using a trained YOLO model
to detect document tampering, photo overlays, tampered QR codes, and altered fonts.
"""

import os
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import numpy as np

logger = logging.getLogger(__name__)


def convert_to_json_serializable(obj: Any) -> Any:
    """Convert numpy types to Python native types for JSON serialization."""
    if isinstance(obj, dict):
        return {k: convert_to_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_to_json_serializable(item) for item in obj]
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return convert_to_json_serializable(obj.tolist())
    elif isinstance(obj, bool):
        return obj
    else:
        return obj

# Try to import ultralytics, but make it optional
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False
    logger.warning("Ultralytics not installed. YOLO fraud detection will be disabled.")

# Try to import cv2
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logger.warning("OpenCV not installed. Some features may be limited.")


class FraudDetector:
    """
    YOLO-based fraud detector for Aadhaar documents.
    
    Detects:
    - Document tampering
    - Photo overlays
    - Tampered QR codes
    - Altered fonts
    - Subtle modifications
    """
    
    # Default class names (update based on your trained model)
    DEFAULT_CLASS_NAMES = {
        0: 'aadhaar_number',
        1: 'photo',
        2: 'qr_code',
        3: 'name_field',
        4: 'address_field'
    }
    
    # Fraud-related class names (if model is trained for fraud detection)
    FRAUD_CLASS_NAMES = {
        'tampered_photo': 'Photo appears to be tampered or overlaid',
        'altered_text': 'Text appears to be digitally altered',
        'fake_qr_code': 'QR code appears invalid or tampered',
        'font_mismatch': 'Inconsistent fonts detected',
        'image_overlay': 'Image overlay or manipulation detected',
        'digital_manipulation': 'Signs of digital manipulation detected'
    }
    
    def __init__(self, model_path: Optional[str] = None, confidence_threshold: float = 0.25):
        """
        Initialize the fraud detector.
        
        Args:
            model_path: Path to the trained YOLO model (.pt file)
            confidence_threshold: Minimum confidence for detections
        """
        self.model = None
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.is_loaded = False
        
        # Try to find model in default locations
        if model_path is None:
            self._find_default_model()
        
        # Load the model if available
        if self.model_path and YOLO_AVAILABLE:
            self._load_model()
    
    def _find_default_model(self):
        """Find model in default locations."""
        default_paths = [
            Path(__file__).parent.parent / 'models' / 'aadhaar_fraud_detector.pt',
            Path(__file__).parent.parent / 'models' / 'best.pt',
            Path(__file__).parent.parent.parent / 'train' / 'models' / 'best.pt',
        ]
        
        for path in default_paths:
            if path.exists():
                self.model_path = str(path)
                logger.info(f"Found fraud detection model at: {self.model_path}")
                return
        
        logger.warning("No fraud detection model found. Detection will be limited.")
    
    def _load_model(self):
        """Load the YOLO model."""
        if not YOLO_AVAILABLE:
            logger.error("Cannot load model: ultralytics not installed")
            return
        
        if not self.model_path or not os.path.exists(self.model_path):
            logger.error(f"Model file not found: {self.model_path}")
            return
        
        try:
            self.model = YOLO(self.model_path)
            self.is_loaded = True
            logger.info(f"Fraud detection model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load fraud detection model: {e}")
            self.model = None
            self.is_loaded = False
    
    def detect(self, image_path: str) -> Dict:
        """
        Detect fraud indicators in an Aadhaar document image.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary containing:
            - detections: List of detected objects with class, confidence, and bbox
            - fraud_indicators: List of fraud-related findings
            - risk_score: Overall risk score (0-1)
            - risk_level: 'low', 'medium', or 'high'
        """
        result = {
            'detections': [],
            'fraud_indicators': [],
            'risk_score': 0.0,
            'risk_level': 'low',
            'analysis_details': {}
        }
        
        if not os.path.exists(image_path):
            logger.error(f"Image not found: {image_path}")
            result['fraud_indicators'].append("Image file not found")
            result['risk_score'] = 1.0
            result['risk_level'] = 'high'
            return result
        
        # Run YOLO detection if model is available
        if self.is_loaded and self.model:
            yolo_results = self._run_yolo_detection(image_path)
            result['detections'] = yolo_results['detections']
            result['fraud_indicators'].extend(yolo_results['fraud_indicators'])
        
        # Run additional CV-based analysis
        if CV2_AVAILABLE:
            cv_results = self._run_cv_analysis(image_path)
            result['fraud_indicators'].extend(cv_results['fraud_indicators'])
            result['analysis_details'] = cv_results['details']
        
        # Calculate overall risk score
        result['risk_score'] = self._calculate_risk_score(result)
        result['risk_level'] = self._get_risk_level(result['risk_score'])
        
        # Convert all numpy types to JSON-serializable Python types
        return convert_to_json_serializable(result)
    
    def _run_yolo_detection(self, image_path: str) -> Dict:
        """Run YOLO model inference."""
        detections = []
        fraud_indicators = []
        
        try:
            results = self.model.predict(
                image_path,
                conf=self.confidence_threshold,
                verbose=False
            )
            
            if results and len(results) > 0:
                for box in results[0].boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    bbox = box.xyxy[0].tolist()
                    
                    # Get class name from model, fallback to DEFAULT_CLASS_NAMES
                    cls_name = results[0].names.get(cls_id)
                    if not cls_name or cls_name.startswith('class_'):
                        cls_name = self.DEFAULT_CLASS_NAMES.get(cls_id, f'detection_{cls_id}')
                    
                    detection = {
                        'class_id': cls_id,
                        'class_name': cls_name,
                        'confidence': conf,
                        'bbox': bbox
                    }
                    detections.append(detection)
                    
                    # Check for fraud-related classes
                    if cls_name in self.FRAUD_CLASS_NAMES:
                        fraud_indicators.append(
                            f"{self.FRAUD_CLASS_NAMES[cls_name]} ({conf:.1%} confidence)"
                        )
        
        except Exception as e:
            logger.error(f"YOLO detection failed: {e}")
        
        return {
            'detections': detections,
            'fraud_indicators': fraud_indicators
        }
    
    def _run_cv_analysis(self, image_path: str) -> Dict:
        """Run computer vision analysis for fraud detection."""
        fraud_indicators = []
        details = {}
        
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                return {'fraud_indicators': ['Could not read image'], 'details': {}}
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # 1. Check for image manipulation using ELA-like analysis
            compression_artifacts = self._check_compression_artifacts(img)
            details['compression_analysis'] = compression_artifacts
            if compression_artifacts['suspicious']:
                fraud_indicators.append(
                    f"Suspicious compression artifacts detected (score: {compression_artifacts['score']:.2f})"
                )
            
            # 2. Check for copy-paste regions
            copy_paste_result = self._detect_copy_paste(gray)
            details['copy_paste_analysis'] = copy_paste_result
            if copy_paste_result['suspicious']:
                fraud_indicators.append("Potential copy-paste manipulation detected")
            
            # 3. Check for inconsistent noise patterns
            noise_result = self._analyze_noise_patterns(gray)
            details['noise_analysis'] = noise_result
            if noise_result['suspicious']:
                fraud_indicators.append(
                    f"Inconsistent noise patterns detected (variance: {noise_result['variance']:.2f})"
                )
            
            # 4. Check edge consistency
            edge_result = self._analyze_edges(gray)
            details['edge_analysis'] = edge_result
            if edge_result['suspicious']:
                fraud_indicators.append("Suspicious edge patterns detected")
            
            # 5. Check for text region anomalies
            text_result = self._analyze_text_regions(gray)
            details['text_analysis'] = text_result
            if text_result['suspicious']:
                fraud_indicators.append(
                    f"Text region anomalies detected ({text_result['reason']})"
                )
            
        except Exception as e:
            logger.error(f"CV analysis failed: {e}")
            fraud_indicators.append(f"Analysis error: {str(e)}")
        
        return {
            'fraud_indicators': fraud_indicators,
            'details': details
        }
    
    def _check_compression_artifacts(self, img: np.ndarray) -> Dict:
        """Check for suspicious JPEG compression artifacts."""
        try:
            # Convert to YCrCb and analyze
            ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
            y_channel = ycrcb[:, :, 0]
            
            # Compute DCT-like features
            rows, cols = y_channel.shape
            block_size = 8
            variances = []
            
            for i in range(0, rows - block_size, block_size):
                for j in range(0, cols - block_size, block_size):
                    block = y_channel[i:i+block_size, j:j+block_size].astype(float)
                    variances.append(np.var(block))
            
            if variances:
                variance_of_variances = np.var(variances)
                mean_variance = np.mean(variances)
                score = variance_of_variances / (mean_variance + 1e-10)
                
                # High variance of variances may indicate manipulation
                # Increased threshold from 50 to 200 - normal scanned/photographed documents
                # often have scores between 50-150 due to JPEG compression
                suspicious = score > 200
                
                return {
                    'suspicious': suspicious,
                    'score': score,
                    'mean_variance': mean_variance
                }
        except:
            pass
        
        return {'suspicious': False, 'score': 0, 'mean_variance': 0}
    
    def _detect_copy_paste(self, gray: np.ndarray) -> Dict:
        """Detect potential copy-paste manipulation."""
        try:
            # Use ORB features to find similar regions
            orb = cv2.ORB_create(nfeatures=500)
            keypoints, descriptors = orb.detectAndCompute(gray, None)
            
            if descriptors is not None and len(descriptors) > 10:
                # Use BFMatcher to find similar features
                bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
                matches = bf.knnMatch(descriptors, descriptors, k=2)
                
                # Filter suspicious matches (similar features in different locations)
                suspicious_matches = 0
                for m, n in matches:
                    if m.queryIdx != m.trainIdx:  # Not the same point
                        if m.distance < 30:  # Very similar
                            pt1 = keypoints[m.queryIdx].pt
                            pt2 = keypoints[m.trainIdx].pt
                            dist = np.sqrt((pt1[0]-pt2[0])**2 + (pt1[1]-pt2[1])**2)
                            if dist > 50:  # Minimum distance apart
                                suspicious_matches += 1
                
                suspicious = suspicious_matches > 10
                return {
                    'suspicious': suspicious,
                    'similar_regions': suspicious_matches
                }
        except:
            pass
        
        return {'suspicious': False, 'similar_regions': 0}
    
    def _analyze_noise_patterns(self, gray: np.ndarray) -> Dict:
        """Analyze noise patterns for inconsistencies."""
        try:
            # Compute local variance in blocks
            rows, cols = gray.shape
            block_size = 32
            local_noises = []
            
            for i in range(0, rows - block_size, block_size):
                for j in range(0, cols - block_size, block_size):
                    block = gray[i:i+block_size, j:j+block_size].astype(float)
                    # Estimate noise using Laplacian
                    laplacian = cv2.Laplacian(block.astype(np.uint8), cv2.CV_64F)
                    noise = np.var(laplacian)
                    local_noises.append(noise)
            
            if local_noises:
                variance = np.var(local_noises)
                mean_noise = np.mean(local_noises)
                
                # High variance in local noise may indicate manipulation
                # Increased threshold from 1000 to 50000 - photographed documents
                # naturally have high noise variance (10000-40000 is common)
                suspicious = variance > 50000 and variance / (mean_noise + 1) > 20
                
                return {
                    'suspicious': suspicious,
                    'variance': variance,
                    'mean_noise': mean_noise
                }
        except:
            pass
        
        return {'suspicious': False, 'variance': 0, 'mean_noise': 0}
    
    def _analyze_edges(self, gray: np.ndarray) -> Dict:
        """Analyze edge patterns for signs of manipulation."""
        try:
            # Detect edges
            edges = cv2.Canny(gray, 50, 150)
            
            # Analyze edge density in different regions
            rows, cols = edges.shape
            block_size = 64
            edge_densities = []
            
            for i in range(0, rows - block_size, block_size):
                for j in range(0, cols - block_size, block_size):
                    block = edges[i:i+block_size, j:j+block_size]
                    density = np.sum(block > 0) / (block_size * block_size)
                    edge_densities.append(density)
            
            if edge_densities:
                variance = np.var(edge_densities)
                max_density = max(edge_densities)
                min_density = min(edge_densities)
                
                # Very high contrast in edge density may indicate cut/paste
                suspicious = (max_density - min_density) > 0.5 and variance > 0.02
                
                return {
                    'suspicious': suspicious,
                    'variance': variance,
                    'max_density': max_density,
                    'min_density': min_density
                }
        except:
            pass
        
        return {'suspicious': False, 'variance': 0, 'max_density': 0, 'min_density': 0}
    
    def _analyze_text_regions(self, gray: np.ndarray) -> Dict:
        """Analyze text regions for font inconsistencies."""
        try:
            # Apply adaptive thresholding to extract text regions
            binary = cv2.adaptiveThreshold(
                gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY_INV, 11, 2
            )
            
            # Find contours (text characters)
            contours, _ = cv2.findContours(
                binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            
            if len(contours) > 20:
                # Analyze character sizes
                char_heights = []
                char_widths = []
                
                for contour in contours:
                    x, y, w, h = cv2.boundingRect(contour)
                    if 5 < h < 100 and 2 < w < 100:  # Filter reasonable character sizes
                        char_heights.append(h)
                        char_widths.append(w)
                
                if char_heights:
                    height_variance = np.var(char_heights)
                    width_variance = np.var(char_widths)
                    
                    # Very high variance may indicate different fonts
                    suspicious = height_variance > 200 or width_variance > 200
                    
                    reason = ""
                    if height_variance > 200:
                        reason = "inconsistent character heights"
                    elif width_variance > 200:
                        reason = "inconsistent character widths"
                    
                    return {
                        'suspicious': suspicious,
                        'reason': reason,
                        'height_variance': height_variance,
                        'width_variance': width_variance,
                        'char_count': len(char_heights)
                    }
        except:
            pass
        
        return {'suspicious': False, 'reason': '', 'height_variance': 0, 'width_variance': 0, 'char_count': 0}
    
    def _calculate_risk_score(self, result: Dict) -> float:
        """Calculate overall risk score based on findings."""
        score = 0.0
        
        # CV-based fraud indicators have lower weight (often false positives)
        # Only count indicators that are NOT from CV analysis
        cv_indicator_keywords = ['compression', 'noise', 'copy-paste', 'edge']
        critical_indicators = [
            ind for ind in result['fraud_indicators']
            if not any(kw in ind.lower() for kw in cv_indicator_keywords)
        ]
        cv_indicators = [
            ind for ind in result['fraud_indicators']
            if any(kw in ind.lower() for kw in cv_indicator_keywords)
        ]
        
        # Critical indicators (from YOLO/actual fraud detection) have higher weight
        if critical_indicators:
            score += min(len(critical_indicators) * 0.2, 0.6)
        
        # CV indicators have much lower weight (often false positives from photos/scans)
        if cv_indicators:
            score += min(len(cv_indicators) * 0.05, 0.15)
        
        # Detection-based scoring (if YOLO found fraud-related classes)
        fraud_detections = [
            d for d in result['detections']
            if d['class_name'] in self.FRAUD_CLASS_NAMES
        ]
        if fraud_detections:
            max_conf = max(d['confidence'] for d in fraud_detections)
            score += max_conf * 0.4
        
        return min(score, 1.0)
    
    def _get_risk_level(self, score: float) -> str:
        """Convert risk score to risk level."""
        if score < 0.3:
            return 'low'
        elif score < 0.6:
            return 'medium'
        else:
            return 'high'


# Singleton instance for easy access
_fraud_detector_instance = None

def get_fraud_detector() -> FraudDetector:
    """Get or create the fraud detector instance."""
    global _fraud_detector_instance
    if _fraud_detector_instance is None:
        _fraud_detector_instance = FraudDetector()
    return _fraud_detector_instance


def detect_fraud(image_path: str) -> Dict:
    """
    Convenience function to detect fraud in an image.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Fraud detection results dictionary
    """
    detector = get_fraud_detector()
    return detector.detect(image_path)
