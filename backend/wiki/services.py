from django.core.exceptions import ValidationError
from django.utils.text import slugify

from .models import WikiPage


def create_wiki_page(title,repository,created_by,content=''):
  slug = slugify(title)
  if not slug:
    raise ValidationError("Title must contain at least one letter or number.")
  if WikiPage.objects.filter(repository=repository, slug=slug).exists():
    raise ValidationError(f"A wiki page with the slug '{slug}' already exists in this repository.")
  return WikiPage.objects.create(title=title,slug=slug,content=content,repository=repository,created_by=created_by)
