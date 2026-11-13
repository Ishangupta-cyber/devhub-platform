from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Organisation, Membership

User = get_user_model()


class MembershipTests(APITestCase):

    def setUp(self):
        self.owner = User.objects.create_user(username='owner', email='o@x.com', password='pass12345')
        self.admin = User.objects.create_user(username='admin', email='a@x.com', password='pass12345')
        self.newbie = User.objects.create_user(username='newbie', email='n@x.com', password='pass12345')
        self.org = Organisation.objects.create(name='acme')
        Membership.objects.create(organisation=self.org, user=self.owner, role='owner')
        Membership.objects.create(organisation=self.org, user=self.admin, role='admin')
        self.url = f'/api/organizations/{self.org.id}/members/'

    def test_anonymous_cannot_list_or_add(self):
        self.assertEqual(self.client.get(self.url).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.client.post(self.url, {'username': 'newbie'}).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_cannot_grant_owner(self):
        self.client.force_authenticate(self.admin)
        resp = self.client.post(self.url, {'username': 'newbie', 'role': 'owner'})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_owner_can_grant_owner(self):
        self.client.force_authenticate(self.owner)
        resp = self.client.post(self.url, {'username': 'newbie', 'role': 'owner'})
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)

    def test_adding_existing_member_is_400(self):
        self.client.force_authenticate(self.owner)
        resp = self.client.post(self.url, {'username': 'admin'})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
