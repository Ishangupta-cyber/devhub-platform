from rest_framework import serializers
from .models import Card,Project,Column

class ProjectSerializer(serializers.ModelSerializer):
    repository_owner = serializers.ReadOnlyField(source='repository.owner.username')

    class Meta:
        model = Project
        fields = ['id', 'name', 'created_at', 'repository_owner']
        read_only_fields = ['id', 'created_at']

class ColumnSerializer(serializers.ModelSerializer):
  class Meta:
    model=Column
    fields=["id","name","position"]
    read_only_fields=["id"]

class CardSerializer(serializers.ModelSerializer):
  # writing_only 
  link_type=serializers.CharField(write_only=True,required=False)
  link_id=serializers.IntegerField(write_only=True,required=False)
  # reading_only
  linked_type=serializers.SerializerMethodField()
  linked_id=serializers.IntegerField(source="object_id",read_only=True)
  linked_title=serializers.SerializerMethodField()

  class Meta:
    model=Card
    fields=['id', 'column', 'position', 'link_type', 'link_id', 'linked_type', 'linked_id', 'linked_title', 'added_at']

  def get_linked_type(self,obj):
    return obj.content_type.model
  def get_linked_title(self,obj):
    return obj.content_object.title
  
