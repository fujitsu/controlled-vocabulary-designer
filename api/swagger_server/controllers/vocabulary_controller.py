"""
vocabulary_controller.py COPYRIGHT FUJITSU LIMITED 2021
"""
# -*- coding: utf-8 -*-

import json
import requests

from swagger_server.models.editing_vocabulary import EditingVocabulary  # noqa: E501
from swagger_server.models.editing_vocabulary_meta import EditingVocabularyMeta  # noqa: E501
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
TERM_BLANK_MARK = '_TERM_BLANK_'

def get_vocabulary_data(file_type):  # noqa: E501
    """Get vocabulary data by type

     # noqa: E501

    :param file_type: Specify for editing_vocabulary, reference_vocabulary1, etc. When editing_vocabulary is set, it gets editing vocabulary data. When reference_vocabulary1 is set, it gets reference vocabulary1 data. When reference_vocabulary2 is set, it gets reference vocabulary2 data. When reference_vocabulary3 is set, it gets reference vocabulary3 data. 
    :type file_type: str

    :rtype: GetAllSuccessResponse
    """

    reference_vocabulary = []
    editing_vocabulary = []
    editing_vocabulary_meta = []

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
    
    elif file_type == 'editing_vocabulary_meta':
        exec_sql = _create_select_sql(file_type)
        exec_res, status_code = _exec_get_postgrest(exec_sql)
        if not status_code == 200:
            return ErrorResponse(0, exec_res['message']), status_code

        editing_vocabulary_meta = exec_res['result']
    

    else:
        print('[get_vocabulary_data] invalid param ', file_type)
        return ErrorResponse(0, 'Invalid parameter.'), 400

    return GetAllSuccessResponse(editing_vocabulary, editing_vocabulary_meta ,reference_vocabulary), 200


def get_vocabulary_term(file_type, term):  # noqa: E501
    """Get editing vocabulary term

     # noqa: E501

    :param file_type: Specify only editing_vocabulary.  It gets editing vocabulary data. 
    :type file_type: str
    :param term: Specify the term to request. 
    :type term: str

    :rtype: EditingVocabulary
    """
    if file_type == 'editing_vocabulary':

        editing_vocabulary = None

        exec_sql = _create_select_sql(file_type, term)
        exec_res, status_code = _exec_get_postgrest(exec_sql)
        if not status_code == 200:
            return ErrorResponse(0, exec_res['message']), status_code

        if len(exec_res['result']) != 0:
            editing_vocabulary = exec_res['result'][0]

        return EditingVocabulary(editing_vocabulary), 200

    elif file_type == 'editing_vocabulary_meta':
    
        editing_vocabulary_meta = None

        exec_sql = _create_select_sql(file_type, term)
        exec_res, status_code = _exec_get_postgrest(exec_sql)
        if not status_code == 200:
            return ErrorResponse(0, exec_res['message']), status_code

        if len(exec_res['result']) != 0:
            editing_vocabulary_meta = exec_res['result'][0]

        return EditingVocabularyMeta(editing_vocabulary_meta), 200

    else:
        print('[get_vocabulary_term] invalid param ', file_type)
        return ErrorResponse(0, 'Invalid parameter.'), 400


def post_vocabulary_term(body, file_type, term):  # noqa: E501
    """Add or Update editing vocabulary terms

     # noqa: E501

    :param body: 
    :type body: list | bytes
    :param file_type: Specify only editing_vocabulary. It gets editing vocabulary data.   
    :type file_type: str
    :param term: Specify the update term
    :type term: str

    :rtype: List[EditingVocabulary]
    """

    if file_type == 'editing_vocabulary':
        # Objects may be included and numbering cannot be used     
        index = 0
        for item in body:
            payload = _create_update_payload(item, index)

            if 'id' in item:
                # update data.
                update_sql = _create_update_sql(file_type, item['id'])
                exec_res, status_code = _exec_update_postgrest(payload, update_sql)
                if not status_code == 200:
                    return exec_res, status_code
            else:
                # not exist data.
                print('[post_vocabulary_term] invalid data id ', file_type)
                return ErrorResponse(0, 'Invalid  data id.'), 400
            index = index + 1

        editing_vocabulary = []
        exec_res, status_code = _exec_get_postgrest('editing_vocabulary')
        if not status_code == 200:
            return ErrorResponse(0, exec_res['message']), status_code

        editing_vocabulary = exec_res['result']

        return editing_vocabulary, 200

    elif file_type == 'editing_vocabulary_meta':
        for item in body:
            payload = _create_updatemeta_payload(item)

            if 'id' in item:
                # update data.
                update_sql = _create_update_sql(file_type, item['id'])
                exec_res, status_code = _exec_update_postgrest(payload, update_sql)
                if not status_code == 200:
                    return exec_res, status_code
            else:
                # not exist data.
                print('[post_vocabulary_meta_term] invalid data id ', file_type)
                return ErrorResponse(0, 'Invalid data id.'), 400

        editing_vocabulary_meta = []
        exec_res, status_code = _exec_get_postgrest('editing_vocabulary_meta')
        if not status_code == 200:
            return ErrorResponse(0, exec_res['message']), status_code

        editing_vocabulary_meta = exec_res['result']

        return editing_vocabulary_meta, 200
    else:
        print('[post_vocabulary_meta_term] invalid param ', file_type)
        return ErrorResponse(0, 'Invalid parameter.'), 400

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

    elif file_type == 'editing_vocabulary_meta':
        ret_sql = 'editing_vocabulary_meta'
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

    elif file_type == 'editing_vocabulary_meta':
        ret_sql = 'editing_vocabulary_meta'
        ret_sql = ret_sql + '?id=eq.' + str(id)

    return ret_sql


def _create_update_payload(target_data, index):

    update_data = {}
    update_data['term'] = target_data['term']\
        if len(target_data['term']) != 0 else TERM_BLANK_MARK + str(index)
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

def _create_updatemeta_payload(target_data):

    update_data = {}
    update_data['meta_name'] = target_data['meta_name']
    update_data['meta_enname'] = target_data['meta_enname']
    update_data['meta_version'] = target_data['meta_version']
    update_data['meta_prefix'] = target_data['meta_prefix']
    update_data['meta_uri'] = target_data['meta_uri']
    update_data['meta_description'] = target_data['meta_description']
    update_data['meta_endescription'] = target_data['meta_endescription']
    update_data['meta_author'] = target_data['meta_author']

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


