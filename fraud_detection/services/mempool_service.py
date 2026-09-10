import urllib.request
import json
from datetime import datetime
from django.utils import timezone
from transactions.models import BitcoinTransaction
from datasets.models import Dataset

MEMPOOL_API_BASE = "https://mempool.space/api"

def fetch_live_mempool_transactions(limit=20, user=None):
    """
    Fetches live real-time transactions from Mempool.space public REST API (no API key required)
    and saves them into the RingFinder BitcoinTransaction database table.
    """
    try:
        # 1. Fetch recent transactions
        req = urllib.request.Request(
            f"{MEMPOOL_API_BASE}/mempool/recent",
            headers={"User-Agent": "RingFinder-Fraud-Detector/1.0"}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            recent_txs = json.loads(response.read().decode())

        if not recent_txs:
            return {"success": False, "message": "No recent transactions returned from mempool.space", "count": 0}

        # 2. Get or create live mempool dataset
        live_dataset, _ = Dataset.objects.get_or_create(
            name="Live Mempool.space Stream",
            defaults={
                "description": "Live real-time Bitcoin mempool transactions fetched from mempool.space REST API.",
                "uploaded_by": user,
                "status": Dataset.Status.IMPORTED,
                "date_min": timezone.now(),
                "date_max": timezone.now()
            }
        )

        imported_txs = []
        for item in recent_txs[:limit]:
            txid = item.get('txid')
            if not txid:
                continue

            # Fetch detailed tx inputs/outputs
            try:
                tx_req = urllib.request.Request(
                    f"{MEMPOOL_API_BASE}/tx/{txid}",
                    headers={"User-Agent": "RingFinder-Fraud-Detector/1.0"}
                )
                with urllib.request.urlopen(tx_req, timeout=5) as tx_resp:
                    tx_detail = json.loads(tx_resp.read().decode())

                sender = "Unknown_Input"
                vin = tx_detail.get('vin', [])
                if vin and 'prevout' in vin[0] and 'scriptpubkey_address' in vin[0]['prevout']:
                    sender = vin[0]['prevout']['scriptpubkey_address']

                receiver = "Unknown_Output"
                vout = tx_detail.get('vout', [])
                if vout and 'scriptpubkey_address' in vout[0]:
                    receiver = vout[0]['scriptpubkey_address']

                satoshis = sum(v.get('value', 0) for v in vout)
                amount_btc = float(satoshis) / 100000000.0

                fee_sat = tx_detail.get('fee', 0)
                fee_btc = float(fee_sat) / 100000000.0

                tx_obj, _ = BitcoinTransaction.objects.update_or_create(
                    transaction_hash=txid,
                    defaults={
                        "sender_wallet": sender,
                        "receiver_wallet": receiver,
                        "amount": amount_btc if amount_btc > 0 else 0.001,
                        "transaction_time": timezone.now(),
                        "block_height": tx_detail.get('status', {}).get('block_height', 0) or 0,
                        "fee": fee_btc,
                        "input_count": len(vin),
                        "output_count": len(vout),
                        "dataset": live_dataset
                    }
                )
                imported_txs.append(tx_obj)

            except Exception:
                continue

        live_dataset.row_count = BitcoinTransaction.objects.filter(dataset=live_dataset).count()
        live_dataset.save()

        return {
            "success": True,
            "message": f"Successfully fetched and imported {len(imported_txs)} live transactions from mempool.space.",
            "count": len(imported_txs)
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"Failed to connect to mempool.space API: {str(e)}",
            "count": 0
        }
