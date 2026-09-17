
from rest_framework.permissions import BasePermission,SAFE_METHODS

from repositories.models import Repository


class CanAccessRepositoryFiles(BasePermission):

  def has_object_permission(self, request, view, obj):
    repository = obj if isinstance(obj, Repository) else obj.repository

    # Read: public repo sabke liye, private sirf owner + org members ko.
    if request.method in SAFE_METHODS:
      return repository.user_can_view(request.user)

    # Write: hamesha manage rights chahiye (owner / org admin).
    return (
      request.user.is_authenticated and repository.user_can_manage(request.user)
    )
