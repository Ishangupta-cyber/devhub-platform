from rest_framework import serializers
from .models import Repository
from organisations.serializers import OrganizationMiniSerializer

class RepositorySerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source='owner.username', read_only=True)
    organization = OrganizationMiniSerializer(read_only=True)
    organization_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Repository
        fields = ['id', 'name', 'description', 'owner', 'organization', 'organization_id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']