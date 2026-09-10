from transactions.models import BitcoinTransaction
from fraud_detection.models import WalletRisk
from django.db.models import Q

def generate_network_graph_data(wallet=None, tx_hash=None, min_amount=None, start_date=None, end_date=None, risk_level=None):
    """
    Generates node & edge data structure tailored for the React NetworkGraph component.
    """
    queryset = BitcoinTransaction.objects.all().order_by('-transaction_time')

    if wallet:
        queryset = queryset.filter(Q(sender_wallet__icontains=wallet) | Q(receiver_wallet__icontains=wallet))
    if tx_hash:
        queryset = queryset.filter(transaction_hash__icontains=tx_hash)
    if min_amount:
        try:
            queryset = queryset.filter(amount__gte=float(min_amount))
        except ValueError:
            pass
    if start_date:
        queryset = queryset.filter(transaction_time__gte=start_date)
    if end_date:
        queryset = queryset.filter(transaction_time__lte=end_date)

    txs = list(queryset[:300])  # Cap at 300 for optimal rendering

    nodes_dict = {}
    edges_list = []

    # Get known wallet risks
    risk_map = {wr.wallet_address: wr for wr in WalletRisk.objects.all()}

    for tx in txs:
        sender = tx.sender_wallet
        receiver = tx.receiver_wallet

        for w in [sender, receiver]:
            if w not in nodes_dict:
                w_risk = risk_map.get(w)
                score = w_risk.risk_score if w_risk else 15
                level = w_risk.risk_level if w_risk else "LOW"
                
                # Filter by risk level if requested
                if risk_level and level != risk_level:
                    continue

                nodes_dict[w] = {
                    "id": w,
                    "label": w[:10] + "..." if len(w) > 12 else w,
                    "full_address": w,
                    "risk_score": score,
                    "risk_level": level
                }

        if sender in nodes_dict and receiver in nodes_dict:
            edges_list.append({
                "id": f"edge-{tx.id}",
                "source": sender,
                "target": receiver,
                "amount": float(tx.amount),
                "transaction_hash": tx.transaction_hash,
                "timestamp": tx.transaction_time.isoformat()
            })

    return {
        "nodes": list(nodes_dict.values()),
        "edges": edges_list
    }
