
from .models import Membership
from rest_framework import permissions

class IsManagerOrReadOnly(permissions.BasePermission):
  def has_permission(self, request, view):
    if request.method in permissions.SAFE_METHODS:
      return True

    membership=Membership.objects.filter(user=request.user,organisation_id=view.kwargs["org_id"]).first()

    return membership is not None and membership.has_management_rights()