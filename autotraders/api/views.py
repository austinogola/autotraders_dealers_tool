from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import HttpResponse
from .models import Bid,Bidder,Copart_Account
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from .serializers import BidderSerializer, CopartSerializer,BidSerializer
from datetime import datetime


# Create your views here.


def bidders(request):
    return HttpResponse("Bidders")

def is_prime(num):
    if num <= 1:
        return False
    for i in range(2, int(num**0.5) + 1):
        if num % i == 0:
            return False
    return True

def invert_at_prime_i_reverse(input_string):
    char_list = list(input_string)

    for i in range(2, len(char_list)):
        if is_prime(i):
            next_prime = i + 1
            if next_prime < len(char_list):
                # Swap characters at prime indexes
                char_list[i], char_list[next_prime] = char_list[next_prime], char_list[i]
            else:
                # Stop if there are no more prime indexes
                break

    print(''.join(char_list))
    
    rever=''.join(char_list)[::-1]
    return rever

def decode_dt(s, n):
    # print(s)
    if n == 0:
        return s

    s2 = ''
    for i in range(0, len(s), 2):
        s2 += s[i + 1] + s[i]

    return decode_dt(s2, n - 1)


def reformatStr(strr):
    decoddStrr=decode_dt(strr,3)
    print(decoddStrr)
    full=decoddStrr[::-1]
    return(full)
    #Invert thrice

@api_view(['GET','POST'])
def bids(request):
    if request.method == 'POST':
        try:
            body_data = request.data
            # print(body_data) 
            return JsonResponse({'success': True,"bids":body_data})

        except json.JSONDecodeError:
            return JsonResponse({'error': True,'message': 'Unknown error'}, status=400)

@api_view(['GET'])
def updateBid(request,id):
    if request.method == 'GET':
        theBid=request.GET['theBid']
        theBidJson=json.loads(theBid)
        lot=theBidJson["lot"]
        VIN=theBidJson["VIN"]
        bid_amount=theBidJson["bid_amount"]
        current_status=theBidJson["current_status"].lower()
        timestamp=theBidJson["timestamp"]
        timestamp=datetime.fromtimestamp(timestamp/1000)

        bidder_exists = Bidder.objects.filter(copart_accounts__contains=[id]).exists()
        # bidder_exists = Bidder.objects.filter(email='austin_ogola').exists()
        if bidder_exists:
            theBidder = Bidder.objects.get(copart_accounts__contains=[id])
            # theBidder = Bidder.objects.get(email='austin_ogola')
            bidder_data=BidderSerializer(theBidder).data
            username=bidder_data["email"]

            prevBid = Bid.objects.get(lot=lot,username=username)
            prevBid.bid_amount = bid_amount
            prevBid.current_status=current_status
            prevBid.status_change=timestamp
            prevBid.save()
            return JsonResponse({'success':True,'message': 'The bid has been updated'})

        else:
            return JsonResponse({'error':True,'message': 'member does not exist'})

            
       

@api_view(['GET','POST'])
def newBid(request,id):
    if request.method == 'GET':
        theBid=request.GET['theBid']
        theBidJson=json.loads(theBid)
       
        bidder_exists = Bidder.objects.filter(copart_accounts__contains=[id]).exists()
        # bidder_exists = Bidder.objects.filter(email='austin_ogola').exists()
        if bidder_exists:
            
            VIN=theBidJson["VIN"]
            lot=theBidJson["lot"]
            bid_amount=theBidJson["bid_amount"]
            current_status=theBidJson["current_status"].lower()
            timestamp=theBidJson["timestamp"]
            timestamp=datetime.fromtimestamp(timestamp/1000)

            theBidder = Bidder.objects.get(copart_accounts__contains=[id])
            # theBidder = Bidder.objects.get(email='austin_ogola')
            bidder_data=BidderSerializer(theBidder).data
            username=bidder_data["email"]

            bid_exists = Bid.objects.filter(VIN=VIN,username=username).exists()
            if bid_exists:

                prevBid = Bid.objects.get(VIN=VIN,username=username)
                bid_changed=(prevBid.bid_amount != bid_amount) or (prevBid.current_status!=current_status)
                if (bid_changed):
                    bid_data=BidSerializer(prevBid).data
                    prevBid.bid_amount = bid_amount
                    prevBid.current_status=current_status
                    prevBid.status_change=timestamp
                    prevBid.save()
            else:
                new_bid = Bid(VIN=VIN,lot=lot,bid_amount=bid_amount,current_status=current_status,
                username=username,timestamp=timestamp)
                new_bid.save()
          
            allBids=Bid.objects.filter(username=username)
            bidsArr=[]
            for e in allBids:
                bidData=BidSerializer(e).data
                bidsArr.append(bidData["lot"])

            return JsonResponse({'success':True,'message': 'Bid added',"currentBids":bidsArr})
            
        else:
            return JsonResponse({'error':True,'message': 'member does not exist'})



@api_view(['GET','POST'])
def addBid(request,id):
    if request.method == 'GET':
        try:
            allB = request.GET['allB']
            allBJson=json.loads(allB)
            # print(allBJson)
            bids=allBJson
            copart_exists = Copart_Account.objects.filter(member_number=id).exists()
            if copart_exists:
                copart = Copart_Account.objects.get(member_number=id)
                copart_data=CopartSerializer(copart).data
                username=copart_data["username"]
                for bid in bids:
                    VIN=bid["VIN"]
                    lot=bid["lot"]
                    bid_amount=bid["bid_amount"]
                    current_status=bid["current_status"].lower()
                    timestamp=bid["timestamp"]
                    timestamp=datetime.fromtimestamp(timestamp/1000)
                    bid_exists = Bid.objects.filter(VIN=VIN,username=username).exists()

                    if bid_exists:
                        prevBid = Bid.objects.get(VIN=VIN,username=username)
                        bid_data=BidSerializer(prevBid).data
                        if (prevBid.bid_amount != bid_amount) or (prevBid.current_status!=current_status):
                            prevBid.bid_amount = bid_amount
                            prevBid.current_status=current_status
                            prevBid.status_change=timestamp
                            prevBid.save()
                            print('modified') 
                            
                           

                    else:
                        new_bid = Bid(VIN=VIN,lot=lot,bid_amount=bid_amount,
                        current_status=current_status,username=username,timestamp=timestamp)
                        new_bid.save()
                    
                return JsonResponse({'success': True,"bids":bids})
                    
            else:
                    return JsonResponse({'error':True,'message': 'member does not exist'})
            

        except json.JSONDecodeError:
            return JsonResponse({'error': True,'message': 'Unknown error'}, status=400)
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
                            # prevBid.status_change=datetime.now()
                            prevBid.save()
                            print('modified')

                    else:
                        new_bid = Bid(VIN=VIN,lot=lot,bid_amount=bid_amount,
                        current_status=current_status,username=username)
                        new_bid.save()
                    
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
    elif(request.method == 'GET'):
         username = request.GET['u']
         password = request.GET['p']
         if username and password :
            bidder_exists = Bidder.objects.filter(email=username,password=password).exists()
            if bidder_exists:
                print('Bidder exists')
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
                print('DOES NOT EXIST')
                return JsonResponse({'error':True,'message': 'No user with these credentials'})
            
                    
         else:
            return JsonResponse({'error':True,'message': 'No user with these credentials'})

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

