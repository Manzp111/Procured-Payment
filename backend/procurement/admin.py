from django.contrib import admin
from .models import PurchaseRequest, Approval

# Inline approvals inside purchase request
class ApprovalInline(admin.TabularInline):
    model = Approval
    extra = 0
    readonly_fields = ("approved_at",)
    fields = ("approved_by", "status", "comment", "approved_at")
    can_delete = False


@admin.register(PurchaseRequest)
class PurchaseRequestAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "created_by", "amount", "created_at", "updated_at")
    list_filter = ("status", "created_at", "updated_at")
    search_fields = ("title", "description", "created_by__email", "created_by__first_name", "created_by__last_name")
    ordering = ("-created_at",)
    readonly_fields = ("created_at", "updated_at", "purchase_order")
    inlines = [ApprovalInline]

    fieldsets = (
        ("Request Info", {
            "fields": ("title", "description", "amount", "status")
        }),
        ("Files", {
            "fields": ("proforma", "purchase_order")
        }),
        ("Creator Info", {
            "fields": ("created_by",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )


@admin.register(Approval)
class ApprovalAdmin(admin.ModelAdmin):
    list_display = ("purchase_request", "status", "approved_by", "approved_at")
    list_filter = ("status", "approved_at")
    search_fields = ("purchase_request__title", "approved_by__email", "comment")
    readonly_fields = ("approved_at",)
    ordering = ("-approved_at",)

    fieldsets = (
        ("Approval Info", {
            "fields": ("purchase_request", "approved_by", "status", "comment")
        }),
        ("Timestamp", {
            "fields": ("approved_at",)
        }),
    )
