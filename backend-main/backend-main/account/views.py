from django.shortcuts import render, get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum, F, FloatField
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth import user_logged_in, user_logged_out, user_login_failed
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from drf_yasg import openapi
from django.db.models.functions import Trim
from drf_yasg.utils import swagger_auto_schema

from utils.index import custom_response, update_lock_count
from utils.pagination import LargeResultsSetPagination
from utils.filters import *
from .models import CustomAuthToken
from .serializers import *
from chwfolder.serializers import CHWNewsSerializer
from chwfolder.models import *
from espar.serializers import EsparNewsSerializer
from espar.models import *
from stardata.serializers import StarDataNewsSerializer
from stardata.models import *
from django_filters.rest_framework import DjangoFilterBackend

User = get_user_model()

class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    @swagger_auto_schema(
        operation_summary="Login Endpoint",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_EMAIL),
                'password': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_PASSWORD),
            },
            required=['email', 'password'],
        ),
    )
    def post(self, request):
        password = request.data["password"]
        try:
            user = User.objects.get(email=request.data['email'].lower(), email_verified=True, is_deleted=False)
            if user.is_locked():
                return custom_response(
                    status="Error",
                    message="Too many attempts, try again in 5 minutes.",
                    data={},
                    http_status=status.HTTP_400_BAD_REQUEST
                )
            
            trial_count, trial_valid = update_lock_count(user, 'increase')            
            if user.check_password(password):
                if user.email_verified:
                    token, created = CustomAuthToken.objects.get_or_create(
                        user_type=ContentType.objects.get_for_model(user),
                        user_id=user.id,
                    )
                    if not created:
                        token.refresh()
                    
                    trial_count, trial_valid = update_lock_count(user, 'fallback')
                    user_logged_in.send(sender=user.__class__, request=request, user=user)
                    user_data = {
                        'email': user.email,
                        'id': user.id
                    }

                    return custom_response(
                        status="Success",
                        message="Login successful, User Authenticated!",
                        data={
                            'access': token.access_token,
                            'refresh': token.refresh_token,
                            'user': user_data,
                        }
                    )
    
                else:
                    return custom_response(
                        status="Error",
                        message=f"Please Verify your email!, you have {5-trial_count} attempt(s) left.",
                        data={},
                        http_status=status.HTTP_400_BAD_REQUEST
                    )
            else: 
                user_login_failed.send(sender=user.__class__, credentials={'email': user.email}, request=request)
                return custom_response(
                    status="Error",
                    message=f"Incorrect credentials, you have {5-trial_count} attempt(s) left.",
                    data={},
                    http_status=status.HTTP_400_BAD_REQUEST
                )
            
        except User.DoesNotExist:
            return custom_response(
                status="Error",
                message="Incorrect credentials",
                data={},
                http_status=status.HTTP_400_BAD_REQUEST
            )
            

class TokenRefreshView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    @swagger_auto_schema(
        operation_summary="Centralized Referesh Token EP",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['refresh_token',],
            properties={
                'refresh_token': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Refresh token"
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="SUCCESS.",
            ),
            400: openapi.Response(
                description="Bad Request.",
                examples={
                    "application/json": {
                        'message': 'Provide the description and message.',
                    }
                }
            ),
        }
    )
    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        try:
            token = CustomAuthToken.objects.get(refresh_token=refresh_token.strip())

            if token.has_refresh_expired():
                return Response({'detail': 'Refresh token expired'}, status=status.HTTP_401_UNAUTHORIZED)
            token.refresh() 
            
            return Response({
                "access_token": token.access_token,
                "refresh_token": token.refresh_token
            }, status=200)
        
        except Exception as e:
            print("REFRESH ERROR", str(e))
            return Response({"message": str(e)}, status=400)
        except AssertionError as e:
            print("REFRESH ERROR", str(e))
            return Response({"message": str(e)}, status=400)
        except CustomAuthToken.DoesNotExist as e:
            print("REFRESH ERROR", str(e))
            return Response({'message': 'Invalid refresh token'}, status=status.HTTP_400_BAD_REQUEST)
    
                
class Overview(APIView):
    def get(self, request, *args, **kwargs):
        
        return custom_response(
            status="OK",
            message= "Data retrieved successfully",
            data={
                'chart': {
                    'total_chw_and_population_2024': ChartCountrySerializer(Country.objects.all(), many=True).data
                },
                "chw": self.get_chw_info(),
                "espar": self.get_espar_info(),
                "readiness": self.get_readiness_info(),
                "stardata": self.get_stardata_info(),
            }
        )
    
    def get_chw_info(self):
        top_regions = Region.objects.annotate(avg_chws_per_10k=Avg('district__chws_per_10k')).order_by('-avg_chws_per_10k')[:5]
        countries = Country.objects.all()
        return {
            "total_chw": countries.aggregate(overall_chw=Sum('total_chws'))['overall_chw'] or 0,
            "total_chw_per_10k": countries.aggregate(overall_chws_per_10k=Sum('chws_per_10000'))['overall_chws_per_10k'] or 0,
            "countries": countries.values_list("country", flat=True),
            "districts": District.objects.all().count(),
            "regions": Region.objects.all().count(),
            "top_region": [
                {"region": f"{region.region_name}, {region.country.country}", "percentage": round(region.avg_chws_per_10k, 2)}
                for region in top_regions
            ]
        }
        
    
    def get_espar_info(self):
        return {
            "total_capacities": 15,
            'countries': Espar.objects.values_list("states", flat=True).distinct(),
            "years": Sheet.objects.values_list("name", flat=True).distinct(),
        }
        
    def get_readiness_info(self):
        def get_result(queryset):
            total_questions = queryset.count()
            answered_questions = queryset.filter(question_score__gt=0).count()
            completion_pct = (answered_questions / total_questions) * 100
            return {
                'total': total_questions,
                'answered': answered_questions,
                'completion_pct': completion_pct,
            }
        return {
            "total_hazards": 15,
            "summary": {
                'arbovirus': get_result(ArboVirus.objects.all()),
                'cholera': get_result(Cholera.objects.all()),
                'cholera_subnational': get_result(CholeraSubNational.objects.all()),
                'cyclone': get_result(Cyclone.objects.all()),
                'fvd': get_result(FVD.objects.all()),
                'fvd_poe': get_result(FVDPoE.objects.all()),
                'lassa_fever': get_result(LassaFever.objects.all()),
                'lassa_fever_district': get_result(LassaFeverDistrict.objects.all()),
                'marburg': get_result(Marburg.objects.all()),
                'meningitis': get_result(Meningitis.objects.all()),
                'meningitise_elimination': get_result(MeningitiseElimination.objects.all()),
                'mpox': get_result(Mpox.objects.all()),
                'mpox_district': get_result(MpoxDistrict.objects.all()),
                'natural_disaster': get_result(Cholera.objects.all()),
                'rift_valley_fever': get_result(RiftValleyFever.objects.all()),
            }
        }
        
    def get_stardata_info(self):
        qs = StarData.objects.annotate(
            cleaned_hazard=Trim('hazard'), 
            cleaned_severity=Trim('severity'),
            cleaned_status=Trim('status'),
            cleaned_hazard_type=Trim('main_type_of_hazard'),
            cleaned_country=Trim('country'),
            cleaned_level=Trim('level'),
            cleaned_year=Trim('year'),
        )
        return {
            "countries": qs.values_list('cleaned_country', flat=True).distinct().count(),
            "hazards": qs.values_list('cleaned_hazard', flat=True).distinct().count(),
            "hazard_types": qs.values_list('cleaned_hazard_type', flat=True).distinct().count(),
            "active": qs.filter(cleaned_status='1').count(),
            'levels': qs.values_list('cleaned_level', flat=True).distinct(),
            'years': qs.values_list('cleaned_year', flat=True).distinct(),
        }
        
class NewsAPIView(APIView):
    def get(self, request, *args, **kwargs):
        chw = CHWNewsSerializer(Country.objects.all(), many=True)
        espar = EsparNewsSerializer(Espar.objects.all(), many=True)
        stardata = StarDataNewsSerializer(StarData.objects.all(), many=True)
        return Response({
            "chw": chw.data,
            "espar": espar.data,
            "stardata": stardata.data
        }, status=status.HTTP_200_OK)
        
        
class AlertAPIView(generics.ListCreateAPIView):
    serializer_class = AlertSerializer
    queryset = Alert.objects.all().order_by("-id")
    pagination_class=LargeResultsSetPagination
    filterset_class = AlertFilter
    filter_backends = [DjangoFilterBackend]
    
    def get(self, request, *args, **kwargs):
        response = super().get(request, *args, **kwargs)
        queryset=self.queryset
        return Response(
            {
                **response.data, 
                "critical": queryset.filter(severity="critical").count(),
                "high": queryset.filter(severity="high").count(),
                "medium": queryset.filter(severity="medium").count(),
                "low": queryset.filter(severity="low").count(),
            }
        )
    
class AlertResolveView(APIView):
    def post(self, request, id, *args, **kwargs):
        alert = get_object_or_404(Alert, id=id)
        if alert.status != 'resolved':
            alert.status = 'resolved'
            alert.save()
            
        return custom_response(
            status="OK",
            message="Alert resolved",
            data={}
        )
        
class AlertAcknowledgeView(APIView):
    def post(self, request, id, *args, **kwargs):
        alert = get_object_or_404(Alert, id=id)
        if alert.status != 'acknowledged':
            alert.status = 'acknowledged'
            alert.save()
            
        return custom_response(
            status="OK",
            message="Alert acknowledge",
            data={}
        )