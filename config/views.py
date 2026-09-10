from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

class RootApiView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({
            "success": True,
            "message": "Welcome to RingFinder Fraud-Ring Detection REST API",
            "status": "ONLINE",
            "base_url": "http://localhost:8000/api/",
            "endpoints": {
                "authentication": {
                    "login": "/api/auth/login/",
                    "register": "/api/auth/register/",
                    "refresh_token": "/api/auth/token/refresh/",
                    "me": "/api/auth/me/"
                },
                "fraud_analytics": {
                    "network_graph": "/api/fraud/network/",
                    "fraud_analysis": "/api/fraud/analyze/",
                    "fraud_results": "/api/fraud/results/",
                    "fraud_rings": "/api/fraud/rings/",
                    "wallet_risks": "/api/fraud/wallets/",
                    "temporal_validation": "/api/fraud/temporal/",
                    "adversarial_testing": "/api/fraud/adversarial/run/",
                    "model_performance": "/api/fraud/model-performance/"
                },
                "datasets": {
                    "dataset_list": "/api/datasets/",
                    "mempool_live_fetch": "/api/fraud/mempool/fetch/"
                },
                "admin": {
                    "django_admin": "/admin/",
                    "dashboard_stats": "/api/admin/dashboard/",
                    "pending_analysts": "/api/admin/analysts/pending/",
                    "activity_logs": "/api/admin/activity-logs/",
                    "system_settings": "/api/admin/settings/"
                }
            },
            "demo_accounts": {
                "admin": "admin@ringfinder.com / admin123",
                "analyst": "analyst@ringfinder.com / analyst123"
            }
        }, status=status.HTTP_200_OK)
