def calculate_wallet_risk(feat_row):
    """
    Computes a risk score (0-100), risk level, anomaly sub-scores, and human-readable explanation reasons.
    """
    score = 0
    reasons = []

    tx_freq = feat_row.get('tx_frequency', 0)
    rapid_tx = feat_row.get('rapid_transfers', 0)
    is_cycle = feat_row.get('is_in_cycle', 0)
    connectivity = feat_row.get('connectivity', 0)
    repeated = feat_row.get('repeated_relationships', 0)
    short_chain = feat_row.get('short_chain_flag', 0)
    total_in = feat_row.get('total_incoming', 0.0)
    total_out = feat_row.get('total_outgoing', 0.0)
    in_out_ratio = feat_row.get('in_out_ratio', 1.0)
    avg_amt = feat_row.get('avg_amount', 0.0)
    amt_var = feat_row.get('amount_variance', 0.0)

    # 1. Circular / Graph structure activity
    circular_score = 0
    if is_cycle:
        score += 35
        circular_score = 95
        reasons.append("Circular transaction pattern detected across connected wallets")
    elif short_chain:
        score += 20
        circular_score = 65
        reasons.append("Rapid pass-through transaction chain detected")

    # 2. Rapid fund transfers
    rapid_score = 0
    if rapid_tx > 2:
        score += 25
        rapid_score = 88
        reasons.append("Rapid movement of funds within tight time windows")
    elif rapid_tx > 0:
        score += 15
        rapid_score = 55
        reasons.append("Elevated transaction frequency with short delay intervals")

    # 3. Connectivity & Repeated relationships
    conn_score = min(int(connectivity * 10), 100)
    if repeated >= 3:
        score += 20
        reasons.append("Repeated transaction activity with specific counterparty wallets")
    elif connectivity > 5:
        score += 10
        reasons.append("High degree of node connectivity in transaction graph")

    # 4. Amount anomaly & velocity
    amt_score = 0
    if total_in > 0 and abs(total_in - total_out) / (total_in + 1e-5) < 0.05 and total_in > 1.0:
        score += 15
        amt_score = 85
        reasons.append("Near-equal volume incoming and outgoing funds (Pass-through anomaly)")
    elif avg_amt > 10.0:
        amt_score = 60
        score += 10
        reasons.append("Abnormally large transaction amounts observed")

    # Cap score at 100
    final_score = min(max(int(score), 0), 100)

    if final_score >= 80:
        level = "CRITICAL"
    elif final_score >= 60:
        level = "HIGH"
    elif final_score >= 30:
        level = "MEDIUM"
    else:
        level = "LOW"

    if not reasons:
        reasons.append("Normal transaction behavior with low risk metrics")

    # Disclaimer attached to explanation
    explanation_list = list(reasons)
    explanation_list.append("Note: Risk scores indicate suspicious structural behavior and do not constitute absolute proof of illegal activity.")

    return {
        "risk_score": final_score,
        "risk_level": level,
        "rapid_transfer_score": rapid_score,
        "amount_anomaly_score": amt_score,
        "timing_anomaly_score": min(rapid_score + 10, 100),
        "connectivity_score": conn_score,
        "circular_activity_score": circular_score,
        "reasons": reasons,
        "explanation": explanation_list
    }
