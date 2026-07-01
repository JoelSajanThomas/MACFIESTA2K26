from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from events.models import Event
from registrations.models import Registration
from results.models import Result
from gallery.models import GalleryImage


@api_view(['GET'])
def dashboard_stats(request):
    data = {
        "total_events": Event.objects.count(),
        "total_registrations": Registration.objects.count(),
        "total_results": Result.objects.count(),
        "total_gallery_images": GalleryImage.objects.count(),
    }
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
    })