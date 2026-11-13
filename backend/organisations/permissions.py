
from .models import Membership
from rest_framework import permissions


class IsManagerOrReadOnly(permissions.BasePermission):
  """Any logged-in user may read; only org owners/admins may write."""

  def has_permission(self, request, view):
    if not (request.user and request.user.is_authenticated):
      return False
    if request.method in permissions.SAFE_METHODS:
      return True

    membership = Membership.objects.filter(user=request.user, organisation_id=view.kwargs["org_id"]).first()
    return membership is not None and membership.has_management_rights()
