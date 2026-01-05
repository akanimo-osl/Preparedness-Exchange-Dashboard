from rest_framework import serializers
from .models import *

class StardataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StarData
        fields = '__all__'
        

class StarDataNewsSerializer(serializers.ModelSerializer):
    key = serializers.CharField(source='country')
    value_1 = serializers.CharField(source='year')
    value_2 = serializers.CharField(source='scale')
    class Meta:
        model = StarData
        fields =['key', 'value_1', 'value_2']