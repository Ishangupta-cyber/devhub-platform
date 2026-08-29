
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from repositories.models import Repository



class IsRepoManagerOrReadOnly(permissions.BasePermission):
  def has_permission(self, request, view):
    if request.method in permissions.SAFE_METHODS:
      return True
    repository=get_object_or_404(Repository,id=view.kwargs["repo_id"])
    return repository.user_can_manage(request.user)

  def has_object_permission(self, request, view, obj):
    if request.method in permissions.SAFE_METHODS:
      return True
    return obj.repository.user_can_manage(request.user)
 
  