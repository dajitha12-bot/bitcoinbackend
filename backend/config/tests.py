from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from fraud_detection.models import AnalysisRun, FraudResult, WalletRisk


class HealthEndpointTests(TestCase):
    def test_health_reports_api_and_database_status(self):
        response = APIClient().get('/api/health/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'OK')
        self.assertEqual(response.data['database'], 'OK')
        self.assertIn('timestamp', response.data)


class AnalystDashboardStatsTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='analyst-test@example.com',
            password='analyst123',
            full_name='Test Analyst',
            role=User.Role.FRAUD_ANALYST,
            status=User.Status.APPROVED,
        )
        self.client = APIClient()
        login = self.client.post(
            '/api/auth/login/',
            {'email': 'analyst-test@example.com', 'password': 'analyst123'},
            format='json',
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")

    def test_dashboard_stats_use_latest_analysis(self):
        AnalysisRun.objects.create(
            total_transactions=25,
            suspicious_transactions=7,
            fraud_rings_found=2,
            precision=0.9,
            recall=0.8,
            f1_score=0.85,
        )
        WalletRisk.objects.create(
            wallet_address='HIGH_WALLET',
            risk_score=80,
            risk_level='HIGH',
        )
        FraudResult.objects.create(
            wallet_address='HIGH_WALLET',
            prediction='SUSPICIOUS',
            risk_score=80,
            risk_level='HIGH',
            reasons=['test'],
        )

        response = self.client.get('/api/fraud/dashboard-stats/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_transactions'], 25)
        self.assertEqual(response.data['suspicious_transactions'], 7)
        self.assertEqual(response.data['fraud_rings_detected'], 2)
        self.assertEqual(response.data['high_risk_wallets'], 1)