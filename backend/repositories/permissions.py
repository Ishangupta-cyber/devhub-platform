
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):

  def has_object_permission(self, request, view, obj):
    if request.method in permissions.SAFE_METHODS:
      return obj.user_can_view(request.user)
    return obj.user_can_manage(request.user)
