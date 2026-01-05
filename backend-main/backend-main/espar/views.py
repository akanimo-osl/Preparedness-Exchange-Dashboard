import json
import pandas as pd
from typing import Dict, List, TypedDict
from django.core.files.storage import default_storage
from django.db.models import Max
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
from utils.constants import CAPACITIES
from .models import *
from .tasks import *
from .serializers import *

class ExcelUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/espar/{file.name}", file)
        #Pass to celery
        load_espar.delay(file_path)
        
        return custom_response(
            status="OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )


class EsparListView(generics.ListAPIView):
    serializer_class=EsparSerializer
    queryset=Espar.objects.all()
    pagination_class=LargeResultsSetPagination
    filterset_class = EsparFilter
    filter_backends = [DjangoFilterBackend]
    


def overall_average(indicators):
    if not indicators:
        return 0
    scores = [ind.scaled_score() for ind in indicators]
    return round(mean(scores), 2)
    
def capacity_averages(indicators, named: bool=False):
    """
    Returns a dict like:
    {
        "C.1": 3.5,
        "C.2": 2.0,
        ...
        "C.15": 4.0
    }
    """
    from collections import defaultdict
    groups = defaultdict(list)

    for ind in indicators:
        capacity = ind.code.split(".")[0] + "." + ind.code.split(".")[1]  # e.g. C.4
        groups[capacity].append(ind.scaled_score())

    if named:
        return {CAPACITIES[cap]: round(sum(vals)/len(vals), 2) for cap, vals in groups.items()}
    return {cap: round(sum(vals)/len(vals), 2) for cap, vals in groups.items()}

    
    
class SummaryAPIView(APIView):
    def get(self, request, *args, **kwargs):
        state=request.query_params.get('country', "Algeria")
        year=request.query_params.get('year', "2024")
        
        filtered_espars = Espar.objects.annotate(
            cleaned_state=Trim('states'),
        ).filter(cleaned_state=state.strip(), sheet__name=year.strip()) 
        capacities = Indicator.objects.filter(espar__in=filtered_espars)
        capacity_summary = []
        # Only include 3rd-level capacities (x.y.z)
        for capacity_code, capacity_label in CAPACITIES.items():
            if len(capacity_code.split(".")) > 2:
                continue
            filtered_capacity = capacities.filter(code=capacity_code)
            # Get max value safely
            aggregated = filtered_capacity.aggregate(max_value=Max("value"))
            max_value = aggregated["max_value"]
            if max_value is None:
                # If no data exists for this capacity, skip or set default
                continue
            capacity_summary.append({
                "category": capacity_label,
                "value": max_value
            })
            
        prev_year_espar=Espar.objects.filter(states=state, sheet__name=int(year)-1)
        prev_year_capacities=Indicator.objects.filter(espar__in=prev_year_espar)
        
        overall_average_ = overall_average(capacities)
        return custom_response(
            status="Ok",
            message=f"{state} - {year} Self Assessment",
            data={
                'filters': {
                    'country': state, 
                    'year': year,
                    'countries': Espar.objects.values_list("states", flat=True).distinct(),
                    'years': Sheet.objects.values_list("name", flat=True).distinct(),
                },
                'capacity_summary': capacity_summary,
                'capacity_average': capacity_averages(capacities),
                'overall': {
                    'value': overall_average_,
                    'change': overall_average(prev_year_capacities) - overall_average_, 
                    'prev_year': int(year)-1,
                }
            }
        )
    
    
class CountryYear(TypedDict):
    country: str
    year: str
class ComparisonAPIView(APIView):
    def get(self, request, *args, **kwargs):
        states: List[CountryYear] = json.loads(request.query_params.get('countries', '[]'))
        countryScores: Dict[str, Dict[str, int]] = {}  # initialize as dict
        for state in states:
            filtered_espars = Espar.objects.annotate(
                cleaned_state=Trim('states'),
            ).filter(cleaned_state=state["country"], sheet__name=state["year"])
            capacities = Indicator.objects.filter(espar__in=filtered_espars)
            
            capacity_summary = {}
            # Only include 3rd-level capacities (x.y.z)
            for capacity_code, capacity_label in CAPACITIES.items():
                if len(capacity_code.split(".")) > 2:
                    continue
                filtered_capacity = capacities.filter(code=capacity_code)
                # Get max value safely
                aggregated = filtered_capacity.aggregate(max_value=Max("value"))
                max_value = aggregated["max_value"]
                if max_value is None:
                    capacity_summary[capacity_label] = 0
                    # If no data exists for this capacity, skip or set default
                    continue
                capacity_summary[capacity_label] = max_value
                
            # Assign the function result, not the function itself
            countryScores[state["country"]] = capacity_summary

        return custom_response(
            status="OK",
            message="",
            data={
                "categories": [
                    capacity_label 
                    for capacity_code, capacity_label in CAPACITIES.items() 
                    if len(capacity_code.split(".")) <= 2
                ],
                "country_scores": countryScores
            }
        )
