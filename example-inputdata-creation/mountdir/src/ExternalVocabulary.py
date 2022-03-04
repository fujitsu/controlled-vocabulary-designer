#! /usr/bin/env python3
"""
ExternalVocabulary.py COPYRIGHT FUJITSU LIMITED 2021
"""
# -*- coding: utf-8 -*-

import argparse
import os
import json
import datetime
import inspect
import pandas as pd

import unicodedata
from nltk.corpus import wordnet as wn
from rdflib import Graph
from rdflib import Literal
from rdflib.namespace import SKOS
from rdflib.namespace import DCTERMS


def location(depth=0):
    frame = inspect.currentframe().f_back
    return os.path.basename(frame.f_code.co_filename),\
        frame.f_code.co_name, frame.f_lineno

def is_japanese(string):
    for ch in string:
        name = unicodedata.name(ch)
        if "CJK UNIFIED" in name \
        or "HIRAGANA" in name \
        or "KATAKANA" in name:
            return True
    return False

def wordnet():
    # ######### Extract synonyms and broader terms for all wordnet terms ##########
    # Dictionary variable definition
    syn_word = {}  # {key: value} = {synset: headword}
    syn_word_no_dup = {}  # {key: value} = {synset：headword（no duplicates）}
    syn_hyper = {}  # {key: value} = {synset：synset of broader concept}
    syn_hyper_pref = {}  # {key: value} = {synset： preferred label of the first synset of the broader concepts}

    for synset in wn.all_synsets("n"):
        # syn_word[synset] = synset.lemma_names("jpn")
        # + synset.lemma_names("eng")
        # normalize term strings to match case
        syn_word[synset] = [char for char in synset.lemma_names("jpn")]
    print(datetime.datetime.now(), "---all_synsets syn_word End", location())

    # create dict {key: value} = {synset: synset of broader concept}
    for synset in wn.all_synsets("n"):
        syn_hyper[synset] = synset.hypernyms()
    print(datetime.datetime.now(), "--all_synsets syn_hyper End", location())

    # create dict {key: value} = {synset: headword(no duplicates)}
    # Because the same headword exists in more than one synset, remove the headword from the synset if the previous headword is included in the synset to eliminate duplicates
    # The reason for dedupe is that in CVD, if the same term exists in more than one synonym group, it will result in an error when reading the reference vocabulary file.
    word_list = [] # list of headwords that have existed
    for key in syn_word:
        word_no_dup =\
            list(set(syn_word[key]) & (set(word_list) ^ set(syn_word[key])))
        word_list += word_no_dup
        syn_word_no_dup[key] = word_no_dup
    print(datetime.datetime.now(), "---word_list loop End", location())

    # create dict {key: value} = {synset: preferred label of the first synset of the broader concepts}
    for key in syn_hyper:
        if len(syn_hyper[key]) != 0 and\
           len(syn_word_no_dup[syn_hyper[key][0]]) != 0:
            # The heading is the first term in the first generic concept.
            syn_hyper_pref[key] = syn_word_no_dup[syn_hyper[key][0]][0]
        else:
            syn_hyper_pref[key] = "" # No broader concept or no headword for the first broader concept
    print(datetime.datetime.now(), "---syn_hyper_pref loop End", location())

    # create 2D array for file output
    output_all = []
    for key in syn_word_no_dup:
        for idx_syn_word_no_dup in range(len(syn_word_no_dup[key])):
            # lang = 'ja' if is_japanese(syn_word_no_dup[key][idx_syn_word_no_dup]) else 'en'
            lang = 'ja'
            output_all.append([syn_word_no_dup[key][idx_syn_word_no_dup],
                              syn_word_no_dup[key][0], lang, "",
                              syn_hyper_pref[key], "", "", ""])
    print(datetime.datetime.now(), "---syn_word_no_dup loop End", location())

    return output_all


def reference_csv(csv_file):
    # Import csv file and extract relationships between terms
    reference_df = pd.read_csv(f'../data/{csv_file}')
    reference_df = reference_df.fillna("")

    # Make mapping dictionary
    dic_uri_preflabel_ja = {}
    dic_uri_preflabel_en = {}
    for idx, uri in enumerate(reference_df['代表語のURI']):
        if reference_df["言語"][idx] == "ja":
            dic_uri_preflabel_ja[uri] = reference_df['代表語'][idx]
        if reference_df["言語"][idx] == "en":
            dic_uri_preflabel_en[uri] = reference_df['代表語'][idx]

    output_all = []
    for index, row in reference_df.iterrows():
        if row["言語"] == "ja" and row["上位語のURI"] != "":
            output_all.append([row["用語名"], row["代表語"], row["言語"], row["代表語のURI"], dic_uri_preflabel_ja[row["上位語のURI"]], row["上位語のURI"], row["他語彙体系の同義語のURI"], row["用語の説明"]])
        elif row["言語"] == "ja" and row["上位語のURI"] == "":
            output_all.append([row["用語名"], row["代表語"], row["言語"], row["代表語のURI"], "", row["上位語のURI"], row["他語彙体系の同義語のURI"], row["用語の説明"]])
        elif row["言語"] == "en" and row["上位語のURI"] != "":
            output_all.append([row["用語名"], row["代表語"], row["言語"], row["代表語のURI"], dic_uri_preflabel_en[row["上位語のURI"]], row["上位語のURI"], row["他語彙体系の同義語のURI"], row["用語の説明"]])
        elif row["言語"] == "en" and row["上位語のURI"] == "":
            output_all.append([row["用語名"], row["代表語"], row["言語"], row["代表語のURI"], "", row["上位語のURI"], row["他語彙体系の同義語のURI"], row["用語の説明"]])

    return output_all


def reference_ttl(rdf_file):
    g = Graph()
    g.parse(f'../data/{rdf_file}', format='turtle')
    sansyogoi_data = []
    uri = []
    for sub, pred, obj in g.triples((None, SKOS.prefLabel, None)):
        uri.append(sub)

    uri = list(set(uri))

    for u in uri:
        # Calculate the number of lines per concept
        len_concept_ja_row = ""
        len_concept_en_row = ""
        len_preflabel_ja = 0
        len_preflabel_en = 0
        len_altlabel_ja = 0
        len_altlabel_en = 0
        len_description_ja = 0
        len_description_en = 0
        lang = ""
        for sub, pred, obj in g.triples((u, SKOS.prefLabel, None)):
            lang = str(repr(obj))[-4:-2]
            if lang == "ja":
                len_preflabel_ja = len_preflabel_ja + 1
            if lang == "en":
                len_preflabel_en = len_preflabel_en + 1
        
        for sub, pred, obj in g.triples((u, SKOS.altLabel, None)):
            lang = str(repr(obj))[-4:-2]
            if lang == "ja":
                len_altlabel_ja = len_altlabel_ja + 1
            if lang == "en":
                len_altlabel_en = len_altlabel_en + 1
        
        for sub, pred, obj in g.triples((u, DCTERMS.description, None)):
            lang = str(repr(obj))[-4:-2]
            if lang == "ja":
                len_description_ja = len_description_ja + 1
            if lang == "en":
                len_description_en = len_description_en + 1
        
        len_concept_ja_row = max(len_preflabel_ja+len_altlabel_ja, len_description_ja)
        len_concept_en_row = max(len_preflabel_en+len_altlabel_en, len_description_en)
        
        # Extract triple information for each concept
        term_ja = []
        term_en = []
        preflabel_ja = ""
        preflabel_en = ""
        altlabel_ja = []
        altlabel_en = []
        broader_term_ja = ""
        broader_term_en = ""
        broader_uri = ""
        exactMatch = ""
        description_ja = ""
        description_en = ""
        # skos:prefLabel
        for sub, pred, obj in g.triples((u, SKOS.prefLabel, None)):
            lang = str(repr(obj))[-4:-2]
            if lang == "ja":
                preflabel_ja = str(obj)
            if lang == "en":
                preflabel_en = str(obj)
        
        # skos:altLabel
        for sub, pred, obj in g.triples((u, SKOS.altLabel, None)):
            lang = str(repr(obj))[-4:-2]
            if lang == "ja":
                altlabel_ja.append(str(obj))
            if lang == "en":
                altlabel_en.append(str(obj))
        
        # skos:broader
        for sub1, pred1, obj1 in g.triples((u, SKOS.broader, None)):
            for sub2, pred2, obj2 in g.triples((obj1, SKOS.prefLabel, None)):
                lang = str(repr(obj2))[-4:-2]
                if lang == "ja":
                    broader_term_ja = str(obj2)
                if lang == "en":
                    broader_term_en = str(obj2)
            broader_uri = str(obj1)
        
        # skos:exactMatch
        for sub, pred, obj in g.triples((u, SKOS.exactMatch, None)):
            exactMatch = str(obj)
        
        # dct:description
        for sub, pred, obj in g.triples((u, DCTERMS.description, None)):
            lang = str(repr(obj))[-4:-2]
            if lang == "ja":
                description_ja = str(obj)
            if lang == "en":
                description_en = str(obj)
        
        # skos:prefLabel + skos:altLabel
        term_ja = altlabel_ja
        term_ja.append(preflabel_ja)
        term_en = altlabel_en
        term_en.append(preflabel_en)
        
        for idx in range(0, len_concept_ja_row):
            sansyogoi_data.append([term_ja[idx], preflabel_ja, "ja", str(u), broader_term_ja, broader_uri, exactMatch, description_ja])
        
        for idx in range(0, len_concept_en_row):
            sansyogoi_data.append([term_en[idx], preflabel_en, "en", str(u), broader_term_en, broader_uri, exactMatch, description_en])
        
    return sansyogoi_data


def _getTriples(g, s=None, p=None, o=None, lang=None):
    for s1, p1, o1 in g.triples((s, p, o)):
        if lang is None:
            yield s1, p1, o1
        else:
            for s2, p2, o2 in g.triples((s1, p1, Literal(o1, lang=lang))):
                yield s2, p2, o2


def check_arg(args, config):
    configlist1 = ["SanSyogoi"]
    configlist2 = ["ExternalVocabulary"]
    configlist3 = ["Algorithm", "wordnet", "reference.csv", "reference.ttl"]
    configlist4 = ["wordnet", "reference.csv", "reference.ttl"]
    for item in configlist1:
        if item not in config.keys():
            print("missing config value: " + item)
            return False
    for item in configlist2:
        if item not in config["SanSyogoi"].keys():
            print("missing config value: " + item)
            return False
    for item in configlist3:
        if item not in config["SanSyogoi"]["ExternalVocabulary"].keys():
            print("missing config value: " + item)
            return False
    mode_switch = config["SanSyogoi"]["ExternalVocabulary"]["Algorithm"]
    in_flg = False
    for item in configlist4:
        if item == mode_switch:
            in_flg = True
    if in_flg is False:
        print("Algorithm pattern is invalid value: " + mode_switch)
        return False
    if mode_switch == "reference.csv":
        # "reference.csv" existed check.
        csv_file = config["SanSyogoi"]["ExternalVocabulary"]["Algorithm"]
        if not os.path.isfile(f'../data/{csv_file}'):
            print('csv file:', csv_file, 'is not existed.')
            return False
        # csv file format check.
        extension = os.path.splitext(csv_file)[1]
        if not extension == '.csv':
            print('csv file:', extension, 'is not supported(', csv_file, ').')
            return False
    if mode_switch == "reference.ttl":
        # "reference.ttl" existed check.
        ttl_file = config["SanSyogoi"]["ExternalVocabulary"]["Algorithm"]
        if not os.path.isfile(f'../data/{ttl_file}'):
            print('ttl file:', ttl_file, 'is not existed.')
            return False
        # ttl file format check.
        extension = os.path.splitext(ttl_file)[1]
        if not extension == '.ttl':
            print('ttl file:', extension, 'is not supported(', ttl_file, ').')
            return False

    endslist = []
    if not len(args.input) == len(endslist):
        print("invalid input file(s)")
        return False
    if not all(map(lambda x: x[1].endswith(endslist[x[0]]),
               enumerate(args.input))):
        print("invalid input file type")
        return False
    endslist = [".json"]
    if not len(args.output) == len(endslist):
        print("invalid output file(s)")
        return False
    if not all(map(lambda x: x[1].endswith(endslist[x[0]]),
               enumerate(args.output))):
        print("invalid output file type")
        return False
    return True


def main(args, config):
    output_file = args.output[0]

    mode_switch = config["SanSyogoi"]["ExternalVocabulary"]["Algorithm"]
    if mode_switch == "wordnet":
        relation = wordnet()
    elif mode_switch == "reference.csv":
        relation = reference_csv(mode_switch)
    elif mode_switch == "reference.ttl":
        relation = reference_ttl(mode_switch)
    # np.save(output_file, vec)
    with open(output_file, 'w') as f:
        json.dump(relation, f, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        usage='%(prog)s [options]',
        description='''
example:
  $ python3 ./ExternalVocabulary.py -c config.json -i
  -o ExternalVocabulary.json
''',
        add_help=True,
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument('-c', '--config', required=True,
                        help="Configuration file path. (ex. config.json)")
    parser.add_argument('-i', '--input', required=True,
                        help="Input file(s)", nargs='*')
    parser.add_argument('-o', '--output', required=True,
                        help="Output file(s)", nargs='*')
    args = parser.parse_args()
    print("start: " + os.path.basename(__file__))
    print("args: " + str(args))

    with open(args.config) as f:
        config = json.load(f)
    print("config:" + str(config))

    if check_arg(args, config):
        print(datetime.datetime.now(), "ExternalVocabulary Start", location())
        main(args, config)
        print(datetime.datetime.now(), "ExternalVocabulary End", location())
    else:
        exit(1)

    print("finish: " + os.path.basename(__file__))
    exit(0)

