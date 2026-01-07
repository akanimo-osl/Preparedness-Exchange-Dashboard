import pandas as pd
import os
from typing import List, Dict, Any, Optional
from datetime import datetime


class WHODataParser:
    """
    Comprehensive WHO Data Parser that handles:
    1. Signal Intelligence CSVs (PHE, Signal, RRA, EIS) - Event/Alert data
    2. Readiness Assessment CSVs - National and SubNational level
    3. Excel files - IHR Scores, SIMEX, CHW, IHRMEF, STAR Dashboard
    """
    
    # Standard columns for Readiness Assessment CSVs
    READINESS_COLUMNS = [
        'QuestionID', 'QuestionKey', 'Language', 'Category', 'CategoryCode',
        'AffectsScore', 'CategoryScore', 'CategoryWeight', 'QuestionScore',
        'QuestionCategoryWeight', 'CategoryLanguage', 'QuestionLanguage',
        'NationalYNValue', 'NationalYN', 'Comments', 'DataPeriod', 'DataPeriodId',
        'FileName', 'Country', 'District', 'AdminLevel', 'AdminLevelName',
        'FileLanguage', 'Table', 'RowNo', 'Question'
    ]
    
    # Standard columns for Signal Intelligence CSVs
    SIGNAL_COLUMNS = [
        'id', 'country', 'lat', 'lon', 'disease', 'grade', 'eventType',
        'status', 'description', 'year', 'reportDate', 'cases', 'deaths'
    ]
    
    def __init__(self, who_data_dir: str = None):
        if who_data_dir is None:
            self.who_data_dir = os.path.join(os.path.dirname(__file__), '..', 'who-data')
        else:
            self.who_data_dir = who_data_dir
        
        # WHO Signal Intelligence CSV files (event-based data)
        self.signal_files = [
            'phe_data.csv',
            'signal_data.csv', 
            'rra_data.csv',
            'eis_data.csv'
        ]
        
        # Readiness Assessment CSV files - National Level
        self.readiness_national_files = [
            'Arbovirus_denguereadiness_dataunweighted.csv',
            'cholerareadiness_DataUnweighted (1).csv',
            'cyclonereadiness_DataUnweighted (1).csv',
            'FVDreadiness_DataUnweighted (1).csv',
            'lassaFeverreadiness_DataUnweighted (1).csv',
            'Marburgreadiness_DataUnweighted (1).csv',
            'meningitis readiness_DataUnweighted (1).csv',
            'meningitiselimination_readiness_DataUnweighted (1).csv',
            'MPoxreadines_DataUnweighted.csv',
            'naturaldisastersreadiness_DataUnweighted (1).csv',
            'riftvalleyfever_readiness_DataUnweighted (1).csv'
        ]
        
        # Readiness Assessment CSV files - SubNational/District Level
        self.readiness_subnational_files = [
            'cholerareadiness_SubNational.DataUnweighted.csv',
            'FVDreadiness_PoE.DataUnweighted.csv',
            'lassafeverreadiness_Districts.DataUnweighted (1).csv',
            'MPox readiness_Districts.DataUnweighted.csv'
        ]
        
        # Excel files
        self.excel_files = [
            '2022-24IHRScoreperCapacity_202510300223.xlsx',
            '2025 SIMEX & ACTION REVIEWS CONDUCTED.xlsx',
            'CHW info_Data.xlsx',
            'COMPREHENSIVE FINAL IHRMEF breakdown 2016-2025 as at December 2024.xlsx',
            'star_dashoard(4).xlsx'
        ]

    def get_all_csv_files(self) -> List[str]:
        """Dynamically get all CSV files in the who-data directory"""
        csv_files = []
        if os.path.isdir(self.who_data_dir):
            for filename in os.listdir(self.who_data_dir):
                if filename.endswith('.csv'):
                    csv_files.append(filename)
        return csv_files
    
    def get_all_excel_files(self) -> List[str]:
        """Dynamically get all Excel files in the who-data directory"""
        excel_files = []
        if os.path.isdir(self.who_data_dir):
            for filename in os.listdir(self.who_data_dir):
                if filename.endswith('.xlsx') or filename.endswith('.xls'):
                    excel_files.append(filename)
        return excel_files
        
    def parse_all_csv_files(self) -> List[Dict[str, Any]]:
        """Parse all WHO CSV files and return unified data structure"""
        all_events = []
        
        csv_files = self.get_all_csv_files()
        
        for csv_file in csv_files:
            file_path = os.path.join(self.who_data_dir, csv_file)
            if os.path.exists(file_path):
                try:
                    if csv_file in self.signal_files:
                        events = self.parse_signal_csv(file_path, csv_file)
                    elif csv_file in self.readiness_subnational_files:
                        events = self.parse_readiness_csv(file_path, csv_file, is_subnational=True)
                    else:
                        events = self.parse_readiness_csv(file_path, csv_file, is_subnational=False)
                    all_events.extend(events)
                    print(f"✅ Parsed {len(events)} records from {csv_file}")
                except Exception as e:
                    print(f"❌ Error parsing {csv_file}: {e}")
                    
        return all_events
    
    def parse_signal_csv(self, file_path: str, csv_file: str) -> List[Dict[str, Any]]:
        """Parse WHO Signal Intelligence CSV files (PHE, Signal, RRA, EIS)"""
        df = pd.read_csv(file_path)
        
        event_type = csv_file.replace('_data.csv', '').upper()
        
        df = self.standardize_signal_columns(df)
        df['source'] = 'WHO'
        df['dataType'] = 'signal'
        df['eventType'] = event_type
        df['sourceFile'] = csv_file
        
        events = df.to_dict('records')
        return [self.validate_signal_event(event) for event in events]
    
    def parse_readiness_csv(self, file_path: str, csv_file: str, is_subnational: bool = False) -> List[Dict[str, Any]]:
        """
        Parse Readiness Assessment CSV files.
        Returns both:
        1. Aggregated country-level summary
        2. Detailed category breakdown
        """
        df = pd.read_csv(file_path)
        
        disease_type = self.extract_disease_from_filename(csv_file)
        
        # Get both aggregated and detailed data
        aggregated_events = self.aggregate_readiness_by_country(df, disease_type, csv_file, is_subnational)
        category_events = self.get_readiness_by_category(df, disease_type, csv_file, is_subnational)
        
        return aggregated_events + category_events
    
    def aggregate_readiness_by_country(self, df: pd.DataFrame, disease_type: str, csv_file: str, is_subnational: bool) -> List[Dict[str, Any]]:
        """Aggregate readiness scores by country (or country+district for subnational)"""
        events = []
        
        if 'Country' not in df.columns:
            return events
        
        # Determine grouping columns
        group_cols = ['Country']
        if is_subnational and 'District' in df.columns:
            group_cols.append('District')
        
        grouped = df.groupby(group_cols)
        
        for group_key, group in grouped:
            if isinstance(group_key, tuple):
                country = group_key[0]
                district = group_key[1] if len(group_key) > 1 else None
            else:
                country = group_key
                district = None
            
            # Calculate scores
            avg_category_score = group['CategoryScore'].mean() if 'CategoryScore' in group.columns else 0
            avg_question_score = group['QuestionScore'].mean() if 'QuestionScore' in group.columns else 0
            
            # Get unique categories
            categories = group['Category'].unique().tolist() if 'Category' in group.columns else []
            
            # Count responses
            yes_count = (group['NationalYN'] == 'yes').sum() if 'NationalYN' in group.columns else 0
            no_count = (group['NationalYN'] == 'no').sum() if 'NationalYN' in group.columns else 0
            total_questions = len(group)
            
            # Get data period if available
            data_period = group['DataPeriod'].iloc[0] if 'DataPeriod' in group.columns and not group['DataPeriod'].isna().all() else None
            
            # Get admin level
            admin_level = group['AdminLevel'].iloc[0] if 'AdminLevel' in group.columns else ('SubNational' if is_subnational else 'National')
            
            event = {
                'id': f"RDN-{disease_type[:3].upper()}-{country[:3].upper()}-{len(events)+1}",
                'source': 'WHO',
                'dataType': 'readiness_summary',
                'country': country,
                'district': district,
                'disease': disease_type,
                'eventType': 'Readiness',
                'adminLevel': admin_level,
                'isSubnational': is_subnational,
                
                # Scores
                'avgCategoryScore': round(avg_category_score, 4),
                'avgQuestionScore': round(avg_question_score, 4),
                'readinessGrade': self.score_to_grade(avg_category_score),
                
                # Response counts
                'totalQuestions': total_questions,
                'yesResponses': int(yes_count),
                'noResponses': int(no_count),
                'responseRate': round((yes_count / total_questions * 100) if total_questions > 0 else 0, 2),
                
                # Categories covered
                'categoriesCount': len(categories),
                'categories': categories,
                
                # Metadata
                'dataPeriod': data_period,
                'sourceFile': csv_file,
                'reportDate': datetime.now().isoformat(),
                'year': datetime.now().year
            }
            events.append(event)
        
        return events
    
    def get_readiness_by_category(self, df: pd.DataFrame, disease_type: str, csv_file: str, is_subnational: bool) -> List[Dict[str, Any]]:
        """Get readiness breakdown by category for each country"""
        events = []
        
        if 'Country' not in df.columns or 'Category' not in df.columns:
            return events
        
        # Group by Country and Category
        group_cols = ['Country', 'Category']
        if is_subnational and 'District' in df.columns:
            group_cols = ['Country', 'District', 'Category']
        
        grouped = df.groupby(group_cols)
        
        for group_key, group in grouped:
            if len(group_cols) == 3:
                country, district, category = group_key
            else:
                country, category = group_key
                district = None
            
            # Calculate category-specific scores
            avg_score = group['CategoryScore'].mean() if 'CategoryScore' in group.columns else 0
            category_weight = group['CategoryWeight'].iloc[0] if 'CategoryWeight' in group.columns else 0
            
            # Get category code
            category_code = group['CategoryCode'].iloc[0] if 'CategoryCode' in group.columns else ''
            
            # Count responses in this category
            yes_count = (group['NationalYN'] == 'yes').sum() if 'NationalYN' in group.columns else 0
            total = len(group)
            
            event = {
                'id': f"CAT-{disease_type[:3].upper()}-{country[:3].upper()}-{category_code}",
                'source': 'WHO',
                'dataType': 'readiness_category',
                'country': country,
                'district': district,
                'disease': disease_type,
                'eventType': 'ReadinessCategory',
                'isSubnational': is_subnational,
                
                # Category info
                'category': category,
                'categoryCode': category_code,
                'categoryScore': round(avg_score, 4),
                'categoryWeight': round(float(category_weight), 4) if category_weight else 0,
                'categoryGrade': self.score_to_grade(avg_score),
                
                # Response counts
                'questionsInCategory': total,
                'yesResponses': int(yes_count),
                'completionRate': round((yes_count / total * 100) if total > 0 else 0, 2),
                
                # Metadata
                'sourceFile': csv_file,
                'reportDate': datetime.now().isoformat()
            }
            events.append(event)
        
        return events
    
    def parse_excel_files(self) -> Dict[str, List[Dict[str, Any]]]:
        """Parse all Excel files and return structured data"""
        excel_data = {}
        
        for excel_file in self.get_all_excel_files():
            file_path = os.path.join(self.who_data_dir, excel_file)
            if os.path.exists(file_path):
                try:
                    # Read all sheets
                    xlsx = pd.ExcelFile(file_path)
                    file_data = {}
                    
                    for sheet_name in xlsx.sheet_names:
                        df = pd.read_excel(xlsx, sheet_name=sheet_name)
                        file_data[sheet_name] = {
                            'columns': df.columns.tolist(),
                            'row_count': len(df),
                            'data': df.to_dict('records')
                        }
                    
                    excel_data[excel_file] = {
                        'sheets': list(xlsx.sheet_names),
                        'data': file_data
                    }
                    print(f"✅ Parsed Excel file: {excel_file} ({len(xlsx.sheet_names)} sheets)")
                except Exception as e:
                    print(f"❌ Error parsing Excel {excel_file}: {e}")
        
        return excel_data
    
    def extract_disease_from_filename(self, filename: str) -> str:
        """Extract disease/hazard type from filename"""
        filename_lower = filename.lower()
        
        if 'arbovirus' in filename_lower or 'dengue' in filename_lower:
            return 'Arbovirus/Dengue'
        elif 'cholera' in filename_lower:
            if 'subnational' in filename_lower:
                return 'Cholera (Subnational)'
            return 'Cholera'
        elif 'cyclone' in filename_lower:
            return 'Cyclone'
        elif 'fvd' in filename_lower:
            if 'poe' in filename_lower:
                return 'FVD (PoE)'
            return 'FVD'
        elif 'lassa' in filename_lower:
            if 'district' in filename_lower:
                return 'Lassa Fever (Districts)'
            return 'Lassa Fever'
        elif 'marburg' in filename_lower:
            return 'Marburg'
        elif 'meningitis' in filename_lower:
            if 'elimination' in filename_lower:
                return 'Meningitis Elimination'
            return 'Meningitis'
        elif 'mpox' in filename_lower:
            if 'district' in filename_lower:
                return 'Mpox (Districts)'
            return 'Mpox'
        elif 'natural' in filename_lower or 'disaster' in filename_lower:
            return 'Natural Disasters'
        elif 'rift' in filename_lower or 'valley' in filename_lower:
            return 'Rift Valley Fever'
        else:
            return 'Unknown'
    
    def score_to_grade(self, score: float) -> str:
        """Convert readiness score to grade"""
        if score >= 8:
            return 'Grade 1'  # High readiness
        elif score >= 5:
            return 'Grade 2'  # Medium readiness
        elif score >= 2:
            return 'Grade 3'  # Low readiness
        else:
            return 'Ungraded'
    
    def standardize_signal_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize column names for signal data"""
        column_mapping = {
            'iso_code': 'id',
            'country_name': 'country',
            'latitude': 'lat', 
            'longitude': 'lon',
            'disease_name': 'disease',
            'risk_grade': 'grade',
            'event_type': 'eventType',
            'event_status': 'status',
            'event_description': 'description',
            'report_date': 'reportDate',
            'case_count': 'cases',
            'death_count': 'deaths'
        }
        
        df = df.rename(columns=column_mapping)
        
        for col in self.SIGNAL_COLUMNS:
            if col not in df.columns:
                df[col] = self.get_default_value(col)
                
        return df
    
    def validate_signal_event(self, event: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean signal event data"""
        event['lat'] = float(event.get('lat', 0)) or 0.0
        event['lon'] = float(event.get('lon', 0)) or 0.0
        event['cases'] = int(event.get('cases', 0)) or 0
        event['deaths'] = int(event.get('deaths', 0)) or 0
        event['year'] = int(event.get('year', datetime.now().year))
        
        grade = str(event.get('grade', '')).lower()
        if '3' in grade:
            event['grade'] = 'Grade 3'
        elif '2' in grade:
            event['grade'] = 'Grade 2'
        elif '1' in grade:
            event['grade'] = 'Grade 1'
        else:
            event['grade'] = 'Ungraded'
            
        status = str(event.get('status', '')).lower()
        if 'closed' in status or 'ended' in status:
            event['status'] = 'Closed'
        elif 'monitor' in status:
            event['status'] = 'Monitoring'
        else:
            event['status'] = 'Ongoing'
            
        return event
    
    def get_default_value(self, column: str) -> Any:
        """Get default value for missing columns"""
        defaults = {
            'id': '',
            'country': 'Unknown',
            'lat': 0.0,
            'lon': 0.0,
            'disease': 'Unknown',
            'grade': 'Ungraded',
            'eventType': 'Unknown',
            'status': 'Ongoing',
            'description': '',
            'year': datetime.now().year,
            'reportDate': datetime.now().isoformat(),
            'cases': 0,
            'deaths': 0
        }
        return defaults.get(column, '')
    
    # Convenience methods for specific data types
    def get_signal_events(self) -> List[Dict[str, Any]]:
        """Get only WHO Signal Intelligence events"""
        all_events = []
        for csv_file in self.signal_files:
            file_path = os.path.join(self.who_data_dir, csv_file)
            if os.path.exists(file_path):
                try:
                    events = self.parse_signal_csv(file_path, csv_file)
                    all_events.extend(events)
                except Exception as e:
                    print(f"❌ Error parsing {csv_file}: {e}")
        return all_events
    
    def get_readiness_summary(self) -> List[Dict[str, Any]]:
        """Get aggregated readiness summaries by country"""
        all_events = self.parse_all_csv_files()
        return [e for e in all_events if e.get('dataType') == 'readiness_summary']
    
    def get_readiness_categories(self) -> List[Dict[str, Any]]:
        """Get detailed readiness category breakdown"""
        all_events = self.parse_all_csv_files()
        return [e for e in all_events if e.get('dataType') == 'readiness_category']
    
    def get_readiness_by_disease(self, disease: str) -> List[Dict[str, Any]]:
        """Get readiness data filtered by disease"""
        all_events = self.parse_all_csv_files()
        return [e for e in all_events if disease.lower() in e.get('disease', '').lower()]
    
    def get_readiness_by_country(self, country: str) -> List[Dict[str, Any]]:
        """Get readiness data filtered by country"""
        all_events = self.parse_all_csv_files()
        return [e for e in all_events if e.get('country', '').lower() == country.lower()]
    
    def get_summary(self) -> Dict[str, Any]:
        """Get comprehensive summary of all available data files"""
        csv_files = self.get_all_csv_files()
        excel_files = self.get_all_excel_files()
        
        return {
            'total_csv_files': len(csv_files),
            'total_excel_files': len(excel_files),
            'signal_files': {
                'count': len([f for f in csv_files if f in self.signal_files]),
                'files': [f for f in csv_files if f in self.signal_files]
            },
            'readiness_national_files': {
                'count': len([f for f in csv_files if f in self.readiness_national_files]),
                'files': [f for f in csv_files if f in self.readiness_national_files]
            },
            'readiness_subnational_files': {
                'count': len([f for f in csv_files if f in self.readiness_subnational_files]),
                'files': [f for f in csv_files if f in self.readiness_subnational_files]
            },
            'excel_files': {
                'count': len(excel_files),
                'files': excel_files
            }
        }
    
    def get_available_diseases(self) -> List[str]:
        """Get list of all available diseases/hazards"""
        diseases = set()
        for csv_file in self.get_all_csv_files():
            if csv_file not in self.signal_files:
                diseases.add(self.extract_disease_from_filename(csv_file))
        return sorted(list(diseases))
    
    def get_available_countries(self) -> List[str]:
        """Get list of all countries in the data"""
        countries = set()
        for csv_file in self.get_all_csv_files():
            file_path = os.path.join(self.who_data_dir, csv_file)
            if os.path.exists(file_path):
                try:
                    df = pd.read_csv(file_path, usecols=['Country'] if 'Country' in pd.read_csv(file_path, nrows=0).columns else ['country'])
                    col = 'Country' if 'Country' in df.columns else 'country'
                    countries.update(df[col].dropna().unique())
                except:
                    pass
        return sorted(list(countries))


def combine_and_deduplicate(who_events: List[Dict[str, Any]], existing_events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Intelligent merge strategy prioritizing WHO data"""
    event_map = {}
    
    for event in who_events:
        data_type = event.get('dataType', 'unknown')
        if data_type == 'signal':
            key = f"signal-{event.get('country', '')}-{event.get('disease', '')}-{str(event.get('reportDate', ''))[:10]}"
        elif data_type == 'readiness_summary':
            key = f"summary-{event.get('country', '')}-{event.get('district', '')}-{event.get('disease', '')}"
        elif data_type == 'readiness_category':
            key = f"category-{event.get('country', '')}-{event.get('district', '')}-{event.get('disease', '')}-{event.get('categoryCode', '')}"
        else:
            key = f"other-{event.get('id', '')}"
        
        event['source_priority'] = 1
        event_map[key] = event
    
    for event in existing_events:
        key = f"existing-{event.get('country', '')}-{event.get('disease', '')}-{str(event.get('reportDate', ''))[:10]}"
        if key not in event_map:
            event['source_priority'] = 2
            event_map[key] = event
    
    return list(event_map.values())


if __name__ == '__main__':
    parser = WHODataParser()
    
    # Print summary
    summary = parser.get_summary()
    print("\n" + "="*60)
    print("📊 WHO DATA PARSER - COMPREHENSIVE SUMMARY")
    print("="*60)
    
    print(f"\n📁 Total CSV Files: {summary['total_csv_files']}")
    print(f"📁 Total Excel Files: {summary['total_excel_files']}")
    
    print(f"\n🔔 Signal Intelligence Files ({summary['signal_files']['count']}):")
    for f in summary['signal_files']['files']:
        print(f"   - {f}")
    
    print(f"\n🏥 Readiness National Files ({summary['readiness_national_files']['count']}):")
    for f in summary['readiness_national_files']['files']:
        print(f"   - {f}")
    
    print(f"\n🏘️ Readiness SubNational Files ({summary['readiness_subnational_files']['count']}):")
    for f in summary['readiness_subnational_files']['files']:
        print(f"   - {f}")
    
    print(f"\n📊 Excel Files ({summary['excel_files']['count']}):")
    for f in summary['excel_files']['files']:
        print(f"   - {f}")
    
    print(f"\n🦠 Available Diseases/Hazards:")
    for d in parser.get_available_diseases():
        print(f"   - {d}")
    
    # Parse all files
    print("\n" + "="*60)
    print("🔄 PARSING ALL CSV FILES...")
    print("="*60)
    events = parser.parse_all_csv_files()
    
    # Summary by data type
    signal_events = [e for e in events if e.get('dataType') == 'signal']
    summary_events = [e for e in events if e.get('dataType') == 'readiness_summary']
    category_events = [e for e in events if e.get('dataType') == 'readiness_category']
    
    print(f"\n✅ PARSING COMPLETE!")
    print(f"   Total records: {len(events)}")
    print(f"   - Signal events: {len(signal_events)}")
    print(f"   - Readiness summaries: {len(summary_events)}")
    print(f"   - Category breakdowns: {len(category_events)}")
    
    if signal_events:
        print(f"\n📌 Sample Signal Event:")
        print(f"   {signal_events[0]}")
    
    if summary_events:
        print(f"\n📌 Sample Readiness Summary:")
        print(f"   {summary_events[0]}")
    
    if category_events:
        print(f"\n📌 Sample Category Breakdown:")
        print(f"   {category_events[0]}")
