from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

class Activity(models.Model):
  
  VERB_CHOICES=[('followed','Followed'),('created_issue','Created_Issue'),('created_repository','Created_Repository')]

  actor=models.ForeignKey(to=settings.AUTH_USER_MODEL, related_name="activities",on_delete=models.CASCADE)
  verb = models.CharField(max_length=30, choices=VERB_CHOICES)

  content_type=models.ForeignKey(to=ContentType,on_delete=models.CASCADE)
  object_id=models.PositiveIntegerField()
  target=GenericForeignKey('content_type','object_id')

  created_at=models.DateTimeField(auto_now_add=True)

  class Meta:
    ordering=["-created_at"]

  def __str__(self):
    return f"{self.actor.username} {self.verb}"
