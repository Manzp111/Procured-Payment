import logging
from .document_processing import extract_text_from_any_pdf, parse_with_ai
from celery import shared_task
from django.core.files.base import ContentFile
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from weasyprint import HTML
from .models import PurchaseRequest
import logging



logger = logging.getLogger(__name__)

def process_proforma(request_id):
    """Process proforma with automatic format detection"""
    from .models import PurchaseRequest
    
    pr = PurchaseRequest.objects.get(id=request_id)
    
    try:
        # Smart extraction handles both formats
        raw_text = extract_text_from_any_pdf(pr.proforma)
        logger.info(f"Extracted {len(raw_text)} characters from request {request_id}")
        
        # Parse with AI
        structured_data = parse_with_ai(raw_text)
        
        # Save results
        pr.vendor_name = structured_data.get("vendor_name", "")[:255]
        pr.vendor_address = structured_data.get("vendor_address", "")
        pr.items_json = structured_data.get("items", [])
        pr.total_amount_extracted = structured_data.get("total_amount")
        pr.payment_terms = structured_data.get("payment_terms", "")
        pr.extraction_status = "SUCCESS"
        
        logger.info(f"Successfully processed proforma for request {request_id}")
        
    except Exception as e:
        error_msg = str(e)[:300]  # Truncate long errors
        logger.error(f"Extraction failed for {request_id}: {error_msg}")
        
        pr.extraction_status = "FAILED"
        pr.vendor_address = f"Processing error: {error_msg}"
    
    pr.save()



logger = logging.getLogger(__name__)


@shared_task
def generate_purchase_order(request_id):
    """
    Generate a PDF Purchase Order and email it to the request creator.
    """
    try:
        pr = PurchaseRequest.objects.get(id=request_id)

        if pr.status != "APPROVED":
            logger.warning(f"Skipping PO generation for non-approved request {request_id}")
            return

        # 1. Render Template → HTML string
        html_string = render_to_string("emails/po.html", {"purchase_request": pr})

        # 2. Convert HTML → PDF bytes
        pdf_bytes = HTML(string=html_string).write_pdf()

        # 3. Save PDF to model field
        filename = f"PO_{pr.id}.pdf"
        pr.purchase_order.save(filename, ContentFile(pdf_bytes), save=True)

        # 4. Email the PDF to request creator
        if pr.created_by and pr.created_by.email:
            email = EmailMessage(
                subject=f"Purchase Order #{pr.id} Approved",
                body=(
                    f"Hello {pr.created_by.username},\n\n"
                    f"Your purchase request titled '{pr.title}' has been fully approved.\n"
                    f"The Purchase Order is attached.\n\n"
                    f"Thank you.\n"
                ),
                to=[pr.created_by.email],
            )

            email.attach(filename, pdf_bytes, "application/pdf")
            email.send()

            logger.info(f"📧 PO emailed to {pr.created_by.email}")

        logger.info(f"✅ Purchase Order generated and emailed for request {request_id}")

    except Exception as e:
        logger.error(f"❌ PO generation failed for request {request_id}: {e}")

        # Clean-up fallback: remove invalid PO file
        try:
            pr = PurchaseRequest.objects.get(id=request_id)
            pr.purchase_order = None
            pr.save()
        except:
            pass
