from django.db import models
from django.conf import settings
from django.utils.text import slugify
from repositories.models import Repository

# Create your models here.
class WikiPage(models.Model):
  title=models.CharField(max_length=200)
  slug=models.SlugField(max_length=200,blank=True)
  content=models.TextField(blank=True)
  repository=models.ForeignKey(to=Repository,on_delete=models.CASCADE,related_name="wiki_pages")
  created_by=models.ForeignKey(to=settings.AUTH_USER_MODEL,related_name="wiki_pages_created",on_delete=models.CASCADE)
  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  class Meta:
    unique_together=("repository","slug")
    ordering=["title"]

  def save(self,*args,**kwargs):
    if not self.slug:
      self.slug=slugify(self.title)
    super().save(*args,**kwargs)

  def __str__(self):
    return f"[{self.repository.name}] {self.title}"

