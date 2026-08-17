from .serializers import IssueSerializer
from rest_framework.generics import ListCreateAPIView,RetrieveUpdateAPIView
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Issue
from repositories.models import Repository
from django.shortcuts import get_object_or_404
from .services import create_issue
from .permissions import IsRepositoryOwnerOrReadOnly
# Create your views here.

class IssueCreateView(ListCreateAPIView):
  serializer_class = IssueSerializer
  permission_classes=[IsAuthenticatedOrReadOnly]

  def get_queryset(self):
    return Issue.objects.filter(repository_id=self.kwargs["repo_id"])

  def perform_create(self, serializer):
    repository = get_object_or_404(Repository, id=self.kwargs['repo_id'])
    issue=create_issue( repository=repository,
    created_by=self.request.user,
    title=serializer.validated_data['title'],
    description=serializer.validated_data.get('description', '')
    )
    serializer.instance=issue

class IssueDetailView(RetrieveUpdateAPIView):
  serializer_class=IssueSerializer
  permission_classes=[IsAuthenticatedOrReadOnly,IsRepositoryOwnerOrReadOnly]

  def get_queryset(self):
    return Issue.objects.filter(repository_id=self.kwargs['repo_id'])

    



