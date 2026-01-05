from django.core.files.storage import default_storage
from django.shortcuts import render, get_object_or_404
import pandas as pd
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend

from utils.index import *
from utils.pagination import *
from utils.filters import *
from account.serializers import FileUploadSerializer
from .models import *
from .tasks import load_chw
from .serializers import *

class ExcelUploadView(APIView):
    def post(self, request):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/chw/{file.name}", file)
        #Pass to celery
        load_chw.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )


class DistrictListView(generics.ListAPIView):
    serializer_class=DistrictSerializer
    queryset=District.objects.all()
    pagination_class=LargeResultsSetPagination
    filterset_class = DistrictFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        queryset=self.queryset
        countries = queryset.values_list('country', flat=True).distinct()
        
        return Response({**response.data, "total_countries": countries.count()}, status=status.HTTP_200_OK)
    

class PipelineAPIView(APIView):
    def get(self, request, *args, **kwargs):
        country = request.query_params.get('country', None)

        top_regions = (
            Region.objects
            .annotate(avg_chws_per_10k=Avg('district__chws_per_10k'))
            .order_by('-avg_chws_per_10k')[:5]
        )
        
        return custom_response(
            status="OK",
            message="",
            data={
                "countries": Country.objects.all().values_list('country', flat=True),
                "country_summary": self.country_summary(country),
                "top_region": [
                    {"region": f"{region.region_name}, {region.country.country}", "percentage": round(region.avg_chws_per_10k, 2)}
                    for region in top_regions
                ]
            }
        )
        
    def country_summary(self, country):
        if country:
            country = get_object_or_404(Country, country=country)
        else:
            country = Country.objects.first()

        # Top performing region by avg CHWs per 10k
        top_region = (
            Region.objects
            .filter(country=country)
            .annotate(avg_chws_per_10k=Avg('district__chws_per_10k'))
            .order_by('-avg_chws_per_10k')
            .first()
        )

        # Drop-off from national average for top region
        region_drop_pct = 0
        if top_region and country.chws_per_10000:
            region_drop_pct = round(
                (top_region.avg_chws_per_10k - country.chws_per_10000) / country.chws_per_10000 * 100,
                2
            )

        return {
            "total_chws": country.total_chws,
            "chw_density": round(country.chws_per_10000, 2),
            "top_region": {
                "name": f"{top_region.region_name}, {country.country}" if top_region else None,
                "avg_chws_per_10k": round(top_region.avg_chws_per_10k, 2) if top_region else None,
                "drop_pct": region_drop_pct
            },
            "total_regions": country.total_regions,
            "total_districts": country.total_districts,
            "population": country.population_2024
        }
        

class DistrictMapView(generics.ListAPIView):
    queryset = District.objects.all()
    serializer_class = DistrictMapSerializer