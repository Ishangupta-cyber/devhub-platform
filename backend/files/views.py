from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .permissions import CanAccessRepositoryFiles
from repositories.models import Repository
from .models import FileNode
from .services import get_file_tree, get_node_details


class FileTreeView(APIView):
    permission_classes=[CanAccessRepositoryFiles]

    def get(self, request, repository_id):
        repository = get_object_or_404(Repository, pk=repository_id)
        self.check_object_permissions(request, repository) 
        tree = get_file_tree(repository)
        return Response(tree)


class FileNodeDetailView(APIView):
    permission_classes = [CanAccessRepositoryFiles]

    def get(self, request, repository_id, node_id):
        node = get_object_or_404(
            FileNode,
            pk=node_id,
            repository_id=repository_id,    
        )
        self.check_object_permissions(request, node)    
        return Response(get_node_details(node))