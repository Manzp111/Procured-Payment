# procurement/models.py

from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import JSONField  # For metadata storage
User = settings.AUTH_USER_MODEL

class PurchaseRequest(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default="USD")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="PENDING")
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="purchase_requests")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Files
    proforma = models.FileField(upload_to="proforma_files/", null=True, blank=True)
    purchase_order = models.FileField(upload_to="purchase_orders/", null=True, blank=True)
    receipt = models.FileField(upload_to="receipts/", null=True, blank=True)

    # Extracted metadata from proforma
    proforma_data = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.status})"

class Approval(models.Model):
    STATUS_CHOICES = [
        ("APPROVED", "Approved"),
        ("REJECTED", "Rejected"),
    ]

    purchase_request = models.ForeignKey(PurchaseRequest, on_delete=models.CASCADE, related_name="approvals")
    approved_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="approvals_made")
    status = models.CharField(max_length=8, choices=STATUS_CHOICES)
    comment = models.TextField(blank=True, null=True)
    approved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.purchase_request.title} - {self.status} by {self.approved_by.email}"
