from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView
from .serializers import OrganisationSerializer,MembershipSerializer,AddMemberSerializer
from .models import Organisation,Membership
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from .services import create_organisation,add_member
from .permissions import IsManagerOrReadOnly
from django.shortcuts import get_object_or_404
from authentication.models import User

# Create your views here.


class OrganisationListCreateView(ListCreateAPIView):
  serializer_class=OrganisationSerializer
  permission_classes=[IsAuthenticated]

  def get_queryset(self):
    """?user=<username> lists that user's organisations (used by profile pages).

    Without it, returns the current user's own organisations.
    """
    username=self.request.query_params.get('user')
    if username:
      return Organisation.objects.filter(memberships__user__username=username).distinct()
    return Organisation.objects.filter(memberships__user=self.request.user).distinct()

  def perform_create(self, serializer):
    org=create_organisation(name=serializer.validated_data['name'],
    description=serializer.validated_data.get("description",""),
    creator=self.request.user)
    serializer.instance=org

class MembershipListCreateView(ListCreateAPIView):

  serializer_class=MembershipSerializer           
  permission_classes=[IsManagerOrReadOnly]

  def get_queryset(self):
    return Membership.objects.filter(organisation_id=self.kwargs["org_id"])

  def get_serializer_class(self):
    if self.request.method=="POST":
      return AddMemberSerializer
    return MembershipSerializer

  def perform_create(self, serializer):

    organisation=get_object_or_404(Organisation,id=self.kwargs["org_id"])
    target_user=get_object_or_404(User,username=serializer.validated_data["username"])

    membership=add_member(organisation=organisation,user=target_user,role=serializer.validated_data["role"])

    output_serializer=MembershipSerializer(membership)
    serializer._data=output_serializer.data
  
