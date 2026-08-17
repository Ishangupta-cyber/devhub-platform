from django.urls import path
from .views import RepositoryListCreateView, RepositoryDetailView

urlpatterns = [
    path('', RepositoryListCreateView.as_view(), name='repository-list-create'),
    path('<int:pk>/', RepositoryDetailView.as_view(), name='repository-detail'),
]