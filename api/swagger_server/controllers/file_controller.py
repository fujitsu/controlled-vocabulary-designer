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
VOCABULARY_ALLOWED_EXTENSIONS = ['.xls', '.xlsx', '.csv']
VOCABULARY_ALLOWED_EXTENSIONS_XLS = ['.xls', '.xlsx']
VOCABULARY_ALLOWED_EXTENSIONS_CSV = ['.csv']
REFERENCE_FORMAT = ['n3', 'nt', 'turtle', 'xml', 'nquads', 'trix']
REFERENCE_FORMAT_JSON = ['jsonld']
REFERENCE_FORMAT_EDIT = ['csv', 'xlsx']
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

    :param file_type: Specify for editing_vocabulary or editing_vovabulary_meta or controlled_vocabulary.   &#x27;editing_vocabulary&#x27; get editing vocabulary file.  &#x27;editing_vocabulary_meta&#x27; get editing vocabulary meta file. &#x27;controlled_vocabulary&#x27; get controlled vocabulary file.
    :type file_type: str
    :param out_format: Specify the file format.   when editing_vocabulary and editing_vovabulary_meta, format is csv or xlsx.   when controlled_vocabulary, format is n3, nquads, nt, trix, turtle, xml, json-ld.
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
        # json to csv or xlsx
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
         # json to csv or xlsx
        ret_serialize =\
            _download_meta_file_ev_serialize(editing_vocabulary_meta, out_format)

    return ret_serialize


def upload_file(editing_vocabulary=None, editing_vocabulary_meta=None, reference_vocabulary1=None, reference_vocabulary2=None, reference_vocabulary3=None):  # noqa: E501
    """Upload the file to the server

    Uploads the file selected by the client to the server.     When &#x27;editing_vocabulary&#x27; uploaded, its check integrity.    # noqa: E501

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

    if editing_vocabulary is not None:
        allow_extension, r_ext =\
            _check_extensions(editing_vocabulary,
                              VOCABULARY_ALLOWED_EXTENSIONS)
        if not allow_extension:
            print(datetime.datetime.now(),
                  '[Error] failed _check_extensions', location())
            return ErrorResponse(0, 'Data Format Error.'), 400

        # Check Synonymous Relationship
        df = _read_file_strage(editing_vocabulary, r_ext)

        # Check columns
        exec_res, status_code = _check_columns(df)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_columns',
                  location())
            return exec_res, status_code

        # _repair_broader_term(df)

        exec_res, status_code = _check_synonymous_relationship(df)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_synonymous_relationship',
                  location())
            return exec_res, status_code

        payload = _make_bulk_data_editing_vocabulary(df)

        exec_res, status_code =\
            _exec_insert_postgrest(payload, 'editing_vocabulary')
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _exec_insert_postgrest', location())
            return exec_res, status_code
    
    if editing_vocabulary_meta is not None:
        allow_extension, r_ext =\
            _check_extensions(editing_vocabulary_meta,
                              VOCABULARY_ALLOWED_EXTENSIONS)
        if not allow_extension:
            print(datetime.datetime.now(),
                  '[Error] failed _check_extensions', location())
            return ErrorResponse(0, 'Data Format Error.'), 400

        # Check Synonymous Relationship
        df = _read_file_strage(editing_vocabulary_meta, r_ext)

        # Check columns
        exec_res, status_code = _check_columns_meta(df)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_columns_meta',
                  location())
            return exec_res, status_code

        payload = _make_bulk_data_editing_vocabulary_meta(df)

        exec_res, status_code =\
            _exec_insert_postgrest(payload, 'editing_vocabulary_meta')

    if reference_vocabulary1 is not None:
        allow_extension, r_ext =\
            _check_extensions(reference_vocabulary1,
                              VOCABULARY_ALLOWED_EXTENSIONS)
        if not allow_extension:
            print(datetime.datetime.now(),
                  '[Error] failed _check_extensions', location())
            return ErrorResponse(0, 'Data Format Error.'), 400

        payload =\
            _make_bulk_data_reference_vocabulary(reference_vocabulary1, r_ext)
        # format check
        exec_res, status_code =\
            _check_trem_format_reference_vocabulary(payload)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_trem_format_reference_vocabulary',
                  location())
            return ErrorResponse(0, 'Data Format Error.'), 400
        exec_res, status_code =\
            _exec_insert_postgrest(payload, 'reference_vocabulary_1')
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _exec_insert_postgrest',
                  location())
            return exec_res, status_code

    if reference_vocabulary2 is not None:
        allow_extension, r_ext =\
            _check_extensions(reference_vocabulary2,
                              VOCABULARY_ALLOWED_EXTENSIONS)
        if not allow_extension:
            print(datetime.datetime.now(),
                  '[Error] failed _check_extensions',
                  location())
            return ErrorResponse(0, 'Data Format Error.'), 400

        payload =\
            _make_bulk_data_reference_vocabulary(reference_vocabulary2, r_ext)
        # format check
        exec_res, status_code =\
            _check_trem_format_reference_vocabulary(payload)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_trem_format_reference_vocabulary',
                  location())
            return ErrorResponse(0, 'Data Format Error.'), 400
        exec_res, status_code =\
            _exec_insert_postgrest(payload, 'reference_vocabulary_2')
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _exec_insert_postgrest',
                  location())
            return exec_res, status_code

    if reference_vocabulary3 is not None:
        allow_extension, r_ext =\
            _check_extensions(reference_vocabulary3,
                              VOCABULARY_ALLOWED_EXTENSIONS)
        if not allow_extension:
            print(datetime.datetime.now(),
                  '[Error] failed _check_extensions',
                  location())
            return ErrorResponse(0, 'Data Format Error.'), 400

        payload =\
            _make_bulk_data_reference_vocabulary(reference_vocabulary3, r_ext)
        # format check
        exec_res, status_code =\
            _check_trem_format_reference_vocabulary(payload)
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _check_trem_format_reference_vocabulary',
                  location())
            return ErrorResponse(0, 'Data Format Error.'), 400
        exec_res, status_code =\
            _exec_insert_postgrest(payload, 'reference_vocabulary_3')
        if not status_code == 200:
            print(datetime.datetime.now(),
                  '[Error] failed _exec_insert_postgrest',
                  location())
            return exec_res, status_code

    return SuccessResponse('request is success.')

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


def _make_bulk_data_reference_vocabulary(excel_data, r_extension):

    payload = []

    if r_extension in VOCABULARY_ALLOWED_EXTENSIONS_XLS:
        df = pd.read_excel(excel_data)
    else:
        df = pd.read_csv(excel_data)
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


# read EXCEL File
def _read_file_strage(file_strage, r_extension):
    print(datetime.datetime.now(),
          'target file extension is', r_extension, location())
    # Read EXCEL file
    if r_extension in VOCABULARY_ALLOWED_EXTENSIONS_XLS:
        df = pd.read_excel(file_strage, na_values="", keep_default_na=False)
    else:
        df = pd.read_csv(file_strage, na_values="", keep_default_na=False)
    return df

# check column
def _check_columns(data_frame):
    # columns = '用語名 代表語 言語 代表語のURI 上位語のURI 他語彙体系の同義語のURI 用語の説明 作成日 最終更新日 同義語候補 上位語候補 x座標値 y座標値 色1 色2'
    # ins_f = lambda x:columns not in x
    for index, item in data_frame.iterrows():
        # if any(map(ins_f, item)):
        if ('用語名' not in item
         or '代表語' not in item
         or '言語' not in item
         or '代表語のURI' not in item
         or '上位語のURI' not in item
         or '他語彙体系の同義語のURI' not in item
         or '用語の説明' not in item
         or '作成日' not in item
         or '最終更新日' not in item
         or '同義語候補' not in item
         or '上位語候補' not in item
         or 'x座標値' not in item
         or 'y座標値' not in item
         or '色1' not in item
         or '色2' not in item):
            return ErrorResponse(0, 'Data Format Error.'), 400
    return SuccessResponse('request is success.'), 200

# check column meta
def _check_columns_meta(data_frame):
    # columns = '語彙の名称 語彙の英語名称 バージョン 接頭語 語彙のURI 語彙の説明 語彙の英語説明 語彙の作成者'
    for index, item in data_frame.iterrows():
        # if any(map(ins_f, item)):
        if ('語彙の名称' not in item
         or '語彙の英語名称' not in item
         or 'バージョン' not in item
         or '接頭語' not in item
         or '語彙のURI' not in item
         or '語彙の説明' not in item
         or '語彙の英語説明' not in item
         or '語彙の作成者' not in item):
            return ErrorResponse(0, 'Data Format Error. meta file columns'), 400
    return SuccessResponse('request is success.'), 200

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


# Check Synonymous Relationship
def _check_synonymous_relationship(df):
    preferred_group = ''
    group_uri = ''
    paylist = []
    preferredlist = []

    # 1-1 Extraction of synonymous relationship
    # sort
    payload_s = df.sort_values('代表語')

    # Only the preferred labels to be a Key is picked up and a list is created.
    for index, item in payload_s.iterrows():
        wk_preferred = item['代表語'] if pd.notnull(item['代表語']) else None
        if preferred_group != wk_preferred:
            preferred_group = wk_preferred
            group_uri = item['代表語のURI'] if pd.notnull(item['代表語のURI']) else None
        # Recursive call
        looplist = []
        looplist.append(wk_preferred)
        ret_flg = _chk_preferred_group(payload_s,
                                       preferredlist,
                                       looplist,
                                       wk_preferred)
        if ret_flg == 1:
            _add_preferred_list(preferredlist, item)

    # Make group lists for every preferred label
    preferred_group = ''
    group_uri = ''
    for name in preferredlist:
        wk_preferred =\
            name['preferred_label']\
            if pd.notnull(name['preferred_label']) else None
        if preferred_group != wk_preferred:
            preferred_group = wk_preferred
            group_uri = name['uri'] if pd.notnull(name['uri']) else None
        # Recursive call
        looplist = []
        looplist.append(wk_preferred)
        _chk_preferred_list_group(payload_s,
                                  paylist,
                                  looplist,
                                  preferred_group,
                                  group_uri,
                                  wk_preferred)

    # Check Synonymous Relationship
    exec_res, status_code = _check_synonymous_relationship_2_0(paylist)
    if not status_code == 200:
        print(datetime.datetime.now(),
              '[Error] _check_synonymous_relationship_2_0 failed ', location())
        return CheckErrorResponse(2, exec_res, 0), status_code
    exec_res, status_code = _check_synonymous_relationship_3_0(paylist)
    if not status_code == 200:
        print(datetime.datetime.now(),
              '[Error] _check_synonymous_relationship_3_0 failed ', location())
        return CheckErrorResponse(3, exec_res, 1), status_code
    exec_res, status_code =\
        _check_synonymous_relationship_3_1(preferredlist)
    if not status_code == 200:
        print(datetime.datetime.now(),
              '[Error] _check_synonymous_relationship_3_1 failed ', location())
        return CheckErrorResponse(3, exec_res, 2), status_code
    exec_res, status_code = _check_synonymous_relationship_4_0(paylist)
    if not status_code == 200:
        print(datetime.datetime.now(),
              '[Error] _check_synonymous_relationship_4_0 failed ', location())
        return CheckErrorResponse(4, exec_res, 0), status_code
    exec_res, status_code =\
        _check_synonymous_relationship_4_1(payload_s, paylist)
    if not status_code == 200:
        print(datetime.datetime.now(),
              '[Error] _check_synonymous_relationship_4_1 failed ', location())
        return CheckErrorResponse(4, exec_res, 1), status_code

    return SuccessResponse('request is success.'), 200


# Check trem format reference_vocabulary
def _check_trem_format_reference_vocabulary(payload):
    # An item that does not contain a key term is considered an error.
    for item in payload:
        wk_preferred_label =\
            item['term'] if pd.notnull(item['term']) else None
        if wk_preferred_label is None:
            return ErrorResponse(0, 'Data Format Error.'), 400
    return SuccessResponse('request is success.'), 200


# Check Synonymous Relationship phase 2 reazon 0
def _check_synonymous_relationship_2_0(paylist):
    # 2-0 Check preferred labels within synonymous terms
    wk_error_term = []
    for name in paylist:
        if name['preferred_group'] != name['preferred_label']:
            wk_error_group = name['preferred_group']
            for name_er in paylist:
                if wk_error_group == name_er['preferred_group']:
                    wk_error_term.append(name_er['term'])
            return wk_error_term, 409
    return SuccessResponse('request is success.'), 200


# Check Synonymous Relationship phase 3 reazon 0
def _check_synonymous_relationship_3_0(paylist):
    # 3-0 Check the URI of preferred labels within and between preferred labels
    wk_error_term = []
    for name in paylist:
        if name['group_uri'] != name['uri']:
            wk_error_group = name['preferred_group']
            for name_er in paylist:
                if wk_error_group == name_er['preferred_group']:
                    wk_error_term.append(name_er['term'])
            return wk_error_term, 409
    return SuccessResponse('request is success.'), 200


# Check Synonymous Relationship phase 3 reazon 1
def _check_synonymous_relationship_3_1(preferredlist):
    # 3-1 Check the URI of preferred labels within and between preferred labels (in case the URI of the preferred label does not exist)
    wk_error_term = []
    for name in preferredlist:
        wk_group_uri = name['uri'] if pd.notnull(name['uri']) else None
        wk_preferred =\
            name['preferred_label']\
            if pd.notnull(name['preferred_label']) else None
        wk_language =\
            name['language']\
            if pd.notnull(name['language']) else None
        for nameb in preferredlist:
            wk_group_uri1b =\
                nameb['uri'] if pd.notnull(nameb['uri']) else None
            wk_preferred1b =\
                nameb['preferred_label']\
                if pd.notnull(nameb['preferred_label']) else None
            wk_language1b =\
                nameb['language']\
                if pd.notnull(nameb['language']) else None
            if wk_group_uri is not None and\
                    wk_group_uri == wk_group_uri1b and\
                    wk_language == wk_language1b and\
                    wk_preferred != wk_preferred1b:
                for name_er in preferredlist:
                    if wk_group_uri == name_er['uri']:
                        wk_error_term.append(name_er['term'])
                return wk_error_term, 409
    return SuccessResponse('request is success.'), 200


# Check Synonymous Relationship phase 4 reazon 0
def _check_synonymous_relationship_4_0(paylist):
    broaderlist = []
    wk_error_term = []
    # 4-0 Check the broader term of preferred labels within and between preferred labels
    for item in paylist:
        wk_broader_term = item['broader_term']
        if wk_broader_term is None:
            # In case the broader term does not exist
            _add_broader_list(broaderlist, item)
        else:
            lst = list(filter(lambda x: x['term'] == wk_broader_term, paylist))
            if len(lst) == 1:
                _add_broader_list(broaderlist, item, lst[0])

    # 4-0
    error_preferred = []
    for name in broaderlist:
        for nameb in broaderlist:
            if name['preferred_group'] != nameb['preferred_group']:
                continue
            if name['broader_preferred_label'] !=\
                    nameb['broader_preferred_label']:
                # Duplicate check
                aflg = False
                for er_preferred in error_preferred:
                    if er_preferred == name['preferred_group']:
                        aflg = True
                if not aflg:
                    error_preferred.append(str(name['preferred_group']))
    for er_preferred in error_preferred:
        wk_error_term.append(er_preferred)
    if len(wk_error_term) > 0:
        return wk_error_term, 409
    return SuccessResponse('request is success.'), 200


# 4-0
def _add_broader_list(broaderlist, item, itemb=None):

    # Duplicate check
    for payitem in broaderlist:
        if payitem['term'] ==\
                item['term'] and payitem['preferred_label'] ==\
                item['preferred_label']:
            return False

    insert_data = {}
    insert_data['preferred_group'] = item['preferred_group']
    insert_data['term'] = item['term']
    insert_data['preferred_label'] = item['preferred_label']
    insert_data['uri'] = item['uri']
    insert_data['broader_term'] = item['broader_term']
    if itemb is not None:
        insert_data['broader_preferred_label'] = itemb['preferred_label']
    else:
        insert_data['broader_preferred_label'] = None
    broaderlist.append(insert_data)

    return True


# Check Synonymous Relationship phase 4 reazon 1
def _check_synonymous_relationship_4_1(payload_s, paylist):
    # 4-2 Check the broader term of preferred labels within and between preferred labels
    for name in paylist:
        wk_broader_term = name['broader_term']
        if wk_broader_term is not None:
            # In case the broader term exists
            looplist = []
            looplist.append(wk_broader_term)
            ret_flg = _chk_broader_term(payload_s, looplist, wk_broader_term)
            if ret_flg == 0:
                None
            elif ret_flg == 2:
                if len(looplist) > 0:
                    return looplist, 409
    return SuccessResponse('request is success.'), 200


# 4-1 Recursive call
def _chk_broader_term(payload_s, looplist, key_preferred):
    if key_preferred is None:
        return 0
    name_p2 = payload_s.query("用語名 == \""+key_preferred.replace("'", "\'")+"\"")
    ret_flg = 1
    for index2, item2 in name_p2.iterrows():
        wk_broader_term =\
            str(item2['上位語のURI']) if pd.notnull(item2['上位語のURI']) else None
        if wk_broader_term is None:
            return 0
        else:
            # Loop check
            for loopitem in looplist:
                if loopitem == wk_broader_term:
                    return 2
            looplist.append(wk_broader_term)
            # Check for narrower groups in recursive calls
            ret_flg = _chk_broader_term(payload_s, looplist, wk_broader_term)
            if ret_flg == 1:
                ret_flg = 0
    return ret_flg


# 1 Recursive call
def _chk_preferred_group(payload_s, preferredlist, looplist, key_preferred):
    if key_preferred is None:
        return 0
    if len(payload_s) <= 1:
        return 0
    name_p2 = payload_s.query("用語名 == \""+key_preferred.replace("'", "\'")+"\"")
    ret_flg = 1
    for index2, item2 in name_p2.iterrows():
        if str(item2['用語名']) == str(item2['代表語']):
            _add_preferred_list(preferredlist, item2)
            return 0
        else:
            wk_preferred = item2['代表語'] if pd.notnull(item2['代表語']) else None
            # Loop check
            for loopitem in looplist:
                if loopitem == wk_preferred:
                    return 2
            looplist.append(wk_preferred)
            # Check for narrower groups in recursive calls
            ret_flg = _chk_preferred_group(payload_s,
                                           preferredlist,
                                           looplist,
                                           wk_preferred)
            if ret_flg == 1:
                _add_preferred_list(preferredlist, item2)
                ret_flg = 0
    return ret_flg


# 1 Recursive call
def _chk_preferred_list_group(payload_s,
                              paylist,
                              looplist,
                              preferred_group,
                              group_uri,
                              key_preferred):
    if key_preferred is None:
        return 0
    if len(payload_s) <= 1:
        return 0
    name_p2 = payload_s.query("代表語 == \""+key_preferred.replace("'", "\'")+"\"")
    for index2, item2 in name_p2.iterrows():
        _add_list(paylist, item2, preferred_group, group_uri)
        if str(item2['用語名']) != str(item2['代表語']):
            wk_term = item2['用語名'] if pd.notnull(item2['用語名']) else None
            # Loop check
            for loopitem in looplist:
                if loopitem == wk_term:
                    return False
            looplist.append(wk_term)
            # Check for narrower groups in recursive calls
            _chk_preferred_list_group(payload_s,
                                      paylist,
                                      looplist,
                                      preferred_group,
                                      group_uri,
                                      wk_term)
    return True


# 1
def _add_list(paylist, item, preferred_group, group_uri):

    # Duplicate check
    for payitem in paylist:
        if payitem['term'] ==\
                item['用語名'] and payitem['preferred_label'] == item['代表語']:
            return False

    insert_data = {}
    insert_data['term'] =\
        item['用語名'] if pd.notnull(item['用語名']) else None
    insert_data['preferred_label'] =\
        item['代表語'] if pd.notnull(item['代表語']) else None
    insert_data['language'] =\
        item['言語'] if pd.notnull(item['言語']) else None
    insert_data['uri'] =\
        item['代表語のURI'] if pd.notnull(item['代表語のURI']) else None
    insert_data['broader_term'] =\
        item['上位語のURI'] if pd.notnull(item['上位語のURI']) else None
    insert_data['other_voc_syn_uri'] =\
        item['他語彙体系の同義語のURI'] if pd.notnull(item['他語彙体系の同義語のURI']) else None
    insert_data['term_description'] =\
        item['用語の説明'] if pd.notnull(item['用語の説明']) else None
    insert_data['created_time'] =\
        item['作成日'] if pd.notnull(item['作成日']) else None
    insert_data['modified_time'] =\
        item['最終更新日'] if pd.notnull(item['最終更新日']) else None

    insert_data['preferred_group'] = preferred_group
    insert_data['group_uri'] = group_uri
    paylist.append(insert_data)

    return True


# 1
def _add_preferred_list(paylist, item):

    # Duplicate check
    for payitem in paylist:
        if payitem['preferred_label'] == item['代表語']:
            return False

    insert_data = {}
    insert_data['term'] =\
        item['用語名'] if pd.notnull(item['用語名']) else None
    insert_data['preferred_label'] =\
        item['代表語'] if pd.notnull(item['代表語']) else None
    insert_data['language'] =\
        item['言語'] if pd.notnull(item['言語']) else None
    insert_data['uri'] =\
        item['代表語のURI'] if pd.notnull(item['代表語のURI']) else None
    insert_data['broader_term'] =\
        item['上位語のURI'] if pd.notnull(item['上位語のURI']) else None
    insert_data['other_voc_syn_uri'] =\
        item['他語彙体系の同義語のURI'] if pd.notnull(item['他語彙体系の同義語のURI']) else None
    insert_data['term_description'] =\
        item['用語の説明'] if pd.notnull(item['用語の説明']) else None
    insert_data['created_time'] =\
        item['作成日'] if pd.notnull(item['作成日']) else None
    insert_data['modified_time'] =\
        item['最終更新日'] if pd.notnull(item['最終更新日']) else None

    paylist.append(insert_data)

    return True


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
    # format is csv or xlsx
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
    elif p_format == 'xlsx':
        downloadFileName = 'temp_excel.xlsx'
        df_org.to_excel(downloadFileName, encoding='utf-8', index=False)
        response = make_response()
        response.data = open(downloadFileName, "rb").read()
        response.headers['Content-Disposition'] = 'attachment;'
        response.mimetype = XLSX_MIMETYPE
        os.remove(downloadFileName)
        return response

def _download_meta_file_ev_serialize(pl_simple, p_format):
    # format is csv or xlsx
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
    elif p_format == 'xlsx':
        downloadFileName = 'temp_excel.xlsx'
        df_org.to_excel(downloadFileName, encoding='utf-8', index=False)
        response = make_response()
        response.data = open(downloadFileName, "rb").read()
        response.headers['Content-Disposition'] = 'attachment;'
        response.mimetype = XLSX_MIMETYPE
        os.remove(downloadFileName)
        return response
