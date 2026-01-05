from django.contrib import admin
from .models import *

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'email_verified', 'is_staff')

admin.site.register(User, UserAdmin)
admin.site.register(CustomAuthToken)

admin.site.register(LoginHistory)
admin.site.register(Alert)