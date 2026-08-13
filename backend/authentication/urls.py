from django.urls import path
from .views import RegisterView,MeView,LogoutView,ChangePassword
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView



urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/',TokenObtainPairView.as_view(),name='login'),
    path('refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    path('me/', MeView.as_view(), name='me'),
    path('logout/',LogoutView.as_view(),name='logout'),
    path('change-password/',ChangePassword.as_view(),name="change_password")
]