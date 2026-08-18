from rest_framework import serializers
from .models import Comments


class CommentSerializer(serializers.ModelSerializer):
  author=serializers.CharField(source="author.username",read_only=True)

  class Meta:
    model=Comments
    field=["id","content","author","created_at","updated_at"]
    read_only_fields=["id","created_at","updated_at"]
