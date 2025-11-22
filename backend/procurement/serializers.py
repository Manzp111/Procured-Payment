from rest_framework import serializers
from .models import PurchaseRequest, Approval

class PurchaseRequestSerializer(serializers.ModelSerializer):
    proforma = serializers.FileField(required=True)
    class Meta:
        model = PurchaseRequest
        fields = [
            "id", "title", "description", "amount", "status",
            "created_by", "created_at", "updated_at",
            "proforma", "purchase_order", "metadata"
        ]
        read_only_fields = ["status", "created_by", "created_at", "updated_at", "purchase_order", "metadata"]


class ApprovalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Approval
        fields = ["id", "purchase_request", "approved_by", "status", "comment", "approved_at"]
        read_only_fields = ["approved_at"]
