from django.test import TestCase

# Create your tests here.


import io
import json
from unittest import mock

from django.core.management import call_command
from django.test import override_settings
from rest_framework.test import APITestCase

from authentication.models import User as AuthUser


def _fake_google(claims, status_code=200):
    """Patch urlopen so tokeninfo 'returns' the given claims."""
    import urllib.error

    def opener(url, timeout=10):
        if status_code != 200:
            raise urllib.error.HTTPError(url, status_code, "bad", {}, None)
        return io.BytesIO(json.dumps(claims).encode())
    return mock.patch("authentication.google.urllib.request.urlopen", side_effect=opener)


GOOD = {"aud": "test-client.apps.googleusercontent.com", "iss": "https://accounts.google.com",
        "email": "Riya.Sen@gmail.com", "email_verified": "true", "name": "Riya Sen"}


@override_settings(GOOGLE_CLIENT_ID="test-client.apps.googleusercontent.com")
class GoogleLoginTests(APITestCase):
    url = "/api/auth/google/"

    def test_new_google_user_is_created_and_gets_tokens(self):
        with _fake_google(GOOD):
            resp = self.client.post(self.url, {"credential": "tok"})
        self.assertEqual(resp.status_code, 200, resp.data)
        self.assertTrue(resp.data["created"])
        self.assertIn("access", resp.data)
        user = AuthUser.objects.get(email__iexact="riya.sen@gmail.com")
        self.assertFalse(user.has_usable_password())
        self.assertTrue(user.is_verified)
        self.assertEqual(user.username, "Riya_Sen")

        me = self.client.get("/api/auth/me/", HTTP_AUTHORIZATION=f"Bearer {resp.data['access']}")
        self.assertEqual(me.data["email"], user.email)

    def test_existing_email_logs_into_same_account(self):
        existing = AuthUser.objects.create_user(email="riya.sen@gmail.com", username="riya", password="pass12345")
        with _fake_google(GOOD):
            resp = self.client.post(self.url, {"credential": "tok"})
        self.assertFalse(resp.data["created"])
        self.assertEqual(AuthUser.objects.filter(email__iexact="riya.sen@gmail.com").count(), 1)
        self.assertTrue(AuthUser.objects.get(pk=existing.pk).check_password("pass12345"))

    def test_username_collision_gets_suffix(self):
        AuthUser.objects.create_user(email="other@x.com", username="Riya_Sen", password="pass12345")
        with _fake_google(GOOD):
            self.client.post(self.url, {"credential": "tok"})
        self.assertTrue(AuthUser.objects.filter(username="Riya_Sen2").exists())

    def test_token_for_another_app_is_rejected(self):
        with _fake_google({**GOOD, "aud": "someone-else"}):
            resp = self.client.post(self.url, {"credential": "tok"})
        self.assertEqual(resp.status_code, 400)
        self.assertFalse(AuthUser.objects.exists())

    def test_unverified_email_is_rejected(self):
        with _fake_google({**GOOD, "email_verified": "false"}):
            self.assertEqual(self.client.post(self.url, {"credential": "tok"}).status_code, 400)

    def test_invalid_token_is_rejected(self):
        with _fake_google({}, status_code=400):
            self.assertEqual(self.client.post(self.url, {"credential": "tok"}).status_code, 400)

    def test_missing_credential(self):
        self.assertEqual(self.client.post(self.url, {}).status_code, 400)

    @override_settings(GOOGLE_CLIENT_ID="")
    def test_not_configured(self):
        self.assertEqual(self.client.post(self.url, {"credential": "tok"}).status_code, 400)

    def test_google_user_cannot_use_change_password(self):
        with _fake_google(GOOD):
            access = self.client.post(self.url, {"credential": "tok"}).data["access"]
        resp = self.client.post("/api/auth/change-password/", {"old_password": "", "new_password": "x"},
                                HTTP_AUTHORIZATION=f"Bearer {access}")
        self.assertEqual(resp.status_code, 400)


class SeedDemoDataTests(APITestCase):

    def test_seed_creates_browsable_data_and_is_rerunnable(self):
        call_command("seed_demo_data", stdout=io.StringIO())
        call_command("seed_demo_data", stdout=io.StringIO())  # second run must not fail

        from files.models import FileNode
        from repositories.models import Repository
        self.assertEqual(Repository.objects.count(), 6)
        self.assertTrue(FileNode.objects.filter(name="README.md").exists())
        self.assertFalse(AuthUser.objects.filter(is_superuser=True).exists(),
                         "no admin without SEED_ADMIN_PASSWORD")

        resp = self.client.post("/api/auth/login/", {"email": "alice@devhub.local", "password": "Demo@1234"})
        self.assertEqual(resp.status_code, 200)

    def test_demo_password_cannot_be_changed_and_is_restored_by_seed(self):
        call_command("seed_demo_data", stdout=io.StringIO())
        alice = AuthUser.objects.get(email="alice@devhub.local")
        self.client.force_authenticate(alice)
        resp = self.client.post("/api/auth/change-password/", {"old_password": "Demo@1234", "new_password": "Hijacked-123!"})
        self.assertEqual(resp.status_code, 403)

        alice.set_password("changed-somehow")
        alice.save()
        call_command("seed_demo_data", stdout=io.StringIO())
        alice.refresh_from_db()
        self.assertTrue(alice.check_password("Demo@1234"))
