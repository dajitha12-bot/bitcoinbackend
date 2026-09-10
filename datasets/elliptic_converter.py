import sys
import pandas as pd

def convert_elliptic_to_ringfinder(input_edgelist_path, output_csv_path="elliptic_ringfinder_format.csv"):
    """
    Converts Kaggle Elliptic Data Set edgelist (txId1, txId2) into RingFinder CSV format.
    
    Kaggle Elliptic files:
    - elliptic_txs_edgelist.csv (cols: txId1, txId2, timestep)
    """
    print(f"Loading Elliptic dataset edgelist from {input_edgelist_path}...")
    df = pd.read_csv(input_edgelist_path)

    # Standardize column mapping
    df_out = pd.DataFrame()
    df_out['transaction_hash'] = df.apply(lambda r: f"ELLIPTIC_TX_{r['txId1']}_{r['txId2']}", axis=1)
    df_out['sender_wallet'] = df['txId1'].apply(lambda x: f"W_ELLIPTIC_{x}")
    df_out['receiver_wallet'] = df['txId2'].apply(lambda x: f"W_ELLIPTIC_{x}")
    df_out['amount'] = 1.0  # Normalized default amount for graph analysis
    df_out['transaction_time'] = "2026-01-01T00:00:00Z"
    df_out['block_height'] = df.get('timestep', 1)
    df_out['fee'] = 0.0001
    df_out['input_count'] = 1
    df_out['output_count'] = 1

    df_out.to_csv(output_csv_path, index=False)
    print(f"Successfully converted {len(df_out)} rows to RingFinder format: {output_csv_path}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        convert_elliptic_to_ringfinder(sys.argv[1])
    else:
        print("Usage: python elliptic_converter.py <path_to_elliptic_txs_edgelist.csv>")
