from django.db import models
from repositories.models import Repository
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# Create your models here.


class Project(models.Model):
  name=models.CharField(max_length=100)
  repository=models.ForeignKey(to=Repository,on_delete=models.CASCADE,related_name="projects")
  created_at=models.DateTimeField(auto_now_add=True)

  class Meta:
    ordering=["-created_at"]

  def __str__(self):
    return f"{self.repository.name}-{self.name}"


class Column(models.Model):
  name=models.CharField(max_length=100)
  project=models.ForeignKey(to=Project,on_delete=models.CASCADE,related_name="columns")
  position=models.PositiveIntegerField(default=10)

  class Meta:
    ordering=["position"]
  def __str__(self):
    return f"{self.project.name}/{self.name}"

class Card(models.Model):
  project = models.ForeignKey(Project, related_name='cards', on_delete=models.CASCADE)
  column = models.ForeignKey(Column, related_name='cards', on_delete=models.CASCADE)
  position = models.PositiveIntegerField(default=10)

  content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
  object_id = models.PositiveIntegerField()
  content_object = GenericForeignKey('content_type', 'object_id')

  added_at = models.DateTimeField(auto_now_add=True)

  class Meta:
      ordering = ['position']
      unique_together = ('project', 'content_type', 'object_id')

  def __str__(self):
      return f"Card in {self.column.name}"
