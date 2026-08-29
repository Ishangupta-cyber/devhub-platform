
from rest_framework import serializers
from .models import WikiPage

class WikiPageListSerializer(serializers.ModelSerializer):
  created_by=serializers.CharField(source="created_by.username",read_only=True)

  class Meta:
    model=WikiPage
    fields=["id","title","slug","created_by","updated_at"]



class WikiPageDetailSerializer(serializers.ModelSerializer):
  created_by=serializers.CharField(source="created_by.username",read_only=True)

  class Meta:
    model = WikiPage
    fields = ['id', 'title', 'slug', 'content', 'created_by', 'created_at', 'updated_at']
    read_only_fields = ['id', 'slug', 'created_at', 'updated_at']