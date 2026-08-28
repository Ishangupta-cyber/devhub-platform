
from rest_framework import serializers
from .models import Activity

class ActivitySerializer(serializers.ModelSerializer):

  actor=serializers.CharField(source="actor.username",read_only=True)
  target_type=serializers.SerializerMethodField()
  target_display=serializers.SerializerMethodField()


  class Meta:
    model=Activity
    fields=["id","actor","verb","target_type","target_display","created_at"]

  def get_target_type(self,obj):
    return obj.content_type.model

  def get_target_display(self,obj):
    target=obj.target
    for attr in ["username","name","title"]:
      if hasattr(target,attr):
        return getattr(target,attr)
    return str(target)
