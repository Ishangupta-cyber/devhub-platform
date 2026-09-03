
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import TokenError
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from urllib.parse import parse_qs


@database_sync_to_async
def get_user_from_token(token_string):
  from authentication.models import User
  try:
    access_token = AccessToken(token_string)
    user_id=access_token['user_id']
    return User.objects.get(id=user_id)
  except (TokenError,KeyError, User.DoesNotExist):
    return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
  async def __call__(self, scope, receive, send):
    query_string = scope.get('query_string', b'').decode()
    params=parse_qs(query_string)
    token=params.get('token',[None])[0]
    if token:
      scope['user']=await (get_user_from_token)(token)
    else:
      scope['user']=AnonymousUser()
    return await super().__call__(scope, receive, send)


