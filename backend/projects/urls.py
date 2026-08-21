# projects/urls.py (naya file)
from django.urls import path
from .views import ColumnListCreateView, ColumnDetailView, CardListCreateView, CardDetailView


urlpatterns = [
    path('<int:project_id>/columns/', ColumnListCreateView.as_view(), name='column-list-create'),
    path('<int:project_id>/columns/<int:pk>/', ColumnDetailView.as_view(), name='column-detail'),
    path('columns/<int:column_id>/cards/', CardListCreateView.as_view(), name='card-list-create'),
    path('columns/<int:column_id>/cards/<int:pk>/', CardDetailView.as_view(), name='card-detail'),
]