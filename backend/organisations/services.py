
from django.db import transaction
from .models import Organisation,Membership


def create_organisation(name,description,creator):
  with transaction.atomic():
    org=Organisation.objects.create(name=name,description=description)
    Membership.objects.create(user=creator,organisation=org,role="owner")
  return org

def add_member(organisation,user,role):
  return Membership.objects.create(organisation=organisation,user=user,role=role)


