import os
import json
from typing import Dict, Optional
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AzureDocumentIntelligence:
    def __init__(self, endpoint: Optional[str] = None, api_key: Optional[str] = None):
        self.endpoint = endpoint or os.getenv('AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT')
        self.api_key = api_key or os.getenv('AZURE_DOCUMENT_INTELLIGENCE_KEY')
        
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        if not self.endpoint or not self.api_key:
            logger.warning(
                "Azure Document Intelligence credentials not configured. "
                "Set AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT and AZURE_DOCUMENT_INTELLIGENCE_KEY "
                "environment variables or pass them to the constructor."
            )
            return False
        
        try:
            from azure.ai.documentintelligence import DocumentIntelligenceClient
            from azure.core.credentials import AzureKeyCredential
            
            self.client = DocumentIntelligenceClient(
                endpoint=self.endpoint,
                credential=AzureKeyCredential(self.api_key)
            )
            logger.info("Azure Document Intelligence client initialized")
            return True
        except ImportError:
            logger.error(
                "Azure SDK not installed. Install with: "
                "pip install azure-ai-documentintelligence"
            )
            return False
        except Exception as e:
            logger.error(f"Failed to initialize Azure client: {e}")
            return False

    def analyze_document(self, image_path: str) -> Dict:
        if not self.client:
            return {
                'success': False,
                'error': 'Azure client not initialized',
                'data': None
            }
        
        try:
            with open(image_path, 'rb') as f:
                poller = self.client.begin_analyze_document(
                    "prebuilt-document",
                    document=f
                )
            
            result = poller.result()
            
            extracted_content = self._parse_azure_response(result)
            
            return {
                'success': True,
                'data': extracted_content,
                'error': None,
                'confidence_score': getattr(result, 'confidence', None)
            }
        except Exception as e:
            logger.error(f"Azure document analysis failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'data': None
            }

    def _parse_azure_response(self, result) -> Dict:
        extracted_data = {
            'tables': [],
            'key_value_pairs': {},
            'raw_content': ''
        }
        
        if hasattr(result, 'content'):
            extracted_data['raw_content'] = result.content
        
        if hasattr(result, 'tables'):
            for table in result.tables:
                table_data = []
                for cell in table.cells:
                    table_data.append({
                        'row': cell.row_index,
                        'column': cell.column_index,
                        'content': cell.content
                    })
                extracted_data['tables'].append(table_data)
        
        if hasattr(result, 'key_value_pairs'):
            for pair in result.key_value_pairs:
                key = pair.key.content if hasattr(pair.key, 'content') else str(pair.key)
                value = pair.value.content if hasattr(pair.value, 'content') else str(pair.value)
                extracted_data['key_value_pairs'][key] = value
        
        return extracted_data

    def validate_extraction(self, extracted_data: Dict) -> Dict:
        validation_result = {
            'is_valid': True,
            'issues': [],
            'completeness_score': 0.0
        }
        
        required_fields = ['raw_content']
        filled_fields = sum(1 for field in required_fields if field in extracted_data and extracted_data[field])
        
        validation_result['completeness_score'] = (filled_fields / len(required_fields)) * 100
        
        if not extracted_data.get('raw_content'):
            validation_result['issues'].append('No content extracted from document')
            validation_result['is_valid'] = False
        
        if validation_result['completeness_score'] < 50:
            validation_result['issues'].append('Low extraction completeness')
            validation_result['is_valid'] = False
        
        return validation_result

    @staticmethod
    def create_mock_client():
        logger.info("Creating mock Azure client for testing")
        return AzureDocumentIntelligence()


class AzureOpenAIIntegration:
    def __init__(self, endpoint: Optional[str] = None, api_key: Optional[str] = None, model: str = "gpt-35-turbo"):
        self.endpoint = endpoint or os.getenv('AZURE_OPENAI_ENDPOINT')
        self.api_key = api_key or os.getenv('AZURE_OPENAI_KEY')
        self.model = model
        self.client = None
        self._initialize_client()

    def _initialize_client(self):
        if not self.endpoint or not self.api_key:
            logger.warning(
                "Azure OpenAI credentials not configured. "
                "Set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY environment variables."
            )
            return False
        
        try:
            from openai import AzureOpenAI
            
            self.client = AzureOpenAI(
                api_key=self.api_key,
                api_version="2024-02-15-preview",
                azure_endpoint=self.endpoint
            )
            logger.info("Azure OpenAI client initialized")
            return True
        except ImportError:
            logger.error(
                "OpenAI SDK not installed. Install with: "
                "pip install openai"
            )
            return False
        except Exception as e:
            logger.error(f"Failed to initialize Azure OpenAI: {e}")
            return False

    def verify_extracted_data(self, extracted_data: Dict, uid_number: str) -> Dict:
        if not self.client:
            return {
                'success': False,
                'error': 'Azure OpenAI client not initialized',
                'verification': None
            }
        
        try:
            prompt = f"""
            Verify the authenticity and consistency of the following Aadhaar document data:
            
            Extracted Data: {json.dumps(extracted_data, indent=2)}
            UID Number: {uid_number}
            
            Check for:
            1. Data consistency
            2. Suspicious patterns
            3. Potential fraud indicators
            4. Missing or incomplete information
            
            Provide a structured analysis with a fraud risk score (0-100).
            """
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an Aadhaar document verification expert."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
                max_tokens=500
            )
            
            analysis = response.choices[0].message.content
            
            return {
                'success': True,
                'verification': analysis,
                'error': None
            }
        except Exception as e:
            logger.error(f"Azure OpenAI verification failed: {e}")
            return {
                'success': False,
                'error': str(e),
                'verification': None
            }


if __name__ == "__main__":
    azure_di = AzureDocumentIntelligence()
    print("Azure Document Intelligence client created (mock mode if credentials not set)")
    
    azure_openai = AzureOpenAIIntegration()
    print("Azure OpenAI client created (mock mode if credentials not set)")
