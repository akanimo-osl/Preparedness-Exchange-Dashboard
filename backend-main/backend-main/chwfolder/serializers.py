from rest_framework import serializers
from .models import *

class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model=Country
        fields='__all__'
        
class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model=Region
        fields='__all__'
        
class DistrictSerializer(serializers.ModelSerializer):
    region=RegionSerializer()
    country=CountrySerializer()
    class Meta:
        model=District
        fields='__all__'
        
class CHWNewsSerializer(serializers.ModelSerializer):
    key = serializers.CharField(source='country')
    value_1 = serializers.CharField(source='total_chws')
    value_2 = serializers.CharField(source='chws_per_10000')
    class Meta:
        model = Country
        fields =['key', 'value_1', 'value_2']
        
        
        
class DistrictMapSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = [
            'district_id',
            'district_name',
            'chw_count',
            'chws_per_10k',
            'population_est',
        ]
