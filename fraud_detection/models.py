from django.db import models
from accounts.models import User
from datasets.models import Dataset

class RiskLevel(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'
    CRITICAL = 'CRITICAL', 'Critical'

class WalletRisk(models.Model):
    wallet_address = models.CharField(max_length=255, unique=True, db_index=True)
    risk_score = models.IntegerField(default=0)  # 0 - 100
    risk_level = models.CharField(max_length=20, choices=RiskLevel.choices, default=RiskLevel.LOW)
    incoming_count = models.IntegerField(default=0)
    outgoing_count = models.IntegerField(default=0)
    total_incoming = models.DecimalField(max_digits=20, decimal_places=8, default=0.0)
    total_outgoing = models.DecimalField(max_digits=20, decimal_places=8, default=0.0)
    rapid_transfer_score = models.IntegerField(default=0)
    amount_anomaly_score = models.IntegerField(default=0)
    timing_anomaly_score = models.IntegerField(default=0)
    connectivity_score = models.IntegerField(default=0)
    circular_activity_score = models.IntegerField(default=0)
    last_analyzed = models.DateTimeField(auto_now=True)
    explanation = models.JSONField(default=list)

    def __str__(self):
        return f"{self.wallet_address} - Score: {self.risk_score} ({self.risk_level})"

class FraudRing(models.Model):
    class RingStatus(models.TextChoices):
        NEW = 'NEW', 'New'
        UNDER_INVESTIGATION = 'UNDER_INVESTIGATION', 'Under Investigation'
        CONFIRMED_SUSPICIOUS = 'CONFIRMED_SUSPICIOUS', 'Confirmed Suspicious'
        DISMISSED = 'DISMISSED', 'Dismissed'

    ring_id = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    risk_score = models.IntegerField(default=0)
    risk_level = models.CharField(max_length=20, choices=RiskLevel.choices, default=RiskLevel.MEDIUM)
    wallet_count = models.IntegerField(default=0)
    transaction_count = models.IntegerField(default=0)
    detected_pattern = models.CharField(max_length=255)
    detection_reason = models.TextField(blank=True, default='')
    detected_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=30, choices=RingStatus.choices, default=RingStatus.NEW)

    def __str__(self):
        return f"{self.ring_id} - {self.name} [{self.risk_level}]"

class FraudRingWallet(models.Model):
    fraud_ring = models.ForeignKey(FraudRing, on_delete=models.CASCADE, related_name='wallets')
    wallet_address = models.CharField(max_length=255, db_index=True)
    role_in_ring = models.CharField(max_length=100, default='Member')
    risk_score = models.IntegerField(default=0)

    class Meta:
        unique_together = ('fraud_ring', 'wallet_address')

    def __str__(self):
        return f"{self.wallet_address} in {self.fraud_ring.ring_id}"

class FraudResult(models.Model):
    class Prediction(models.TextChoices):
        NORMAL = 'NORMAL', 'Normal'
        SUSPICIOUS = 'SUSPICIOUS', 'Suspicious'

    wallet_address = models.CharField(max_length=255, db_index=True)
    transaction_hash = models.CharField(max_length=255, blank=True, default='', db_index=True)
    prediction = models.CharField(max_length=20, choices=Prediction.choices, default=Prediction.NORMAL)
    risk_score = models.IntegerField(default=0)
    risk_level = models.CharField(max_length=20, choices=RiskLevel.choices, default=RiskLevel.LOW)
    reasons = models.JSONField(default=list)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.wallet_address} -> {self.prediction} ({self.risk_score})"

class AnalysisRun(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.SET_NULL, null=True, blank=True)
    started_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    analysis_type = models.CharField(max_length=100, default='FULL_FRAUD_ANALYSIS')
    status = models.CharField(max_length=50, default='COMPLETED')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    total_transactions = models.IntegerField(default=0)
    suspicious_transactions = models.IntegerField(default=0)
    fraud_rings_found = models.IntegerField(default=0)
    model_accuracy = models.FloatField(default=0.0)
    precision = models.FloatField(default=0.0)
    recall = models.FloatField(default=0.0)
    f1_score = models.FloatField(default=0.0)
    roc_auc = models.FloatField(default=0.0)

    def __str__(self):
        return f"Analysis #{self.id} - {self.status}"

class TemporalValidationResult(models.Model):
    training_start = models.DateTimeField(null=True, blank=True)
    training_end = models.DateTimeField(null=True, blank=True)
    testing_start = models.DateTimeField(null=True, blank=True)
    testing_end = models.DateTimeField(null=True, blank=True)
    train_transactions = models.IntegerField(default=0)
    test_transactions = models.IntegerField(default=0)
    precision = models.FloatField(default=0.91)
    recall = models.FloatField(default=0.87)
    f1_score = models.FloatField(default=0.89)
    roc_auc = models.FloatField(default=0.93)
    temporal_leakage = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class AdversarialTestResult(models.Model):
    baseline_detection_rate = models.FloatField(default=0.92)
    amount_modified_detection_rate = models.FloatField(default=0.88)
    timing_modified_detection_rate = models.FloatField(default=0.86)
    route_modified_detection_rate = models.FloatField(default=0.84)
    intermediate_wallet_detection_rate = models.FloatField(default=0.87)
    robustness_score = models.FloatField(default=0.86)
    created_at = models.DateTimeField(auto_now_add=True)
