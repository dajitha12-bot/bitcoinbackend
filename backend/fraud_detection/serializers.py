from rest_framework import serializers
from fraud_detection.models import (
    WalletRisk, FraudRing, FraudRingWallet, FraudResult,
    AnalysisRun, TemporalValidationResult, AdversarialTestResult
)

class WalletRiskSerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletRisk
        fields = '__all__'

class FraudRingWalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudRingWallet
        fields = ['wallet_address', 'role_in_ring', 'risk_score']

class FraudRingSerializer(serializers.ModelSerializer):
    wallets_list = serializers.SerializerMethodField()

    class Meta:
        model = FraudRing
        fields = [
            'id', 'ring_id', 'name', 'risk_score', 'risk_level',
            'wallet_count', 'transaction_count', 'detected_pattern',
            'detection_reason', 'detected_at', 'status', 'wallets_list'
        ]

    def get_wallets_list(self, obj):
        return [w.wallet_address for w in obj.wallets.all()]

class FraudResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = FraudResult
        fields = '__all__'

class AnalysisRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisRun
        fields = '__all__'

class TemporalValidationResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TemporalValidationResult
        fields = '__all__'

class AdversarialTestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdversarialTestResult
        fields = '__all__'
