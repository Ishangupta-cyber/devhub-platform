from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status
from .serializers import RegisterSerializer,MeSerializer
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken


# Create your views here.

class RegisterView(APIView):
  def post(self,request):
    serializer=RegisterSerializer(data=request.data)
    if serializer.is_valid():
      user=serializer.save()
      return Response({"message": "User registered successfully", "email": user.email},status=status.HTTP_201_CREATED)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

  

class MeView(APIView):
  permission_classes=[IsAuthenticated]

  def get(self,request):
    serializer=MeSerializer(request.user)
    return Response(serializer.data)

  def post(self,request):
    serializer=MeSerializer(request.user,data=request.data,partial=True)
    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data)
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
  permission_classes=[IsAuthenticated]

  def post(self,request):
    try:
      refresh_token=request.data["refresh"]
      token=RefreshToken(refresh_token)
      token.blacklist()
      return Response({"message": "Logged out successfully"},status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
      return Response({"error": "Invalid token","message":str(e)},status=status.HTTP_400_BAD_REQUEST)
  


class ChangePassword(APIView):
  permission_classes=[IsAuthenticated]

  def post(self, request):
    user=request.user
    old_password=request.data.get("old_password")
    new_password=request.data.get("new_password")

    if not user.check_password(old_password):
      return Response({"error": "Old password is incorrect"},status=status.HTTP_400_BAD_REQUEST)

    if len(new_password)<8:
      return Response({"error": "New password must be at least 8 characters"},status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()
    return Response({"message": "Password changed successfully"},status=status.HTTP_200_OK)



  