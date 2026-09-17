
from rest_framework.permissions import BasePermission,SAFE_METHODS

from repositories.models import Repository


class CanAccessRepositoryFiles(BasePermission):

  def has_object_permission(self, request, view, obj):
    repository = obj if isinstance(obj, Repository) else obj.repository

    # Repository mein abhi is_public field nahi hai — tab tak read sabke liye
    # khula hai, waise hi jaise repositories.IsOwnerOrReadOnly karta hai.
    # Field add hote hi ye apne aap usko respect karne lagega.
    if request.method in SAFE_METHODS and getattr(repository, 'is_public', True):
      return True

    return (
      request.user.is_authenticated and repository.user_can_manage(request.user)
    )
