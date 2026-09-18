
from rest_framework.permissions import BasePermission,SAFE_METHODS

from repositories.models import Repository


class CanAccessRepositoryFiles(BasePermission):

  def has_object_permission(self, request, view, obj):
    repository = obj if isinstance(obj, Repository) else obj.repository

    if request.method in SAFE_METHODS:
      return repository.user_can_view(request.user)
    
    return (
      request.user.is_authenticated and repository.user_can_manage(request.user)
    )
