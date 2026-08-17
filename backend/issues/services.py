from .models import Issue


def create_issue(repository, created_by, title, description=""):
    return Issue.objects.create(
        repository=repository,
        created_by=created_by,
        title=title,
        description=description
    )