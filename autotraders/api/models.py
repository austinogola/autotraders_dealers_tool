from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.dispatch import receiver
from django.db.models.signals import post_save, m2m_changed
import json

class Bidder(models.Model):
    BIDDER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('dealer', 'Dealer'),
    ]

    # bidder_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    surname = models.CharField(max_length=50)
    email = models.CharField(unique=True,max_length=255)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=30)
    allowed_max_bid = models.CharField(max_length=255)

    bidder_type = models.CharField(max_length=10, choices=BIDDER_TYPE_CHOICES, default='dealer')
    copart_accounts = ArrayField(models.IntegerField(),default=list)  

    # class Meta:
    #     ordering = ['created']


    # bids = models.ManyToManyField('Bid', related_name='bids', blank=True)

    def __str__(self):
        return str(self.name)


class Bid(models.Model):
    CURRENT_STATUS_CHOICES = [
        ('winning', 'WINNING'),
        ('outbid', 'OUTBID'),
        ('won', 'WON'),
    ]
   
    timestamp = models.DateTimeField(auto_now_add=True)
    lot = models.CharField(max_length=50)
    VIN = models.CharField(max_length=50)
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    current_status = models.CharField(max_length=10,choices=CURRENT_STATUS_CHOICES, default='winning')
    # bid_numbers = ArrayField(models.IntegerField(), blank=True, null=True)

    username = models.CharField(max_length=255)  # Email of the bid owner
    bidder = models.ForeignKey(Bidder, on_delete=models.CASCADE, related_name='bids',blank=True, null=True)
    # status_change = models.DateTimeField(auto_now_add=True,blank=True, null=True)


    def __str__(self):
        return str(self.VIN)


class Copart_Account(models.Model):

    description = models.CharField(max_length=255)
    member_number=models.IntegerField()
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=255)
    active = models.BooleanField(default=True)
    

    def __str__(self):
        return str(self.username)


