from rest_framework import serializers
from authentication.models import User
from .models import Follow


class ProfileSerializer(serializers.ModelSerializer):

  follower_count=serializers.IntegerField(read_only=True)
  following_count=serializers.IntegerField(read_only=True)
  is_following=serializers.SerializerMethodField()

  class Meta:
    model=User
    fields = ['username', 'full_name', 'bio', 'avatar', 'follower_count', 'following_count','is_following']

  def get_is_following(self,obj):
    request=self.context.get('request')
    if not request or not request.user.is_authenticated:
      return False
    return Follow.objects.filter(follower=request.user,following=obj).exists()

