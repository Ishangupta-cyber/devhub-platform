
from rest_framework.generics import ListAPIView
from .serializers import ActivitySerializer
from rest_framework.permissions import IsAuthenticated
from profiles.models import Follow
from .models import Activity

class ActivityFeedView(ListAPIView):

  serializer_class=ActivitySerializer
  permission_classes=[IsAuthenticated]

  def get_queryset(self):
    following_ids=Follow.objects.filter(follower=self.request.user).values_list("following_id",flat=True)
    return Activity.objects.filter(actor_id__in=following_ids).select_related("actor","content_type")
