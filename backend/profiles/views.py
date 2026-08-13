from django.shortcuts import render
from rest_framework.generics import RetrieveAPIView
from .serializers import ProfileSerializer
from authentication.models import User
from rest_framework.permissions import AllowAny
from django.db.models import Count

# Create your views here.

class ProfileDetailView(RetrieveAPIView):
  lookup_field="username"
  serializer_class=ProfileSerializer
  permission_classes=[AllowAny]

  def get_queryset(self):
    return User.objects.annotate(
            followers_count=Count('followers'),
            following_count=Count('following')
        )

