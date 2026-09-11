from django.urls import path
from fraud_detection.views import (
    NetworkGraphView,
    AnalyzeFraudView,
    FraudResultsListView,
    FraudResultDetailView,
    WalletRiskListView,
    WalletRiskDetailView,
    FraudRingListView,
    FraudRingDetailView,
    TemporalValidationView,
    AdversarialTestingView,
    ModelPerformanceView,
    ModelPerformanceHistoryView,
    LiveMempoolFetchView,
    AnalystDashboardStatsView,
    ExplainChatbotView
)

urlpatterns = [
    path('network/', NetworkGraphView.as_view(), name='fraud_network'),
    path('analyze/', AnalyzeFraudView.as_view(), name='fraud_analyze'),
    path('dashboard-stats/', AnalystDashboardStatsView.as_view(), name='analyst_dashboard_stats'),
    path('results/', FraudResultsListView.as_view(), name='fraud_results'),
    path('results/<int:pk>/', FraudResultDetailView.as_view(), name='fraud_result_detail'),
    path('wallets/', WalletRiskListView.as_view(), name='wallet_risks'),
    path('wallets/<str:wallet_address>/', WalletRiskDetailView.as_view(), name='wallet_risk_detail'),
    path('rings/', FraudRingListView.as_view(), name='fraud_rings'),
    path('rings/<int:pk>/', FraudRingDetailView.as_view(), name='fraud_ring_detail'),
    path('temporal/', TemporalValidationView.as_view(), name='temporal_validation_get'),
    path('temporal/run/', TemporalValidationView.as_view(), name='temporal_validation_run'),
    path('adversarial/run/', AdversarialTestingView.as_view(), name='adversarial_testing_run'),
    path('model-performance/', ModelPerformanceView.as_view(), name='model_performance'),
    path('model-performance/history/', ModelPerformanceHistoryView.as_view(), name='model_performance_history'),
    path('mempool/fetch/', LiveMempoolFetchView.as_view(), name='mempool_fetch'),
    path('explain-chatbot/', ExplainChatbotView.as_view(), name='explain_chatbot'),
]
