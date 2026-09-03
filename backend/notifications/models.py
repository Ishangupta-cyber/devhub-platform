from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey

# Create your models here.



class Notification(models.Model):

  recipient=models.ForeignKey(to=settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="notifications") #jisko jayega notification

  actor=models.ForeignKey(to=settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name="notifications_sent")

  verb=models.CharField(max_length=50)

  content_type=models.ForeignKey(ContentType,on_delete=models.CASCADE)
  object_id=models.PositiveIntegerField()
  target=GenericForeignKey('content_type','object_id')

  is_read=models.BooleanField(default=False)
  created_at=models.DateTimeField(auto_now_add=True)

  class Meta:
    ordering=["-created_at"]


