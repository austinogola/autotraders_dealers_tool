from django.contrib import admin
from .models import Bid,Bidder,Copart_Account


# from .forms import BidderUpdateForm
class Copart_Account_Admin(admin.ModelAdmin):
    list_display = ('description','member_number','username', 'password','active')  # Customize this based on your model fields

    search_fields = ['description','member_number', 'username'] 
    def save_model(self, request, obj, form, change):
        

        return super().save_model(request, obj, form, change)

admin.site.register(Copart_Account, Copart_Account_Admin)
# admin.site.register(Copart_Account)

class BidderAdmin(admin.ModelAdmin):
    list_display = ('name', 'surname', 'email','password', 
    'phone', 'allowed_max_bid','bidder_type','copart_accounts')  
   
    # actions = [Admin_Actions.edit_bidder] 
    search_fields = ['name','surname', 'email','bidder_type'] 
    # form = BidderUpdateForm 

    def save_model(self, request, obj, form, change):
        
        # copart_object={
        #     "username" : f'{obj.name.lower()}_{obj.surname.lower()}',
        #     "email" : obj.email, "password" : obj.password, "active" : True
        # }
        
        # for number in obj.copart_accounts:
        #     #
        #     accounts_with_number_exists=Copart_Account.objects.filter(member_number=number).exists()
        #     if not (accounts_with_number_exists):
        #         c = Copart_Account(
        #         username= f'{obj.name.lower()}_{obj.surname.lower()}',
        #         email=obj.email, password=obj.password,member_number=number,active= True
        #         )
        #         c.save()
            
        # Call the original save_model method to save the instance
        return super().save_model(request, obj, form, change)

    def change_view(self, request, object_id, form_url='', extra_context=None):

        return super().change_view(request, object_id, form_url, extra_context)




admin.site.register(Bidder, BidderAdmin)
# admin.site.register(Bidder)

class BidAdmin(admin.ModelAdmin):
    list_display = ('timestamp','lot','VIN', 'bid_amount','current_status','username')  # Customize this based on your model fields

    search_fields = ['timestamp','lot','VIN', 'bid_amount','current_status','username'] 
    def save_model(self, request, obj, form, change):
        

        return super().save_model(request, obj, form, change)

admin.site.register(Bid, BidAdmin)
# admin.site.register(Bid)
