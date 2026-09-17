from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.exceptions import ValidationError as DRFValidationError


def custom_exception_handler(exc, context):
    if isinstance(exc, DjangoValidationError):
        exc = DRFValidationError(detail=exc.messages)
    return drf_exception_handler(exc, context)
