import pytesseract
import cv2
from pathlib import Path

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Test if Tesseract is working
try:
    version = pytesseract.get_tesseract_version()
    print(f"[OK] Tesseract is installed: Version {version}")
except Exception as e:
    print(f"[ERROR] Tesseract error: {e}")
    exit(1)

# Test on a sample image
data_dir = Path(__file__).parent / "data" / "raw"
if data_dir.exists():
    images = list(data_dir.glob("*.jpg"))
    if images:
        test_image = str(images[0])
        print(f"\nTesting on: {images[0].name}")
        
        img = cv2.imread(test_image)
        if img is not None:
            print(f"Image loaded: {img.shape}")
            
            # Test image_to_data
            try:
                data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
                print(f"\nimage_to_data keys: {list(data.keys())}")
                print(f"Number of items: {len(data.get('text', []))}")
                if 'conf' in data:
                    print(f"Confidence values found: {len([c for c in data['conf'] if float(c) > 0])}")
            except Exception as e:
                print(f"image_to_data error: {e}")
            
            # Test image_to_string
            try:
                text = pytesseract.image_to_string(img)
                print(f"\nExtracted text length: {len(text)}")
                print(f"First 200 chars: {text[:200]}")
            except Exception as e:
                print(f"image_to_string error: {e}")
        else:
            print("Failed to load image")
    else:
        print("No images found in data/raw")
else:
    print(f"Directory not found: {data_dir}")
