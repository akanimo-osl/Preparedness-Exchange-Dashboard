from django.core.files.storage import default_storage
import pandas as pd
from celery import shared_task
from .models import *
from utils.index import *
from utils.constants import *

@shared_task
def load_chw(file_path):
    print("START LOADING CHW DATA")
    full_path = default_storage.open(file_path, mode="rb")
    xls = pd.ExcelFile(full_path)

    # Utility to load + clean a sheet
    def load_sheet(name):
        if name not in xls.sheet_names:
            return None
        df = pd.read_excel(xls, name)
        df = df.dropna(how="all")
        df = df.where(pd.notna(df), None)  # NaN -> None
        return df

    # ---- Countries ----
    df_country = load_sheet("CHW Country")
    if df_country is not None:
        for _, row in df_country.iterrows():
            Country.objects.update_or_create(
                country_id=row["CountryID"],
                defaults={
                    "country": row["Country"],
                    "population_2024": row["Population_2024"],
                    "total_chws": row["Total_CHWs"],
                    "chws_per_10000": row["CHWs_per_10000"],
                    "total_regions": row["Total_Regions"],
                    "total_districts": row["Total_Districts"],
                    "data_year": row["Data_Year"],
                    "last_updated": row["Last_Updated"],
                }
            )
 
    # ---- Regions ----
    df_region = load_sheet("CHW Region")
    if df_region is not None:
        for _, row in df_region.iterrows():
            Region.objects.update_or_create(
                region_id=row["RegionID"],
                defaults={
                    "country_id": row["CountryID"],
                    "region_name": row["Region_Name"],
                    "district_count": row["District_Count"],
                    "region_number": row["Region_Number"],
                    "province": row["Province"],
                }
            )

    # ---- Districts ----
    df_district = load_sheet("CHW District")
    if df_district is not None:
        for _, row in df_district.iterrows():
            District.objects.update_or_create(
                district_id=row["DistrictID"],
                defaults={
                    "region_id": row["RegionID"],
                    "country_id": row["CountryID"],
                    "district_name": row["District_Name"],
                    "chw_count": row["CHW_Count"],
                    "population_est": row["Population_Est"],
                    "chws_per_10k": row["CHWs_per_10K"],
                }
            )
    print("END LOADING CHW DATA")