
from django.shortcuts import get_object_or_404
from .models import Project,Column,Card
from issues.models import Issue
from pull_requests.models import Pull_Request

LINKABLE_MODELS = {
    'issue': Issue,
    'pull_request': Pull_Request,
}


def create_project(name,repository):
  return Project.objects.create(name=name,repository=repository)

def create_column(name,project,position):
  return Column.objects.create(name=name,position=position,project=project)

def add_card(link_id,link_type,column):
  model_class=LINKABLE_MODELS.get(link_type.lower())
  if not model_class:
        raise ValueError(f"'{link_type}' is not a linkable type.")
  linked_object=get_object_or_404(model_class,id=link_id)
  return Card.objects.create(
        project=column.project,
        column=column,
        content_object=linked_object
    )

