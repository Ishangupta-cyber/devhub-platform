from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
  password=serializers.CharField(write_only=True,min_length=8)
  password2=serializers.CharField(write_only=True,min_length=8)

  class Meta:
    model=User
    fields=['email','password','password2','username','full_name']

  def validate(self,data):
    if data['password']!=data['password2']:
      raise serializers.ValidationError({"password":"Passwords don't match"})
    return data

  def create(self,validated_data):
    validated_data.pop('password2')
    user=User.objects.create_user(
      email=validated_data['email'],
      username=validated_data['username'],
      full_name=validated_data['full_name'],
      password=validated_data['password']
    )
    return user


class MeSerializer(serializers.ModelSerializer):
  class Meta:
    model=User
    fields = ['id', 'email', 'username', 'full_name', 'bio', 'avatar', 'is_verified', 'date_joined']
    read_only_fields = ['id', 'email', 'is_verified', 'date_joined']


