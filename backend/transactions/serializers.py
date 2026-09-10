from rest_framework import serializers
from transactions.models import BitcoinTransaction

class BitcoinTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BitcoinTransaction
        fields = [
            'id', 'transaction_hash', 'sender_wallet', 'receiver_wallet',
            'amount', 'transaction_time', 'block_height', 'fee',
            'input_count', 'output_count', 'dataset', 'created_at'
        ]
