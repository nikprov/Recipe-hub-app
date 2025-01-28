# recipe_hub_backend/views.py
from django.views.generic import TemplateView
from django.conf import settings
import os

class HomeView(TemplateView):
    """
    View for the API homepage that provides links to all available endpoints
    and documentation resources.
    """
    template_name = 'home.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add debug information to context
        context['debug'] = {
            'template_dirs': settings.TEMPLATES[0]['DIRS'],
            'template_path': os.path.join(settings.BASE_DIR, 'templates', self.template_name),
            'template_exists': os.path.exists(os.path.join(settings.BASE_DIR, 'templates', self.template_name))
        }
        return context

    def get_template_names(self):
        """Override to add debugging if template isn't found"""
        try:
            return [self.template_name]
        except Exception as e:
            print(f"Template error: {str(e)}")
            print(f"Looking for template in: {settings.TEMPLATES[0]['DIRS']}")
            raise