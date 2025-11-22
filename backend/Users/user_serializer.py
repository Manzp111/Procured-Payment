# users/serializers.py

from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        help_text="Password must be strong"
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={"input_type": "password"},
        help_text="Enter the same password for confirmation"
    )
    profile_picture_url = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ( "id","email","phone", "first_name", "last_name", "password", "password2", "profile_picture_url", "is_verified","is_active","is_staff",)
        extra_kwargs = {
            "id":{"read_only":True},
            "is_verified": {"read_only": True},
            "is_active": {"read_only": True},
            "is_staff": {"read_only": True},
        }
 
    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        # Check if profile_picture exists and has a file
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            try:
                return request.build_absolute_uri(obj.profile_picture.url)
            except ValueError:
                return None
        return None



    def validate_password(self, value):
        """
        Validate the password using Django's validators.
        Can add extra rules here if needed.
        """
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        return value
        
    def validate(self, attrs):
            # Password match check
            if attrs.get("password") != attrs.get("password2"):
                raise serializers.ValidationError({
                    "success": False,
                    "message": "Passwords do not match",
                    "data": None
                })

            # Email uniqueness check
            if User.objects.filter(email=attrs.get("email")).exists():
                raise serializers.ValidationError({
                    "success": False,
                    "message": "Email already exists",
                    "data": None
                })

            # Phone uniqueness check
            if User.objects.filter(phone=attrs.get("phone")).exists():
                raise serializers.ValidationError({
                    "success": False,
                    "message": "Phone number already exists",
                    "data": None
                })

            # Password strength check
            try:
                validate_password(attrs.get("password"))
            except ValidationError as e:
                raise serializers.ValidationError({
                    "success": False,
                    "message": e.messages[0],  # only return the first validation message
                    "data": None
                })

            return attrs

    def create(self, validated_data):
            validated_data.pop("password2")
            password = validated_data.pop("password")
            user = User(**validated_data)
            user.set_password(password)          
      
            return user
