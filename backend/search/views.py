from rest_framework.views import APIView
from .serailizers import RepoResultSerializer,IssueResultSerializer,UserResultSerializer,WikiResultSerializer
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework import status
from .services import SEARCH_MAP


SERIALIZER_MAP = {
    'repositories': RepoResultSerializer,
    'issues': IssueResultSerializer,
    'users': UserResultSerializer,
    'wiki_pages': WikiResultSerializer,
}


class SearchView(APIView):
  permission_classes=[permissions.IsAuthenticated]
  def get (self,request):
    query_text=request.query_params.get('q','').strip()
    search_type=request.query_params.get('type')

    if not query_text:
      return Response({"error": "Query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST)
    if search_type:
      if search_type not in SEARCH_MAP:
        return Response( {"error": f"Invalid type. Choose from: {', '.join(SEARCH_MAP.keys())}"},
                    status=status.HTTP_400_BAD_REQUEST)
      types_to_search=[search_type]
    else:
      types_to_search=list(SEARCH_MAP.keys())

    results={}
    for t in types_to_search:
      search_func,result_key=SEARCH_MAP[t]
      queryset = search_func(query_text)
      serializer_class = SERIALIZER_MAP[result_key]
      results[result_key] = serializer_class(queryset, many=True).data

    return Response(results)


