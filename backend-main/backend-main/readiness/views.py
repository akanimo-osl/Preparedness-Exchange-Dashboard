import re
from django.core.files.storage import default_storage
import pandas as pd
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import status, generics
from rest_framework.permissions import AllowAny
from django.db.models import Sum, F, FloatField
from django.db.models.functions import Cast, Lower, FirstValue
from django_filters.rest_framework import DjangoFilterBackend

from account.serializers import FileUploadSerializer
from utils.index import gen_unique_key, custom_response
from utils.pagination import LargeResultsSetPagination
from utils.filters import *
from .models import *
from .tasks import *
from .serializers import *

class ArboVirusUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/arbovirus/{file.name}", file)
        load_arbovirus.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )


class CholeraUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/cholera/{file.name}", file)
        load_cholera.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )

class CholeraSubNationalUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/cholerasubnational/{file.name}", file)
        load_cholerasubnational.delay(file_path)
        
        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        

class CycloneUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/cyclone/{file.name}", file)
        load_cyclone.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        
        
class FVDUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/fvd/{file.name}", file)
        load_fvd.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        

class FVDPoEUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/fvdpoe/{file.name}", file)
        load_fvdpoe.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        

class LassaFeverUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/lassafever/{file.name}", file)
        load_lassafever.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        
        
class LassaFeverDistrictUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/lassafeverdistrict/{file.name}", file)
        load_lassafeverdistrict.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        

class MarburgUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/marburg/{file.name}", file)
        load_marburg.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        

class MeningitisUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/meningitis/{file.name}", file)
        load_meningitis.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        
        
class MeningitiseEliminationUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/meningitiselimination/{file.name}", file)
        load_meningitiselimination.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        
        
class MpoxUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/mpox/{file.name}", file)
        load_mpox.delay(file_path)
        
        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        

class MpoxDistrictUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/mpoxdistrict/{file.name}", file)
        load_mpoxdistrict.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        

class NaturalDisasterUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/naturaldisaster/{file.name}", file)
        load_naturaldisaster.delay(file_path)

        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        

class RiftValleyFeverUploadView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        file = serializer.validated_data['file']
        file_path = default_storage.save(f"uploads/readiness/riftvalley/{file.name}", file)
        load_riftvalley.delay(file_path)
        
        return custom_response(
            "OK",
            message="Data imported successfully",
            data={},
            http_status=status.HTTP_200_OK
        )
        
        
    


class ArboVirusSummaryView(generics.ListAPIView):
    serializer_class = ArbovirusSerializer
    queryset = ArboVirus.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = ArbovirusFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        )
        
        
class CholeraSummaryView(generics.ListAPIView):
    serializer_class = CholeraSerializer
    queryset = Cholera.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = CholeraFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        )
        

class CholeraSubNationalSummaryView(generics.ListAPIView):
    serializer_class = CholeraSubNationalSerializer
    queryset = CholeraSubNational.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = CholeraSubNationalFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        )
        
        
class CycloneSummaryView(generics.ListAPIView):
    serializer_class = CycloneSerializer
    queryset = Cyclone.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = CycloneFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        )


class FVDSummaryView(generics.ListAPIView):
    serializer_class = FVDSerializer
    queryset = FVD.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = FvDFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        )      
        
        
class FVDPoESummaryView(generics.ListAPIView):
    serializer_class = FVDPoESerializer
    queryset = FVDPoE.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = FvDPoEFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        )     
        
        

class FVDPoESummaryView(generics.ListAPIView):
    serializer_class = FVDPoESerializer
    queryset = FVDPoE.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = FvDPoEFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        )    
        
        
class LassaFeverSummaryView(generics.ListAPIView):
    serializer_class = LassaFeverSerializer
    queryset = LassaFever.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = LassaFeverFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        ) 
        
    
class LassaFeverDistrictSummaryView(generics.ListAPIView):
    serializer_class = LassaFeverDistrictSerializer
    queryset = LassaFeverDistrict.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = LassaFeverDistrictFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        ) 
            
            
class MarburgSummaryView(generics.ListAPIView):
    serializer_class = MarburgSerializer
    queryset = Marburg.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = MarburgFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        ) 


class MeningitisSummaryView(generics.ListAPIView):
    serializer_class = MeningitisSerializer
    queryset = Meningitis.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = MeningitisFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        ) 
        

class MeningitiseEliminationSummaryView(generics.ListAPIView):
    serializer_class = MeningitisEliminationSerializer
    queryset = MeningitiseElimination.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = MeningitiseEliminationFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        ) 


class MpoxSummaryView(generics.ListAPIView):
    serializer_class = MpoxSerializer
    queryset = Mpox.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = MpoxFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        ) 


class MpoxDistrictSummaryView(generics.ListAPIView):
    serializer_class = MpoxDistrictSerializer
    queryset = MpoxDistrict.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = MpoxFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        ) 


class NaturalDisasterSummaryView(generics.ListAPIView):
    serializer_class = NaturalDisasterSerializer
    queryset = NaturalDisaster.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = NaturalDisasterFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        ) 


class RiftValleyFeverSummaryView(generics.ListAPIView):
    serializer_class = RiftValleySerializer
    queryset = RiftValleyFever.objects.all().annotate(country_lower=Lower(F('country')))
    pagination_class=LargeResultsSetPagination
    filterset_class = RiftValleyFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        filtered_qs = self.filter_queryset(self.get_queryset())
        response = super().get(request, *args, **kwargs)
        total_questions = filtered_qs.count()
        answered_questions = filtered_qs.filter(question_score__gt=0).count()
        try:
            completion_pct = (answered_questions / total_questions) * 100
        except Exception as err:
            completion_pct = 0

        return Response({
                "countries": self.queryset.values_list("country_lower", flat=True).distinct(),
                "total_questions": total_questions,
                "answered_questions": answered_questions,
                "completion_pct": completion_pct,
                **response.data
            },
            status=status.HTTP_200_OK
        ) 





        
        
        
class RegionalHeatmapAPIView(APIView):
    """
    Returns regional readiness scores as a flat array for the heatmap
    """
    def get(self, request):
        readiness = request.query_params.get('readiness', 'arbovirus')
        qs = self.get_qs(readiness)
        heatmap_array = []

        for entry in qs:
            region = entry.admin_level_name or entry.country or "Unknown"

            # Compute weighted score
            score = float(entry.question_score or 0) * float(entry.question_category_weight or 0)
            score = min(score * 100, 100)  # cap at 100%

            heatmap_array.append({
                "region": region,
                "score": round(score, 2)
            })

        # Aggregate scores by region if multiple entries exist
        region_map = {}
        for item in heatmap_array:
            region_map.setdefault(item["region"], []).append(item["score"])

        result_array = [
            {"region": reg, "score": round(sum(scores) / len(scores), 2)}
            for reg, scores in region_map.items()
        ]

        return Response(result_array)
    
    def get_qs(self, readiness):
        if readiness == 'arbovirus':
            return ArboVirus.objects.all()
        elif readiness == 'cholera':
            return Cholera.objects.all()
        elif readiness == 'cholerasubnational':
            return CholeraSubNational.objects.all()
        elif readiness == 'cyclone':
            return Cyclone.objects.all()
        elif readiness == 'fvd':
            return FVD.objects.all()
        elif readiness == 'fvdpoe':
            return FVDPoE.objects.all()
        elif readiness == 'lassafever':
            return LassaFever.objects.all()
        elif readiness == 'lassafeverdistrict':
            return LassaFeverDistrict.objects.all()
        elif readiness == 'marburg':
            return Marburg.objects.all()
        elif readiness == 'meningitis':
            return Meningitis.objects.all()
        elif readiness == 'meningitiseelimination':
            return MeningitiseElimination.objects.all()
        elif readiness == 'mpox':
            return Mpox.objects.all()
        elif readiness == 'mpoxdistrict':
            return MpoxDistrict.objects.all()
        elif readiness == 'naturaldisaster':
            return NaturalDisaster.objects.all()
        elif readiness == 'riftvalley':
            return RiftValleyFever.objects.all()
        else:
            return ArboVirus.objects.all()