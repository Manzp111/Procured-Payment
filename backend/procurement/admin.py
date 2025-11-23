# requests/admin.py

from django.contrib import admin
from .models import PurchaseRequest, ApprovalLevel, ApprovalAction

# -----------------------------
# ApprovalLevel Admin
# -----------------------------
@admin.register(ApprovalLevel)
class ApprovalLevelAdmin(admin.ModelAdmin):
    list_display = ('level', 'name', 'approver_list', 'created_by', 'created_at')
    search_fields = ('name',)
    ordering = ('level',)
    
    def approver_list(self, obj):
        return ", ".join([str(u) for u in obj.approvers.all()])
    approver_list.short_description = "Approvers"

# -----------------------------
# PurchaseRequest Admin
# -----------------------------
@admin.register(PurchaseRequest)
class PurchaseRequestAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'status', 'current_level', 'amount', 
        'created_by', 'created_at', 'updated_at'
    )
    list_filter = ('status', 'current_level', 'created_at')
    search_fields = ('title', 'vendor_name', 'invoice_vendor_name')
    readonly_fields = ('created_at', 'updated_at', 'current_level', 'three_way_match_status', 'discrepancy_details')
    
    fieldsets = (
        ("Request Info", {
            'fields': ('title', 'description', 'amount', 'status', 'current_level')
        }),
        ("Files", {
            'fields': ('proforma', 'purchase_order', 'invoice', 'receipt')
        }),
        ("Vendor / AI Data", {
            'fields': ('vendor_name', 'vendor_address', 'items_json', 'total_amount_extracted', 
                       'invoice_vendor_name', 'invoice_items_json', 'invoice_total')
        }),
        ("Matching / Tolerance", {
            'fields': ('three_way_match_status', 'discrepancy_details', 'amount_tolerance_percent', 'quantity_tolerance_percent')
        }),
        ("Audit Info", {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )

# -----------------------------
# ApprovalAction Admin
# -----------------------------
@admin.register(ApprovalAction)
class ApprovalActionAdmin(admin.ModelAdmin):
    list_display = ('request', 'level', 'action', 'actor', 'acted_at')
    list_filter = ('action', 'level', 'acted_at')
    search_fields = ('actor__username', 'request__title', 'comment')
    readonly_fields = ('acted_at',)
