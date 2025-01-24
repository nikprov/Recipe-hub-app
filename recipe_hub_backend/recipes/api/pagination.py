# recipe_hub_backend\recipes\api\pagination.py

from rest_framework.pagination import PageNumberPagination

class SmallSetPagination(PageNumberPagination):
    page_size = 10

