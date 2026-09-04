from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from config.permissions import IsAdminOrReadOnly
from events.models import Event
from accounts.models import AuditLog
from .models import Result
from .serializers import ResultSerializer


def _is_staff(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)


class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.select_related("event").all()
    serializer_class = ResultSerializer
    permission_classes = [IsAdminOrReadOnly]
    required_module = "results"

    def get_queryset(self):
        qs = super().get_queryset()
        if not _is_staff(self.request.user):
            qs = qs.filter(event__is_result_published=True)
        return qs

    @action(detail=False, methods=["post"], url_path="clear-all")
    def clear_all(self, request):
        if not _is_staff(request.user):
            return Response({"detail": "Staff access required."}, status=status.HTTP_403_FORBIDDEN)
        count = Result.objects.count()
        Result.objects.all().delete()
        Event.objects.filter(is_result_published=True).update(is_result_published=False)
        AuditLog.objects.create(
            user=request.user,
            action="CLEAR_ALL_RESULTS",
            module="results",
            ip_address=request.META.get("REMOTE_ADDR"),
            details=f"Cleared all {count} event results.",
        )
        return Response({
            "success": True,
            "message": f"All {count} event results have been cleared.",
            "deleted_count": count,
        })
