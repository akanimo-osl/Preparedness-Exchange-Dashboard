from rest_framework import serializers
from .models import *

class ArbovirusSerializer(serializers.ModelSerializer):
    class Meta:
        model=ArboVirus
        fields = "__all__"
        
class CholeraSerializer(serializers.ModelSerializer):
    class Meta:
        model=Cholera
        fields = "__all__"
        
class CholeraSubNationalSerializer(serializers.ModelSerializer):
    class Meta:
        model=CholeraSubNational
        fields = "__all__"
        
class CycloneSerializer(serializers.ModelSerializer):
    class Meta:
        model=Cyclone
        fields = "__all__"
        

class FVDSerializer(serializers.ModelSerializer):
    class Meta:
        model=FVD
        fields = "__all__"
        
class FVDPoESerializer(serializers.ModelSerializer):
    class Meta:
        model=FVDPoE
        fields = "__all__"
        
class LassaFeverSerializer(serializers.ModelSerializer):
    class Meta:
        model=LassaFever
        fields = "__all__"
        
class LassaFeverDistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model=LassaFeverDistrict
        fields = "__all__"
        
class MarburgSerializer(serializers.ModelSerializer):
    class Meta:
        model=Marburg
        fields = "__all__"
        
class MeningitisSerializer(serializers.ModelSerializer):
    class Meta:
        model=Meningitis
        fields = "__all__"
        
class MeningitisEliminationSerializer(serializers.ModelSerializer):
    class Meta:
        model=MeningitiseElimination
        fields = "__all__"
        
class MpoxSerializer(serializers.ModelSerializer):
    class Meta:
        model=Mpox
        fields = "__all__"
        
class MpoxDistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model=MpoxDistrict
        fields = "__all__"

class NaturalDisasterSerializer(serializers.ModelSerializer):
    class Meta:
        model=NaturalDisaster
        fields = "__all__"
        
class RiftValleySerializer(serializers.ModelSerializer):
    class Meta:
        model=RiftValleyFever
        fields = "__all__"