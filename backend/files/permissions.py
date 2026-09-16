
from rest_framework.permissions import BasePermission,SAFE_METHODS

class CanAccessRepositoryFiles(BasePermission):

  def has_object_permission(self, request, view, obj):
    repository = obj if hasattr(obj,'is_public') else obj.repository

    if request.method in SAFE_METHODS:
      if repository.is_public:
        return True
      return (
        request.user.is_authenticated and repository.user_can_manage(request.user)
      )
    return (
        request.user.is_authenticated and repository.user_can_manage(request.user)
      )