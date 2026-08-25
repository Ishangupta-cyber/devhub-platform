
from rest_framework import serializers
from .models import Organisation,Membership

class OrganisationSerializer(serializers.ModelSerializer):
  class Meta:
    model=Organisation
    fields=["id","name","description","created_at"]
    read_only_fields=["id","created_at"]

class MembershipSerializer(serializers.ModelSerializer):

  username=serializers.CharField(source="user.username",read_only=True)
  class Meta:
    model=Membership
    fields=["id","username","role","joined_at"]
    read_only_fields=["id","joined_at"]
    

class AddMemberSerializer(serializers.Serializer):
  username=serializers.CharField()
  role=serializers.ChoiceField(choices=Membership.ROLE_CHOICES,default="member")

