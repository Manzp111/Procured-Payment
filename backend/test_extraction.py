import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set the CORRECT settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'procured_payment.settings')

# Setup Django
django.setup()

# Import your procurement app modules
from procurement.document_processing import extract_text_from_pdf, parse_with_ai
from django.core.files.uploadedfile import SimpleUploadedFile

def test_extraction():
    # Path to your sample.pdf (in procurement app folder)
    pdf_path = os.path.join('procurement', 'sample.pdf')
    
    if not os.path.exists(pdf_path):
        print(f"❌ ERROR: PDF file not found at: {pdf_path}")
        print("Please ensure 'sample.pdf' is in the 'procurement' folder")
        return

    try:
        with open(pdf_path, 'rb') as f:
            mock_file = SimpleUploadedFile('sample.pdf', f.read(), content_type='application/pdf')
            
            print("📝 Step 1: Extracting text from PDF...")
            text = extract_text_from_pdf(mock_file)
            print(f"✅ Success! Extracted {len(text)} characters")
            print("First 300 characters:")
            print(repr(text[:300]))

            if not text.strip():
                print("⚠️  WARNING: No text extracted! The PDF might be a scanned image (not text-based).")
                return

            print("\n🤖 Step 2: Sending to OpenAI for structured parsing...")
            data = parse_with_ai(text)
            print("✅ SUCCESS! AI extracted structured data:")
            print(data)
            
    except Exception as e:
        print(f"💥 FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_extraction()