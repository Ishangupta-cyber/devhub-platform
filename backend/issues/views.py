from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView

from repositories.permissions import CanViewRepository, RepositoryScopedMixin
from .models import Issue
from .permissions import IsAuthorOrRepositoryManager
from .serializers import IssueSerializer
from .services import create_issue


class IssueCreateView(RepositoryScopedMixin, ListCreateAPIView):
  serializer_class = IssueSerializer
  permission_classes = [CanViewRepository]

  def get_queryset(self):
    return Issue.objects.filter(repository_id=self.kwargs["repo_id"]).select_related("created_by", "repository")

  def perform_create(self, serializer):
    issue = create_issue(
      repository=self.get_repository(),
      created_by=self.request.user,
      title=serializer.validated_data['title'],
      description=serializer.validated_data.get('description', '')
    )
    serializer.instance = issue


class IssueDetailView(RepositoryScopedMixin, RetrieveUpdateAPIView):
  serializer_class = IssueSerializer
  permission_classes = [CanViewRepository, IsAuthorOrRepositoryManager]

  def get_queryset(self):
    return Issue.objects.filter(repository_id=self.kwargs['repo_id']).select_related("created_by", "repository")
