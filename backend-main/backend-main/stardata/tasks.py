from django.core.files.storage import default_storage
import pandas as pd
from celery import shared_task
from .models import *
from utils.index import *

def normalize_text(text:str)->str:
    # remove prefix "_" if it exists
    if text.startswith("_"):
        text = text[1:]
    return text.lower()


def extract_base_data(row):
    fields = [
        '_N', 'Country', 'Level', 'Year', 'Start_date', 'End_date', 'Subgroup_of_Hazards', 'Main_Type_of_Hazard',
        'Hazard', 'Health_consequences', 'Scale', 'Geographical_Area', 'Exposure', 'Frequency', 'Seasonality', 
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Likelihood',
        'Severity', 'Vulnerability', 'Vulnerability_Details', 'Coping_capacity', 'Coping_capacity_details', 
        'Governance_and_Resouces', 'Health_Sector_Capacity', 'Non_Health_Sector_Capcity', 'Commuty_Capacity', 
        'Resources', 'Impact', 'Confidence_level', 'Risk_level', 'Risk_level_Number', 'Status'
    ]
    return {normalize_text(f): row.get(f, None) for f in fields}


@shared_task
def load_stardata(file_path):
    print("START LOADING STARDATA")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row)
        unique_key = gen_unique_key('stardata', idx)

        StarData.objects.update_or_create(
            key_on_table=unique_key,
            defaults=base_data
        )
    print("END LOADING STARDATA")