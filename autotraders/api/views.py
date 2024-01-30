from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import HttpResponse
from .models import Bid,Bidder,Copart_Account
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from .serializers import BidderSerializer, CopartSerializer,BidSerializer


# Create your views here.


def bidders(request):
    return HttpResponse("Bidders")

@api_view(['GET','POST'])
def bids(request):
    if request.method == 'POST':
        try:
            body_data = request.data
            print(body_data) 
            return JsonResponse({'success': True,"bids":body_data})

        except json.JSONDecodeError:
            return JsonResponse({'error': True,'message': 'Unknown error'}, status=400)

@api_view(['GET','POST'])
def addBid(request,id):
    if request.method == 'POST':
        try:
            body_data = request.data
            copart_exists = Copart_Account.objects.filter(member_number=id).exists()
            if copart_exists:
                copart = Copart_Account.objects.get(member_number=id)
                copart_data=CopartSerializer(copart).data
                username=copart_data["username"]
                bids=body_data['bids']
                for bid in bids:
                    VIN=bid["VIN"]
                    lot=bid["lot"]
                    bid_amount=bid["bid_amount"]
                    current_status=bid["current_status"].lower()
                    bid_exists = Bid.objects.filter(VIN=VIN,username=username).exists()
                    if bid_exists:
                        prevBid = Bid.objects.get(VIN=VIN,username=username)
                        bid_data=BidSerializer(prevBid).data
                        if(bid_data["current_status"] != current_status):
                            prevBid.current_status=current_status
                            prevBid.save()
                            print('modified')

                    else:
                        new_bid = Bid(VIN=VIN,lot=lot,bid_amount=bid_amount,
                        current_status=current_status,username=username)
                        new_bid.save()
                    
                    

                # print(username)
                    # bidder = Bidder.objects.get(email=username,password=password)
                    # bidder_data=BidderSerializer(bidder).data
                    # copart_nums=bidder_data['copart_accounts']
                    # copart_accounts=[]
                    # for number in copart_nums:
                    #     cop_acc = Copart_Account.objects.get(member_number=number)
                    #     account_data=CopartSerializer(cop_acc).data
                    #     copart_accounts.append(account_data)
                    # profile={"username":username, "accounts":copart_accounts}
                return JsonResponse({'success': True,"bids":body_data})
                    
            else:
                    return JsonResponse({'error':True,'message': 'member does not exist'})
            

        except json.JSONDecodeError:
            return JsonResponse({'error': True,'message': 'Unknown error'}, status=400)
       



def copart_accounts(request):
    return HttpResponse("Copart Accounts")

@api_view(['GET'])
def auth(request):
    return Response('GET received')

@api_view(['GET','POST'])
def signIn(request):
    if request.method == 'POST':
        try:
            body_data = request.data
            u_present="username" in body_data
            p_present="password" in body_data
            if u_present and p_present :
                username=body_data['username']
                password=body_data['password']

                bidder_exists = Bidder.objects.filter(email=username,password=password).exists()
                if bidder_exists:
                    bidder = Bidder.objects.get(email=username,password=password)
                    bidder_data=BidderSerializer(bidder).data
                    copart_nums=bidder_data['copart_accounts']
                    copart_accounts=[]
                    for number in copart_nums:
                        cop_acc = Copart_Account.objects.get(member_number=number)
                        account_data=CopartSerializer(cop_acc).data
                        copart_accounts.append(account_data)
                    profile={"username":username, "accounts":copart_accounts}
                    return JsonResponse({'success': True,"profile":profile})
                    
                else:
                    return JsonResponse({'error':True,'message': 'No user with these credentials'})


            else:
                return JsonResponse({'error':True,'message': 'Missing username/password'})
                # return JsonResponse({'error': 'Missing username/password'}, status=400)
            
            return JsonResponse({'message': 'Data processed successfully'})
        except json.JSONDecodeError:
            return JsonResponse({'error': True,'message': 'Unknown error'}, status=400)
    else:
        return JsonResponse({'error': True,'message': 'Invalid request method'}, status=405)



# @api_view(['GET', 'POST','DELETE','PUT'])
# def bidderView(request):
#     if request.method == 'GET':
#         bidders = Company.objects.all()
#         Copart_Account.objects.filter(member_number=number)
#         serializer = CompanySerializer(companies, many=True)
#         return Response(serializer.data)

#     elif request.method == 'POST':
#         serializer = CompanySerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

