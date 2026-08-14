from django.shortcuts import get_object_or_404  
from rest_framework.generics import RetrieveAPIView, ListAPIView
from .serializers import ProfileSerializer
from authentication.models import User
from rest_framework.permissions import AllowAny,IsAuthenticated
from django.db.models import Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Follow

# Create your views here.

class ProfileDetailView(RetrieveAPIView):
  lookup_field="username"
  serializer_class=ProfileSerializer
  permission_classes=[AllowAny]

  def get_queryset(self):
    return User.objects.annotate(
            followers_count=Count('followers'),
            following_count=Count('following')
        )


class FollowUserView(APIView):
  permission_classes=[IsAuthenticated]

  def post(self, request, username):
    target_user=get_object_or_404(User,username=username)

    if target_user==request.user:
      return Response({"error":"You can not send request to yourself"},status=status.HTTP_400_BAD_REQUEST)

    follow_obj,created=Follow.objects.get_or_create(follower=request.user,following=target_user)

    if not created:
      return Response({
        "message":"Already following this user"
      },status=status.HTTP_200_OK)

    return Response({
      "message":f"You are now following {target_user.username}"
    },status=status.HTTP_201_CREATED)


class UnFollowUserView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, username):
        target_user = get_object_or_404(User, username=username)

        if target_user == request.user:
            return Response({"error": "You cannot unfollow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        follow_req = Follow.objects.filter(follower=request.user, following=target_user).first()

        if not follow_req:
            return Response({"message": "You Already do not Follow this user."}, status=status.HTTP_400_BAD_REQUEST)

        follow_req.delete()

        return Response({"message": f"You unfollowed {target_user.username}."}, status=status.HTTP_200_OK)


class FollowersListView(ListAPIView):
   serializer_class=ProfileSerializer
   permission_classes=[AllowAny]

   def get_queryset(self):
      target_user=get_object_or_404(User,username=self.kwargs['username'])
      follower_ids=Follow.objects.filter(following=target_user).values_list("follower_id",flat=True)
      return User.objects.filter(id__in=follower_ids).annotate(followers_count=Count('followers'),following_count=Count("following"))


class FollowingListView(ListAPIView):
   serializer_class=ProfileSerializer
   permission_classes=[AllowAny]

   def get_queryset(self):
      target_user=get_object_or_404(User,username=self.kwargs['username'])
      following_ids=Follow.objects.filter(follower=target_user).values_list("following_id",flat=True)
      return User.objects.filter(id__in=following_ids).annotate(followers_count=Count('followers'),following_count=Count("following"))