from rest_framework import permissions


class IsAuthorOrParentOwner(permissions.BasePermission):
  def has_object_permission(self, request, view, obj):
    if request.method in permissions.SAFE_METHODS:
      return True
    if obj.author==request.user:
      return True
    repository=getattr(obj.content_object,"repository",None)
    if repository and repository.owner==request.user:
      return True
    return False
    