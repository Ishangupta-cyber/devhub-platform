
from .models import WikiPage


def create_wiki_page(title,repository,created_by,content=''):
  return WikiPage.objects.create(title=title,content=content,repository=repository,created_by=created_by)