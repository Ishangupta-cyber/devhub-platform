from django.contrib import admin

from .models import FileNode


@admin.register(FileNode)
class FileNodeAdmin(admin.ModelAdmin):
    list_display = ('name', 'node_type', 'repository', 'parent')
    list_filter = ('node_type', 'repository')
    search_fields = ('name',)
    # parent self-FK hai — default dropdown saare nodes load karta hai.
    raw_id_fields = ('parent', 'repository')
