from sklearn.ensemble import RandomForestClassifier
import numpy as np

class FraudClassifier:
    def __init__ (self):
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.feature_columns = [
            'incoming_count', 'outgoing_count', 'total_incoming', 'total_outgoing',
            'tx_frequency', 'avg_amount', 'amount_variance', 'rapid_transfers',
            'connectivity', 'repeated_relationships', 'is_in_cycle',
            'unique_counterparties', 'in_out_ratio', 'short_chain_flag'
        ]

    def fit(self, X_df, y):
        X = X_df[self.feature_columns].fillna(0)
        self.model.fit(X, y)

    def predict_proba(self, X_df):
        X = X_df[self.feature_columns].fillna(0)
        if hasattr(self.model, "predict_proba"):
            return self.model.predict_proba(X)[:, 1]
        return np.zeros(len(X_df))

    def predict(self, X_df):
        X = X_df[self.feature_columns].fillna(0)
        return self.model.predict(X)
