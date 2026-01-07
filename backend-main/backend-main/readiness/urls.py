"""
URL configuration for drivequick project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path
from .views import *

urlpatterns = [
    path('load/arbovirus', ArboVirusUploadView.as_view()),
    path('load/cholera', CholeraUploadView.as_view()),
    path('load/cholera/sub_national', CholeraSubNationalUploadView.as_view()),
    path('load/cyclone', CycloneUploadView.as_view()),
    path('load/fvd', FVDUploadView.as_view()),
    path('load/fvd/poe', FVDPoEUploadView.as_view()),
    path('load/lassa', LassaFeverUploadView.as_view()),
    path('load/lassa/district', LassaFeverDistrictUploadView.as_view()),
    path('load/marbug', MarburgUploadView.as_view()),
    path('load/meningitis', MeningitisUploadView.as_view()),
    path('load/meningitis/elimination', MeningitiseEliminationUploadView.as_view()),
    path('load/mpox', MpoxUploadView.as_view()),
    path('load/mpox/district', MpoxDistrictUploadView.as_view()),
    path('load/natural_disaster', NaturalDisasterUploadView.as_view()),
    path('load/riftvalley_fever', RiftValleyFeverUploadView.as_view()),
    
    
    path('summary/arbovirus', ArboVirusSummaryView.as_view()),
    path('summary/cholera', CholeraSummaryView.as_view()),
    path('summary/cholerasubnational', CholeraSubNationalSummaryView.as_view()),
    path('summary/cyclone', CycloneSummaryView.as_view()),
    path('summary/fvd', FVDSummaryView.as_view()),
    path('summary/fvdpoe', FVDPoESummaryView.as_view()),
    path('summary/lassafever', LassaFeverSummaryView.as_view()),
    path('summary/lassafeverdistrict', LassaFeverDistrictSummaryView.as_view()),
    path('summary/marburg', MarburgSummaryView.as_view()),
    path('summary/meningitis', MeningitisSummaryView.as_view()),
    path('summary/meningitiseelimination', MeningitiseEliminationSummaryView.as_view()),
    path('summary/mpox', MpoxSummaryView.as_view()),
    path('summary/mpoxdistrict', MpoxDistrictSummaryView.as_view()),
    path('summary/naturaldisaster', NaturalDisasterSummaryView.as_view()),
    path('summary/riftvalleyfever', RiftValleyFeverSummaryView.as_view()),
    
    # WHO Signal Intelligence endpoints
    path('who-data', WHODataView.as_view()),
    path('who-data/health', WHOHealthCheckView.as_view()),
    
    path('heatmap', RegionalHeatmapAPIView.as_view()),
]
