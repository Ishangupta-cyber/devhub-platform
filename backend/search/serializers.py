


from rest_framework import serializers


class RepoResultSerializer(serializers.Serializer):
  name=serializers.CharField()
  id=serializers.IntegerField()
  description=serializers.CharField()
  owner=serializers.CharField(source="owner.username")

class IssueResultSerializer(serializers.Serializer):
  id=serializers.IntegerField()
  title = serializers.CharField()
  status=serializers.CharField()
  repository_id=serializers.IntegerField()
  repository_name=serializers.CharField(source="repository.name")

class UserResultSerializer(serializers.Serializer):
  full_name=serializers.CharField()
  username=serializers.CharField()
  avatar=serializers.CharField(allow_null=True)

class WikiResultSerializer(serializers.Serializer):
  id=serializers.IntegerField()
  title=serializers.CharField()
  slug=serializers.CharField()
  repository_id=serializers.IntegerField()
  repository_name=serializers.CharField(source="repository.name")

  

