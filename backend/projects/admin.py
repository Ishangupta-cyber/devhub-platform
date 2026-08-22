from django.contrib import admin
from .models import Project,Column,Card
# Register your models here.
admin.site.register([Column,Card,Project])