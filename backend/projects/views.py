from django.db import IntegrityError
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

from repositories.permissions import CanManageRepositoryOrReadOnly, RepositoryScopedMixin
from .models import Project, Column, Card
from .serializers import ColumnSerializer, ProjectSerializer, CardSerializer
from .services import create_project, create_column, add_card, move_card


class ProjectListCreateView(RepositoryScopedMixin, ListCreateAPIView):
  serializer_class = ProjectSerializer
  permission_classes = [CanManageRepositoryOrReadOnly]

  def get_queryset(self):
    return Project.objects.filter(repository_id=self.kwargs["repo_id"]).select_related('repository__owner')

  def perform_create(self, serializer):
    serializer.instance = create_project(name=serializer.validated_data["name"], repository=self.get_repository())


class ProjectScopedMixin(RepositoryScopedMixin):
  def get_project(self):
    if not hasattr(self, "_project"):
      self._project = get_object_or_404(Project.objects.select_related("repository"), id=self.kwargs["project_id"])
    return self._project

  def resolve_repository(self):
    return self.get_project().repository


class ColumnListCreateView(ProjectScopedMixin, ListCreateAPIView):
  serializer_class = ColumnSerializer
  permission_classes = [CanManageRepositoryOrReadOnly]

  def get_queryset(self):
    return Column.objects.filter(project_id=self.kwargs["project_id"])

  def perform_create(self, serializer):
    serializer.instance = create_column(
      name=serializer.validated_data["name"],
      position=serializer.validated_data.get("position"),
      project=self.get_project(),
    )


class ColumnDetailView(ProjectScopedMixin, RetrieveUpdateDestroyAPIView):
  serializer_class = ColumnSerializer
  permission_classes = [CanManageRepositoryOrReadOnly]

  def get_queryset(self):
    return Column.objects.filter(project_id=self.kwargs["project_id"])


class ColumnScopedMixin(RepositoryScopedMixin):
  def get_column(self):
    if not hasattr(self, "_column"):
      self._column = get_object_or_404(
        Column.objects.select_related("project__repository"), id=self.kwargs["column_id"]
      )
    return self._column

  def resolve_repository(self):
    return self.get_column().project.repository


class CardListCreateView(ColumnScopedMixin, ListCreateAPIView):
  serializer_class = CardSerializer
  permission_classes = [CanManageRepositoryOrReadOnly]

  def get_queryset(self):
    return Card.objects.filter(column_id=self.kwargs["column_id"]).select_related("content_type")

  def perform_create(self, serializer):
    data = serializer.validated_data
    if "link_type" not in data or "link_id" not in data:
      raise ValidationError({"non_field_errors": ["link_type and link_id are required."]})
    try:
      serializer.instance = add_card(column=self.get_column(), link_type=data["link_type"], link_id=data["link_id"])
    except IntegrityError:
      raise ValidationError({"non_field_errors": ["This item is already added to the board."]})


class CardDetailView(ColumnScopedMixin, RetrieveUpdateDestroyAPIView):
  serializer_class = CardSerializer
  permission_classes = [CanManageRepositoryOrReadOnly]

  def get_queryset(self):
    return Card.objects.filter(column_id=self.kwargs['column_id']).select_related("content_type")

  def perform_update(self, serializer):
    data = serializer.validated_data
    serializer.instance = move_card(
      card=serializer.instance,
      column_id=data.get("column_id"),
      position=data.get("position"),
    )
