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
    """?owner=<username> lists that user's repos (used by profile pages).

    Without it, returns what the current user can reach: their own repos
    plus those belonging to organisations they are a member of.
    """
    base=Repository.objects.select_related('owner','organization')

    owner=self.request.query_params.get('owner')
    if owner:
      return base.filter(owner__username=owner)

    user=self.request.user
    return base.filter(
      Q(owner=user) | Q(organization__memberships__user=user)
    ).distinct()

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