from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView
from .serializers import CommentSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.contrib.contenttypes.models import ContentType
from .models import Comments
from issues.models import Issue
from .services import create_comment
from django.shortcuts import get_object_or_404
from .permissions import IsAuthorOrParentOwner
# Create your views here.

class CommentListCreateView(ListCreateAPIView):
  serializer_class=CommentSerializer
  permission_classes=[IsAuthenticatedOrReadOnly]

  def get_queryset(self):
    issue_content_type=ContentType.objects.get_for_model(Issue)
    return Comments.objects.filter(
      content_type=issue_content_type,
      object_id=self.kwargs["issue_id"]
    )

  def perform_create(self, serializer):
    issue = get_object_or_404(Issue, id=self.kwargs['issue_id'])
    comment = create_comment(
            content_object=issue,
            author=self.request.user,
            content=serializer.validated_data['content']
        )
    serializer.instance = comment

class CommentDetailView(RetrieveUpdateDestroyAPIView):
  serializer_class=CommentSerializer
  permission_classes=[IsAuthorOrParentOwner]

  def get_queryset(self):
      issue_content_type = ContentType.objects.get_for_model(Issue)
      return Comments.objects.filter(
          content_type=issue_content_type,
          object_id=self.kwargs['issue_id']
      )