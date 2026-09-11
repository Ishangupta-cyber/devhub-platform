from django.db.models import Q
from django.shortcuts import render
from rest_framework import generics,permissions
from .models import Repository
from .serializers import RepositorySerializer
from .permissions import IsOwnerOrReadOnly
from .services import create_repository

# Create your views here.

class RepositoryListCreateView(generics.ListCreateAPIView):
  serializer_class=RepositorySerializer
  permission_classes=[permissions.IsAuthenticated]

  def get_queryset(self):
    """Repositories the current user owns, plus those of orgs they belong to."""
    user=self.request.user
    return (
      Repository.objects
      .filter(Q(owner=user) | Q(organization__memberships__user=user))
      .select_related('owner','organization')
      .distinct()
    )

  def perform_create(self, serializer):
    repo=create_repository(
      owner=self.request.user,
      name=serializer.validated_data['name'],
      description=serializer.validated_data.get('description',''),
      organization_id=serializer.validated_data.get('organization_id')
    )
    serializer.instance=repo


class RepositoryDetailView(generics.RetrieveUpdateDestroyAPIView):
  queryset=Repository.objects.all()
  serializer_class=RepositorySerializer
  permission_classes=[IsOwnerOrReadOnly]