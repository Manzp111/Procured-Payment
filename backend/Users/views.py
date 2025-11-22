# users/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from drf_spectacular.utils import extend_schema, OpenApiExample
from django.db import transaction
from .user_serializer import UserRegistrationSerializer
from .utils import api_response
from .models import VerificationToken,User
from .task import send_welcome_email_task
from .mixins import UserStatusMixin
from rest_framework_simplejwt.tokens import RefreshToken




@extend_schema(
    summary="Register a new user account",
    description="""
### User Registration API  
This endpoint allows a new user to create an account.

**Features:**
- Validates unique email and phone
- Enforces strong password rules
- Returns a consistent response format with metadata
- Public — no authentication required
""",
    request=UserRegistrationSerializer,
    responses={
        201: OpenApiExample(
            "Success Response",
            value={
                "success": True,
                "message": "User registered successfully",
                "data": {
                    "id": 1,
                    "email": "john@gmail.com",
                    "phone": "+250780000002",
                    "first_name": "John",
                    "last_name": "Doe",
                    "profile_picture": None,
                    "is_verified": False,
                    "is_active": True,
                    "is_staff": False
                },
                "errors": None,
       
            }
        ),
        400: OpenApiExample(
            "Validation Error",
            value={
                "success": False,
                "message": "Registration failed",
                "data": None,
                "errors": {
                    "email": ["This field must be unique."],
                    "phone": ["This field must be unique."],
                    "password": ["Password is too weak."]
                },
       
            }
        ),
    },
    examples=[
        OpenApiExample(
            "User Registration Example",
            description="Example request body to create a new user",
            value={
                "email": "gilbert@gmail.com",
                "phone": "0781234567",
                "first_name": "Gilbert",
                "last_name": "Manzi",
                "password": "StrongPass@123",
                "password2": "StrongPass@123",
                "profile_picture": None
            }
        )
    ],
    methods=["POST"]
)
class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data, context={"request": request})

        # serializer = UserRegistrationSerializer(data=request.data)

        # Validate manually, no automatic exception
        serializer.is_valid(raise_exception=False)

        if serializer.errors:
            # Return the first error only
            first_field = next(iter(serializer.errors))
            first_msg = serializer.errors[first_field]
            return api_response(
                success=False,
                message=first_msg[0] if isinstance(first_msg, list) else str(first_msg),
                data=None,
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            with transaction.atomic():
                user = serializer.create(serializer.validated_data)
                user.save()
                token_obj = VerificationToken.objects.create(user=user)
                send_welcome_email_task.delay(user.id, str(token_obj.token))
        except Exception as e:
            # Catch any save error
            return api_response(
                success=False,
                message=str(e),
                data=None,
                status_code=status.HTTP_400_BAD_REQUEST
                
            )
        user_serializer = UserRegistrationSerializer(user, context={"request": request})
        return api_response(
            success=True,
            message="User registered successfully",  
            data=user_serializer.data,             
            status_code=status.HTTP_201_CREATED
        )





@extend_schema(
    summary="Login a user and get JWT tokens",
    description="""
### User Login API
This endpoint allows an existing user to log in using their email and password.

**Behavior:**
- Checks if the user exists.
- Validates password correctness.
- Ensures the user is active and verified.
- Returns `access` and `refresh` JWT tokens on successful login.
- Returns meaningful error messages if login fails.

**Responses:**
- 200: Success with JWT tokens.
- 400: Missing email or password.
- 401: Incorrect password.
- 403: User inactive or not verified.
- 404: Email does not exist.
""",
    request=OpenApiExample(
        name="Login Request Example",
        value={
            "email": "user@example.com",
            "password": "StrongPass@123"
        },
        request_only=True
    ),
    responses={
        200: OpenApiExample(
            "Successful Login",
            value={
                "success": True,
                "message": "Login successful",
                "data": {
                    "access": "<access_token_here>",
                    "refresh": "<refresh_token_here>"
                },
                "errors": None
            }
        ),
        400: OpenApiExample(
            "Missing Fields",
            value={
                "success": False,
                "message": "Email and password are required",
                "data": None,
                "errors": None
            }
        ),
        401: OpenApiExample(
            "Incorrect Password",
            value={
                "success": False,
                "message": "Incorrect password",
                "data": None,
                "errors": None
            }
        ),
        403: OpenApiExample(
            "Inactive or Unverified User",
            value={
                "success": False,
                "message": "User account is inactive or not verified",
                "data": None,
                "errors": None
            }
        ),
        404: OpenApiExample(
            "Email Not Found",
            value={
                "success": False,
                "message": "Email does not exist",
                "data": None,
                "errors": None
            }
        ),
    },
      examples=[
        OpenApiExample(
            "User login Example",
            description="Example request body to login to user",
            value={                              
                    "email": "gilbertnshimyimana11@gmail.com",
                    "password": "StrongPass@123"                  

            }
        )
    ],
   
    methods=["POST"]
)
class LoginAPIView(APIView, UserStatusMixin):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return api_response(
                success=False,
                message="Email and password are required",
                data=None,
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return api_response(
                success=False,
                message="Email does not exist",
                data=None,
                status_code=status.HTTP_404_NOT_FOUND
            )

        if not user.check_password(password):
            return api_response(
                success=False,
                message="Incorrect password",
                data=None,
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        # Check active and verified using mixin
        status_check = self.check_user_status(user)
        if status_check:
            return status_check

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        data = {
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }

        return api_response(
            success=True,
            message="Login successful",
            data=data,
            status_code=status.HTTP_200_OK
        )
