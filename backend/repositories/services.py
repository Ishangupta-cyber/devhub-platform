
from .models import Repository
from django.shortcuts import get_object_or_404
from organisations.models import Membership,Organisation
from rest_framework.exceptions import PermissionDenied

def create_repository(owner,name,organization_id=None,description=""):  
  organization = None
  if organization_id:
    organization = get_object_or_404(Organisation,id=organization_id)
    is_manager= Membership.objects.filter(user=owner,organisation=organization,role__in=["owner","admin"]).exists()
    if not is_manager:
       raise PermissionDenied("You must be an owner or admin of this organization.")

  return Repository.objects.create(
        owner=owner, name=name, description=description, organisation=organization)