from django.contrib.contenttypes.models import ContentType
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from issues.models import Issue
from repositories.permissions import CanViewRepository, RepositoryScopedMixin
from .models import Comments
from .permissions import IsAuthorOrParentOwner
from .serializers import CommentSerializer
from .services import create_comment


class IssueCommentMixin(RepositoryScopedMixin):
  def get_issue(self):
    if not hasattr(self, "_issue"):
      self._issue = get_object_or_404(Issue.objects.select_related("repository"), id=self.kwargs["issue_id"])
    return self._issue

  def resolve_repository(self):
    return self.get_issue().repository

  def get_queryset(self):
    return Comments.objects.filter(
      content_type=ContentType.objects.get_for_model(Issue),
      object_id=self.kwargs["issue_id"],
    ).select_related("author")


class CommentListCreateView(IssueCommentMixin, ListCreateAPIView):
  serializer_class = CommentSerializer
  permission_classes = [CanViewRepository]

  def perform_create(self, serializer):
    serializer.instance = create_comment(
      content_object=self.get_issue(),
      author=self.request.user,
      content=serializer.validated_data['content'],
    )


class CommentDetailView(IssueCommentMixin, RetrieveUpdateDestroyAPIView):
  serializer_class = CommentSerializer
  permission_classes = [CanViewRepository, IsAuthorOrParentOwner]
