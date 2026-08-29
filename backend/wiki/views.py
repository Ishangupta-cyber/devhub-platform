from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView
from .permissions import IsRepoManagerOrReadOnly
from .models import WikiPage
from .serializers import WikiPageDetailSerializer, WikiPageListSerializer
from .services import create_wiki_page
from django.shortcuts import get_object_or_404
from repositories.models import Repository



class WikiPageListCreateView(ListCreateAPIView):
  permission_classes=[IsRepoManagerOrReadOnly]

  def get_queryset(self):
    return WikiPage.objects.filter(repository_id=self.kwargs["repo_id"]).select_related("created_by")

  def get_serializer_class(self):
    if self.request.method=="POST":
      return WikiPageDetailSerializer
    return WikiPageListSerializer

  def perform_create(self, serializer):
    repo=get_object_or_404(Repository , id=self.kwargs["repo_id"])
    page=create_wiki_page(title=serializer.validated_data["title"],content=serializer.validated_data.get("content",""),repository=repo,created_by=self.request.user)
    serializer.instance=page
  


class WikiPageDetailView(RetrieveUpdateDestroyAPIView):
  permission_classes=[IsRepoManagerOrReadOnly]
  serializer_class=WikiPageDetailSerializer
  lookup_field="slug"

  def get_queryset(self):
    return WikiPage.objects.filter(repository_id=self.kwargs["repo_id"]).select_related("created_by")

