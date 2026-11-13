
from rest_framework import permissions
from rest_framework.exceptions import NotFound


class IsOwnerOrReadOnly(permissions.BasePermission):

  def has_object_permission(self, request, view, obj):
    if request.method in permissions.SAFE_METHODS:
      return obj.user_can_view(request.user)
    return obj.user_can_manage(request.user)


# --- Permissions for anything that lives *inside* a repository -------------
#
# Views using these must implement `get_repository()` returning the repo the
# URL points at (see RepositoryScopedMixin). Checking at has_permission level
# means list endpoints are covered too, not just detail ones.

def _check_view_access(request, view):
  repository = view.get_repository()
  if not repository.user_can_view(request.user):
    # 404, not 403: a private repo's existence is itself private
    raise NotFound()
  return repository


class CanViewRepository(permissions.BasePermission):
  """Read: anyone who can see the repo. Write: any logged-in user who can see it
  (e.g. opening an issue or commenting)."""

  def has_permission(self, request, view):
    _check_view_access(request, view)
    if request.method in permissions.SAFE_METHODS:
      return True
    return bool(request.user and request.user.is_authenticated)


class CanManageRepositoryOrReadOnly(permissions.BasePermission):
  """Read: anyone who can see the repo. Write: repo owner / org owner or admin."""

  def has_permission(self, request, view):
    repository = _check_view_access(request, view)
    if request.method in permissions.SAFE_METHODS:
      return True
    return repository.user_can_manage(request.user)


class RepositoryScopedMixin:
  """Resolves and caches the repository a nested URL refers to.

  Subclasses override `resolve_repository()`; the default reads `repo_id`.
  """

  def resolve_repository(self):
    from django.shortcuts import get_object_or_404
    from .models import Repository
    return get_object_or_404(Repository, id=self.kwargs['repo_id'])

  def get_repository(self):
    if not hasattr(self, '_repository'):
      self._repository = self.resolve_repository()
    return self._repository
