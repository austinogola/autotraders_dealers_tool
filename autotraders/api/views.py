from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import HttpResponse
from .models import Bid,Bidder,Copart_Account
from django.views.decorators.csrf import csrf_exempt
import json
from django.http import JsonResponse
from .serializers import BidderSerializer, CopartSerializer


# Create your views here.


def bidders(request):
    return HttpResponse("Bidders")


def bids(request):
    return HttpResponse("Bids")


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
                    return JsonResponse({'success': True,"data":copart_accounts})
                    
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

