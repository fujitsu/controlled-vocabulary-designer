"""
file_controller.py COPYRIGHT FUJITSU LIMITED 2021
"""
# -*- coding: utf-8 -*-

import json
import pandas as pd
import numpy as np
import pathlib
import requests
import rdflib
import os
import tempfile
import inspect
import datetime
import psycopg2
from psycopg2 import extras

from flask import jsonify, make_response
from swagger_server.models.check_error_response import CheckErrorResponse  # noqa: E501
from swagger_server.models.error_response import ErrorResponse  # noqa: E501
from swagger_server.models.success_response import SuccessResponse  # noqa: E501

HEADER = {
    "Content-Type": "application/json"
}

POSTGREST_BASE_URL = 'http://dbrest:3000/'
REFERENCE_VOCABULARY = ['reference_vocabulary1',
                        'reference_vocabulary2',
                        'reference_vocabulary3']
VOCABULARY_ALLOWED_EXTENSIONS = ['.csv']
VOCABULARY_ALLOWED_LANGUAGE = ['ja', 'en']
VOCABULARY_ALLOWED_COLOR1 = ['black', 'red', 'orange', 'green', 'blue','purple']
VOCABULARY_ALLOWED_COLOR2 = ['black', 'red', 'orange', 'green', 'blue','purple']
REFERENCE_FORMAT = ['n3', 'nt', 'turtle', 'xml', 'nquads', 'trix']
REFERENCE_FORMAT_JSON = ['jsonld']
REFERENCE_FORMAT_EDIT = ['csv']
XLSX_MIMETYPE = 'application/'\
                'vnd.openxmlformats-officedocument.spreadsheetml.sheet'
SPLIT_COUNT = 10000
DB_CONNECT = 'postgres://commonvocabulary:commonvocabulary@db:5432'
WORK_PATH = '/tmp/work/'
MAX_FILE_CNT = 5
DEF_WORK_MEM = '65536'
UPD_WORK_MEM = '524288'
TERM_BLANK_MARK = '_TERM_BLANK_'

def location(depth=0):
    frame = inspect.currentframe().f_back
    return os.path.basename(frame.f_code.co_filename),\
        frame.f_code.co_name, frame.f_lineno


def download_file(file_type, out_format):  # noqa: E501
    """Download the file from the server

     # noqa: E501

    :param file_type: Specify for editing_vocabulary or editing_vocabulary_meta or controlled_vocabulary. It downloads the selected file. 
    :type file_type: str
    :param out_format: Specify the file format. When editing_vocabulary is set, the format is csv. when controlled_vocabulary is set, the format is n3, nquads, nt, trix, turtle, xml, json-ld. 
    :type out_format: str

    :rtype: str
    """
    print('file_type:'+file_type+' out_format:'+out_format)

    editing_vocabulary = []
    editing_vocabulary_meta = []

    if file_type == 'editing_vocabulary':
        exec_sql = _create_select_sql(file_type)
        exec_res, status_code = _exec_get_postgrest(exec_sql)
        if not status_code == 200:
            return ErrorResponse(0, exec_res.message), status_code

        editing_vocabulary = exec_res['result']
        if len(editing_vocabulary) <= 0:
            return ErrorResponse(0, 'Download file not found.'), 404
        # json to csv
        ret_serialize =\
            _download_file_ev_serialize(editing_vocabulary, out_format)
        
    if file_type == 'controlled_vocabulary':
        exec_sql = _create_select_sql('editing_vocabulary')
        exec_sql_meta = _create_select_sql('editing_vocabulary_meta')
        exec_res, status_code = _exec_get_postgrest(exec_sql)
        exec_res_meta, status_code_meta = _exec_get_postgrest(exec_sql_meta)
        if not status_code == 200:
            return ErrorResponse(0, exec_res.message), status_code
        if not status_code_meta == 200:
            return ErrorResponse(0, exec_res_meta.message), status_code_meta

        editing_vocabulary = exec_res['result']
        editing_vocabulary_meta = exec_res_meta['result']
        if len(editing_vocabulary) <= 0:
            return ErrorResponse(0, 'Download file not found.'), 404
        if len(editing_vocabulary_meta) <= 0:
            return ErrorResponse(0, 'Download file not found.'), 404
        # Graph
        ret_graph = _download_file_make(editing_vocabulary, editing_vocabulary_meta)
        ret_serialize = _download_file_serialize(ret_graph, out_format)

    if file_type == 'editing_vocabulary_meta':
        exec_sql = _create_select_sql(file_type)
        exec_res, status_code = _exec_get_postgrest(exec_sql)
        if not status_code == 200:
            return ErrorResponse(0, exec_res.message), status_code

        editing_vocabulary_meta = exec_res['result']
        if len(editing_vocabulary_meta) <= 0:
            return ErrorResponse(0, 'Download file not found.'), 404
         # json to csv
        ret_serialize =\
            _download_meta_file_ev_serialize(editing_vocabulary_meta, out_format)

    return ret_serialize


def upload_file(editing_vocabulary=None, editing_vocabulary_meta=None, reference_vocabulary1=None, reference_vocabulary2=None, reference_vocabulary3=None):  # noqa: E501
    """Upload the file to the server

    Uploads the file selected by the client to the server. When editing_vocabulary is uploaded, its check integrity.  # noqa: E501

    :param editing_vocabulary: 
    :type editing_vocabulary: strstr
    :param editing_vocabulary_meta: 
    :type editing_vocabulary_meta: strstr
    :param reference_vocabulary1: 
    :type reference_vocabulary1: strstr
    :param reference_vocabulary2: 
    :type reference_vocabulary2: strstr
    :param reference_vocabulary3: 
    :type reference_vocabulary3: strstr

    :rtype: SuccessResponse
    """
    # prefix
    uri_prefix = ""

    if editing_vocabulary_meta is not None:
        # extension check
        allow_extension, r_ext =\
            _check_extensions(editing_vocabulary_meta,
                              VOCABULARY_ALLOWED_EXTENSIONS)
        if not allow_extension:
            print(datetime.datetime.now(),
                  '[Error] failed _check_extensions', location())
            return ErrorResponse(0, 'Data Format Error.'), 400

        # read file
        df = _read_file_storage(editing_vocabulary_meta)
        # Check columns
        exec_res, status_code, df = _check_columns_meta(df)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_columns_meta',
                  location())
            return exec_res, status_code

        uri_prefix = df['語彙のURI'][0]
        if uri_prefix[-1:] == '/':
            pass
        else:
            uri_prefix = uri_prefix + '/'

        # Payload make to upload to database by REST API
        payload = _make_bulk_data_editing_vocabulary_meta(df)

        exec_res, status_code =\
            _exec_insert_postgrest(payload, 'editing_vocabulary_meta')

    if editing_vocabulary is not None:
        file_type = 0
        if editing_vocabulary_meta is None:
            # something is wrong
            return CheckErrorResponse(-1, 0, 'upload editing voc and meta together', file_type), 411
        allow_extension, r_ext =\
            _check_extensions(editing_vocabulary,
                              VOCABULARY_ALLOWED_EXTENSIONS)
        if not allow_extension:
            print(datetime.datetime.now(),
                  '[Error] failed _check_extensions', location())
            return ErrorResponse(0, 'Data Format Error.'), 400
        
        df = _read_file_storage(editing_vocabulary)

        # Check columns
        exec_res, status_code, df = _check_columns(df)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_columns',
                  location())
            return exec_res, status_code
        # uri must starts with meta_uri 
        # phase 4, reasn 0
        exec_res, status_code = _check_uri_startswith_prefix(df, uri_prefix, file_type)
        if not status_code == 200:
            print(datetime.datetime.now(),
                    '[Error] failed _check_uri_startswith_prefix',
                    location())
            return exec_res, status_code
        # the empty cell or cells with white spaces are detected the above
        # broader_term must start with prefix
        # phase 5, reason 0
        exec_res, status_code = _check_broader_term_startswith_prefix(df, uri_prefix, file_type)
        if not status_code == 200:
            print(datetime.datetime.now(),
                    '[Error] failed __check_broader_term_startswith_prefix',
                    location())
            return exec_res, status_code
        # the empty cell or cells with white spaces are detected the above

        # check inconsistencies
        exec_res, status_code, df = _check_inconsistencies_vocs(df, file_type)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_inconsistencies_vocs',
                  location())
            return exec_res, status_code

        # Payload-make to upload to database by REST API
        payload = _make_bulk_data_editing_vocabulary(df)

        exec_res, status_code =\
            _exec_insert_postgrest(payload, 'editing_vocabulary')
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _exec_insert_postgrest', location())
            return exec_res, status_code
    
    if reference_vocabulary1 is not None:
        file_type = 1
        allow_extension, r_ext =\
            _check_extensions(reference_vocabulary1,
                              VOCABULARY_ALLOWED_EXTENSIONS)
        if not allow_extension:
            print(datetime.datetime.now(),
                  '[Error] failed _check_extensions', location())
            return ErrorResponse(0, 'Data Format Error.'), 400
        
        # read file
        df = _read_file_storage(reference_vocabulary1)
        # Check columns
        exec_res, status_code, df = _check_columns_ref(df, 1)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_columns_ref',
                  location())
            return exec_res, status_code
        # check inconsistencies
        exec_res, status_code, df = _check_inconsistencies_vocs(df, file_type)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_inconsistencies_vocs',
                  location())
            return exec_res, status_code

        payload =\
            _make_bulk_data_reference_vocabulary(df)

        exec_res, status_code =\
            _exec_insert_postgrest(payload, 'reference_vocabulary_1')
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _exec_insert_postgrest',
                  location())
            return exec_res, status_code

    if reference_vocabulary2 is not None:
        file_type = 2
        allow_extension, r_ext =\
            _check_extensions(reference_vocabulary2,
                              VOCABULARY_ALLOWED_EXTENSIONS)
        if not allow_extension:
            print(datetime.datetime.now(),
                  '[Error] failed _check_extensions',
                  location())
            return ErrorResponse(0, 'Data Format Error.'), 400
        
        # read file
        df = _read_file_storage(reference_vocabulary2)
        # Check columns
        exec_res, status_code, df = _check_columns_ref(df, 2)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_columns_ref',
                  location())
            return exec_res, status_code
        # check inconsistencies
        exec_res, status_code, df = _check_inconsistencies_vocs(df, file_type)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_inconsistencies_vocs',
                  location())
            return exec_res, status_code
        payload =\
            _make_bulk_data_reference_vocabulary(df)

        exec_res, status_code =\
            _exec_insert_postgrest(payload, 'reference_vocabulary_2')
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _exec_insert_postgrest',
                  location())
            return exec_res, status_code

    if reference_vocabulary3 is not None:
        file_type=3
        allow_extension, r_ext =\
            _check_extensions(reference_vocabulary3,
                              VOCABULARY_ALLOWED_EXTENSIONS)
        if not allow_extension:
            print(datetime.datetime.now(),
                  '[Error] failed _check_extensions',
                  location())
            return ErrorResponse(0, 'Data Format Error.'), 400

        # read file
        df = _read_file_storage(reference_vocabulary3)
        # Check columns
        exec_res, status_code, df = _check_columns_ref(df, 3)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_columns_ref',
                  location())
            return exec_res, status_code
        # check inconsistencies
        exec_res, status_code, df = _check_inconsistencies_vocs(df, file_type)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_inconsistencies_vocs',
                  location())
            return exec_res, status_code
        payload =\
            _make_bulk_data_reference_vocabulary(df)

        exec_res, status_code =\
            _exec_insert_postgrest(payload, 'reference_vocabulary_3')
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _exec_insert_postgrest',
                  location())
            return exec_res, status_code

    return SuccessResponse('request is success.')



def _check_inconsistencies_vocs(df, file_type):
    # values of lang must be ja or en or empty (which contains white spaces)
    # phase 3, reason 0
    exec_res, status_code = _check_lang_val(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_lang_val',
                location())
        return exec_res, status_code, df

    # fill lang cell with 'ja'
    # term_colname ='用語名'
    lang_colname = '言語'
    df.loc[df[lang_colname].str.strip() == '', lang_colname] = 'ja'

    # At here, uri must be valid.
    
    # check all pref_label in a group that have same uri and lang are same
    # phase 2, reason 0
    exec_res, status_code = _check_pref_label_val(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_pref_label_val',
                location())
        return exec_res, status_code, df

    # check not all preferred label in a group that have same uri are empty  
    # this returns only one error if there are many groups that having empty preferred label
    # pahse 2, reason 1
    exec_res, status_code = _check_pref_label_empty(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_pref_label_empty',
                location())
        return exec_res, status_code, df
    # for a empty prefered label, term need not to be empty　

    # trim white space cells to empty string
    preferred_label_colname = '代表語'
    df.loc[ df[preferred_label_colname].str.strip()  == '', preferred_label_colname ] = ''
    
    # check there does not exist different synonim group that having same uri have same preffered label 
    # this returns only one error if there are many groups that having same preferred label
    # pahse 2, reason 2
    exec_res, status_code = _check_diff_synogroup_have_diff_pref(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_diff_synogroup_have_diff_pref',
                location())
        return exec_res, status_code, df

   
    # At here, sysnominus relations must be valid.

    # check blanck term existence condition
    # 409 phase 1, reason 0 
    exec_res, status_code = _check_blanck_term_condition(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_blanck_term_condition',
                location())
        return exec_res, status_code, df

    # trim white space cells to empty string
    term_colname = '用語名'
    df.loc[df[term_colname].str.strip()  == '', term_colname] = ''

    # check duplicated terms
    # phase 1, reason 5
    exec_res, status_code = _check_duplicated_terms(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_duplicated_terms',
                location())
        return exec_res, status_code, df

    # check broader terms are same in a synonum group
    # phase 5, reason 1
    exec_res, status_code = _check_broader_terms_same(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_broader_terms_same',
                location())
        return exec_res, status_code, df

    # check broader values are in uri
    # phase 5, reason 2
    exec_res, status_code = _check_broader_exist_in_uri(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_broader_exist_in_uri',
                location())
        return exec_res, status_code, df

    # checks loop relation between terms
    # phase 5, reason 3 (This returns only one error even if there are many)
    exec_res, status_code = _check_broader_loop_relation(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_broader_loop_relation',
                location())
        return exec_res, status_code, df

    # check other vocabulary synonimum are same in a synonum group
    # 409 phase 6, reason 0
    exec_res, status_code = _check_other_voc_syn_same(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_other_voc_syn_same',
                location())
        return exec_res, status_code, df

    # check term_description are same in a synonum group for each language
    # phase 7, reason 0 (This returns only one error even if there are many)
    exec_res, status_code = _check_term_description_same(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_term_description_same',
                location())
        return exec_res, status_code, df

    # check created time are same in a synonum group for each language
    # phase 8, reason 0 (This returns only one error even if there are many)
    exec_res, status_code = _check_created_time_same(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_created_time_same',
                location())
        return exec_res, status_code, df

    # check created time are same in a synonum group for each language
    # phase 9, reason 0 (This returns only one error even if there are many)
    exec_res, status_code = _check_modified_time_same(df, file_type)
    if not status_code == 200:
        print(datetime.datetime.now(),
                '[Error] failed _check_modified_time_same',
                location())
        return exec_res, status_code, df

    if file_type == 0: # if editing vocabulary   
        # fill values for color1 and color2
        df = _fill_color_val(df, '色1',
                    default_color='black', allowed_color=VOCABULARY_ALLOWED_COLOR1)
        df = _fill_color_val(df, '色2',
                    default_color='black', allowed_color=VOCABULARY_ALLOWED_COLOR2)

    # fill values for position_x_colname and position_y_colname
    df = _fill_pos_val(df)

    # fills cells without 0 are replaced to 1
    df = _fill_confirm_val(df)

    # parse created_time modified_time

    return SuccessResponse('request is success.'), 200, df

def _check_extensions(file, extensions):
    suffix = pathlib.Path(file.filename).suffix
    if suffix not in extensions:
        return False, suffix
    else:
        return True, suffix


def _exec_insert_postgrest(payload, url):
    if not payload:
        print('[_exec_insert_postgrest] end(payload error)',
              location(), datetime.datetime.now())
        return ErrorResponse(0, 'Data Format Error.'), 400
    else:
        psg_res = requests.delete(POSTGREST_BASE_URL + url)
        try:
            psg_res.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(e)
            print('[_exec_insert_postgrest] DELETE', url,
                  'error', psg_res.reason, location(),
                  datetime.datetime.now())
            return ErrorResponse(0, psg_res.reason), psg_res.status_code

        splitPayload = list(split_list(payload, SPLIT_COUNT))
        for i in range(len(splitPayload)):
            split = splitPayload[i]
            psg_res = requests.post(POSTGREST_BASE_URL + url,
                                    headers=HEADER, data=json.dumps(split))
            try:
                psg_res.raise_for_status()
            except requests.exceptions.RequestException as e:
                print(e)
                print(datetime.datetime.now(),
                      '[_exec_insert_postgrest] POST', url, 'error', i,
                      '.', psg_res.reason, location())
                return ErrorResponse(0, psg_res.reason), psg_res.status_code

        return SuccessResponse('request is success.'), 200


def _make_bulk_data_reference_vocabulary(df):

    payload = []
    
    for index, item in df.iterrows():
        insert_data = {}
        insert_data['term'] = item['用語名']
        if '代表語' in item:
            insert_data['preferred_label'] =\
                item['代表語'] if pd.notnull(item['代表語']) else None
        if '言語' in item:
            insert_data['language'] =\
                item['言語'] if pd.notnull(item['言語']) else None
        if '代表語のURI' in item:
            insert_data['uri'] =\
                item['代表語のURI'] if pd.notnull(item['代表語のURI']) else None
        if '上位語のURI' in item:
            insert_data['broader_term'] =\
                item['上位語のURI'] if pd.notnull(item['上位語のURI']) else None
        if '他語彙体系の同義語のURI' in item:
            insert_data['other_voc_syn_uri'] =\
                item['他語彙体系の同義語のURI'] if pd.notnull(item['他語彙体系の同義語のURI']) else None
        if '用語の説明' in item:
            insert_data['term_description'] =\
                item['用語の説明'] if pd.notnull(item['用語の説明']) else None
        if '作成日' in item:
            insert_data['created_time'] =\
                item['作成日'] if pd.notnull(item['作成日']) else None
        if '最終更新日' in item:
            insert_data['modified_time'] =\
                item['最終更新日'] if pd.notnull(item['最終更新日']) else None
        if 'x座標値' in item:
            insert_data['position_x'] =\
                item['x座標値'] if pd.notnull(item['x座標値']) else None
        if 'y座標値' in item:
            insert_data['position_y'] =\
                item['y座標値'] if pd.notnull(item['y座標値']) else None
        payload.append(insert_data)

    return payload


def _make_bulk_data_editing_vocabulary(data_frame):

    payload = []

    for index, item in data_frame.iterrows():
        insert_data = {}
        if '用語名' in item:
            insert_data['term'] = \
            item['用語名'] if pd.notnull(item['用語名']) else TERM_BLANK_MARK + str(index)
        if '代表語' in item:
            insert_data['preferred_label'] =\
                item['代表語'] if pd.notnull(item['代表語']) else None
        if '言語' in item:
            insert_data['language'] =\
                item['言語'] if pd.notnull(item['言語']) else None
        if '代表語のURI' in item:
            insert_data['uri'] =\
                item['代表語のURI'] if pd.notnull(item['代表語のURI']) else None
        if '上位語のURI' in item:
            insert_data['broader_term'] =\
                item['上位語のURI'] if pd.notnull(item['上位語のURI']) else None
        if '他語彙体系の同義語のURI' in item:
            insert_data['other_voc_syn_uri'] =\
                item['他語彙体系の同義語のURI'] if pd.notnull(item['他語彙体系の同義語のURI']) else None
        if '用語の説明' in item:
            insert_data['term_description'] =\
                item['用語の説明'] if pd.notnull(item['用語の説明']) else None
        if '作成日' in item:
            insert_data['created_time'] =\
                item['作成日'] if pd.notnull(item['作成日']) else None
        if '最終更新日' in item:
            insert_data['modified_time'] =\
                item['最終更新日'] if pd.notnull(item['最終更新日']) else None
        if '同義語候補' in item:
            insert_data['synonym_candidate'] =\
                [x.strip() for x in item['同義語候補'].split(',')]\
                if pd.notnull(item['同義語候補']) else []
        if '上位語候補' in item:
            insert_data['broader_term_candidate'] =\
                [x.strip() for x in item['上位語候補'].split(',')]\
                if pd.notnull(item['上位語候補']) else []
        if 'x座標値' in item:
            insert_data['position_x'] =\
                item['x座標値'] if pd.notnull(item['x座標値']) else None
        if 'y座標値' in item:
            insert_data['position_y'] =\
                item['y座標値'] if pd.notnull(item['y座標値']) else None
        insert_data['color1'] =\
            item['色1'] if pd.notnull(item['色1']) else None
        insert_data['color2'] =\
            item['色2'] if pd.notnull(item['色2']) else None
        insert_data['hidden'] = False
        if '確定済み用語' not in item:
            insert_data['confirm'] = 0
        else:
            insert_data['confirm'] =\
                item['確定済み用語'] if pd.notnull(item['確定済み用語']) else 0

        payload.append(insert_data)

    return payload

def _make_bulk_data_editing_vocabulary_meta(data_frame):

    payload = []

    for index, item in data_frame.iterrows():
        insert_data = {}
        insert_data['meta_name'] = item['語彙の名称']
        if '語彙の英語名称' in item:
            insert_data['meta_enname'] =\
                item['語彙の英語名称'] if pd.notnull(item['語彙の英語名称']) else None
        if 'バージョン' in item:
            insert_data['meta_version'] =\
                item['バージョン'] if pd.notnull(item['バージョン']) else None
        if '接頭語' in item:
            insert_data['meta_prefix'] =\
                item['接頭語'] if pd.notnull(item['接頭語']) else None
        if '語彙のURI' in item:
            insert_data['meta_uri'] =\
                item['語彙のURI'] if pd.notnull(item['語彙のURI']) else None
        if '語彙の説明' in item:
            insert_data['meta_description'] =\
                item['語彙の説明'] if pd.notnull(item['語彙の説明']) else None
        if '語彙の英語説明' in item:
            insert_data['meta_endescription'] =\
                item['語彙の英語説明'] if pd.notnull(item['語彙の英語説明']) else None
        if '語彙の作成者' in item:
            insert_data['meta_author'] =\
                item['語彙の作成者'] if pd.notnull(item['語彙の作成者']) else None
        payload.append(insert_data)

    return payload


def split_list(list, split_num):
    for idx in range(0, len(list), split_num):
        yield list[idx:idx + split_num]


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

    return ret_sql


def _exec_get_postgrest(target_table):

    response_data = {}

    psg_res = requests.get(POSTGREST_BASE_URL + target_table, headers=HEADER)
    try:
        psg_res.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(e)
        response_data['message'] = psg_res.reason
        return response_data, psg_res.status_code

    response_data['result'] = json.loads(psg_res.text)

    return response_data, 200


def _add_check_term(namel, bterm, term, puri):  #
    blflg = True
    wkname = [puri, bterm]
    for name in namel:
        if name[0] == bterm and name[1] == term:
            blflg = False
    if blflg:
        namel.append(wkname)


# read CSV File
def _read_file_storage(file_strage):
    # Read CSV file
    #df = pd.read_csv(file_strage, na_values="", keep_default_na=False)
    df = pd.read_csv(file_strage, na_filter=False, dtype=str)
    return df

# check column
def _check_columns(data_frame):
    # columns = '用語名 代表語 言語 代表語のURI 上位語のURI 他語彙体系の同義語のURI 用語の説明 作成日 最終更新日 同義語候補 上位語候補 x座標値 y座標値 色1 色2 確定済み用語''
    required_columns =['用語名', '代表語', '言語', '代表語のURI', '上位語のURI',
                        '他語彙体系の同義語のURI', '用語の説明', '作成日',
                        '最終更新日', '同義語候補', '上位語候補',
                        'x座標値', 'y座標値', '色1', '色2', '確定済み用語' ]
    missing_colmuns = []
    for req_col in required_columns:
        if req_col not in data_frame.columns:
            missing_colmuns.append(req_col)
    if missing_colmuns: # if it is empty
        return CheckErrorResponse(0, missing_colmuns, '',  0, 0), 411, data_frame
    data_frame = data_frame[required_columns]
    return SuccessResponse('request is success.'), 200, data_frame

# check column meta
def _check_columns_meta(data_frame):
    # columns = '語彙の名称 語彙の英語名称 バージョン 接頭語 語彙のURI 語彙の説明 語彙の英語説明 語彙の作成者'
    required_columns =['語彙の名称', '語彙の英語名称', 'バージョン', '接頭語', '語彙のURI',
                        '語彙の説明', '語彙の英語説明', '語彙の作成者']
    missing_colmuns = []
    for req_col in required_columns:
        if req_col not in data_frame.columns:
            missing_colmuns.append(req_col)
    if missing_colmuns: # if it is empty
        return CheckErrorResponse(1, missing_colmuns, '', 0, 4), 411, data_frame
    # trim colmuns if there is redundant colmns
    data_frame = data_frame[required_columns] 
    return SuccessResponse('request is success.'), 200, data_frame

# check column meta
def _check_columns_ref(data_frame, ref_num):
    # ref_num: int, the number of reference vocabulary file
    required_columns =['用語名', '代表語', '言語', '代表語のURI', '上位語のURI',
                        '他語彙体系の同義語のURI', '用語の説明', '作成日',
                        'x座標値', 'y座標値' ]
    missing_colmuns = []
    for req_col in required_columns:
        if req_col not in data_frame.columns:
            missing_colmuns.append(req_col)
    if missing_colmuns: # if it is empty
        return CheckErrorResponse(1, missing_colmuns, '',ref_num+1, ref_num), 411, data_frame
    # trim colmuns if there is redundant colmns
    data_frame = data_frame[required_columns] 
    return SuccessResponse('request is success.'), 200, data_frame

def _make_row_data_frame(term, col):
    """Make row data

    Make new vocabulary for DataFrame format at term.

    :param term:
    :type term: strstr
    :param col:
    :type col: integer

    :rtype: list
    """
    if col == 11:
        row = [
            term,
            term,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            'black',
            'black',
        ]
        return row
    elif col == 12:
        row = [
            term,
            term,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            'black',
            'black',
            0,
        ]
        return row
    elif col == 15:
        row = [
            term,
            term,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            None,
            'black',
            'black',
            0,
        ]
        return row
    else:
        return None


def _repair_broader_term(df):
    """Repair for lost broader_term.

    If broader_term is not in df, add to broader_term to df in term.

    :param df:
    :type df: DataFormat

    """
    for index, item in df.iterrows():
        broader_term = item['上位語のURI'] if pd.notnull(item['上位語のURI']) else None
        if broader_term is not None:
            resdf = df.query('用語名 == @broader_term')
            if len(resdf) == 0:
                row, col = df.shape
                # Add the broader term if it does not already exist in the vocabulary
                newRow = _make_row_data_frame(broader_term, col)
                if newRow is not None:
                    df.loc[row] = newRow















def _download_file_make(pl_simple, pl_simple_meta):
    g = rdflib.ConjunctiveGraph()
    g.bind("skos", rdflib.namespace.SKOS)
    g.bind("dct", rdflib.namespace.DCTERMS)
    g.bind("rdf", rdflib.namespace.RDF)

    # make triples
    # Base
    rtype = rdflib.namespace.RDF.type  # Type
    scon = rdflib.namespace.SKOS.Concept  # Concept
    sinscheme = rdflib.namespace.SKOS.inScheme  # inScheme
    sconceptscheme = rdflib.namespace.SKOS.ConceptScheme  # ConceptScheme
    plabel = rdflib.namespace.SKOS.prefLabel  # prefLabel
    alabel = rdflib.namespace.SKOS.altLabel  # altLabel
    broader = rdflib.namespace.SKOS.broader  # broader
    narrower = rdflib.namespace.SKOS.narrower  # narrower
    exactMatch = rdflib.namespace.SKOS.exactMatch  # exactMatch
    title = rdflib.namespace.DCTERMS.title # title
    hasVersion = rdflib.namespace.DCTERMS.hasVersion # hasVersion
    description = rdflib.namespace.DCTERMS.description # description
    creator = rdflib.namespace.DCTERMS.creator # creator
    created = rdflib.namespace.DCTERMS.created # created
    modified = rdflib.namespace.DCTERMS.modified # modified

    # add List
    namel = []
    # broader
    name_bt = []
    # narrower
    name_nw = []

    # JSON convert to pandas.DataFrame
    #nm = pd.json_normalize(pl_simple)
    #nm_meta = pd.json_normalize(pl_simple_meta)

    # JSON convert to pandas.DataFrame
    nm = pd.json_normalize(pl_simple)
    nm_meta = pd.json_normalize(pl_simple_meta)

    g.bind(nm_meta["meta_prefix"][0], nm_meta["meta_uri"][0])

    # replace nan with ""
    nm = nm.replace(np.nan, "")

    dic_preflabel_uri = {}
    for index, row in nm.iterrows():
        if row['preferred_label'] != "":
            dic_preflabel_uri[row['preferred_label']] = row['uri']

    # replace label with URI
    col_broader_uri = []
    for broader_term in nm['broader_term']:
        if broader_term in dic_preflabel_uri.keys():
            col_broader_uri.append(dic_preflabel_uri[broader_term])
        elif broader_term != "":
            col_broader_uri.append(broader_term)
        else:
            col_broader_uri.append("")

    nm.loc[:, "broader_term"] = col_broader_uri

    # create meta
    namelx = nm_meta.loc[:, ['meta_name', 'meta_enname', 'meta_version', 'meta_prefix', 'meta_uri',  'meta_description', 'meta_endescription', 'meta_author']].values
    for name in namelx:
        nameb = [rdflib.URIRef(str(name[4])), rtype, sconceptscheme]
        namel.append(nameb)
        m_prefix = str(name[3])
        m_uri = rdflib.URIRef(str(name[4]))
        if(str(name[0]) != ""):
            nameb = [m_uri, title, rdflib.Literal(str(name[0]), lang='ja')]
            namel.append(nameb)
        if(str(name[1]) != ""):
            nameb = [m_uri, title, rdflib.Literal(str(name[1]), lang='en')]
            namel.append(nameb)
        if(str(name[2]) != ""):
            nameb = [m_uri, hasVersion, rdflib.Literal(str(name[2]))]
            namel.append(nameb)
        if(str(name[5]) != ""):
            nameb = [m_uri, description, rdflib.Literal(str(name[5]), lang='ja')]
            namel.append(nameb)
        if(str(name[6]) != ""):
            nameb = [m_uri, description, rdflib.Literal(str(name[6]), lang='en')]
            namel.append(nameb)
        if(str(name[7]) != ""):
            nameb = [m_uri, creator, rdflib.Literal(str(name[7]))]
            namel.append(nameb)

    # create type links for OtherVocabulary info
    nameoi = nm.query('other_voc_syn_uri != ""')
    namelx = nameoi.loc[:, ['other_voc_syn_uri']].values.tolist()
    namelx = set(sum(namelx, []))
    for name in namelx:
        nameb = [rdflib.URIRef(str(name)[:(str(name).rfind('/') + 1)]), rtype, sconceptscheme]
        namel.append(nameb)


    # create exactMatch and inscheme for OtherVocabulary link
    nameou = nm.query('other_voc_syn_uri != ""')
    namelx = nameou.loc[:, ['other_voc_syn_uri', 'uri']].values.tolist()
    namelx = list(map(list, set(map(tuple, namelx))))
    for name in namelx:
        nameb = [rdflib.URIRef(str(name[0])), rtype, scon]
        namel.append(nameb)
        nameb = [rdflib.URIRef(str(name[0])), exactMatch, rdflib.URIRef(str(name[1]))]
        namel.append(nameb)
        nameb = [rdflib.URIRef(str(name[0])), sinscheme, rdflib.URIRef(str(name[0])[:(str(name[0]).rfind('/') + 1)])]
        namel.append(nameb)

    # JSON query Get Concept, prefLabel and narrower base
    namelpl = nm.query('term == preferred_label and uri != ""')
    # get uri and term
    namelx = namelpl.loc[:, ['term', 'uri', 'language']].values
    for name in namelx:
        if TERM_BLANK_MARK in str(name[0]):
            continue
        # print('prefLabel:'+str(name[0])+' '+str(name[1]))
        nameb = [
            rdflib.URIRef(str(name[1])),
            plabel,
            rdflib.Literal(str(name[0]), lang=name[2])
        ]
        namel.append(nameb)
        # narrower
        _add_check_term(name_nw, name[0], name[0], name[1])

    # query altLabel
    namelal = nm.query('term != preferred_label and uri != ""')
    # get uri and term
    namelx = namelal.loc[:, ['term', 'uri', 'language']].values
    for name in namelx:
        if TERM_BLANK_MARK in str(name[0]):
            continue
        # print('altLabel:' + str(name[0])+' '+str(name[1]))
        nameb = [
            rdflib.URIRef(str(name[1])),
            alabel,
            rdflib.Literal(str(name[0]), lang=name[2])
        ]
        namel.append(nameb)

    # create broader links
    # query broader_term
    namelbt = nm.query('broader_term != "" and uri != ""')
    # get uri and broader_term
    namelx = namelbt.loc[:, ['broader_term', 'term', 'uri']].values
    for name in namelx:
        if TERM_BLANK_MARK in str(name[1]):
            continue
        _add_check_term(name_bt, name[0], name[1], name[2])

    name_bt = list(map(list, set(map(tuple, name_bt))))
    for namebt in name_bt:
        nameb = [
            rdflib.URIRef(str(namebt[0])),
            broader,
            rdflib.URIRef(str(namebt[1]))
        ]
        namel.append(nameb)

    # print("--- printing narrower ---")
    # create narrower links
    for namenw in name_bt:
        nameb = [
            rdflib.URIRef(str(namenw[1])),
            narrower,
            rdflib.URIRef(str(namenw[0]))
        ]
        namel.append(nameb)


    # create other links
    namelpl = nm.query('uri != ""')
    # get language, uri, othervoc_syn_uri, term_description, created and modified
    namelx = namelpl.loc[:, ['language', 'uri', 'other_voc_syn_uri', 'term_description', 'created_time', 'modified_time']].values.tolist()
    namelx = list(map(list, set(map(tuple, namelx))))
    for name in namelx:
        nameb = [rdflib.URIRef(str(name[1])), rtype, scon]
        namel.append(nameb)
        nameb = [rdflib.URIRef(str(name[1])), sinscheme, m_uri]
        namel.append(nameb)
        if(str(name[2]) != ""):
            nameb = [rdflib.URIRef(str(name[1])), exactMatch, rdflib.URIRef(str(name[2]))]
            namel.append(nameb)
        if(str(name[3]) != ""):
            nameb = [rdflib.URIRef(str(name[1])), description, rdflib.Literal(str(name[3]), lang=name[0])]
            namel.append(nameb)
        if(str(name[4]) != ""):
            nameb = [rdflib.URIRef(str(name[1])), created, rdflib.Literal(str(name[4]))]
            namel.append(nameb)
        if(str(name[5]) != ""):
            nameb = [rdflib.URIRef(str(name[1])), modified, rdflib.Literal(str(name[5]))]
            namel.append(nameb)

    namel = list(map(list, set(map(tuple, namel))))
              
    # Add List to Graph
    for name in namel:
        g.add((name[0], name[1], name[2]))
    return g


def _download_file_serialize(g, p_format):
    # :param format: Specify the file format.
    # when editing_vocabulary, format is csv or xlsx.
    # n3, nt, turtle, xml, trix, nquads
    if p_format in REFERENCE_FORMAT:
        response = make_response()
        response.data = g.serialize(format=p_format).decode("utf-8")
        response.headers['Content-Type'] = 'application/octet-stream'
        response.headers['Content-Disposition'] =\
            'attachment; filename=test_sample.' + p_format
        return response
    elif p_format in REFERENCE_FORMAT_JSON:
        df_json = []
        wk_format = "json-ld"
        df_json = g.serialize(format=wk_format, indent=4).decode("utf-8")
        response = make_response(jsonify(df_json))
        response.headers['Content-Type'] = 'application/ld+json'
        response.headers['Content-Disposition'] =\
            'attachment; filename=test_sample.jspnld'
        return response


def _download_file_ev_serialize(pl_simple, p_format):
    # format is csv 
    df_json = []
    df_json = pd.json_normalize(pl_simple)
    # print("--- printing "+p_format+" ---")
    df_org = df_json.copy()
    # delete word "[","]"
    df_org['term'] =\
            df_org['term'].str.replace(TERM_BLANK_MARK+'\d+', '',regex=True) 
    df_org['synonym_candidate'] =\
        df_org['synonym_candidate'].astype("string")
    df_org['broader_term_candidate'] =\
        df_org['broader_term_candidate'].astype("string")
    df_org['synonym_candidate'] =\
        df_org['synonym_candidate'].str.replace('[', '')
    df_org['synonym_candidate'] =\
        df_org['synonym_candidate'].str.replace(']', '')
    df_org['synonym_candidate'] =\
        df_org['synonym_candidate'].str.replace('\'', '')
    df_org['broader_term_candidate'] =\
        df_org['broader_term_candidate'].str.replace('[', '')
    df_org['broader_term_candidate'] =\
        df_org['broader_term_candidate'].str.replace(']', '')
    df_org['broader_term_candidate'] =\
        df_org['broader_term_candidate'].str.replace('\'', '')
    # delete columns id hidden
    df_org.drop(columns=['id', 'hidden'], inplace=True)
    # make dictionary {preferred_label: uri}
    dic_preflabel_uri = dict(zip(df_org['preferred_label'], df_org['uri']))
    # if broader_term is label, convert label into uri
    col_broader_uri = []
    for broader_term in list(df_org['broader_term']):
        if broader_term in list(df_org['uri']):
            col_broader_uri.append(broader_term)
        elif broader_term in list(df_org['preferred_label']):
            col_broader_uri.append(dic_preflabel_uri[broader_term])
        else:
            col_broader_uri.append(np.nan)
    df_org.loc[:, 'broader_term'] = col_broader_uri
    # header change
    df_org = df_org.rename(columns={'term': '用語名',
                                    'preferred_label': '代表語',
                                    'language': '言語',
                                    'uri': '代表語のURI',
                                    'broader_term': '上位語のURI',
                                    'other_voc_syn_uri': '他語彙体系の同義語のURI',
                                    'term_description': '用語の説明',
                                    'created_time': '作成日',
                                    'modified_time': '最終更新日',
                                    'broader_term_candidate': '上位語候補',
                                    'synonym_candidate': '同義語候補',
                                    'position_x': 'x座標値',
                                    'position_y': 'y座標値',
                                    'color1': '色1',
                                    'color2': '色2',
                                    'confirm': '確定済み用語'})

    if p_format == 'csv':
        with tempfile.TemporaryFile("w+") as f:
            # encoding='utf-8', index=False
            df_org.to_csv(f, encoding='utf-8', index=False)
            f.seek(0)
            response = make_response()
            response.data = f.read()
            response.headers['Content-Type'] = 'text/csv'
            response.headers['Content-Disposition'] =\
                'attachment; filename=test_sample.csv'
            return response
    else: 
        pass

def _download_meta_file_ev_serialize(pl_simple, p_format):
    # format is csv 
    df_json = []
    df_json = pd.json_normalize(pl_simple)
    # print("--- printing "+p_format+" ---")
    df_org = df_json.copy()
    # delete columns id
    df_org.drop(columns=['id'], inplace=True)
    # header change
    df_org = df_org.rename(columns={'meta_name': '語彙の名称',
                                    'meta_enname': '語彙の英語名称',
                                    'meta_version': 'バージョン',
                                    'meta_prefix': '接頭語',
                                    'meta_uri': '語彙のURI',
                                    'meta_description': '語彙の説明',
                                    'meta_endescription': '語彙の英語説明',
                                    'meta_author': '語彙の作成者'})

    if p_format == 'csv':
        with tempfile.TemporaryFile("w+") as f:
            # encoding='utf-8', index=False
            df_org.to_csv(f, encoding='utf-8', index=False)
            f.seek(0)
            response = make_response()
            response.data = f.read()
            response.headers['Content-Type'] = 'text/csv'
            response.headers['Content-Disposition'] =\
                'attachment; filename=test_sample.csv'
            return response
    else:
        passs



#########################################################################################################
#########################################################################################################
#########################################################################################################

# 409 phase 4, reason 0
def _check_uri_startswith_prefix(df, uri_prefix, file_type=0):
    # uri must starts with meta_uri 
    # the empty cell or cells with white spaces are also detected and returns errorresponse
    term_colname ='用語名'
    lang_colname = '言語'
    pre_uri_colname = '代表語のURI'
    tmpdf = df[~df[pre_uri_colname].str.startswith(uri_prefix, na=False)][[term_colname, lang_colname]]
    term_list = tmpdf[term_colname].to_list()
    lang_list = tmpdf[lang_colname].to_list()
    if len(term_list) != 0:
        return CheckErrorResponse(4, term_list, lang_list, 0, file_type), 409
    return SuccessResponse('request is success.'), 200


# 409 phase 5, reason 0
def _check_broader_term_startswith_prefix(df, uri_prefix, file_type=0):
    # broader_term must start with prefix
    # the empty cell or cells with white spaces are also detected and returns errorresponse
    term_colname ='用語名'
    lang_colname = '言語'
    broader_term_colname =  '上位語のURI'
    # non empty
    tmpdf1 = df[broader_term_colname] != '' 
    # starts with prefix
    tmpdf2 = df[broader_term_colname].str.startswith(uri_prefix)
    tmpdf = df[tmpdf1 & ~tmpdf2][[term_colname, lang_colname]]
    term_list = tmpdf[term_colname].to_list()
    lang_list = tmpdf[lang_colname].to_list()
    if len(term_list) != 0:
        return CheckErrorResponse(5, term_list, lang_list, 0, file_type), 409
    return SuccessResponse('request is success.'), 200


# # 409 phase 3, reason 0
def _check_lang_val(df, file_type=0):
    # the values must be in VOCABULARY_ALLOWED_LANGUAGE or empty (which contains white spaces)
    # empty cells are not filled
    term_colname ='用語名'
    lang_colname = '言語'
    num_row = df.shape[0]
    tmpseries2 = df[lang_colname].str.strip() # get lang col
    tmp_data = [False] * num_row
    boolseries1 = pd.Series(tmp_data)
    # check existence
    for lang_val in VOCABULARY_ALLOWED_LANGUAGE:
        boolseries1 = boolseries1 | (tmpseries2 == lang_val)
    
    # detect empty cells
    boolseries1 = boolseries1 | (tmpseries2 == '')

    tmpdf = df[~boolseries1][[term_colname, lang_colname]]
    term_list = tmpdf[term_colname].to_list()
    lang_list = tmpdf[lang_colname].to_list()
    if len(term_list) != 0:
        return CheckErrorResponse(3, term_list, lang_list, 0, file_type), 409
    return SuccessResponse('request is success.'), 200

# # 409 phase 2, reason 0
def _check_pref_label_val(df, file_type=0):
    # check all pref_label in a group that have same uri and lang are same
    # this returns only one error if there are many groups that having empty preferred label
    term_colname ='用語名'
    preferred_label_colname = '代表語'
    lang_colname = '言語'
    uri_colname =  '代表語のURI'
    # 一旦埋めておく
    df[df[lang_colname].str.strip() == ''] = 'ja'
    df = df[[term_colname,uri_colname, lang_colname, preferred_label_colname]]
    # count distinct pref_label in eeach group 
    count_df = df.groupby([lang_colname, uri_colname]).nunique(dropna= False) # this is a DataFrame　
    # this count blanck string
    count_df2 = count_df[count_df[preferred_label_colname] != 1]
    if count_df2.size != 0:
        # if there are distinct pref_labels
        tmplang, tmpuri = count_df2.index[0] # get the first uri and lang
        tmpdf = df[(df[uri_colname] == tmpuri) & (df[lang_colname] == tmplang)][[term_colname, lang_colname]]
        term_list = tmpdf[term_colname].to_list()
        lang_list = tmpdf[lang_colname].to_list()
        return CheckErrorResponse(2, term_list, lang_list, 0, file_type), 409
    return SuccessResponse('request is success.'), 200



# # 409 phase 2, reason 1
def _check_pref_label_empty(df, file_type=0):
    # check not all preferred label in a group that have same uri are empty  
    # this returns only one error if there are many groups that having empty preferred label
    term_colname ='用語名'
    preferred_label_colname = '代表語'
    lang_colname = '言語'
    uri_colname =  '代表語のURI'
    for group_uri, group_df in df.groupby(uri_colname):
        tmp_bool_df = group_df[preferred_label_colname].str.strip()  == '' #
        if tmp_bool_df.all():
            #all preferred_label in the group is empty
            tmpdf = df[df[uri_colname] == group_uri][[term_colname, lang_colname]]
            term_list = tmpdf[term_colname].to_list()
            lang_list = tmpdf[lang_colname].to_list()
            return CheckErrorResponse(2, term_list, lang_list, 1, file_type), 409
    return SuccessResponse('request is success.'), 200




# # 409 pahse 2, reason 2
def _check_diff_synogroup_have_diff_pref(df, file_type=0):
    # check there does not exist different synonim group that having same uri have same preffered label 
    # this returns only one error if there are many groups that having same preferred label
    term_colname = '用語名'  
    preferred_label_colname = '代表語' 
    lang_colname = '言語' 
    uri_colname = '代表語のURI' 
    count_df = df.groupby([preferred_label_colname, lang_colname]).nunique(dropna= False) # this is a DataFrame　
    count_df2 = count_df[count_df[uri_colname] != 1]
    if count_df2.size != 0:
        # there are different synonim group that have same preffered label
        tmppreflabel, tmplang = count_df2.index[0] # get the first preflabel and lang
        tmpdf = df[(df[preferred_label_colname] == tmppreflabel) & (df[lang_colname] == tmplang)][[term_colname, lang_colname]]
        term_list = tmpdf[term_colname].to_list()
        lang_list = tmpdf[lang_colname].to_list()
        return CheckErrorResponse(2, term_list, lang_list, 2, file_type), 409
    return SuccessResponse('request is success.'), 200



# 409 phase 1, reason 0, 1, 2
def _check_blanck_term_condition(df, file_type=0):
    # check blanck term existence condition
    # preferred label must be blanck for the row
    # term description must not be blanck for the row
    # 
    # empty terms that have same uri and lang are not allowed
    # empty term and no empty term that have same uri and lang are not allowed
    #
    # prerequest:
    #  1. terms that having same uri and lang have same preferred label
    #  2. At least in some languege, preferred label are defined
    #
    # this returns only one error if there are many
    term_colname = '用語名'  
    preferred_label_colname = '代表語' 
    lang_colname = '言語' 
    uri_colname = '代表語のURI' 
    term_description_colname = '用語の説明' 
    # get rows with blanck terms
    empty_term_df= df[df[term_colname].str.strip() == '']
    # check preferred label are empty, term description are not empty
    for idx, row in empty_term_df.iterrows():
        if row[preferred_label_colname].strip() != '':
            # term is blanck but preferred label is not empty
            term_list = [row[uri_colname]]
            lang_list = [row[lang_colname]]
            return CheckErrorResponse(1, term_list, lang_list, 0, file_type), 409
        if row[term_description_colname].strip() == '':
            # term description is empty
            term_list = [row[uri_colname]]
            lang_list = [row[lang_colname]]
            return CheckErrorResponse(1, term_list, lang_list, 0, file_type), 409
    ### 1-1
    # check duplicate rows with blanck terms
    count_df = empty_term_df.groupby([lang_colname, uri_colname]).count() # this is a DataFrame　
    # this count blanck string
    count_df2 = count_df[count_df[term_colname] != 1]
    if count_df2.size != 0:
        # if there are blanck terms
        tmplang, tmpuri = count_df2.index[0] # get the first uri and lang
        term_list = [tmpuri]
        lang_list = [tmplang]
        return CheckErrorResponse(1, term_list, lang_list, 1, file_type), 409
    ### 1-2
    for idx, row in empty_term_df.iterrows():
        lang = row[lang_colname]
        uri = row[uri_colname]
        tmpdf = df[(df[uri_colname] == uri) & (df[lang_colname] == lang)]
        count_series = tmpdf.nunique()
        if count_series[term_colname] != 1:
            # blanck and non blanck term are existed
            term_list = [uri]
            lang_list = [lang]
            return CheckErrorResponse(1, term_list, lang_list, 2, file_type), 409
    return SuccessResponse('request is success.'), 200

# 409 phase 1, reason 5
def _check_duplicated_terms(df, file_type=0):
    # check duplicated terms
    term_colname = '用語名'  
    lang_colname = '言語'
    # detedt duplicated terms
    tmpdf = df[df.duplicated(subset=term_colname)][[term_colname, lang_colname]]
    if tmpdf.size != 0:
        # there are duplicated terms
        tmpdf = tmpdf.drop_duplicates()
        term_list = tmpdf[term_colname].to_list()
        lang_list = tmpdf[lang_colname].to_list()
        return CheckErrorResponse(1, term_list, lang_list, 5, file_type), 409
    return SuccessResponse('request is success.'), 200


# 409 phase 5, reason 1
def _check_broader_terms_same(df, file_type=0):
    # check broader terms are same in a synonum group
    # this returns only one error if there are many
    term_colname = '用語名'  
    lang_colname = '言語' 
    uri_colname = '代表語のURI' 
    broader_term_colname = '上位語のURI' 
    # df = df[[term_colname, lang_colname, uri_colname, broader_term_colname]] # just for debug
    count_df = df.groupby(uri_colname).nunique(dropna= False)
    count_df2 = count_df[count_df[broader_term_colname] != 1]
    if count_df2.size != 0:
        # there is non unique broader
        tmpuri = count_df2.index[0] # get the first uri
        tmpdf = df[(df[uri_colname] == tmpuri) ][[term_colname, lang_colname]]
        term_list = tmpdf[term_colname].to_list()
        lang_list = tmpdf[lang_colname].to_list()
        return CheckErrorResponse(5, term_list, lang_list, 1, file_type), 409
    return SuccessResponse('request is success.'), 200

# 409 phase 5, reason 2
def _check_broader_exist_in_uri(df, file_type=0):
    # check broader values are in uri
    # this returns only one error if there are many
    term_colname = '用語名'  
    lang_colname = '言語' 
    uri_colname = '代表語のURI' 
    broader_term_colname = '上位語のURI' 
    # get broader uri
    uri_series = df[broader_term_colname].drop_duplicates()
    uri_list = uri_series[uri_series != ''].to_list()
    for tmpuri in uri_list:
        tmp_bool_series = ~(df[uri_colname] == tmpuri)
        if tmp_bool_series.all():
            # there does not exist the broader uri in uri
            tmpdf = df[df[broader_term_colname] == tmpuri][[term_colname, lang_colname]]
            term_list = tmpdf[term_colname].to_list()
            lang_list = tmpdf[lang_colname].to_list()
            return CheckErrorResponse(5, term_list, lang_list, 2, file_type), 409
    return SuccessResponse('request is success.'), 200


# recursive depth first search
def dfs(v, neighbor, invisited, infinished, pushdown):
    if infinished[v]:
        return invisited, infinished, pushdown, 0, v
    if invisited[v]:
        #print("Cycle found")
        return invisited, infinished, pushdown, 1, v
    invisited[v] = True
    pushdown.append(v)
    for vnext in neighbor[v]:
        invisited, infinished, pushdown, status, tmpv = dfs(vnext, neighbor, invisited, infinished, pushdown)
        if status == 1:
            return invisited, infinished, pushdown, 1, tmpv
    infinished[v]=True
    pushdown.pop()
    return invisited, infinished, pushdown, 0, v

# phase 5, reason 3 (This returns only one error even if there are many)
def _check_broader_loop_relation(df, file_type=0):
    # checks loop relation between terms
    # prerequest all values in broader_term must exist in uri
    # this use graph theoreticd depth first search
    term_colname = '用語名'
    lang_colname = '言語'
    uri_colname = '代表語のURI' 
    broader_term_colname = '上位語のURI' 
    df2 = df[[uri_colname, broader_term_colname]] 
    df2 = df2.drop_duplicates()
    # make graph adjacent list
    df2[uri_colname]
    uri_set = set(df2[uri_colname])
    visited ={ x: False for x in uri_set}
    finished ={ x: False for x in uri_set}
    neighbor ={ x: [] for x in uri_set}
    for idx, row in df2.iterrows():
        if row[broader_term_colname] != '':
            neighbor[row[uri_colname]].append(row[broader_term_colname])
    pushdown = []
    for uri_item in uri_set:
        visited, finished, pushdown, status, tmp_uri = dfs(uri_item, neighbor, visited, finished, pushdown)
        if status == 1:
            # print("Cycle found")
            break
    if status == 1:
        term_list = []
        lang_list = []
        first_idx = pushdown.index(tmp_uri)
        uri_chain = pushdown[first_idx:]
        for ii_uri in uri_chain:
            row = df[df[uri_colname]  == ii_uri ].iloc[0]
            term_list.append(row[term_colname])
            lang_list.append(row[lang_colname])
        return CheckErrorResponse(5, term_list, lang_list, 3, file_type), 409
    return SuccessResponse('request is success.'), 200


# 409 phase 6, reason 0
def _check_other_voc_syn_same(df, file_type=0):
    # check other vocabulary synonimum are same in a synonum group
    # this returns only one error if there are many
    term_colname = '用語名'  
    lang_colname = '言語' 
    uri_colname = '代表語のURI' 
    other_voc_syn_uri_colname = '他語彙体系の同義語のURI' 
    # df = df[[term_colname, lang_colname, uri_colname, other_voc_syn_uri_colname]] # just for debug
    count_df = df.groupby(uri_colname).nunique(dropna= False)
    count_df2 = count_df[count_df[other_voc_syn_uri_colname] != 1]
    if count_df2.size != 0:
        # there is non unique broader
        tmpuri = count_df2.index[0] # get the first uri
        tmpdf = df[(df[uri_colname] == tmpuri) ][[term_colname, lang_colname]]
        term_list = tmpdf[term_colname].to_list()
        lang_list = tmpdf[lang_colname].to_list()
        return CheckErrorResponse(6, term_list, lang_list, 0, file_type), 409
    return SuccessResponse('request is success.'), 200


# 409 phase 7, reason 0
def _check_term_description_same(df, file_type=0):
    # check term_description are same in a synonum group for each language
    # this returns only one error if there are many
    term_colname = '用語名'  
    lang_colname = '言語' 
    uri_colname = '代表語のURI' 
    term_description_colname = '用語の説明'
    # df = df[[term_colname, lang_colname, uri_colname, term_description_colname]] # just for debug
    count_df = df.groupby([uri_colname, lang_colname]).nunique(dropna= False)
    count_df2 = count_df[count_df[term_description_colname] != 1]
    if count_df2.size != 0:
        # there is non unique broader
        tmpuri, tmplang = count_df2.index[0] # get the first uri
        tmpdf = df[(df[uri_colname] == tmpuri) & (df[lang_colname] == tmplang) ][[term_colname, lang_colname]]
        term_list = tmpdf[term_colname].to_list()
        lang_list = tmpdf[lang_colname].to_list()
        return CheckErrorResponse(7, term_list, lang_list, 0, file_type), 409
    return SuccessResponse('request is success.'), 200

# 409 phase 8, reason 0
def _check_created_time_same(df, file_type=0):
    # check created time are same in a synonum group for each language
    # this returns only one error if there are many
    term_colname = '用語名'  
    lang_colname = '言語' 
    uri_colname = '代表語のURI' 
    created_time_colname = '作成日'
    count_df = df.groupby(uri_colname).nunique(dropna= False)
    count_df2 = count_df[count_df[created_time_colname] != 1]
    if count_df2.size != 0:
        # there is non unique broader
        tmpuri = count_df2.index[0] # get the first uri
        tmpdf = df[(df[uri_colname] == tmpuri) ][[term_colname, lang_colname]]
        term_list = tmpdf[term_colname].to_list()
        lang_list = tmpdf[lang_colname].to_list()
        return CheckErrorResponse(8, term_list, lang_list, 0, file_type), 409
    return SuccessResponse('request is success.'), 200


# 409 phase 9, reason 0
def _check_modified_time_same(df, file_type=0):
    # check created time are same in a synonum group for each language
    # this returns only one error if there are many
    term_colname = '用語名'  
    lang_colname = '言語' 
    uri_colname = '代表語のURI' 
    modified_time_colname = '最終更新日' 
    count_df = df.groupby(uri_colname).nunique(dropna= False)
    count_df2 = count_df[count_df[modified_time_colname] != 1]
    if count_df2.size != 0:
        # there is non unique broader
        tmpuri = count_df2.index[0] # get the first uri
        tmpdf = df[(df[uri_colname] == tmpuri) ][[term_colname, lang_colname]]
        term_list = tmpdf[term_colname].to_list()
        lang_list = tmpdf[lang_colname].to_list()
        return CheckErrorResponse(9, term_list, lang_list, 0, file_type), 409
    return SuccessResponse('request is success.'), 200


def _fill_color_val(df, colname, default_color='black', allowed_color=VOCABULARY_ALLOWED_COLOR1):
    # non allowed colors are replaced to default color
    num_row = df.shape[0]
    tmpseries2 = df[colname].str.strip() # get color col
    tmp_data = [False] * num_row
    boolseries1 = pd.Series(tmp_data)
    # check existence
    for color_val in allowed_color:
        boolseries1 = boolseries1 | (tmpseries2 == color_val)
    df.loc[~boolseries1, colname] = default_color    
    # df[colname].where(boolseries1, default_color, inplace = True)
    return df

def _fill_pos_val(df):
    # fills uncastable values to 0.0
    position_x_colname = 'x座標値' 
    position_y_colname = 'y座標値'
    tmp_bool = pd.to_numeric(df[position_x_colname]).isnull()
    df.loc[tmp_bool, position_x_colname] = 0.0
    tmp_bool = pd.to_numeric(df[position_y_colname]).isnull()
    df.loc[tmp_bool, position_y_colname] = 0.0
    return df

def _fill_confirm_val(df):
    # fills cells without 0 are replaced to 1
    confirm_colname =  '確定済み用語'
    tmp_bool = df[confirm_colname] != '0'
    df.loc[tmp_bool, confirm_colname] = '1'
    return df
