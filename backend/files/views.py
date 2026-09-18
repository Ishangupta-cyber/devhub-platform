from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from repositories.models import Repository
from .models import FileNode
from .permissions import CanAccessRepositoryFiles
from .serializers import FileNodeCreateSerializer, FileNodeUpdateSerializer
from .services import (
    get_file_tree,
    get_node_details,
    create_file_node,
    update_file_node,
    delete_file_node,
    move_file_node
)


class FileTreeView(APIView):
    permission_classes = [CanAccessRepositoryFiles]

    def get(self, request, repository_id):
        repository = get_object_or_404(Repository, pk=repository_id)
        self.check_object_permissions(request, repository)
        return Response(get_file_tree(repository))

    def post(self, request, repository_id):
        repository = get_object_or_404(Repository, pk=repository_id)
        self.check_object_permissions(request, repository)

        serializer = FileNodeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        node = create_file_node(
            repository=repository,
            name=data['name'],
            node_type=data['node_type'],
            parent_id=data.get('parent'),
            content=data.get('content', ''),
        )
        return Response(get_node_details(node), status=status.HTTP_201_CREATED)


class FileNodeDetailView(APIView):
    permission_classes = [CanAccessRepositoryFiles]

    def get_node(self, request, repository_id, node_id):
        node = get_object_or_404(FileNode, pk=node_id, repository_id=repository_id)
        self.check_object_permissions(request, node)
        return node

    def get(self, request, repository_id, node_id):
        node = self.get_node(request, repository_id, node_id)
        return Response(get_node_details(node))

    def patch(self, request, repository_id, node_id):
        node = self.get_node(request, repository_id, node_id)

        serializer = FileNodeUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

    # Move pehle — parent badal jaye to uniqueness naye folder mein check hogi
        if 'parent' in data:
            node = move_file_node(node, data['parent'])

        node = update_file_node(
            node,
            name=data.get('name'),
            content=data.get('content'),
        )
        return Response(get_node_details(node))

    def delete(self, request, repository_id, node_id):
        node = self.get_node(request, repository_id, node_id)
        delete_file_node(node)
        return Response(status=status.HTTP_204_NO_CONTENT)
