from django.db import models
from django.conf import settings



class Organisation(models.Model):
  name=models.CharField(max_length=100 , unique=True)
  description=models.TextField(blank=True)
  created_at=models.DateTimeField(auto_now_add=True)

  class Meta:
    ordering=["-created_at"]

  def __str__(self):
    return self.name

class Membership(models.Model):
  ROLE_CHOICES=[
    ("owner","Owner"),
    ("admin","Admin"),
    ("member","Member")
  ]
  user=models.ForeignKey(to=settings.AUTH_USER_MODEL,related_name="memberships",on_delete=models.CASCADE)
  organisation=models.ForeignKey(to=Organisation,on_delete=models.CASCADE,related_name="memberships")
  role=models.CharField(max_length=10,choices=ROLE_CHOICES,default="member")
  joined_at=models.DateTimeField(auto_now_add=True)

  class Meta:
    unique_together=("user","organisation")
    ordering=["joined_at"]

  def has_management_rights(self):
    return self.role in ["admin","owner"]

  def __str__(self):
    return f"{self.user.username} - {self.organisation.name} ({self.role})"