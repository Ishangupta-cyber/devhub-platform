from django.db import models
from django.conf import settings
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
# Create your models here.


class Comments(models.Model):
  content=models.TextField(blank=True)
  author=models.ForeignKey(to=settings.AUTH_USER_MODEL,related_name="comments",on_delete=models.CASCADE)

  content_type=models.ForeignKey(to=ContentType,on_delete=models.CASCADE)
  object_id=models.PositiveIntegerField()
  content_object=GenericForeignKey("content_type","object_id")

  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  class Meta:
    ordering = ['created_at']

  def __str__(self):
    return f"Comment by {self.author.username} on {self.content_object}"