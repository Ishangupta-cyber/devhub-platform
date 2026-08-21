from rest_framework.generics import ListCreateAPIView,RetrieveUpdateDestroyAPIView
from .serializers import ColumnSerializer,ProjectSerializer,CardSerializer
from .permissions import IsRepoOwnerForProject,IsRepoOwnerForColumn,IsRepoOwnerForCard
from .models import Project,Column,Card
from repositories.models import Repository
from django.shortcuts import get_object_or_404
from .services import create_project,create_column,add_card
# Create your views here.


class ProjectListCreateView(ListCreateAPIView):
  serializer_class=ProjectSerializer
  permission_classes=[IsRepoOwnerForProject]

  def get_queryset(self):
    return Project.objects.filter(repository_id=self.kwargs["repo_id"])

  def perform_create(self, serializer):
    repository=get_object_or_404(Repository,id=self.kwargs["repo_id"])
    project=create_project(name=serializer.validated_data["name"],repository=repository)
    serializer.instance=project


class ColumnListCreateView(ListCreateAPIView):
  serializer_class=ColumnSerializer
  permission_classes=[IsRepoOwnerForColumn]

  def get_queryset(self):
    return Column.objects.filter(project_id=self.kwargs["project_id"])

  def perform_create(self, serializer):
    project=get_object_or_404(Project,id=self.kwargs["project_id"])
    Column=create_column(name=serializer.validated_data["name"],position=serializer.validated_data["position"],project=project)
    serializer.instance=Column

class ColumnDetailView(RetrieveUpdateDestroyAPIView):
  serializer_class=ColumnSerializer
  permission_classes=[IsRepoOwnerForColumn]

  def get_queryset(self):
    return Column.objects.filter(project_id=self.kwargs["project_id"])

class CardListCreateView(ListCreateAPIView):
  serializer_class=CardSerializer
  permission_classes=[IsRepoOwnerForCard]

  def get_queryset(self):
    return Card.objects.filter(column_id=self.kwargs["column_id"])

  def perform_create(self, serializer):
    column=get_object_or_404(Column,id=self.kwargs["column_id"])
    card=add_card(
      column=column,
      link_type=serializer.validated_data["link_type"],
      link_id=serializer.validated_data["link_id"]
    )
    serializer.instance=card


class CardDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = CardSerializer
    permission_classes = [IsRepoOwnerForCard]

    def get_queryset(self):
      return Card.objects.filter(column_id=self.kwargs['column_id'])