from django.urls import path
from . import views
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    # path('bidders/', views.bidderView),
    # path('bids/', views.bidView),
    # path('copart_accounts/', views.copartView),
    path('bids', views.bids, name='bids'),
    path('bids/add/<int:id>', views.addBid, name='addBid'),
    path('bidders/', views.bidders, name='bidders'),
    path('copart/', views.copart_accounts, name='copart_accounts'),
    path('auth/', views.auth, name='auth'),
    path('auth/signin',views.signIn, name='signIn'),
    # url(r'^object/$', csrf_exempt(views.ObjectView.as_view())),
]
