from .models import Pull_Request

def create_pull_request(title,repository,created_by,description=""):
  return Pull_Request.objects.create(repository=repository,title=title,created_by=created_by,description=description)