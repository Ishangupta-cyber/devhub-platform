from django.urls import path
from .views import FileTreeView, FileNodeDetailView

urlpatterns = [
    path(
        'repositories/<int:repository_id>/tree/',
        FileTreeView.as_view(),
        name='file-tree',
    ),
    path(
        'repositories/<int:repository_id>/files/<int:node_id>/',
        FileNodeDetailView.as_view(),
        name='file-detail',
    ),
]