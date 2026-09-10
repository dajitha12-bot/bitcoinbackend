from django.urls import path
from admin_panel.views import (
    AdminDashboardView,
    PendingAnalystsView,
    ApproveAnalystView,
    RejectAnalystView,
    AnalystListView,
    AnalystDetailView,
    ActivateAnalystView,
    DeactivateAnalystView,
    AdminFraudResultsView,
    AdminFraudRingsView,
    AdminTemporalResultsView,
    AdminAdversarialResultsView,
    ActivityLogsView,
    SystemSettingsView
)

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('analysts/pending/', PendingAnalystsView.as_view(), name='pending_analysts'),
    path('analysts/<int:pk>/approve/', ApproveAnalystView.as_view(), name='approve_analyst'),
    path('analysts/<int:pk>/reject/', RejectAnalystView.as_view(), name='reject_analyst'),
    path('analysts/', AnalystListView.as_view(), name='analyst_list'),
    path('analysts/<int:pk>/', AnalystDetailView.as_view(), name='analyst_detail'),
    path('analysts/<int:pk>/activate/', ActivateAnalystView.as_view(), name='activate_analyst'),
    path('analysts/<int:pk>/deactivate/', DeactivateAnalystView.as_view(), name='deactivate_analyst'),
    path('fraud-results/', AdminFraudResultsView.as_view(), name='admin_fraud_results'),
    path('fraud-rings/', AdminFraudRingsView.as_view(), name='admin_fraud_rings'),
    path('temporal-results/', AdminTemporalResultsView.as_view(), name='admin_temporal_results'),
    path('adversarial-results/', AdminAdversarialResultsView.as_view(), name='admin_adversarial_results'),
    path('activity-logs/', ActivityLogsView.as_view(), name='activity_logs'),
    path('settings/', SystemSettingsView.as_view(), name='system_settings'),
]
