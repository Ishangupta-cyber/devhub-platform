from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from organisations.models import Organisation, Membership
from .models import Repository

User = get_user_model()


class RepositoryVisibilityTests(APITestCase):

    def setUp(self):
        self.owner = User.objects.create_user(
            username='ravi', email='ravi@example.com', password='pass12345'
        )
        self.member = User.objects.create_user(
            username='meera', email='meera@example.com', password='pass12345'
        )
        self.stranger = User.objects.create_user(
            username='sam', email='sam@example.com', password='pass12345'
        )

        self.org = Organisation.objects.create(name='acme')
        Membership.objects.create(organisation=self.org, user=self.owner, role='owner')
        Membership.objects.create(organisation=self.org, user=self.member, role='member')

        self.public = Repository.objects.create(
            name='open-source', owner=self.owner, is_public=True
        )
        self.private = Repository.objects.create(
            name='internal', owner=self.owner, organization=self.org, is_public=False
        )

    def detail_url(self, repo):
        return f'/api/repositories/{repo.pk}/'

    # --- default ---

    def test_new_repository_is_public_by_default(self):
        repo = Repository.objects.create(name='fresh', owner=self.stranger)
        self.assertTrue(repo.is_public)

    def test_is_public_is_exposed_in_api(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.get(self.detail_url(self.private))
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.assertFalse(res.data['is_public'])

    # --- detail read ---

    def test_public_repo_readable_by_stranger(self):
        self.client.force_authenticate(user=self.stranger)
        res = self.client.get(self.detail_url(self.public))
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)

    def test_private_repo_not_readable_by_stranger(self):
        self.client.force_authenticate(user=self.stranger)
        res = self.client.get(self.detail_url(self.private))
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN, res.data)

    def test_private_repo_readable_by_org_member(self):
        self.client.force_authenticate(user=self.member)
        res = self.client.get(self.detail_url(self.private))
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)

    def test_org_member_cannot_edit_private_repo(self):
        self.client.force_authenticate(user=self.member)
        res = self.client.patch(
            self.detail_url(self.private), {'description': 'hi'}, format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN, res.data)

    def test_owner_can_toggle_visibility(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.patch(
            self.detail_url(self.public), {'is_public': False}, format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        self.public.refresh_from_db()
        self.assertFalse(self.public.is_public)

    # --- profile listing (?owner=) ---

    def test_profile_listing_hides_private_repos_from_stranger(self):
        self.client.force_authenticate(user=self.stranger)
        res = self.client.get('/api/repositories/?owner=ravi')
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        names = {r['name'] for r in res.data}
        self.assertEqual(names, {'open-source'})

    def test_profile_listing_shows_private_repo_to_org_member(self):
        self.client.force_authenticate(user=self.member)
        res = self.client.get('/api/repositories/?owner=ravi')
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        names = {r['name'] for r in res.data}
        self.assertEqual(names, {'open-source', 'internal'})

    def test_profile_listing_shows_own_private_repos(self):
        self.client.force_authenticate(user=self.owner)
        res = self.client.get('/api/repositories/?owner=ravi')
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        names = {r['name'] for r in res.data}
        self.assertEqual(names, {'open-source', 'internal'})
