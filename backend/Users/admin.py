from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, VerificationToken

# -------------------------
# Custom User Admin
# -------------------------
@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # Fields to display in the list view
    list_display = ('first_name', 'last_name', 'phone', 'email','role', 'is_verified', 'is_active', 'is_staff')
    list_filter = ('is_verified', 'is_active', 'is_staff')
    search_fields = ('phone', 'email', 'first_name', 'last_name')
    ordering = ('phone',)

    # Fields to show on the detail view
    fieldsets = (
        ('Personal Info', {'fields': ('first_name', 'last_name', 'email', 'phone', 'profile_picture')}),
        ('Permissions', {'fields': ('is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important Dates', {'fields': ('last_login', 'date_joined')}),
        ('Authentication', {'fields': ('password',)}),
    )

    # Fields to show when creating a new user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('first_name', 'last_name', 'email', 'phone', 'password1', 'password2', 'is_verified', 'is_active', 'is_staff')}
        ),
    )

    # Readonly fields
    readonly_fields = ('date_joined', 'last_login')

# -------------------------
# VerificationToken Admin
# -------------------------
@admin.register(VerificationToken)
class VerificationTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'token', 'created_at', 'expires_at', 'is_expired')
    readonly_fields = ('token', 'created_at', 'expires_at')
    search_fields = ('user__phone', 'user__email', 'token')
    list_filter = ('created_at',)

    # Custom method to show if token is expired
    def is_expired(self, obj):
        return obj.is_expired()
    is_expired.boolean = True
    is_expired.short_description = 'Expired?'
