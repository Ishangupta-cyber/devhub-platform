from rest_framework import serializers
from .models import Repository

class RepositorySerializer(serializers.ModelSerializer):
  owner=serializers.CharField(source="owner.username",read_only=True)

  class Meta:
    model=Repository
    fields=["id","name","description","owner","created_at","updated_at"]
    read_only_fields=["id","created_at","updated_at"]
