from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            'success': False,
            'message': response.data.get('detail', str(exc)) if isinstance(response.data, dict) else str(exc),
            'errors': response.data
        }
        response.data = custom_data
    else:
        response = Response({
            'success': False,
            'message': 'An unexpected server error occurred.',
            'errors': str(exc)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
