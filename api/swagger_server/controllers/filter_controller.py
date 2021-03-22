"""
filter_controller.py COPYRIGHT FUJITSU LIMITED 2021
"""
import json
import requests

from swagger_server.models.error_response import ErrorResponse  # noqa: E501
from swagger_server.models.pos_filter import PosFilter  # noqa: E501
from swagger_server.models.success_response import SuccessResponse  # noqa: E501
from swagger_server import util

HEADER = {
    "Content-Type": "application/json"
}
POSTGREST_BASE_URL = 'http://dbrest:3000/'
POS_TABLE = 'part_of_speech_filter'


def get_filter_data():  # noqa: E501
    """Get part of speech filter data.

     # noqa: E501


    :rtype: PosFilter
    """
    # print('[get_filter_data] start.')
    psg_res = requests.get(POSTGREST_BASE_URL + POS_TABLE, headers=HEADER)
    try:
        psg_res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print('[get_filter_data] error code:', end="")
        print(psg_res.status_code, ', reason:', psg_res.reason)
        return ErrorResponse(0, psg_res.reason), psg_res.status_code

    posFilter = json.loads(psg_res.text)[0]
    # print(posFilter)

    # print('[get_filter_data] end.')
    return PosFilter(posFilter['noun'], posFilter['verb'],
                     posFilter['adjective'], posFilter['adverb'],
                     posFilter['adnominal'], posFilter['interjection'],
                     posFilter['other']), 200


def post_filter_data(body=None):  # noqa: E501
    """Post part of speech filter data.

     # noqa: E501

    :param body: Post part of speech filter data.
    :type body: dict | bytes

    :rtype: SuccessResponse
    """
    if body is not None:
        psg_res = requests.delete(POSTGREST_BASE_URL + POS_TABLE)
        try:
            psg_res.raise_for_status()
        except requests.exceptions.RequestException as e:
            return ErrorResponse(0, psg_res.reason), psg_res.status_code

        psg_res = requests.post(POSTGREST_BASE_URL + POS_TABLE, json=body)
        try:
            psg_res.raise_for_status()
        except requests.exceptions.RequestException as e:
            return ErrorResponse(0, psg_res.reason), psg_res.status_code

    return SuccessResponse('request is success.'), 200
