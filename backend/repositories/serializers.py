from rest_framework import serializers
from .models import Repository

class RepositorySerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source='owner.username', read_only=True)
    organization = serializers.CharField(source='organization.name', read_only=True, default=None)
    organization_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Repository
        fields = ['id', 'name', 'description', 'owner', 'organization', 'organization_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']