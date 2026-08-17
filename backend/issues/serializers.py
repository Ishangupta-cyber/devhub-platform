
from rest_framework import serializers
from .models import Issue


class IssueSerializer(serializers.ModelSerializer):

  created_by=serializers.CharField(source="created_by.username",read_only=True)
  repository=serializers.CharField(source="repository.name",read_only=True)

  class Meta:
    model=Issue
    fields=['id', 'title', 'description', 'status', 'repository', 'created_by', 'created_at', 'updated_at']
    read_only_fields=['id','created_at','updated_at']
