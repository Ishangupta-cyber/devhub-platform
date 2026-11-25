"""Sign in with Google.

The browser gets an ID token (a JWT) from Google Identity Services and posts
it here. We ask Google to validate it via the tokeninfo endpoint (stdlib only,
no extra dependency), check it was issued for *our* client id, then find or
create the matching user.
"""
import json
import re
import urllib.error
import urllib.parse
import urllib.request

from django.conf import settings
from django.db import IntegrityError, transaction

from .models import User

TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
VALID_ISSUERS = {"accounts.google.com", "https://accounts.google.com"}


class GoogleAuthError(Exception):
    pass


def verify_google_token(credential):
    """Return Google's claims for a valid ID token, else raise GoogleAuthError."""
    client_id = settings.GOOGLE_CLIENT_ID
    if not client_id:
        raise GoogleAuthError("Google sign-in is not configured on the server.")

    url = f"{TOKENINFO_URL}?{urllib.parse.urlencode({'id_token': credential})}"
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            claims = json.load(resp)
    except urllib.error.HTTPError:
        raise GoogleAuthError("Invalid Google token.")
    except (urllib.error.URLError, TimeoutError, ValueError):
        raise GoogleAuthError("Could not reach Google to verify the sign-in. Try again.")

    if claims.get("aud") != client_id:
        raise GoogleAuthError("This Google token was issued for a different app.")
    if claims.get("iss") not in VALID_ISSUERS:
        raise GoogleAuthError("Invalid Google token issuer.")
    if str(claims.get("email_verified")).lower() != "true" or not claims.get("email"):
        raise GoogleAuthError("Your Google account email is not verified.")
    return claims


def _unique_username(email):
    base = re.sub(r"[^a-zA-Z0-9_]", "_", email.split("@")[0])[:40].strip("_") or "user"
    candidate, n = base, 1
    while User.objects.filter(username=candidate).exists():
        n += 1
        candidate = f"{base}{n}"
    return candidate


def get_or_create_google_user(claims):
    email = User.objects.normalize_email(claims["email"])
    user = User.objects.filter(email__iexact=email).first()
    if user:
        if not user.is_active:
            raise GoogleAuthError("This account is disabled.")
        if not user.is_verified:
            user.is_verified = True
            user.save(update_fields=["is_verified"])
        return user, False

    for _ in range(3):  # retry if two sign-ups race for the same username
        try:
            with transaction.atomic():
                user = User.objects.create_user(
                    email=email,
                    username=_unique_username(email),
                    password=None,  # unusable password: this account signs in with Google
                    full_name=claims.get("name", "")[:150],
                    is_verified=True,
                )
            return user, True
        except IntegrityError:
            existing = User.objects.filter(email__iexact=email).first()
            if existing:
                return existing, False
    raise GoogleAuthError("Could not create your account. Try again.")
