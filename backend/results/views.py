from rest_framework import viewsets

from config.permissions import IsAdminOrReadOnly
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
