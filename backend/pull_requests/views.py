from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateAPIView

from issues.permissions import IsAuthorOrRepositoryManager
from repositories.permissions import CanViewRepository, RepositoryScopedMixin
from .models import Pull_Request
from .serializers import PullRequestSerializer
from .services import create_pull_request

# Statuses only a repo manager may move a PR into.
MANAGER_ONLY_STATUSES = {"approved", "merged"}


class PullRequestListCreateView(RepositoryScopedMixin, ListCreateAPIView):
  permission_classes = [CanViewRepository]
  serializer_class = PullRequestSerializer

  def get_queryset(self):
    return Pull_Request.objects.filter(repository_id=self.kwargs["repo_id"]).select_related("created_by", "repository")

  def perform_create(self, serializer):
    pr = create_pull_request(
      repository=self.get_repository(),
      created_by=self.request.user,
      title=serializer.validated_data['title'],
      description=serializer.validated_data.get('description', "")
    )
    serializer.instance = pr


class PullRequestDetailView(RepositoryScopedMixin, RetrieveUpdateAPIView):
  serializer_class = PullRequestSerializer
  permission_classes = [CanViewRepository, IsAuthorOrRepositoryManager]

  def get_queryset(self):
    return Pull_Request.objects.filter(repository_id=self.kwargs["repo_id"]).select_related("created_by", "repository")

  def perform_update(self, serializer):
    new_status = serializer.validated_data.get("status")
    if new_status in MANAGER_ONLY_STATUSES and not self.get_repository().user_can_manage(self.request.user):
      raise PermissionDenied("Only repository maintainers can approve or merge pull requests.")
    serializer.save()
