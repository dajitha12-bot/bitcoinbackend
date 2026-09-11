import os
import pandas as pd
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
from fraud_detection.services.temporal_validator import run_temporal_validation
from fraud_detection.services.adversarial_detector import run_adversarial_testing

class Command(BaseCommand):
    help = 'Seeds initial demo data including accounts, Bitcoin transactions, fraud rings, and analysis results.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting RingFinder comprehensive demo data seeding..."))

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
        if created or not admin_user.check_password('admin123'):
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created Admin: admin@ringfinder.com / admin123"))

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
        if created or not analyst_user.check_password('analyst123'):
            analyst_user.set_password('analyst123')
            analyst_user.save()
            self.stdout.write(self.style.SUCCESS("Created Analyst: analyst@ringfinder.com / analyst123"))

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

        # 2. Ingest Sample CSV Datasets if present
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        sample_dir = os.path.join(base_dir, 'sample_csv')

        csv_files = [
            ("Elliptic Kaggle Bitcoin Network", "elliptic_dataset_sample.csv", "Pre-loaded Kaggle Elliptic transaction graph dataset."),
            ("Mempool.space Live Bitcoin Network", "mempool_live_bitcoin_sample.csv", "Real-time Bitcoin blockchain mempool transaction snapshot."),
            ("Multi-Ring Laundering Network 2026", "bitcoin_fraud_ring_network.csv", "Complex multi-ring circular routing and adversarial obfuscation dataset.")
        ]

        for name, filename, desc in csv_files:
            ds, _ = Dataset.objects.get_or_create(
                name=name,
                defaults={
                    "description": desc,
                    "uploaded_by": admin_user,
                    "row_count": 20,
                    "date_min": timezone.now() - timedelta(days=15),
                    "date_max": timezone.now(),
                    "status": Dataset.Status.IMPORTED
                }
            )

            file_path = os.path.join(sample_dir, filename)
            if os.path.exists(file_path):
                try:
                    df = pd.read_csv(file_path)
                    txs = []
                    for idx, row in df.iterrows():
                        if 'txId1' in df.columns and 'txId2' in df.columns:
                            tx_hash = f"ELLIPTIC_TX_{row['txId1']}_{row['txId2']}"
                            sender = f"W_ELLIPTIC_{row['txId1']}"
                            receiver = f"W_ELLIPTIC_{row['txId2']}"
                            amount = float(row.get('amount', 1.0))
                        else:
                            sender = str(row.get('sender_wallet') or f"W_SENDER_{idx}").strip()
                            receiver = str(row.get('receiver_wallet') or f"W_RECEIVER_{idx}").strip()
                            tx_hash = str(row.get('transaction_hash') or f"TX-{ds.id}-{idx}").strip()
                            amount = float(row.get('amount', 1.0))

                        txs.append(BitcoinTransaction(
                            transaction_hash=tx_hash,
                            sender_wallet=sender,
                            receiver_wallet=receiver,
                            amount=amount,
                            transaction_time=timezone.now() - timedelta(hours=idx * 2),
                            block_height=860000 + idx,
                            fee=float(row.get('fee', 0.0001)),
                            dataset=ds
                        ))
                    if txs:
                        BitcoinTransaction.objects.bulk_create(txs, ignore_conflicts=True)
                        ds.row_count = len(txs)
                        ds.status = Dataset.Status.IMPORTED
                        ds.save()
                except Exception as err:
                    self.stdout.write(self.style.WARNING(f"Could not load CSV {filename}: {err}"))

        # 3. Seed Synthetic Synthetic Bitcoin Transactions
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

        base_time = timezone.now() - timedelta(days=5)
        tx_data = []

        # Normal Transactions
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

        # Second cycle of Ring 1
        tx_data.append(("TX_RING1_005", "W101", "W102", 20.00, ring_time + timedelta(hours=1)))
        tx_data.append(("TX_RING1_006", "W102", "W103", 19.95, ring_time + timedelta(hours=1, minutes=5)))
        tx_data.append(("TX_RING1_007", "W103", "W104", 19.90, ring_time + timedelta(hours=1, minutes=12)))
        tx_data.append(("TX_RING1_008", "W104", "W101", 19.85, ring_time + timedelta(hours=1, minutes=18)))

        # Adversarial Route: W101 -> W201 -> W103 -> W202 -> W101
        adv_time = base_time + timedelta(days=2, hours=4)
        tx_data.append(("TX_ADV_001", "W101", "W201", 30.00, adv_time))
        tx_data.append(("TX_ADV_002", "W201", "W103", 29.90, adv_time + timedelta(minutes=6)))
        tx_data.append(("TX_ADV_003", "W103", "W202", 29.85, adv_time + timedelta(minutes=14)))
        tx_data.append(("TX_ADV_004", "W202", "W101", 29.80, adv_time + timedelta(minutes=22)))

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

        # 4. Fetch live Mempool.space transactions
        try:
            from fraud_detection.services.mempool_service import fetch_live_mempool_transactions
            fetch_live_mempool_transactions(limit=15, user=admin_user)
            self.stdout.write(self.style.SUCCESS("Fetched live Mempool.space transactions automatically."))
        except Exception:
            pass

        # 5. Execute Full Fraud Analysis Pipeline over all transactions
        execute_full_fraud_analysis(dataset_id=None, user=admin_user)

        # 6. Execute Temporal Validation & Adversarial Testing
        run_temporal_validation()
        try:
            run_adversarial_testing()
        except Exception:
            pass

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
        ActivityLog.objects.create(user=admin_user, action="SYSTEM_INIT", description="Seeded initial system demo datasets.")
        ActivityLog.objects.create(user=admin_user, action="ANALYST_APPROVED", description="Approved analyst account analyst@ringfinder.com.")

        self.stdout.write(self.style.SUCCESS("Demo data successfully seeded across all models! Zero empty states."))
