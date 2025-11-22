from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import (
    extend_schema,
    OpenApiParameter,
    OpenApiExample
)
from drf_spectacular.types import OpenApiTypes

import pdfplumber
import pytesseract
from PIL import Image
import tempfile
import os
import openai

class CreatePurchaseRequestAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Create Purchase Request from Uploaded Proforma Invoice",
        description="Upload a PDF/Image proforma and extract structured data using OpenAI.",
        parameters=[
            OpenApiParameter(
                name="title",
                type=OpenApiTypes.STR,
                location="form",
                description="Title of purchase request",
                required=True
            ),
            OpenApiParameter(
                name="department",
                type=OpenApiTypes.STR,
                location="form",
                description="Department requesting purchase",
                required=True
            ),
            OpenApiParameter(
                name="proforma",
                type=OpenApiTypes.BINARY,
                location="form",
                description="Proforma invoice file (PDF or Image)",
                required=True
            ),
        ],
        examples=[
            OpenApiExample(
                "Sample Request",
                summary="Example with title and department",
                value={"title": "Laptop Purchase", "department": "IT Department"},
            ),
        ],
    )
    def post(self, request):
        serializer = PurchaseRequestSerializer(data=request.data)

        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            for chunk in proforma.chunks():
                tmp.write(chunk)
            temp_path = tmp.name

        extracted_text = ""
        try:
            if proforma.name.lower().endswith(".pdf"):
                with pdfplumber.open(temp_path) as pdf:
                    extracted_text = "\n".join([page.extract_text() or "" for page in pdf.pages])
            else:  # assume image
                img = Image.open(temp_path)
                extracted_text = pytesseract.image_to_string(img)
        except Exception as e:
            os.remove(temp_path)
            return Response({"success": False, "message": str(e)}, status=500)
        finally:
            os.remove(temp_path)

        # Send extracted text to OpenAI to get structured data
        prompt = f"""
        Extract the following information from this proforma invoice text:

        {extracted_text}

        Return JSON with these keys:
        - supplier_name
        - item_list (array of items with name, quantity, unit_price)
        - total_amount
        - currency
        - date
        - reference_number
        """

        try:
            client = openai.OpenAI()
            ai_response = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[{"role": "user", "content": prompt}],
            )
            extracted_data = ai_response.choices[0].message["content"]
        except Exception as e:
            return Response(
                {"success": False, "message": "OpenAI error", "error": str(e)},
                status=500,
            )

        return Response(
            {
                "success": True,
                "message": "Purchase request created",
                "data": {
                    "title": title,
                    "department": department,
                    "extracted_data": extracted_data,
                },
            },
            status=201,
        )
