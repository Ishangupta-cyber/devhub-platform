from rest_framework import serializers
from .models import Pull_Request

class PullRequestSerializer(serializers.Serializer):
  created_by=serializers.CharField(source="created_by.username",read_only=True)
  repository=serializers.CharField(source="repository.name",read_only=True)

  class Meta:
    model=Pull_Request
    fields=["id","title","description","status",'repository', 'created_by', 'created_at', 'updated_at']
    read_only_fields=["id","created_at","updated_at"]

  def validate(self,data):
    new_status=data.get('status')
    if new_status and self.instance:
      if not self.instance.can_transition_to(new_status):
        raise serializers.ValidationError(f"Cannot move from '{self.instance.status}' to '{new_status}'.")
    return data
