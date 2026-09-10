from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
from accounts.models import User
from datasets.models import Dataset
from transactions.models import BitcoinTransaction
from fraud_detection.models import (
    WalletRisk, FraudRing, FraudRingWallet, FraudResult,
    AnalysisRun, TemporalValidationResult, AdversarialTestResult
)
from admin_panel.models import ActivityLog, SystemSetting
from fraud_detection.services.fraud_detector import execute_full_fraud_analysis

class Command(BaseCommand):
    help = 'Seeds initial demo data including accounts, Bitcoin transactions, fraud rings, and analysis results.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting RingFinder demo data seeding..."))

        # 1. Create Demo Users
        admin_user, created = User.objects.get_or_create(
            email='admin@ringfinder.com',
            defaults={
                'username': 'admin@ringfinder.com',
                'full_name': 'System Administrator',
                'role': User.Role.ADMIN,
                'status': User.Status.APPROVED,
                'is_staff': True,
                'is_superuser': True,
                'organization': 'RingFinder Core',
                'reason': 'System Admin Account'
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created Admin: admin@ringfinder.com / admin123"))
        else:
            admin_user.set_password('admin123')
            admin_user.save()

        analyst_user, created = User.objects.get_or_create(
            email='analyst@ringfinder.com',
            defaults={
                'username': 'analyst@ringfinder.com',
                'full_name': 'Lead Fraud Analyst',
                'role': User.Role.FRAUD_ANALYST,
                'status': User.Status.APPROVED,
                'approved_by': admin_user,
                'approved_at': timezone.now() - timedelta(days=10),
                'organization': 'Chain Intelligence Lab',
                'reason': 'Blockchain Forensics Investigation'
            }
        )
        if created:
            analyst_user.set_password('analyst123')
            analyst_user.save()
            self.stdout.write(self.style.SUCCESS("Created Analyst: analyst@ringfinder.com / analyst123"))
        else:
            analyst_user.set_password('analyst123')
            analyst_user.save()

        pending_user, _ = User.objects.get_or_create(
            email='pending@ringfinder.com',
            defaults={
                'username': 'pending@ringfinder.com',
                'full_name': 'Applicant Analyst',
                'role': User.Role.FRAUD_ANALYST,
                'status': User.Status.PENDING,
                'organization': 'FinTech Research Institute',
                'reason': 'Academic research on cryptocurrency fraud'
            }
        )
        pending_user.set_password('analyst123')
        pending_user.save()

        # 2. Create Demo Dataset Record
        demo_dataset, _ = Dataset.objects.get_or_create(
            name="Synthetic Bitcoin Transactions 2026",
            defaults={
                "description": "Synthetic dataset containing normal, circular, and adversarial Bitcoin graph flows.",
                "uploaded_by": admin_user,
                "row_count": 50,
                "date_min": timezone.now() - timedelta(days=30),
                "date_max": timezone.now(),
                "status": Dataset.Status.IMPORTED
            }
        )

        # 3. Create Bitcoin Transactions
        base_time = timezone.now() - timedelta(days=5)

        tx_data = []

        # Normal Wallets (W001, W002, W003, W004)
        tx_data.append(("TX_NORM_001", "W001", "W002", 1.25, base_time))
        tx_data.append(("TX_NORM_002", "W002", "W003", 0.85, base_time + timedelta(hours=2)))
        tx_data.append(("TX_NORM_003", "W003", "W004", 0.50, base_time + timedelta(hours=5)))
        tx_data.append(("TX_NORM_004", "W004", "W001", 0.10, base_time + timedelta(days=1)))
        tx_data.append(("TX_NORM_005", "W001", "W003", 2.00, base_time + timedelta(days=2)))

        # Suspicious Circular Fraud Ring 1: W101 -> W102 -> W103 -> W104 -> W101
        ring_time = base_time + timedelta(hours=12)
        tx_data.append(("TX_RING1_001", "W101", "W102", 15.50, ring_time))
        tx_data.append(("TX_RING1_002", "W102", "W103", 15.48, ring_time + timedelta(minutes=4)))
        tx_data.append(("TX_RING1_003", "W103", "W104", 15.45, ring_time + timedelta(minutes=9)))
        tx_data.append(("TX_RING1_004", "W104", "W101", 15.40, ring_time + timedelta(minutes=15)))
        
        # Second cycle of Ring 1 for rapid velocity
        tx_data.append(("TX_RING1_005", "W101", "W102", 20.00, ring_time + timedelta(hours=1)))
        tx_data.append(("TX_RING1_006", "W102", "W103", 19.95, ring_time + timedelta(hours=1, minutes=5)))
        tx_data.append(("TX_RING1_007", "W103", "W104", 19.90, ring_time + timedelta(hours=1, minutes=12)))
        tx_data.append(("TX_RING1_008", "W104", "W101", 19.85, ring_time + timedelta(hours=1, minutes=18)))

        # Modified Adversarial Route: W101 -> W201 -> W103 -> W202 -> W101
        adv_time = base_time + timedelta(days=2, hours=4)
        tx_data.append(("TX_ADV_001", "W101", "W201", 30.00, adv_time))
        tx_data.append(("TX_ADV_002", "W201", "W103", 29.90, adv_time + timedelta(minutes=6)))
        tx_data.append(("TX_ADV_003", "W103", "W202", 29.85, adv_time + timedelta(minutes=14)))
        tx_data.append(("TX_ADV_004", "W202", "W101", 29.80, adv_time + timedelta(minutes=22)))

        # Kaggle Elliptic Dataset Sample Transactions
        ellip_dataset, _ = Dataset.objects.get_or_create(
            name="Elliptic Kaggle Bitcoin Network",
            defaults={
                "description": "Pre-loaded Kaggle Elliptic transaction graph dataset.",
                "uploaded_by": admin_user,
                "row_count": 4,
                "status": Dataset.Status.IMPORTED
            }
        )
        tx_data.append(("ELLIPTIC_TX_1001_1002", "W_ELLIPTIC_1001", "W_ELLIPTIC_1002", 5.00, base_time + timedelta(days=3)))
        tx_data.append(("ELLIPTIC_TX_1002_1003", "W_ELLIPTIC_1002", "W_ELLIPTIC_1003", 4.95, base_time + timedelta(days=3, minutes=10)))
        tx_data.append(("ELLIPTIC_TX_1003_1004", "W_ELLIPTIC_1003", "W_ELLIPTIC_1004", 4.90, base_time + timedelta(days=3, minutes=20)))
        tx_data.append(("ELLIPTIC_TX_1004_1001", "W_ELLIPTIC_1004", "W_ELLIPTIC_1001", 4.85, base_time + timedelta(days=3, minutes=30)))

        for i, (tx_hash, sender, receiver, amt, t_time) in enumerate(tx_data):
            BitcoinTransaction.objects.update_or_create(
                transaction_hash=tx_hash,
                defaults={
                    "sender_wallet": sender,
                    "receiver_wallet": receiver,
                    "amount": amt,
                    "transaction_time": t_time,
                    "block_height": 840000 + i,
                    "fee": 0.0001,
                    "input_count": 1,
                    "output_count": 1,
                    "dataset": demo_dataset
                }
            )

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(tx_data)} synthetic transactions."))

        # Try fetching live Mempool.space transactions automatically
        try:
            from fraud_detection.services.mempool_service import fetch_live_mempool_transactions
            fetch_live_mempool_transactions(limit=10, user=admin_user)
            self.stdout.write(self.style.SUCCESS("Fetched live Mempool.space transactions automatically."))
        except Exception:
            pass

        # 4. Run Fraud Engine to compute Wallet Risks, Rings, Results
        execute_full_fraud_analysis(dataset_id=None, user=admin_user)

        # 5. Create Temporal Validation Result
        TemporalValidationResult.objects.get_or_create(
            id=1,
            defaults={
                "train_transactions": 7000,
                "test_transactions": 3000,
                "precision": 0.91,
                "recall": 0.87,
                "f1_score": 0.89,
                "roc_auc": 0.93,
                "temporal_leakage": False
            }
        )

        # 6. Create Adversarial Test Result
        AdversarialTestResult.objects.get_or_create(
            id=1,
            defaults={
                "baseline_detection_rate": 0.92,
                "amount_modified_detection_rate": 0.88,
                "timing_modified_detection_rate": 0.86,
                "route_modified_detection_rate": 0.84,
                "intermediate_wallet_detection_rate": 0.87,
                "robustness_score": 0.86
            }
        )

        # 7. Create System Settings
        SystemSetting.objects.get_or_create(
            key="global_config",
            defaults={
                "value": {
                    "risk_threshold_high": 60,
                    "risk_threshold_critical": 80,
                    "min_cycle_length": 3,
                    "rapid_transfer_seconds": 600,
                    "suspicious_amount_btc": 10.0
                },
                "description": "Global RingFinder system risk threshold settings"
            }
        )

        # 8. Create Initial Activity Logs
        ActivityLog.objects.create(user=admin_user, action="SYSTEM_INIT", description="Seeded initial system demo data.")
        ActivityLog.objects.create(user=admin_user, action="ANALYST_APPROVED", description="Approved analyst account analyst@ringfinder.com.")

        self.stdout.write(self.style.SUCCESS("Demo data successfully seeded! Ready for development & testing."))
