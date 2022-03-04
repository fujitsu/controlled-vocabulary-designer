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

def is_japanese(string):
    for ch in string:
        name = unicodedata.name(ch) 
        if "CJK UNIFIED" in name \
        or "HIRAGANA" in name \
        or "KATAKANA" in name:
            return True
    return False

def hensyugoi(tuning, hensyugoi_file, pos, vec, syn, hyper, filter_words, domain_word_file, voc_uri):
    # If domain _ word _ file exists in the same folder, extract field terms from domain _ word _ file
    if os.path.exists(domain_word_file) is True:
        # Import a list of terms in a field, normalize strings of terms
        tag_file = pd.read_csv(domain_word_file)
        tag_file = tag_file.fillna("")
        tag = list(tag_file["用語名"])
        tag = [(unicodedata.normalize("NFKC", char)).lower() for char in tag] # normalize term strings to match case
        tag = list(set(tag)) # normalized and lowercase to remove term duplication

    # Check if a column other than the term column exists
    flag_pref_label = True if('代表語' in tag_file.columns) else False
    flag_lang = True if('言語' in tag_file.columns) else False
    flag_uri = True if('代表語のURI' in tag_file.columns) else False
    flag_broader = True if('上位語のURI' in tag_file.columns) else False
    flag_other_voc_syn_uri = True if('他語彙体系の同義語のURI' in tag_file.columns) else False
    flag_term_description = True if('用語の説明' in tag_file.columns) else False
    flag_created = True if('作成日' in tag_file.columns) else False
    flag_modified = True if('最終更新日' in tag_file.columns) else False
    flag_color1 = True if('色1' in tag_file.columns) else False
    flag_color2 = True if('色2' in tag_file.columns) else False
    flag_confirmed = True if('確定済み用語' in tag_file.columns) else False

    dic_pref_label = {}
    dic_lang = {}
    dic_uri= {}
    dic_broader= {}
    dic_other_voc_syn_uri= {}
    dic_term_description= {}
    dic_created= {}
    dic_modified= {}
    dic_color1= {}
    dic_color2= {}
    dic_confirmed= {}
    for index, row in tag_file.iterrows():
        dic_pref_label[row["用語名"]] = row["代表語"] if flag_pref_label else ""
        dic_lang[row["用語名"]] = row["言語"] if flag_lang else ""
        dic_uri[row["用語名"]] = row["代表語のURI"] if flag_uri else ""
        dic_broader[row["用語名"]] = row["上位語のURI"] if flag_broader else ""
        dic_other_voc_syn_uri[row["用語名"]] = row["他語彙体系の同義語のURI"] if flag_other_voc_syn_uri else ""
        dic_term_description[row["用語名"]] = row["用語の説明"] if flag_term_description else ""
        dic_created[row["用語名"]] = row["作成日"] if flag_created else ""
        dic_modified[row["用語名"]] = row["最終更新日"] if flag_modified else ""
        dic_color1[row["用語名"]] = row["色1"] if flag_color1 else ""
        dic_color2[row["用語名"]] = row["色2"] if flag_color2 else ""
        dic_confirmed[row["用語名"]] = row["確定済み用語"] if flag_confirmed else ""

    if(flag_uri == False):
        uri = voc_uri
        if(uri[-1] != "/"):
            uri = uri + "/"
    idx = 0
    header = ['用語名', '代表語', '言語', '代表語のURI', '上位語のURI', '他語彙体系の同義語のURI', '用語の説明', '作成日', '最終更新日', '同義語候補', '上位語候補', 'x座標値', 'y座標値', '色1', '色2', '確定済み用語']
    with open(hensyugoi_file, 'w', newline="", errors='ignore', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        for word in filter_words:
            word_normalized = unicodedata.normalize("NFKC", word).lower()
            pref_label = dic_pref_label[word] if flag_pref_label else word
            if flag_lang:
                lang = dic_lang[word]
            else:
                #lang = 'ja' if is_japanese(word) else 'en'
                lang = 'ja'
            uri_pref = dic_uri[word] if flag_uri else uri + str(idx + 1)
            broader = dic_broader[word] if flag_broader else ""
            other_voc_syn_uri = dic_other_voc_syn_uri[word] if flag_other_voc_syn_uri else ""
            term_description = dic_term_description[word] if flag_term_description else ""
            created = dic_created[word] if flag_created else ""
            modified = dic_modified[word] if flag_modified else ""
            color1 = dic_color1[word] if flag_color1 else "black"
            color2 = dic_color2[word] if flag_color2 else "black"
            confirmed = dic_confirmed[word] if flag_confirmed else 0
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
    domain_word_file = args.input[5]
    output_file = args.output[0]

    pos = np.load(file=pos_file, allow_pickle = True)
    vec = np.load(file=vec_file, allow_pickle = True)
    syn = np.load(file=syn_file, allow_pickle = True)
    hyper = np.load(file=hyper_file, allow_pickle = True)
    filterddata =np.load(file=filterddata_file, allow_pickle = True)

    tuning = config["Hensyugoi"]["Hensyugoi"]["VectorMagnification"]
    voc_uri = config["Hensyugoi"]["Hensyugoi"]["URI"]
    hensyugoi(tuning, output_file, pos, vec, syn, hyper, filterddata, domain_word_file, voc_uri)

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

