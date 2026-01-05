from django.core.files.storage import default_storage
import pandas as pd
from celery import shared_task
from .models import *
from utils.index import *
from utils.constants import *

def snake_case(name: str) -> str:
    """
    Convert CamelCase / PascalCase to snake_case correctly,
    preserving acronyms such as PoE, LAN, MAC, IP.
    """
    if name == 'PoEName':
        return 'poe_name'
    # Step 1: Insert underscore between lowercase → uppercase (e.g., PoE → Po_E)
    name = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', name)
    # Step 2: Insert underscore between acronym → normal word (e.g., PoEName → PoE_Name)
    name = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1_\2', name)

    return name.lower()



def extract_base_data(row, extra_fields=[]):
    fields = [
        'QuestionId', 'QuestionKey', 'Language', 'Category', 'CategoryCode',
        'AffectsScore', 'CategoryScore', 'CategoryWeight', 'QuestionScore',
        'QuestionCategoryWeight', 'CategoryLanguage', 'QuestionLanguage',
        'NationalYNValue', 'NationalYN', 'Comments', 'FileName', 'Country',
        'AdminLevel', 'AdminLevelName', 'FileLanguage', 'Table', 
        'RowNo', 'Question',
    ]
    fields.extend(extra_fields)
    
    return {snake_case(f): row.get(f, None) for f in fields}


@shared_task
def load_arbovirus(file_path):
    print("START LOADING ARBOVIRUS")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row)
        unique_key = gen_unique_key('arbovirus', idx)

        ArboVirus.objects.update_or_create(
            key_on_table=unique_key,
            defaults=base_data
        )
    print("END LOADING ARBOVIRUS")
    

@shared_task
def load_cholera(file_path):
    print("START LOADING CHOLERA")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId"])
        unique_key = gen_unique_key('cholera', idx)

        Cholera.objects.update_or_create(
            key_on_table=unique_key,
            defaults=base_data
        )
    print("END LOADING CHOLERA")
    

@shared_task
def load_cholerasubnational(file_path):
    print("START LOADING CHOLERA SUBNATIONAL")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId", "District"])
        unique_key = gen_unique_key('cholerasubnational', idx)

        CholeraSubNational.objects.update_or_create(
            key_on_table=unique_key,
            defaults=base_data
        )
    print("END LOADING CHOLERA SUBNATIONAL")
    

@shared_task
def load_cyclone(file_path):
    print("START LOADING CYCLONE")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId"])
        unique_key = gen_unique_key('cyclone', idx)

        Cyclone.objects.update_or_create(
            key_on_table=unique_key,
            defaults=base_data
        )
    print("END LOADING CYCLONE")
    

@shared_task
def load_fvd(file_path):
    print("START LOADING FVD")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId"])
        unique_key = gen_unique_key('fvd', idx)

        FVD.objects.update_or_create(
            key_on_table=unique_key,
            defaults=base_data
        )
    print("END LOADING FVD")
    

@shared_task
def load_fvdpoe(file_path):
    print("START LOADING FVDPoE")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId", "District", "PoEName"])
        unique_key = gen_unique_key('fvdpoe', idx)

        FVDPoE.objects.update_or_create(
            key_on_table=unique_key,
            defaults=base_data
        )
    print("END LOADING FVDPoE")
    
    
@shared_task
def load_lassafever(file_path):
    print("START LOADING LASSAFEVER")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId"])
        unique_key = gen_unique_key('lassafever', idx)

        LassaFever.objects.update_or_create(
            key_on_table=unique_key,
            defaults=base_data
        )
    print("END LOADING LASSAFEVER")
    
    
@shared_task
def load_lassafeverdistrict(file_path):
    print("START LOADING LASSAFEVERDISTRICT")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId", "HasInternationalPOE", "District"])
        unique_key = gen_unique_key('lassafeverdistrict', idx)

        LassaFeverDistrict.objects.update_or_create(
            key_on_table=unique_key,
            defaults=base_data
        )
    print("END LOADING LASSAFEVERDISTRICT")
    

@shared_task
def load_marburg(file_path):
    print("START LOADING MARBURG")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId"])
        unique_key = gen_unique_key('marbug', idx)

        Marburg.objects.update_or_create(
            key_on_table=unique_key,
            defaults=base_data
        )
    print("END LOADING MARBURG")
    

@shared_task
def load_meningitis(file_path):
    print("START LOADING Meningitis")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row)
        unique_key = gen_unique_key('meningitis', idx)

        Meningitis.objects.update_or_create(
            key_on_table=unique_key,
            defaults=base_data
        )
    print("END LOADING Meningitis")
    

@shared_task
def load_meningitiselimination(file_path):
    print("START LOADING MeningitisElimination")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId"])
        unique_key = gen_unique_key('meningitiseelimination', idx)

        MeningitiseElimination.objects.update_or_create(
                key_on_table=unique_key,
                defaults=base_data
            )
    print("END LOADING MeningitisElimination")
    

@shared_task
def load_mpox(file_path):
    print("START LOADING MPOX")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId"])
        unique_key = gen_unique_key('mpox', idx)

        Mpox.objects.update_or_create(
                key_on_table=unique_key,
                defaults=base_data
            )
    print("END LOADING MPOX")
    

@shared_task
def load_mpoxdistrict(file_path):
    print("START LOADING mpoxdistrict")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId", "District"])
        unique_key = gen_unique_key('mpoxdistrict', idx)

        MpoxDistrict.objects.update_or_create(
                key_on_table=unique_key,
                defaults=base_data
            )
    print("END LOADING mpoxdistrict")
    

@shared_task
def load_naturaldisaster(file_path):
    print("START LOADING naturaldisaster")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId"])
        unique_key = gen_unique_key('naturaldisaster', idx)

        NaturalDisaster.objects.update_or_create(
                key_on_table=unique_key,
                defaults=base_data
            )
    print("END LOADING naturaldisaster")
    
    
@shared_task
def load_riftvalley(file_path):
    print("START LOADING riftvalley")
    file = default_storage.open(file_path, mode="rb")
    df = pd.read_csv(file)
    df = df.where(pd.notna(df), None)  # NaN → None

    for idx, row in df.iterrows():
        base_data = extract_base_data(row, ["DataPeriod", "DataPeriodId"])
        unique_key = gen_unique_key('riftvalleyfever', idx)

        RiftValleyFever.objects.update_or_create(
                key_on_table=unique_key,
                defaults=base_data
            )
    print("END LOADING riftvalley")