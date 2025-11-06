import sys
from pathlib import Path
from datetime import datetime
sys.path.insert(0, str(Path(__file__).parent))

from src.verification_pipeline import AadhaarVerificationPipeline
from config import RAW_DATA_DIR, OUTPUTS_DIR

pipeline = AadhaarVerificationPipeline()

print(f"Processing images from: {RAW_DATA_DIR}")
results = pipeline.batch_verify(str(RAW_DATA_DIR), use_azure=False)

if results:
    # Generate timestamped filename
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_filename = f"verification_report_{timestamp}.json"
    report_path = pipeline.generate_report(results, str(OUTPUTS_DIR / report_filename))
    print(f"\nReport generated: {report_path}")
    print(f"Total images processed: {len(results)}")
else:
    print("No images found or processed")
