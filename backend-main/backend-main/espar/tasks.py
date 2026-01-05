from django.core.files.storage import default_storage
import pandas as pd
from celery import shared_task
from .models import *
from utils.index import *
from utils.constants import *

@shared_task
def load_espar(file_path):
    print("START LOADING ESPAR")
    full_path = default_storage.open(file_path, mode="rb")
    xls = pd.ExcelFile(full_path)
    for sheet_name in xls.sheet_names: 
        if not is_year(sheet_name):
            continue
        
        # Load with header detection
        df = pd.read_excel(xls, sheet_name, skiprows=13)
        # Clean: remove completely empty rows
        df = df.dropna(how="all")
        sheet_obj, _ = Sheet.objects.get_or_create(name=sheet_name.strip())

        for idx, row in df.iterrows():
            # Convert NaN → None
            row = row.where(pd.notna(row), None)

            unique_key = gen_unique_key(sheet_name, idx)

            # Safely read base fields
            espar, _ = Espar.objects.update_or_create(
                sheet=sheet_obj,
                key_on_table=unique_key,
                defaults={
                    "data_received": row.get("Data Received"),
                    "region": row.get("Region"),
                    "states": row.get("States Party of IHR"),
                    "iso_code": row.get("ISO Code"),
                    "total_average": parse_number(row.get("Total Average")),
                }
            )

            # Remaining columns = indicators
            for col in CAPACITIES.keys():
                value = row.get(col)
                # Ignore empty columns
                if value is None:
                    continue

                Indicator.objects.update_or_create(
                    espar=espar,
                    code=col,
                    defaults={"value": parse_number(value)}
                )
    
    print("DONE LOADING ESPAR")
        