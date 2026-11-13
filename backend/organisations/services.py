
from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework.exceptions import PermissionDenied

from .models import Organisation, Membership


def create_organisation(name, description, creator):
  with transaction.atomic():
    org = Organisation.objects.create(name=name, description=description)
    Membership.objects.create(user=creator, organisation=org, role="owner")
  return org


def add_member(organisation, user, role, added_by):
  acting = Membership.objects.filter(organisation=organisation, user=added_by).first()
  # admins can add members and admins; handing out ownership is owner-only
  if role == "owner" and (acting is None or acting.role != "owner"):
    raise PermissionDenied("Only organisation owners can add another owner.")
  if Membership.objects.filter(organisation=organisation, user=user).exists():
    raise ValidationError(f"{user.username} is already a member of {organisation.name}.")
  return Membership.objects.create(organisation=organisation, user=user, role=role)
