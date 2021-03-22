"""
example_controller.py COPYRIGHT FUJITSU LIMITED 2021
"""
from swagger_server.models.error_response import ErrorResponse  # noqa: E501
from swagger_server.models.search_success_response import SearchSuccessResponse  # noqa: E501
from swagger_server import util

import requests
import json

POSTGREST_BASE_URL = 'http://dbrest:3000/'
SEARCH_COUNT_URL = 'rpc/example_search_count_func'
SEARCH_URL = 'rpc/example_search_func'


def get_example_phrases(term, index):  # noqa: E501
    """Get example phrases

     # noqa: E501

    :param term: Get example phrases
    :type term: str
    :param index: Get example phrases
    :type index: int

    :rtype: SearchSuccessResponse
    """
    print('[get_example_phrases] start term:', term, ', index:', index)

    data = {'PGroonga': term}
    count_r = requests.post(POSTGREST_BASE_URL + SEARCH_COUNT_URL, json=data)
    try:
        count_r.raise_for_status()
    except requests.exceptions.RequestException as e:
        print('[get_example_phrases] error code:', end="")
        print(count_r.status_code, ', reason:', count_r.reason)
        return ErrorResponse(0, count_r.reason), count_r.status_code

    result_count = json.loads(count_r.text)
    print('example_search_count_func : ', result_count)

    data = {'PGroonga': term, 'index': index}
    search_r = requests.post(POSTGREST_BASE_URL + SEARCH_URL, json=data)
    try:
        search_r.raise_for_status()
    except requests.exceptions.RequestException as e:
        print('[get_example_phrases] error code:', end="")
        print(search_r.status_code, ', reason:', search_r.reason)
        return ErrorResponse(0, search_r.reason), search_r.status_code

    print('example_search_func : ', search_r)

    search_result = json.loads(search_r.text)

    print('[get_example_phrases] end')

    return SearchSuccessResponse(result_count, search_result), 200
