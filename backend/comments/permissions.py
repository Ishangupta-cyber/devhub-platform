from rest_framework import permissions


class IsAuthorOrParentOwner(permissions.BasePermission):
  """Comment author can edit/delete; repo managers (owner, org owner/admin) can delete too."""

  def has_object_permission(self, request, view, obj):
    if request.method in permissions.SAFE_METHODS:
      return True
    if obj.author_id == request.user.id:
      return True
    repository = getattr(obj.content_object, "repository", None)
    return bool(repository and repository.user_can_manage(request.user))
