from rest_framework import serializers
from .models import FileNode

class FileNodeCreateSerializer(serializers.Serializer):
  name = serializers.CharField(max_length=255)
  node_type = serializers.ChoiceField(choices=FileNode.NodeType.choices)
  parent = serializers.IntegerField(required=False, allow_null=True)
  content = serializers.CharField(required=False, allow_blank=True, default='')

class fileNodeDetailSerializer(serializers.Serializer):
  name=serializers.CharField(max_length=255)
  content=serializers.CharField(required=False,allow_blank=True,default='')