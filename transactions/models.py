from django.db import models
from datasets.models import Dataset

class BitcoinTransaction(models.Model):
    transaction_hash = models.CharField(max_length=255, db_index=True)
    sender_wallet = models.CharField(max_length=255, db_index=True)
    receiver_wallet = models.CharField(max_length=255, db_index=True)
    amount = models.DecimalField(max_digits=20, decimal_places=8)
    transaction_time = models.DateTimeField(db_index=True)
    block_height = models.BigIntegerField(default=0)
    fee = models.DecimalField(max_digits=15, decimal_places=8, default=0.0)
    input_count = models.IntegerField(default=1)
    output_count = models.IntegerField(default=1)
    dataset = models.ForeignKey(Dataset, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['sender_wallet']),
            models.Index(fields=['receiver_wallet']),
            models.Index(fields=['transaction_time']),
            models.Index(fields=['transaction_hash']),
        ]

    def __str__(self):
        return f"{self.transaction_hash[:10]}... | {self.sender_wallet} -> {self.receiver_wallet} ({self.amount} BTC)"
