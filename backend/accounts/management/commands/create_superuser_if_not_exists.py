"""
Management command to create a superuser from environment variables.
This is useful for automated deployments (like Render) where terminal access is not available.
"""
import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Create a superuser from environment variables if one does not exist'

    def handle(self, *args, **options):
        User = get_user_model()
        
        # Get credentials from environment variables
        username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.getenv('DJANGO_SUPERUSER_EMAIL')
        password = os.getenv('DJANGO_SUPERUSER_PASSWORD')
        name = os.getenv('DJANGO_SUPERUSER_NAME', 'Admin User')
        
        if not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    'DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD must be set. '
                    'Skipping superuser creation.'
                )
            )
            return
        
        # Check if superuser already exists by username or email
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.SUCCESS(f'Superuser "{username}" already exists.')
            )
            return
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.SUCCESS(f'User with email {email} already exists.')
            )
            return
        
        # Create the superuser
        try:
            user = User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                name=name
            )
            self.stdout.write(
                self.style.SUCCESS(f'Superuser "{username}" ({email}) created successfully!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error creating superuser: {e}')
            )
