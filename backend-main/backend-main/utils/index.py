import re
from django.conf import settings
from django.utils import timezone
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import timedelta
from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError

User = get_user_model()

def update_lock_count(user, action: str):
    valid_action = ['increase', 'fallback']
    if user.lock_count != 5:
        if action not in valid_action:
            return 0
        if action == 'increase':
            user.lock_count += 1
            user.save()
        if action == 'fallback':
            user.lock_count = 0
            user.save()
            return user.lock_count, False
        if user.lock_count == 5:
            now = timezone.now()
            # Calculate the next minute by adding a timedelta of 1 minute
            next_minute = now + timedelta(minutes=5)
            user.lock_count = 0
            user.lock_duration = next_minute
            user.save()
            return 5, True
        return user.lock_count, True
    return 5, False


def custom_response(status, message, data=None, http_status=status.HTTP_200_OK):
    return Response({
        "status": status,
        "message": message,
        "data": data
    }, status=http_status)


def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Special handling for ValidationError
        if isinstance(exc, ValidationError):
            if isinstance(exc.detail, dict):
                # Get the first error message from the dictionary
                try:
                    first_field = next(iter(exc.detail))
                    first_error = exc.detail[first_field]
                    if isinstance(first_error, list):
                        response.data = {'message': first_error[0]}
                    else:
                        response.data = {'message': first_error}
                except (StopIteration, TypeError):
                    response.data = {'message': 'Validation error occurred'}
            elif isinstance(exc.detail, list):
                response.data = {'message': exc.detail[0]}
            else:
                response.data = {'message': str(exc.detail)}
        # If the exception has a 'message' in its detail, use that
        elif 'message' in response.data:
            response.data = {'message': response.data['message']}
        # Handle case where 'detail' is in response.data
        elif 'detail' in response.data:
            response.data = {'message': response.data['detail']}
        # Otherwise, get the first error from the first field
        else:
            try:
                first_error = next(iter(response.data.values()))
                if isinstance(first_error, list):
                    response.data = {'message': first_error[0]}
                else:
                    response.data = {'message': first_error}
            except (StopIteration, TypeError):
                # Fallback if we can't extract a message
                response.data = {'message': 'An error occurred'}
    return response


def format_date(date):
    """Generates and returns the formatted date

    Args:
        date (datetime): A datetime obj or DateTimeField
        returns {day}{suffix} of {month} {year}

    Returns:
        str: 4th of december 2024
    """
    day = str(date.day)
    month = date.strftime('%B')
    year = date.year
    #predefine the suffixes
    suffixes = {1: 'st', 2: 'nd', 3: 'rd'}
    
    if int(day[-1]) in suffixes.keys():
        suffix = suffixes[int(day[-1])]
    else:
        suffix = 'th'
        
    return f"{day}{suffix} of {month} {year}"


def check_special_character(password: str)->bool:
    # Define the regular expression for special characters
    special_char_pattern = r'[!@#$%^&*(),.?":{}|<>]'
    
    # Search for a special character in the password
    if re.search(special_char_pattern, password):
        return True
    else:
        return False
    

def get_client_ip(request):
    """Get the real client IP address even if behind a proxy."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def get_browser_info(request):
    ua_string = request.META.get('HTTP_USER_AGENT', '')

    # Look for major browsers
    match = re.search(r'(Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)\/([\d.]+)', ua_string)
    if match:
        browser, version = match.groups()
        # Map "Trident" to "Internet Explorer"
        if browser == "Trident":
            browser = "Internet Explorer"
        return f"{browser} {version}"

    return "Unknown Browser"

def gen_unique_key(sheet_name, idx):
    return f"{sheet_name}_row_{idx}"

def parse_number(value):
    try:
        return float(value)
    except (ValueError, TypeError):
        return None
    
def is_year(s: str) -> bool:
    return s.isdigit() and len(s) == 4