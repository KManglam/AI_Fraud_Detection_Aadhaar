import json
import logging
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

try:
    from .verhoeff_validator import VerhoeffValidator
    from .ocr_extractor import OcrExtractor
    from .azure_integration import AzureDocumentIntelligence, AzureOpenAIIntegration
except ImportError:
    from verhoeff_validator import VerhoeffValidator
    from ocr_extractor import OcrExtractor
    from azure_integration import AzureDocumentIntelligence, AzureOpenAIIntegration

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class AadhaarVerificationPipeline:
    def __init__(
        self,
        use_azure_di: bool = False,
        use_azure_openai: bool = False,
        azure_di_endpoint: Optional[str] = None,
        azure_di_key: Optional[str] = None,
        azure_openai_endpoint: Optional[str] = None,
        azure_openai_key: Optional[str] = None
    ):
        self.validator = VerhoeffValidator()
        self.ocr_extractor = OcrExtractor()
        
        self.azure_di = None
        self.azure_openai = None
        
        if use_azure_di:
            self.azure_di = AzureDocumentIntelligence(
                endpoint=azure_di_endpoint,
                api_key=azure_di_key
            )
        
        if use_azure_openai:
            self.azure_openai = AzureOpenAIIntegration(
                endpoint=azure_openai_endpoint,
                api_key=azure_openai_key
            )
        
        self.processed_uids = set()
        self.fraud_alerts = []

    def verify_document(self, image_path: str, use_azure: bool = False) -> Dict:
        logger.info(f"Starting verification for: {image_path}")
        
        verification_result = {
            'image_path': image_path,
            'timestamp': datetime.now().isoformat(),
            'ocr_extraction': None,
            'uid_validation': None,
            'azure_di_validation': None,
            'azure_openai_verification': None,
            'is_fraudulent': False,
            'fraud_flags': [],
            'overall_score': 0.0,
            'recommendation': 'ACCEPT'
        }
        
        ocr_result = self.ocr_extractor.extract_data_from_image(image_path)
        verification_result['ocr_extraction'] = ocr_result
        
        if not ocr_result['success']:
            verification_result['recommendation'] = 'REJECT'
            verification_result['fraud_flags'].append('OCR_EXTRACTION_FAILED')
            logger.warning(f"OCR extraction failed: {ocr_result['error']}")
            return verification_result
        
        extracted_data = ocr_result['extracted_data']
        uid_number = extracted_data.get('uid_number')
        
        if uid_number:
            uid_validation = self.validator.validate_aadhaar_uid(uid_number)
            verification_result['uid_validation'] = uid_validation
            
            if not uid_validation['is_valid']:
                verification_result['is_fraudulent'] = True
                verification_result['fraud_flags'].append('INVALID_CHECKSUM')
                logger.warning(f"Invalid UID checksum: {uid_number}")
            
            if uid_number in self.processed_uids:
                verification_result['is_fraudulent'] = True
                verification_result['fraud_flags'].append('DUPLICATE_UID')
                logger.warning(f"Duplicate UID detected: {uid_number}")
            else:
                self.processed_uids.add(uid_number)
        else:
            verification_result['fraud_flags'].append('UID_NOT_FOUND')
            verification_result['is_fraudulent'] = True
        
        if use_azure and self.azure_di:
            azure_result = self.azure_di.analyze_document(image_path)
            verification_result['azure_di_validation'] = azure_result
            
            if not azure_result['success']:
                verification_result['fraud_flags'].append('AZURE_DI_FAILED')
                logger.warning(f"Azure DI analysis failed: {azure_result['error']}")
            else:
                validation = self.azure_di.validate_extraction(azure_result['data'])
                if not validation['is_valid']:
                    verification_result['fraud_flags'].append('AZURE_DI_VALIDATION_FAILED')
                    verification_result['is_fraudulent'] = True
        
        if uid_number and use_azure and self.azure_openai:
            openai_result = self.azure_openai.verify_extracted_data(extracted_data, uid_number)
            verification_result['azure_openai_verification'] = openai_result
            
            if not openai_result['success']:
                logger.warning(f"Azure OpenAI verification failed: {openai_result['error']}")
        
        verification_result['overall_score'] = self._calculate_fraud_score(
            verification_result,
            ocr_result
        )
        
        if verification_result['is_fraudulent'] or verification_result['overall_score'] > 50:
            verification_result['recommendation'] = 'REJECT'
        elif verification_result['overall_score'] > 30:
            verification_result['recommendation'] = 'REVIEW'
        else:
            verification_result['recommendation'] = 'ACCEPT'
        
        if verification_result['is_fraudulent'] or verification_result['overall_score'] > 50:
            self.fraud_alerts.append({
                'image': image_path,
                'uid': uid_number,
                'flags': verification_result['fraud_flags'],
                'score': verification_result['overall_score']
            })
        
        logger.info(
            f"Verification complete for {image_path}: "
            f"Score={verification_result['overall_score']:.1f}, "
            f"Recommendation={verification_result['recommendation']}"
        )
        
        return verification_result

    def _calculate_fraud_score(self, verification_result: Dict, ocr_result: Dict) -> float:
        score = 0.0
        
        if 'INVALID_CHECKSUM' in verification_result['fraud_flags']:
            score += 40
        
        if 'DUPLICATE_UID' in verification_result['fraud_flags']:
            score += 30
        
        if 'UID_NOT_FOUND' in verification_result['fraud_flags']:
            score += 25
        
        if 'AZURE_DI_VALIDATION_FAILED' in verification_result['fraud_flags']:
            score += 20
        
        ocr_confidence = ocr_result.get('confidence', 0)
        if ocr_confidence < 50:
            score += (50 - ocr_confidence) * 0.2
        
        return min(score, 100.0)

    def batch_verify(self, image_directory: str, use_azure: bool = False) -> List[Dict]:
        logger.info(f"Starting batch verification for directory: {image_directory}")
        
        image_dir = Path(image_directory)
        if not image_dir.exists():
            logger.error(f"Directory not found: {image_directory}")
            return []
        
        results = []
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
        
        for image_file in image_dir.iterdir():
            if image_file.suffix.lower() in image_extensions:
                result = self.verify_document(str(image_file), use_azure=use_azure)
                results.append(result)
        
        logger.info(f"Batch verification complete. Processed {len(results)} images")
        return results

    def generate_report(self, verification_results: List[Dict], output_path: str) -> str:
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        
        total = len(verification_results)
        accepted = sum(1 for r in verification_results if r['recommendation'] == 'ACCEPT')
        rejected = sum(1 for r in verification_results if r['recommendation'] == 'REJECT')
        review = sum(1 for r in verification_results if r['recommendation'] == 'REVIEW')
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_documents': total,
                'accepted': accepted,
                'rejected': rejected,
                'review_required': review,
                'fraud_alerts': len(self.fraud_alerts)
            },
            'detailed_results': verification_results,
            'fraud_alerts': self.fraud_alerts
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Report generated: {output_file}")
        return str(output_file)

    def reset(self):
        self.processed_uids.clear()
        self.fraud_alerts.clear()
        logger.info("Pipeline reset")


if __name__ == "__main__":
    pipeline = AadhaarVerificationPipeline()
    print("Aadhaar Verification Pipeline initialized")
