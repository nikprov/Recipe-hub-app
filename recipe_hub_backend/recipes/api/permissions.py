# recipe_hub_backend\recipes\api\permissions.py

'''
Here we have the permissions that define the access on various backend 
endpoints. 
They are used individually or together on occasion to deliver the desired access.
e.g. see the CustomRegisterView 
'''

from rest_framework import permissions

class IsAdminUserOrReadOnly(permissions.IsAdminUser):

    def has_permission(self, request, view):
        is_admin = super().has_permission(request, view)
        return request.method in permissions.SAFE_METHODS or is_admin
    

class IsNotAuthenticated(permissions.BasePermission):
    """
    Custom permission class that only allows unauthenticated users to access the view.
    This is particularly useful for registration endpoints where we want to prevent
    already logged-in users from creating new accounts.
    """
    def has_permission(self, request, view):
        # Return True (allow access) only if the user is not authenticated
        return not request.user.is_authenticated
    

class IsAuthorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow authors of an object to edit or delete it.
    Handles both Recipe/Comment (author field) and DifficultyRating (rating_author field).
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True

        # Admin users can delete any object
        if request.method == 'DELETE' and request.user.is_staff:
            return True

        # Write permissions are only allowed to the author
        # Handle both 'author' and 'rating_author' fields
        if hasattr(obj, 'author'):
            return obj.author == request.user
        elif hasattr(obj, 'rating_author'):
            return obj.rating_author == request.user
        
        return False