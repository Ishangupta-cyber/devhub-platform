from rest_framework import serializers
from .models import FileNode


class FileNodeCreateSerializer(serializers.Serializer):
  name = serializers.CharField(max_length=255)
  node_type = serializers.ChoiceField(choices=FileNode.NodeType.choices)
  parent = serializers.IntegerField(required=False, allow_null=True)
  # trim_whitespace=False - content payload hai, har byte user ka hai.
  # Default True hota to trailing newline / indentation kat jaati.
  content = serializers.CharField(
    required=False, allow_blank=True, default='', trim_whitespace=False,
  )
  

class FileNodeUpdateSerializer(serializers.Serializer):
  name = serializers.CharField(max_length=255, required=False)
  content = serializers.CharField(
    required=False, allow_blank=True, trim_whitespace=False,
  )
  parent = serializers.IntegerField(required=False, allow_null=True)
