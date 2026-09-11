import re

from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank
from django.db.models import Q

from repositories.models import Repository
from issues.models import Issue
from authentication.models import User
from wiki.models import WikiPage

CONFIG = 'english'


def build_query(query_text):
    """Build a prefix-matching tsquery so search-as-you-type works.

    plainto_tsquery only matches whole lexemes: 'dev' would never find
    'devhub-api', because that indexes as 'devhub-api' / 'devhub' / 'api'.
    Splitting on non-word characters and appending ':*' to each term turns
    'dev' into 'dev:*', which matches any lexeme starting with it.

    Returns None when the text has no usable terms.
    """
    words = [w for w in re.split(r'\W+', query_text) if w]
    if not words:
        return None
    raw = ' & '.join('{}:*'.format(w) for w in words)
    return SearchQuery(raw, search_type='raw', config=CONFIG)


def _ranked(queryset, vector, query, related=None):
    """Filter to real matches, then order by rank.

    Filtering on the vector rather than on rank > 0 matters: for multi-term
    queries postgres returns ts_rank = 1e-20 (not 0) for rows that do not
    match at all, so a `rank__gt=0` filter lets the whole table through.
    """
    qs = queryset.annotate(
        search=vector,
        rank=SearchRank(vector, query),
    ).filter(search=query)

    if related:
        qs = qs.select_related(*related)
    return qs.order_by('-rank')[:10]


def search_repositories(query_text):
    query = build_query(query_text)
    if query is None:
        return Repository.objects.none()
    vector = (
        SearchVector('name', weight='A', config=CONFIG)
        + SearchVector('description', weight='B', config=CONFIG)
    )
    return _ranked(Repository.objects.all(), vector, query, related=['owner'])


def search_issues(query_text):
    query = build_query(query_text)
    if query is None:
        return Issue.objects.none()
    vector = (
        SearchVector('title', weight='A', config=CONFIG)
        + SearchVector('description', weight='B', config=CONFIG)
    )
    return _ranked(Issue.objects.all(), vector, query, related=['repository'])


def search_users(query_text):
    # usernames are identifiers, not prose - substring beats full-text here
    query_text = query_text.strip()
    if not query_text:
        return User.objects.none()
    return (
        User.objects
        .filter(Q(username__icontains=query_text) | Q(full_name__icontains=query_text))
        .filter(is_active=True)[:10]
    )


def search_wiki(query_text):
    query = build_query(query_text)
    if query is None:
        return WikiPage.objects.none()
    vector = (
        SearchVector('title', weight='A', config=CONFIG)
        + SearchVector('content', weight='B', config=CONFIG)
    )
    return _ranked(WikiPage.objects.all(), vector, query, related=['repository'])


SEARCH_MAP = {
    'repository': (search_repositories, 'repositories'),
    'issue': (search_issues, 'issues'),
    'user': (search_users, 'users'),
    'wiki': (search_wiki, 'wiki_pages'),
}
