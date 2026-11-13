from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from repositories.permissions import CanManageRepositoryOrReadOnly, RepositoryScopedMixin
from .models import WikiPage
from .serializers import WikiPageDetailSerializer, WikiPageListSerializer
from .services import create_wiki_page


class WikiPageListCreateView(RepositoryScopedMixin, ListCreateAPIView):
  permission_classes = [CanManageRepositoryOrReadOnly]

  def get_queryset(self):
    return WikiPage.objects.filter(repository_id=self.kwargs["repo_id"]).select_related("created_by")

  def get_serializer_class(self):
    if self.request.method == "POST":
      return WikiPageDetailSerializer
    return WikiPageListSerializer

  def perform_create(self, serializer):
    page = create_wiki_page(
      title=serializer.validated_data["title"],
      content=serializer.validated_data.get("content", ""),
      repository=self.get_repository(),
      created_by=self.request.user,
    )
    serializer.instance = page


class WikiPageDetailView(RepositoryScopedMixin, RetrieveUpdateDestroyAPIView):
  permission_classes = [CanManageRepositoryOrReadOnly]
  serializer_class = WikiPageDetailSerializer
  lookup_field = "slug"

  def get_queryset(self):
    return WikiPage.objects.filter(repository_id=self.kwargs["repo_id"]).select_related("created_by")
