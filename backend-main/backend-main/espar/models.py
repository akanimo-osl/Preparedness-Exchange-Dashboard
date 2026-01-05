# models.py
from django.db import models
from statistics import mean

class Sheet(models.Model):
    name = models.CharField(max_length=100)
    
class Espar(models.Model):
    sheet = models.ForeignKey(Sheet, on_delete=models.CASCADE, related_name="rows")
    key_on_table = models.CharField(max_length=100, unique=True)
    data_received = models.CharField(max_length=10)
    region = models.CharField(max_length=20)
    states = models.CharField(max_length=100)
    iso_code = models.CharField(max_length=10)
    total_average = models.IntegerField(default=0, null=True, blank=True)
    
    def __str__(self):
        return f"{self.sheet.name} - {self.region} - {self.states}"
    
    def weak_indicators(self):
        return [i for i in self.indicators.all() if i.scaled_score() <= 2]

    def strong_indicators(self):
        return [i for i in self.indicators.all() if i.scaled_score() >= 4]

    class Meta:
        unique_together = ('sheet', 'key_on_table')

class Indicator(models.Model):
    espar = models.ForeignKey(Espar, on_delete=models.CASCADE, related_name="indicators")
    code = models.CharField(max_length=10)  # e.g. C.1.1
    value = models.IntegerField(default=0, null=True, blank=True)  # score like 20/40/60/80/100
    
    def __str__(self):
        return f"{self.espar.sheet.name} - {self.code} - {self.value}"
    
    def scaled_score(self):
        return int(self.value / 20)
    

    class Meta:
        unique_together = ('espar', 'code')