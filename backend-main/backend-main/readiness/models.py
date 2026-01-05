from django.db import models

class BaseReadiness(models.Model):
    key_on_table = models.CharField(max_length=100, unique=True)
    question_id=models.IntegerField(default=0, null=True, blank=True)
    question_key=models.CharField(max_length=255, null=True, blank=True)
    language=models.CharField(max_length=100, null=True, blank=True)
    category=models.CharField(max_length=255, null=True, blank=True)
    category_code=models.CharField(max_length=255, null=True, blank=True)
    affects_score=models.IntegerField(default=0, null=True, blank=True)
    category_score=models.IntegerField(default=0, null=True, blank=True)
    category_weight=models.DecimalField(decimal_places=10, default=0, max_digits=20, null=True, blank=True)
    question_score=models.DecimalField(decimal_places=10, default=0, max_digits=20, null=True, blank=True)
    question_category_weight=models.DecimalField(decimal_places=10, default=0, max_digits=20, null=True, blank=True)
    category_language=models.TextField(null=True, blank=True)
    question_language=models.TextField(null=True, blank=True)
    national_yn_value=models.CharField(max_length=255, null=True, blank=True)
    national_yn=models.CharField(max_length=30, null=True, blank=True)
    comments=models.TextField(blank=True, null=True)
    file_name=models.CharField(max_length=100, null=True, blank=True)
    country=models.CharField(max_length=100, null=True, blank=True)
    admin_level=models.CharField(max_length=100, null=True, blank=True)
    admin_level_name=models.CharField(max_length=100, null=True, blank=True)
    file_language=models.CharField(max_length=100, null=True, blank=True)
    table=models.CharField(max_length=100, null=True, blank=True)
    row_no=models.IntegerField(default=0, null=True, blank=True)
    question=models.TextField(null=True, blank=True)
    
    @property
    def weighted_score(self):
        try:
            return float(self.question_score or 0) * float(self.question_category_weight or 0)
        except:
            return 0
    
    class Meta:
        abstract = True
        


class ArboVirus(BaseReadiness):
    pass

class Cholera(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)
    
class CholeraSubNational(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)
    district=models.CharField(max_length=255)

class Cyclone(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)

class FVD(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)
    
class FVDPoE(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)
    district=models.CharField(max_length=255, null=True, blank=True)
    poe_name=models.CharField(max_length=255, null=True, blank=True)
    
class LassaFever(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)
    
class LassaFeverDistrict(BaseReadiness):
    has_international_poe=models.IntegerField(default=0, null=True, blank=True)
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)
    district=models.CharField(max_length=255, null=True, blank=True)
    
class Marburg(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)
    
class Meningitis(BaseReadiness):
    pass

class MeningitiseElimination(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)

class Mpox(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)

class MpoxDistrict(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)
    district=models.CharField(max_length=255, null=True, blank=True)
    
class NaturalDisaster(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)
    
class RiftValleyFever(BaseReadiness):
    data_period=models.CharField(max_length=100, null=True, blank=True)
    data_period_id=models.CharField(max_length=100, null=True, blank=True)