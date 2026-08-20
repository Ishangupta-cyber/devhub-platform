from rest_framework.generics import ListCreateAPIView,RetrieveUpdateAPIView
from issues.permissions import IsRepositoryOwnerOrReadOnly
from .serializers import PullRequestSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Pull_Request
from django.shortcuts import get_object_or_404
from repositories.models import Repository
from .services import create_pull_request
# Create your views here.

class PullRequestListCreateView(ListCreateAPIView):
  permission_classes=[IsRepositoryOwnerOrReadOnly]
  serializer_class=PullRequestSerializer

  def get_queryset(self):
    return Pull_Request.objects.filter(repository_id=self.kwargs["repo_id"])

  def perform_create(self, serializer):
    repository=get_object_or_404(Repository, id=self.kwargs["repo_id"])
    pr=create_pull_request(
      repository=repository,
      created_by=self.request.user,
      title=serializer.validated_data['title'],
      description=serializer.validated_data.get('description',"")
    )
    serializer.instance=pr


class PullRequestDetailView(RetrieveUpdateAPIView):
  serializer_class=PullRequestSerializer
  permission_classes=[IsRepositoryOwnerOrReadOnly,IsAuthenticatedOrReadOnly]

  def get_queryset(self):
    return Pull_Request.objects.filter(repository_id=self.kwargs["repo_id"])

