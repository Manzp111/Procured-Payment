# procurement/urls.py
from django.urls import path
from .views import CreatePurchaseRequestAPIView

urlpatterns = [
    path("requests/", CreatePurchaseRequestAPIView.as_view(), name="create-request"),
]
