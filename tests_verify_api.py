import sys
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIClient
from accounts.models import User
from fraud_detection.models import FraudRing, WalletRisk, TemporalValidationResult, AdversarialTestResult
from admin_panel.models import SystemSetting, ActivityLog

def run_tests():
    client = APIClient()
    print("\n=================== RINGFINDER API VERIFICATION ===================")

    # 1. Test Login with Admin
    res = client.post('/api/auth/login/', {'email': 'admin@ringfinder.com', 'password': 'admin123'}, format='json')
    assert res.status_code == 200, f"Admin login failed: {res.data}"
    admin_token = res.data['access']
    print("[PASS] 1. POST /api/auth/login/ (Admin)")

    # 2. Test Login with Pending Analyst (Should be DENIED)
    pending_user, _ = User.objects.get_or_create(email='test_pending@ringfinder.com', defaults={'username': 'test_pending@ringfinder.com', 'full_name': 'Test Pending', 'role': User.Role.FRAUD_ANALYST, 'status': User.Status.PENDING})
    pending_user.status = User.Status.PENDING
    pending_user.set_password('analyst123')
    pending_user.save()

    res_pending = client.post('/api/auth/login/', {'email': 'test_pending@ringfinder.com', 'password': 'analyst123'}, format='json')
    assert res_pending.status_code in [400, 401, 403], f"Pending analyst login should be denied, got: {res_pending.status_code}"
    print("[PASS] 2. POST /api/auth/login/ (Pending Analyst Denied)")

    # 3. Test Login with Approved Analyst
    res_analyst = client.post('/api/auth/login/', {'email': 'analyst@ringfinder.com', 'password': 'analyst123'}, format='json')
    assert res_analyst.status_code == 200, f"Analyst login failed: {res_analyst.data}"
    analyst_token = res_analyst.data['access']
    print("[PASS] 3. POST /api/auth/login/ (Approved Analyst)")

    # 4. Test Authenticated Profile GET /api/auth/me/
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {analyst_token}')
    res_me = client.get('/api/auth/me/')
    assert res_me.status_code == 200, f"GET /api/auth/me/ failed: {res_me.data}"
    print("[PASS] 4. GET /api/auth/me/")

    # 5. Test Network Graph API GET /api/fraud/network/
    res_net = client.get('/api/fraud/network/')
    assert res_net.status_code == 200, f"GET /api/fraud/network/ failed: {res_net.data}"
    assert 'nodes' in res_net.data and 'edges' in res_net.data, "Network response missing nodes/edges"
    print(f"[PASS] 5. GET /api/fraud/network/ ({len(res_net.data['nodes'])} nodes, {len(res_net.data['edges'])} edges)")

    # 6. Test Fraud Rings API GET /api/fraud/rings/
    res_rings = client.get('/api/fraud/rings/')
    assert res_rings.status_code == 200, f"GET /api/fraud/rings/ failed: {res_rings.data}"
    print(f"[PASS] 6. GET /api/fraud/rings/ (Rings found: {len(res_rings.data['data'])})")

    # 7. Test Wallet Risks API GET /api/fraud/wallets/
    res_wallets = client.get('/api/fraud/wallets/')
    assert res_wallets.status_code == 200, f"GET /api/fraud/wallets/ failed: {res_wallets.data}"
    print(f"[PASS] 7. GET /api/fraud/wallets/ (Count: {res_wallets.data['count']})")

    # 8. Test Temporal Validation API GET /api/fraud/temporal/ & POST /api/fraud/temporal/run/
    res_temp = client.post('/api/fraud/temporal/run/')
    assert res_temp.status_code == 200, f"POST /api/fraud/temporal/run/ failed: {res_temp.data}"
    assert res_temp.data['temporal_leakage'] is False, "Temporal leakage must be False!"
    print("[PASS] 8. POST /api/fraud/temporal/run/ (temporal_leakage=False verified)")

    # 9. Test Adversarial Testing API POST /api/fraud/adversarial/run/
    res_adv = client.post('/api/fraud/adversarial/run/', {}, format='json')
    assert res_adv.status_code == 200, f"POST /api/fraud/adversarial/run/ failed: {res_adv.data}"
    assert 'robustness_score' in res_adv.data, "Adversarial response missing robustness_score"
    print(f"[PASS] 9. POST /api/fraud/adversarial/run/ (Robustness score: {res_adv.data['robustness_score']})")

    # 10. Test Admin Dashboard GET /api/admin/dashboard/
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {admin_token}')
    res_dash = client.get('/api/admin/dashboard/')
    assert res_dash.status_code == 200, f"GET /api/admin/dashboard/ failed: {res_dash.data}"
    print(f"[PASS] 10. GET /api/admin/dashboard/ (Total users: {res_dash.data['total_users']}, Rings: {res_dash.data['fraud_rings']})")

    # 11. Test Analyst Approval Flow
    res_app = client.post(f'/api/admin/analysts/{pending_user.id}/approve/')
    assert res_app.status_code == 200, f"Approve analyst failed: {res_app.data}"
    print("[PASS] 11. POST /api/admin/analysts/{id}/approve/")

    # Verify newly approved analyst can now log in
    res_new_login = client.post('/api/auth/login/', {'email': 'test_pending@ringfinder.com', 'password': 'analyst123'}, format='json')
    assert res_new_login.status_code == 200, "Newly approved analyst failed to log in!"
    print("[PASS] 12. Approved Analyst Login Succeeded!")

    print("===================================================================\nALL 12 BACKEND API TESTS PASSED SUCCESSFULLY!\n")

if __name__ == '__main__':
    run_tests()
