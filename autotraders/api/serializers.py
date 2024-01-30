from rest_framework import serializers
from .models import Bid,Bidder,Copart_Account




class BidderSerializer(serializers.ModelSerializer):
    # email = serializers.EmailField(unique=True)
    # password = serializers.CharField(max_length=255)
    # allowed_max_bid = serializers.CharField(max_length=255)
    # copart_accounts = ArrayField(serializers.IntegerField(),default=list)  
    class Meta:
        model=Bidder
        fields=('email','password','copart_accounts','allowed_max_bid')
        # fields = '__all__'
        
   


class BidSerializer(serializers.ModelSerializer):
    class Meta:
        model=Bid
        fields=('timestamp','lot','VIN','bid_amount','current_status','username')



class CopartSerializer(serializers.ModelSerializer):
    class Meta:
        model=Copart_Account
        fields=('password','member_number','username','active')



class SignInSerializer(serializers.ModelSerializer):
    bidder = BidderSerializer()
    cop = CopartSerializer()
    class Meta:
        model=Bidder
        fields=('username','password','copart_accounts','allowed_max_bid')
        # fields = '__all__'

