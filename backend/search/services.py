
from django.contrib.postgres.search import SearchVector,SearchQuery,SearchRank
from repositories.models import Repository
from issues.models import Issue
from authentication.models import User
from django.db.models import Q
from wiki.models import WikiPage




def search_repositories(query_text):
  vector=SearchVector('name',weight="A") + SearchVector('description',weight="B")
  query=SearchQuery(query_text)
  return (
    Repository.objects.annotate(rank=SearchRank(vector,query)).filter(rank__gt=0).select_related('owner').order_by('-rank')[:10]
  )

def search_issues(query_text):
  vector=SearchVector('title',weight="A") + SearchVector('description',weight='B')
  query=SearchQuery(query_text)
  return (
    Issue.objects.annotate(rank=SearchRank(vector,query)).filter(rank__gt=0).select_related('repository').order_by('-rank')[:10]
  )

def search_users(query_text):
    return (
        User.objects
        .filter(Q(username__icontains=query_text) | Q(full_name__icontains=query_text))
        .filter(is_active=True)[:10]
    )


def search_wiki(query_text):
    vector = SearchVector('title', weight='A') + SearchVector('content', weight='B')
    query = SearchQuery(query_text)
    return (
        WikiPage.objects
        .annotate(rank=SearchRank(vector, query))
        .filter(rank__gt=0)
        .select_related('repository')
        .order_by('-rank')[:10]
    )


SEARCH_MAP = {
    'repository': (search_repositories, 'repositories'),
    'issue': (search_issues, 'issues'),
    'user': (search_users, 'users'),
    'wiki': (search_wiki, 'wiki_pages'),
}