from django.db import models

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone
from django.conf import settings
from django.core.validators import RegexValidator
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from uuid import uuid4
import datetime, secrets
from datetime import timedelta

phone_validator = RegexValidator(
    regex=r'^\+\d{6,15}$',
    message="Phone number must be entered in the format: +234xxxxxxxxxx. Up to 15 digits allowed."
)

def generate_token():
    return secrets.token_hex(32)  # 64-char string

def get_setting(name, default):
    return getattr(settings, 'CUSTOM_AUTH', {}).get(name, default)

class CustomAuthToken(models.Model):
    access_token = models.CharField(max_length=64, unique=True, default=generate_token)
    refresh_token = models.CharField(max_length=64, unique=True, default=generate_token)

    access_expires_at = models.DateTimeField()
    refresh_expires_at = models.DateTimeField()

    # Generic relation to the user-like object
    user_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    user_id = models.PositiveIntegerField()
    user = GenericForeignKey('user_type', 'user_id')

    created = models.DateTimeField(auto_now_add=True)

    def has_access_expired(self):
        return timezone.now() >= self.access_expires_at

    def has_refresh_expired(self):
        return timezone.now() >= self.refresh_expires_at
    
    def rotate_access_token(self):
        self.access_token = generate_token()
        self.access_expires_at = timezone.now() + timedelta(
            minutes=get_setting('ACCESS_TOKEN_LIFESPAN_MINUTES', 15)
        )
        self.save()

    def refresh(self):
        self.access_token = generate_token()
        self.refresh_token = generate_token()
        self.access_expires_at = timezone.now() + timedelta(minutes=get_setting('ACCESS_TOKEN_LIFESPAN_MINUTES', 15))
        self.refresh_expires_at = timezone.now() + timedelta(days=get_setting('REFRESH_TOKEN_LIFESPAN_DAYS', 1))
        self.save()
        return self

class UserManager(BaseUserManager):
    def create_user(self, email, password, **other_fields):
        email = self.normalize_email(email)
        if not other_fields.get("username"):
            other_fields["username"] = str(uuid4())[:30]  # generate unique username

        user = self.model(
            email=email,
            **other_fields
        )
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **other_fields):
        user = self.create_user(
            email = self.normalize_email(email),
            password=password,
            **other_fields
        )
        user.email_verified = True
        user.is_admin = True
        user.is_active = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user
    

class User(AbstractUser):
    email = models.EmailField(blank=False, unique=True)
    full_name = models.CharField(blank=False, max_length=255)
    username = models.CharField(blank=True, null=True, max_length=255)
    date_of_birth = models.CharField(max_length=255, blank=False)
    phone_number = models.CharField(
        max_length=16,
        unique=True,
        null=True,
        validators=[phone_validator],
        help_text="Enter your Number in international format, e.g. +234XXXXXXXXXX",
        error_messages={
            'unique': 'This phone number is already registered',
            'required': 'We need your phone to onboard you.'
        }
    )
    country = models.CharField(max_length=255, blank=False)

    email_verified = models.BooleanField(default=False)
    has_accepted_terms = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    otp_secret = models.CharField(max_length=32, blank=True, null=True)
    is_2fa_enabled = models.BooleanField(default=False)

    lock_count = models.PositiveIntegerField(default=0)
    lock_duration = models.DateTimeField(blank=True, null=True)
    last_email_change = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self):
        return f'{self.email}'
    
    def is_locked(self):
        now = timezone.now()
        if self.lock_duration:
            if self.lock_duration <= now:
                return False
            return True
        return False 
    
    
class LoginHistory(models.Model):
    ACTION_CHOICES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
    ]

    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    ip_address = models.GenericIPAddressField()
    browser = models.CharField(max_length=255)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        user_display = self.user.email if self.user else "Unknown User"
        return f"{user_display} - {self.action} - {self.status} @ {self.timestamp}"
    
    

class Alert(models.Model):
    STATUS_CHOICES = (
        ("active", "active"),
        ("acknowledged", "acknowledged"),
        ("resolved", "resolved")
    )
    SEVERITY_CHOICES = (
        ("critical", "CRITICAL"),
        ("high", "HIGH"),
        ("medium", "MEDIUM"),
        ("low", "LOW"),
    )
    CATEGORY_CHOICES = (
        ('disease_outbreak', "Disease Outbreak"),
        ('resource_shortage', "Resource Shortage"),
        ("natural_disaster", "Natural Disaster"),
        ("administrative", "Administrative"),
        ("capaticy_alert", "Capacity Alert")
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=255, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    severity = models.CharField(max_length=50, choices=SEVERITY_CHOICES)
    country = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    date = models.DateTimeField(auto_now_add=True)
    acknowledge_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    last_updated_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.status} - {self.severity}"