import pandas as pd
import numpy as np
import networkx as nx

def extract_wallet_features(df_transactions):
    """
    Computes 15 key features per wallet from a pandas DataFrame of transactions.
    """
    if df_transactions.empty:
        return pd.DataFrame()

    df = df_transactions.copy()
    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0.0)
    df['transaction_time'] = pd.to_datetime(df['transaction_time'])

    # Build NetworkX DiGraph for graph structural metrics
    G = nx.DiGraph()
    for _, row in df.iterrows():
        G.add_edge(row['sender_wallet'], row['receiver_wallet'], amount=row['amount'])

    # Find strongly connected components and simple cycles
    sccs = list(nx.strongly_connected_components(G))
    cycle_nodes = set()
    for scc in sccs:
        if len(scc) > 1:
            cycle_nodes.update(scc)

    wallets = list(set(df['sender_wallet']).union(set(df['receiver_wallet'])))
    features_list = []

    for wallet in wallets:
        in_txs = df[df['receiver_wallet'] == wallet]
        out_txs = df[df['sender_wallet'] == wallet]

        incoming_count = len(in_txs)
        outgoing_count = len(out_txs)
        total_incoming = in_txs['amount'].sum()
        total_outgoing = out_txs['amount'].sum()
        
        all_txs = pd.concat([in_txs, out_txs]).sort_values('transaction_time')
        total_count = incoming_count + outgoing_count
        
        avg_amount = all_txs['amount'].mean() if total_count > 0 else 0.0
        amount_variance = all_txs['amount'].var() if total_count > 1 else 0.0

        # Rapid transfer score calculation (time gap < 10 mins)
        time_gaps = all_txs['transaction_time'].diff().dt.total_seconds().dropna() if total_count > 1 else pd.Series()
        min_time_gap = time_gaps.min() if not time_gaps.empty else 999999
        rapid_transfers = (time_gaps < 600).sum() if not time_gaps.empty else 0

        # Counterparties
        counterparties = set(in_txs['sender_wallet']).union(set(out_txs['receiver_wallet']))
        unique_counterparties = len(counterparties)

        # Repeated relationships
        counterparty_counts = pd.concat([in_txs['sender_wallet'], out_txs['receiver_wallet']]).value_counts()
        max_repeated = counterparty_counts.max() if not counterparty_counts.empty else 0

        # In/out ratio
        in_out_ratio = (incoming_count / outgoing_count) if outgoing_count > 0 else (incoming_count if incoming_count > 0 else 1.0)

        # Graph Metrics
        in_degree = G.in_degree(wallet) if wallet in G else 0
        out_degree = G.out_degree(wallet) if wallet in G else 0
        connectivity = in_degree + out_degree
        is_in_cycle = 1 if wallet in cycle_nodes else 0

        features_list.append({
            'wallet_address': wallet,
            'incoming_count': incoming_count,
            'outgoing_count': outgoing_count,
            'total_incoming': total_incoming,
            'total_outgoing': total_outgoing,
            'tx_frequency': total_count,
            'avg_amount': avg_amount,
            'amount_variance': amount_variance if not np.isnan(amount_variance) else 0.0,
            'rapid_transfers': rapid_transfers,
            'min_time_gap': min_time_gap,
            'connectivity': connectivity,
            'repeated_relationships': max_repeated,
            'is_in_cycle': is_in_cycle,
            'unique_counterparties': unique_counterparties,
            'in_out_ratio': in_out_ratio,
            'short_chain_flag': 1 if (connectivity > 2 and total_incoming > 0 and abs(total_incoming - total_outgoing) / (total_incoming + 1e-5) < 0.1) else 0
        })

    return pd.DataFrame(features_list)
