from django.db import models

class Country(models.Model):
    country_id = models.IntegerField(primary_key=True)
    country = models.CharField(max_length=100)
    population_2024 = models.BigIntegerField()
    total_chws = models.IntegerField()
    chws_per_10000 = models.FloatField()
    total_regions = models.IntegerField()
    total_districts = models.IntegerField()
    data_year = models.IntegerField()
    last_updated = models.DateField()

    def __str__(self):
        return self.country


class Region(models.Model):
    region_id = models.IntegerField(primary_key=True)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    region_name = models.CharField(max_length=150)
    district_count = models.IntegerField()
    region_number = models.IntegerField()
    province = models.CharField(max_length=150, null=True, blank=True)

    def __str__(self):
        return f"{self.region_name}"


class District(models.Model):
    district_id = models.IntegerField(primary_key=True)
    region = models.ForeignKey(Region, on_delete=models.CASCADE)
    country = models.ForeignKey(Country, on_delete=models.CASCADE)
    district_name = models.CharField(max_length=200)
    chw_count = models.IntegerField()
    population_est = models.BigIntegerField()
    chws_per_10k = models.FloatField()

    def __str__(self):
        return self.district_name
