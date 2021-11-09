"""
vocabulary_controller.py COPYRIGHT FUJITSU LIMITED 2021
"""
# -*- coding: utf-8 -*-

import json
import requests

from swagger_server.models.editing_vocabulary import EditingVocabulary  # noqa: E501
from swagger_server.models.error_response import ErrorResponse  # noqa: E501
from swagger_server.models.get_all_success_response import GetAllSuccessResponse  # noqa: E501
from swagger_server import util

HEADER = {
    "Content-Type": "application/json"
}

POSTGREST_BASE_URL = 'http://dbrest:3000/'
REFERENCE_VOCABULARY = ['reference_vocabulary1',
                        'reference_vocabulary2',
                        'reference_vocabulary3']


def delete_vocabulary_term(body, file_type):  # noqa: E501
    """Delete editing vocabulary term

     # noqa: E501

    :param body: Specify the term id to request.

    :type body: List[]
    :param file_type: Specify only editing_vocabulary.   &#x27;editing_vocabulary&#x27; get editing vocabulary data.
    :type file_type: str

    :rtype: List[EditingVocabulary]
    """

    print('[delete_vocabulary_term] file_type :', file_type, ', body :', body)

    if not file_type == 'editing_vocabulary':
        print('[post_vocabulary_term] error. invalid param', file_type)
        return ErrorResponse(0, 'Invalid parameter.'), 400

    for id in body:
        delete_sql = _create_delete_sql(file_type, id)
        print('[delete_vocabulary_term] delete_sql :', delete_sql)
        exec_res, status_code = _exec_delete_postgrest(delete_sql)
        if not status_code == 200:
            return exec_res, status_code

    editing_vocabulary = []
    exec_res, status_code = _exec_get_postgrest('editing_vocabulary')
    if not status_code == 200:
        return ErrorResponse(0, exec_res['message']), status_code

    editing_vocabulary = exec_res['result']

    return editing_vocabulary, 200


def get_vocabulary_data(file_type):  # noqa: E501
    """Get vocabulary data by type

     # noqa: E501

    :param file_type: Specify for editing_vocabulary, reference_vocabulary1, etc.   &#x27;editing_vocabulary&#x27; get editing vocabulary data.   &#x27;reference_vocabulary1&#x27; get reference vocabulary1 data.   &#x27;reference_vocabulary2&#x27; get reference vocabulary2 data.   &#x27;reference_vocabulary3&#x27; get reference vocabulary3 data.
    :type file_type: str

    :rtype: GetAllSuccessResponse
    """

    reference_vocabulary = []
    editing_vocabulary = []

    if file_type in REFERENCE_VOCABULARY:
        exec_sql = _create_select_sql(file_type)
        exec_res, status_code = _exec_get_postgrest(exec_sql)
        if not status_code == 200:
            return ErrorResponse(0, exec_res['message']), status_code

        reference_vocabulary = exec_res['result']

    elif file_type == 'editing_vocabulary':
        exec_sql = _create_select_sql(file_type)
        exec_res, status_code = _exec_get_postgrest(exec_sql)
        if not status_code == 200:
            return ErrorResponse(0, exec_res['message']), status_code

        editing_vocabulary = exec_res['result']

    else:
        print('[get_vocabulary_data] invalid param ', file_type)
        return ErrorResponse(0, 'Invalid parameter.'), 400

    return GetAllSuccessResponse(editing_vocabulary, reference_vocabulary), 200


def get_vocabulary_term(file_type, term):  # noqa: E501
    """Get editing vocabulary term

     # noqa: E501

    :param file_type: Specify only editing_vocabulary.   &#x27;editing_vocabulary&#x27; get editing vocabulary data.
    :type file_type: str
    :param term: Specify the term to request.
    :type term: str

    :rtype: EditingVocabulary
    """
    if not file_type == 'editing_vocabulary':
        print('[get_vocabulary_term] error. invalid param', file_type)
        return ErrorResponse(0, 'Invalid parameter.'), 400

    editing_vocabulary = None

    exec_sql = _create_select_sql(file_type, term)
    exec_res, status_code = _exec_get_postgrest(exec_sql)
    if not status_code == 200:
        return ErrorResponse(0, exec_res['message']), status_code

    if len(exec_res['result']) != 0:
        editing_vocabulary = exec_res['result'][0]

    return EditingVocabulary(editing_vocabulary), 200


def post_vocabulary_term(body, file_type, term):  # noqa: E501
    """Add or Update editing vocabulary terms

     # noqa: E501

    :param body:
    :type body: list | bytes
    :param file_type: Specify only editing_vocabulary.   &#x27;editing_vocabulary&#x27; get editing vocabulary data.
    :type file_type: str
    :param term: Specify the update term
    :type term: str

    :rtype: List[EditingVocabulary]
    """

    # print('[post_vocabulary_term] file_type :', file_type )
    # print('[post_vocabulary_term] term :', term )

    if not file_type == 'editing_vocabulary':
        print('[post_vocabulary_term] error. invalid param', file_type)
        return ErrorResponse(0, 'Invalid parameter.'), 400

    for item in body:
        # print('[post_vocabulary_term] item :', item )
        payload = _create_update_payload(item)
        # print('[post_vocabulary_term] payload :', payload )

        if 'id' in item:
            # update data.
            update_sql = _create_update_sql(file_type, item['id'])
            exec_res, status_code = _exec_update_postgrest(payload, update_sql)
            if not status_code == 200:
                return exec_res, status_code
        else:
            # add data.
            exec_res, status_code = \
                _exec_insert_postgrest(payload, 'editing_vocabulary')
            if not status_code == 200:
                return exec_res, status_code

    editing_vocabulary = []
    exec_res, status_code = _exec_get_postgrest('editing_vocabulary')
    if not status_code == 200:
        return ErrorResponse(0, exec_res['message']), status_code

    editing_vocabulary = exec_res['result']

    return editing_vocabulary, 200


def _create_select_sql(file_type, term=None):

    ret_sql = ''

    if file_type in REFERENCE_VOCABULARY:
        if file_type == 'reference_vocabulary1':
            ret_sql = 'reference_vocabulary_1'
        elif file_type == 'reference_vocabulary2':
            ret_sql = 'reference_vocabulary_2'
        else:
            ret_sql = 'reference_vocabulary_3'

    elif file_type == 'editing_vocabulary':
        ret_sql = 'editing_vocabulary'
        if term is not None:
            ret_sql = ret_sql + '?term=eq.' + term

    return ret_sql


def _create_update_sql(file_type, id):

    ret_sql = ''

    if file_type in REFERENCE_VOCABULARY:
        if file_type == 'reference_vocabulary1':
            ret_sql = 'reference_vocabulary_1'
        elif file_type == 'reference_vocabulary2':
            ret_sql = 'reference_vocabulary_2'
        else:
            ret_sql = 'reference_vocabulary_3'

    elif file_type == 'editing_vocabulary':
        ret_sql = 'editing_vocabulary'
        ret_sql = ret_sql + '?id=eq.' + str(id)

    return ret_sql


def _create_delete_sql(file_type, id):

    ret_sql = ''
    ret_sql = file_type + '?id=eq.' + str(id)

    return ret_sql


def _create_update_payload(target_data):

    update_data = {}
    update_data['term'] = target_data['term']
    update_data['preferred_label'] = target_data['preferred_label']
    update_data['language'] = target_data['language']
    update_data['uri'] = target_data['uri']
    update_data['broader_term'] = target_data['broader_term']
    update_data['other_voc_syn_uri'] = target_data['other_voc_syn_uri']
    update_data['term_description'] = target_data['term_description']
    update_data['created_time'] = target_data['created_time']
    update_data['modified_time'] = target_data['modified_time']
    update_data['synonym_candidate'] = \
        target_data['synonym_candidate'] \
        if len(target_data['synonym_candidate']) != 0 else []
    update_data['broader_term_candidate'] = \
        target_data['broader_term_candidate'] \
        if len(target_data['broader_term_candidate']) != 0 else []
    update_data['position_x'] = target_data['position_x']
    update_data['position_y'] = target_data['position_y']
    update_data['color1'] = target_data['color1']
    update_data['color2'] = target_data['color2']
    update_data['hidden'] = target_data['hidden']
    update_data['confirm'] = target_data['confirm']

    return update_data


def _exec_get_postgrest(target_table):

    response_data = {}

    psg_res = requests.get(POSTGREST_BASE_URL + target_table, headers=HEADER)
    try:
        psg_res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print('[_exec_get_postgrest] error code:', end="")
        print(psg_res.status_code, ', reason:', psg_res.reason)
        response_data['message'] = psg_res.reason
        return response_data, psg_res.status_code

    response_data['result'] = json.loads(psg_res.text)
    return response_data, 200


def _exec_update_postgrest(payload, url):

    response_data = {}

    psg_res = requests.patch(POSTGREST_BASE_URL + url,
                             headers=HEADER,
                             data=json.dumps(payload))
    try:
        psg_res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print('[_exec_update_postgrest] error code:', end="")
        print(psg_res.status_code, ', reason:', psg_res.reason)
        response_data['message'] = psg_res.reason
        return response_data, psg_res.status_code

    return response_data, 200


def _exec_insert_postgrest(payload, url):

    response_data = {}

    psg_res = requests.post(POSTGREST_BASE_URL + url,
                            headers=HEADER,
                            data=json.dumps(payload))
    try:
        psg_res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print('[_exec_insert_postgrest] error code:', end="")
        print(psg_res.status_code, ', reason:', psg_res.reason)
        response_data['message'] = psg_res.reason
        return response_data, psg_res.status_code

    return response_data, 200


def _exec_delete_postgrest(url):

    response_data = {}

    psg_res = requests.delete(POSTGREST_BASE_URL + url)
    try:
        psg_res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print('[_exec_delete_postgrest] error code:', end="")
        print(psg_res.status_code, ', reason:', psg_res.reason)
        response_data['message'] = psg_res.reason
        return response_data, psg_res.status_code

    return response_data, 200
