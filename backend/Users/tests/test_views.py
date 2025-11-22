from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from Users.models import User, VerificationToken
from unittest.mock import patch


class RegisterAPIViewTest(APITestCase):

    def setUp(self):
        self.url = reverse("register")
        self.user_data = {
            "email": "testuser@example.com",
            "phone": "0781234567",
            "first_name": "Test",
            "last_name": "User",
            "password": "StrongPass@123",
            "password2": "StrongPass@123",
            "profile_picture": None
        }

    @patch("Users.views.send_welcome_email_task.delay")
    def test_successful_registration(self, mock_send_email):
        response = self.client.post(self.url, self.user_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["message"], "User registered successfully")
        self.assertIsNone(response.data["errors"])

        # Check DB
        self.assertEqual(User.objects.count(), 1)
        user = User.objects.first()
        self.assertEqual(user.email, self.user_data["email"])

        # Check verification token
        self.assertTrue(VerificationToken.objects.filter(user=user).exists())
        token = VerificationToken.objects.get(user=user)
        mock_send_email.assert_called_once_with(user.id, str(token.token))

    def test_missing_required_fields(self):
        data = {}
        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Email is required.")  # check the first field's error message

        expected_errors = ["email", "phone", "first_name", "last_name", "password", "password2"]
        custom_messages = {
            "email": "Email is required.",
            "phone": "Phone number is required.",
            "first_name": "First name is required.",
            "last_name": "Last name is required.",
            "password": "Password is required.",
            "password2": "Password confirmation is required.",
        }

        # for field in expected_errors:
        #     self.assertIn(field, response.data["errors"])
        #     self.assertIn(custom_messages[field], response.data["errors"][field])


    def test_password_mismatch(self):
        data = self.user_data.copy()
        data["password2"] = "WrongPass@123"

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Passwords do not match")

    def test_duplicate_email(self):
        User.objects.create_user(
            email=self.user_data["email"],
            phone="0799999999",
            first_name="Existing",
            last_name="User",
            password="StrongPass@123"
        )

        response = self.client.post(self.url, self.user_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Email already exists")

    def test_duplicate_phone(self):
        User.objects.create_user(
            email="new@example.com",
            phone=self.user_data["phone"],
            first_name="Existing",
            last_name="User",
            password="StrongPass@123"
        )

        response = self.client.post(self.url, self.user_data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Phone number already exists")

    def test_weak_password(self):
        data = self.user_data.copy()
        data["password"] = data["password2"] = "123"

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data["success"])
        self.assertEqual(response.data["message"], "Password must be at least 8 characters long")
