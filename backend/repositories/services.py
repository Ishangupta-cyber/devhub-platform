
from .models import Repository

def create_repository(owner,name,description=""):
  return Repository.objects.create(owner=owner,name=name,description=description)