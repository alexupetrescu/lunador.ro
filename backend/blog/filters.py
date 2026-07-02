from django.contrib.postgres.search import SearchQuery, SearchRank
from rest_framework.filters import BaseFilterBackend


class PostgresSearchFilter(BaseFilterBackend):
    """Full-text search against the precomputed ``search_vector`` column.

    Uses ``websearch`` query parsing (quotes, OR, -exclude) and orders by
    relevance. Falls through untouched when no ``search`` param is supplied.
    """

    search_param = "search"

    def filter_queryset(self, request, queryset, view):
        term = request.query_params.get(self.search_param, "").strip()
        if not term:
            return queryset
        query = SearchQuery(term, search_type="websearch")
        return (
            queryset.filter(search_vector=query)
            .annotate(rank=SearchRank("search_vector", query))
            .order_by("-rank", "-published_at")
        )

    def get_schema_operation_parameters(self, view):
        return [
            {
                "name": self.search_param,
                "required": False,
                "in": "query",
                "description": "Full-text search term",
                "schema": {"type": "string"},
            }
        ]
