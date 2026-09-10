from django.urls import path
from datasets.views import (
    DatasetListCreateView,
    DatasetDetailView,
    DatasetImportView,
    DatasetPreviewView
)

urlpatterns = [
    path('', DatasetListCreateView.as_view(), name='dataset_list_create'),
    path('<int:pk>/', DatasetDetailView.as_view(), name='dataset_detail'),
    path('<int:pk>/import/', DatasetImportView.as_view(), name='dataset_import'),
    path('<int:pk>/preview/', DatasetPreviewView.as_view(), name='dataset_preview'),
]
