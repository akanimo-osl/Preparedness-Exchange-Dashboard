from django.core.files.storage import default_storage
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models.functions import Trim

from account.serializers import FileUploadSerializer
from utils.index import custom_response
from utils.pagination import *
from utils.filters import *
from .models import *
from .tasks import *
from .serializers import *

class StardataUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/stardata/{file.name}", file)
        load_stardata.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )


class StardataListView(generics.ListAPIView):
    serializer_class=StardataSerializer
    queryset=StarData.objects.all()
    pagination_class=LargeResultsSetPagination
    filterset_class = StardataFilter
    filter_backends = [DjangoFilterBackend]
    

class SummaryAPIView(APIView):
    def get(self, request, *args, **kwargs):
        hazard=request.query_params.get('hazard', '')
        hazard_type=request.query_params.get('hazard_type', '')
        severity=request.query_params.get('severity', "")
        status=request.query_params.get('status', "")
        
        stardata=StarData.objects.annotate(
            cleaned_hazard=Trim('hazard'), 
            cleaned_severity=Trim('severity'),
            cleaned_status=Trim('status'),
            cleaned_hazard_type=Trim('main_type_of_hazard'),
            cleaned_country=Trim('country')
        )
        hazards = stardata.exclude(cleaned_hazard__isnull=True).values_list("cleaned_hazard", flat=True).distinct()
        cleaned_hazard_types = stardata.exclude(cleaned_hazard_type__isnull=True).values_list("cleaned_hazard_type", flat=True).distinct()
        severities = stardata.exclude(cleaned_severity__isnull=True).values_list("cleaned_severity", flat=True).distinct()
        statuses = stardata.exclude(cleaned_status__isnull=True).values_list("cleaned_status", flat=True).distinct()
        
        filtered_stardata = stardata.filter(
            cleaned_hazard=hazard.strip(), 
            cleaned_severity=severity.strip(),
            cleaned_status=status.strip(),
        )
        star_data_filters = {}
        if hazard:
            star_data_filters['cleaned_hazard'] = hazard
        if hazard_type:
            star_data_filters['cleaned_hazard_type'] = hazard_type
        if severity:
            star_data_filters['cleaned_severity'] = severity
        if status:
            star_data_filters['cleaned_status'] = status

        filtered_stardata = stardata.filter(**star_data_filters)
        
        return custom_response(
            status="OK",
            message="",
            data={
                'filters': {
                    'hazards': hazards,
                    'hazard_types': cleaned_hazard_types,
                    'severities': severities,
                    'statuses': statuses,
                },
                'incident': {
                    'total': filtered_stardata.count(),
                    'active': filtered_stardata.filter(cleaned_status='1').count(),
                    'affected_country': filtered_stardata.values_list('cleaned_country', flat=True).distinct().count(),
                }
            }
        )
        
    
    
class ChartsAPIView(APIView):
    def get(self, request, *args, **kwargs):
        stardata=StarData.objects.annotate(
            cleaned_country=Trim('country')
        )
        countries = stardata.values_list('cleaned_country', flat=True).distinct()
        country=request.query_params.get('country')
        filtered_stardata=stardata.filter(country=country)
        
        return custom_response(
            status="OK",
            message="",
            data={
                'filters': {
                    'countries': countries
                },
                'hazard_frequency': [{'name': i.hazard.strip(), 'value':i.frequency} for i in filtered_stardata if i.frequency],
                'severity_distribution': [{'name': i.hazard.strip(), 'value': i.severity.strip() } for i in filtered_stardata if i.severity],
                'status': [{'name': i.hazard.strip(), 'value': i.status.strip() } for i in filtered_stardata if i.status],
            }
        )   