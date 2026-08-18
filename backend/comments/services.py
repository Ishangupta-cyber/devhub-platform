

from .models import Comments

def create_comment(content_object, author, content):
  return Comments.objects.create(content_object=content_object,author=author,content=content)