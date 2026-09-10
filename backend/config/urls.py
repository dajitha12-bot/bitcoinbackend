from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from config.views import HealthView, RootApiView

urlpatterns = [
    path('', RootApiView.as_view(), name='root_api_index'),
    path('api/health/', HealthView.as_view(), name='health'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/datasets/', include('datasets.urls')),
    path('api/fraud/', include('fraud_detection.urls')),
    path('api/admin/', include('admin_panel.urls')),
    path('api/transactions/', include('transactions.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
