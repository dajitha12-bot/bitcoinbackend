from rest_framework import serializers
from datasets.models import Dataset
from accounts.serializers import UserSerializer

class DatasetSerializer(serializers.ModelSerializer):
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)

    class Meta:
        model = Dataset
        fields = [
            'id', 'name', 'description', 'file', 'uploaded_by',
            'uploaded_by_details', 'row_count', 'date_min', 'date_max',
            'status', 'created_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'row_count', 'date_min', 'date_max', 'status', 'created_at']
