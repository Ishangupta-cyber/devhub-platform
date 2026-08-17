from django.urls import path
from .views import RepositoryListCreateView, RepositoryDetailView
from issues.views import IssueCreateView,IssueDetailView

urlpatterns = [
    path('', RepositoryListCreateView.as_view(), name='repository-list-create'),
    path('<int:pk>/', RepositoryDetailView.as_view(), name='repository-detail'),
    path('<int:repo_id>/issues/', IssueCreateView.as_view(), name='issue-list-create'),
    path('<int:repo_id>/issues/<int:pk>/', IssueDetailView.as_view(), name='issue-detail'),
]