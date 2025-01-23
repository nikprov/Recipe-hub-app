# recipe_hub_backend\recipes\admin.py

from django.contrib import admin
from .models import Recipe, Comment, DifficultyRating

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    
    list_display = ('title', 'author', 'cooking_time', 'created_at') # This list_display shows which fields appear in the list view   
    list_filter = ('created_at', 'cooking_time', 'author') # Add filters to the right sidebar    
    # Add search functionality
    search_fields = ('title', 'description', 'ingredients')    
    # Show latest recipes first
    ordering = ('-created_at',)    
    # Fields to show in detail view, grouped for better organization
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'author')
        }),
        ('Recipe Details', {
            'fields': ('ingredients', 'instructions', 'cooking_time')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)  # This makes this section collapsible
        }),
    )
    # Make timestamp fields read-only since they're auto-generated
    readonly_fields = ('created_at', 'updated_at')

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author', 'recipe', 'content_preview', 'created_at')
    list_filter = ('created_at', 'author')
    search_fields = ('content', 'author__username', 'recipe__title')
    readonly_fields = ('created_at', 'updated_at')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Comment'

@admin.register(DifficultyRating)
class DifficultyRatingAdmin(admin.ModelAdmin):
    list_display = ('rating_author', 'recipe', 'rating', 'created_at')
    list_filter = ('created_at', 'rating_author')
    search_fields = ('rating', 'author__username', 'recipe__title')
    readonly_fields = ('created_at', 'updated_at')
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Rating'