from django.db import models
from repositories.models import Repository
from django.conf import settings

# Create your models here.
class Pull_Request(models.Model):
  STATUS_CHOICES=[
    ("draft","Draft"),
    ("review","Review"),
    ("approved","Approved"),
    ("merged","Merged")
  ]

  ALLOWED_TRANSITIONS={
    "draft":["riview"],
    "review":["draft","approved"],
    "approved":["merged"],
    "merged":[],
  }


  title=models.CharField(max_length=200)
  description=models.TextField(blank=True)
  status=models.CharField(max_length=10,choices=STATUS_CHOICES,default="draft")
  repository=models.ForeignKey(to=Repository,related_name="pull_requests",on_delete=models.CASCADE)
  created_by=models.ForeignKey(settings.AUTH_USER_MODEL,related_name="pull_requests_created",on_delete=models.CASCADE)
  created_at=models.DateTimeField(auto_now_add=True)
  updated_at=models.DateTimeField(auto_now=True)

  class Meta:
    ordering=["-created_at"]

  def can_transition_to(self,new_status):
    return new_status in self.ALLOWED_TRANSITIONS.get(self.status,[])

  def __str__(self):
    return f"[{self.repository.name}] {self.title} ({self.status})"