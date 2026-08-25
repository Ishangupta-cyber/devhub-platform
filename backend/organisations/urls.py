
from .views import OrganisationListCreateView , MembershipListCreateView
from django.urls import path


urlpatterns=[
  path('', OrganisationListCreateView.as_view(), name="org-list-create"),
   path('<int:org_id>/members/', MembershipListCreateView.as_view(), name='org-members'),
]