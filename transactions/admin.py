from django.contrib import admin
from transactions.models import BitcoinTransaction

@admin.register(BitcoinTransaction)
class BitcoinTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'transaction_hash', 'sender_wallet', 'receiver_wallet', 'amount', 'transaction_time')
    search_fields = ('transaction_hash', 'sender_wallet', 'receiver_wallet')
    list_filter = ('transaction_time',)
