from django.shortcuts import render
from rest_framework import generics,permissions
from .models import Repository
from .serializers import RepositorySerializer
from .permissions import IsOwnerOrReadOnly
from .services import create_repository

# Create your views here.

class RepositoryListCreateView(generics.ListCreateAPIView):
  queryset=Repository.objects.all()
  serializer_class=RepositorySerializer
  permission_classes=[permissions.IsAuthenticatedOrReadOnly]

  def perform_create(self, serializer):
    repo=create_repository(
      owner=self.request.user,
      name=serializer.validated_data['name'],
      description=serializer.validated_data.get('description','')
    )
    serializer.instance=repo


class RepositoryDetailView(generics.RetrieveUpdateDestroyAPIView):
  queryset=Repository.objects.all()
  serializer_class=RepositorySerializer
  permission_classes=[IsOwnerOrReadOnly]