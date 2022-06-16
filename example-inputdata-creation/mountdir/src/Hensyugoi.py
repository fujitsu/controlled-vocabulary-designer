#! /usr/bin/env python3
"""
Hensyugoi.py COPYRIGHT FUJITSU LIMITED 2021
"""
# -*- coding: utf-8 -*-

import argparse
import os
import sys
import traceback
import json

import os
import csv
import codecs
import unicodedata
import pandas as pd
import numpy as np


def hensyugoi(tuning, hensyugoi_file, pos, vec, syn, hyper, filter_words, domain_words_file, voc_uri):
    # If domain_words_file exists in the same folder, extract field terms from domain_words_file
    if os.path.exists(domain_words_file) is True:
        # Import a list of terms in a field, normalize strings of terms
        domain_words_csv = pd.read_csv(domain_words_file)
        domain_words_csv = domain_words_csv.fillna("")
        domain_words = list(domain_words_csv["用語名"])

    # Check if a column other than the term column exists
    flag_pref_label = True if('代表語' in domain_words_csv.columns) else False
    flag_lang = True if('言語' in domain_words_csv.columns) else False
    flag_uri = True if('代表語のURI' in domain_words_csv.columns) else False
    flag_broader = True if('上位語のURI' in domain_words_csv.columns) else False
    flag_other_voc_syn_uri = True if('他語彙体系の同義語のURI' in domain_words_csv.columns) else False
    flag_term_description = True if('用語の説明' in domain_words_csv.columns) else False
    flag_created = True if('作成日' in domain_words_csv.columns) else False
    flag_modified = True if('最終更新日' in domain_words_csv.columns) else False
    flag_color1 = True if('色1' in domain_words_csv.columns) else False
    flag_color2 = True if('色2' in domain_words_csv.columns) else False
    flag_confirmed = True if('確定済み用語' in domain_words_csv.columns) else False

    if(flag_uri == False):
        uri = voc_uri
        if(uri[-1] != "/"):
            uri = uri + "/"

    dic_preflabel_uri = {}
    suf = 1
    col_uri = []
    if flag_pref_label == True and flag_uri == False:
        for word in domain_words_csv["代表語"]:
            if word not in dic_preflabel_uri.keys():
                dic_preflabel_uri[word] = uri + str(suf)
                suf = suf + 1
        for word in domain_words_csv['代表語']:
            col_uri.append(dic_preflabel_uri[word])
    elif flag_pref_label == False and flag_uri == False:
        for word in domain_words_csv["用語名"]:
            if word not in dic_preflabel_uri.keys():
                dic_preflabel_uri[word] = uri + str(suf)
                suf = suf + 1
        for word in domain_words_csv['用語名']:
            col_uri.append(dic_preflabel_uri[word])

    idx = 0
    header = ['用語名', '代表語', '言語', '代表語のURI', '上位語のURI', '他語彙体系の同義語のURI', '用語の説明', '作成日', '最終更新日', '同義語候補', '上位語候補', 'x座標値', 'y座標値', '色1', '色2', '確定済み用語']
    with open(hensyugoi_file, 'w', newline="", errors='ignore', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        for index, word in enumerate(filter_words):
            pref_label = domain_words_csv["代表語"][index] if flag_pref_label else word
            lang = domain_words_csv["言語"][index] if flag_lang else "ja"
            uri_pref = domain_words_csv["代表語のURI"][index] if flag_uri else col_uri[index]
            broader = domain_words_csv["上位語のURI"][index] if flag_broader else ""
            other_voc_syn_uri = domain_words_csv["他語彙体系の同義語のURI"][index] if flag_other_voc_syn_uri else ""
            term_description = domain_words_csv["用語の説明"][index] if flag_term_description else ""
            created = domain_words_csv["作成日"][index] if flag_created else ""
            modified = domain_words_csv["最終更新日"][index] if flag_modified else ""
            color1 = domain_words_csv["色1"][index] if flag_color1 else "black"
            color2 = domain_words_csv["色2"][index] if flag_color2 else "black"
            confirmed = domain_words_csv["確定済み用語"][index] if flag_confirmed else 0
            word_normalized = unicodedata.normalize("NFKC", word).lower()
            if(word == ""):
                writer.writerow([word, pref_label, lang, uri_pref, broader, other_voc_syn_uri, term_description, created, modified, "", "", 0, 0, color1, color2, confirmed])
            else:
                writer.writerow([word, pref_label, lang, uri_pref, broader, other_voc_syn_uri, term_description, created, modified, ", ".join(syn.item()[word]), ", ".join(hyper.item().get(word_normalized)), vec.item()[word_normalized][0]*tuning, vec.item()[word_normalized][1]*tuning, color1, color2, confirmed])
            idx = idx + 1


def check_arg(args, config):
    configlist1 = ["Hensyugoi"]
    configlist2 = ["Hensyugoi"]
    configlist3 = ["VectorMagnification"]
    for item in configlist1:
        if item not in config.keys():
            print("missing config value: " + item)
            return False
    for item in configlist2:
        if item not in config["Hensyugoi"].keys():
            print("missing config value: " + item)
            return False
    for item in configlist3:
        if item not in config["Hensyugoi"]["Hensyugoi"].keys():
            print("missing config value: " + item)
            return False
    endslist = [".npy", ".npy", ".npy", ".npy", ".npy", ".csv"]
    if not len(args.input) == len(endslist):
        print("invalid input file(s)")
        return False
    if not all(map(lambda x: x[1].endswith(endslist[x[0]]), enumerate(args.input))):
        print("invalid input file type")
        return False
    endslist = [".csv"]
    if not len(args.output) == len(endslist):
        print("invalid output file(s)")
        return False
    if not all(map(lambda x: x[1].endswith(endslist[x[0]]), enumerate(args.output))):
        print("invalid output file type")
        return False
    return True

def main(args, config):
    pos_file = args.input[0]
    vec_file = args.input[1]
    syn_file = args.input[2]
    hyper_file = args.input[3]
    filterddata_file = args.input[4]
    domain_words_file = args.input[5]
    output_file = args.output[0]

    pos = np.load(file=pos_file, allow_pickle = True)
    vec = np.load(file=vec_file, allow_pickle = True)
    syn = np.load(file=syn_file, allow_pickle = True)
    hyper = np.load(file=hyper_file, allow_pickle = True)
    filterddata =np.load(file=filterddata_file, allow_pickle = True)

    tuning = config["Hensyugoi"]["Hensyugoi"]["VectorMagnification"]
    voc_uri = config["Hensyugoi"]["Hensyugoi"]["URI"]
    hensyugoi(tuning, output_file, pos, vec, syn, hyper, filterddata, domain_words_file, voc_uri)

    #with open(output_file, 'w') as f:
    #    json.dump(vec, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        usage = '%(prog)s [options]',
        description =
'''
example:
  $ python3 ./Hensyugoi.py -c config.json -i WordSeparation.npy WordEmbedding.npy SynonymExtraction.npy HypernymExtraction.npy Filtering.npy -o Hensyugoi.csv
''',
        add_help = True,
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument('-c', '--config', required=True, help="Configuration file path. (ex. config.json)")
    parser.add_argument('-i', '--input', required=True, help="Input file(s)", nargs='*')
    parser.add_argument('-o', '--output', required=True, help="Output file(s)", nargs='*')
    args = parser.parse_args()
    print ("start: " + os.path.basename(__file__))
    print("args: " + str(args))

    with open(args.config) as f:
        config = json.load(f)
    print("config:" + str(config))

    if check_arg(args, config):
        main(args, config)
    else:
        exit(1)

    print ("finish: " + os.path.basename(__file__))
    exit(0)

