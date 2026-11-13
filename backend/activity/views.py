from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from issues.models import Issue
from profiles.models import Follow
from repositories.models import Repository
from .models import Activity
from .serializers import ActivitySerializer


class ActivityFeedView(ListAPIView):
  serializer_class=ActivitySerializer
  permission_classes=[IsAuthenticated]

  def get_queryset(self):
    user=self.request.user
    following_ids=Follow.objects.filter(follower=user).values_list("following_id",flat=True)

    # Following someone must not reveal what they do in private repos you
    # can't see: drop repo/issue events whose repository is hidden from you.
    visible_repo_ids=Repository.objects.visible_to(user).values("id")
    hidden_repo_ids=Repository.objects.exclude(id__in=visible_repo_ids).values("id")
    hidden_issue_ids=Issue.objects.filter(repository_id__in=hidden_repo_ids).values("id")
    repo_ct=ContentType.objects.get_for_model(Repository)
    issue_ct=ContentType.objects.get_for_model(Issue)

    return (
      Activity.objects.filter(actor_id__in=following_ids)
      .exclude(Q(content_type=repo_ct, object_id__in=hidden_repo_ids))
      .exclude(Q(content_type=issue_ct, object_id__in=hidden_issue_ids))
      .select_related("actor","content_type")
    )
