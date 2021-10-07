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

import unicodedata
from nltk.corpus import wordnet as wn
from rdflib import Graph
from rdflib import Literal
from rdflib.namespace import SKOS


def location(depth=0):
    frame = inspect.currentframe().f_back
    return os.path.basename(frame.f_code.co_filename),\
        frame.f_code.co_name, frame.f_lineno


def wordnet():
    # ######### Extract synonyms and broader terms for all wordnet terms ##########
    # Dictionary variable definition
    syn_word = {}  # {key: value} = {synset: headword}
    syn_word_no_dup = {}  # {key: value} = {synset：headword（no duplicates）}
    syn_hyper = {}  # {key: value} = {synset：synset of broader concept}
    syn_hyper_pref = {}  # {key: value} = {synset： preferred label of the first synset of the broader concepts}
    syn_pos = {}  # {key: value} = {synset： part of speech}

    for synset in wn.all_synsets("n"):
        # syn_word[synset] = synset.lemma_names("jpn")
        # + synset.lemma_names("eng")
        # normalize term strings to match case
        syn_word[synset] = [char for char in synset.lemma_names("jpn")]
        syn_pos[synset] = "名詞"
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
            output_all.append([syn_word_no_dup[key][idx_syn_word_no_dup],
                              syn_word_no_dup[key][0], "",
                              syn_hyper_pref[key], syn_pos[key]])
    print(datetime.datetime.now(), "---syn_word_no_dup loop End", location())

    return output_all


def cvo(in_file):

    print(datetime.datetime.now(), 'file:', in_file, location())

    file_ext = os.path.splitext(in_file)
    if file_ext[1] == '.ttl':
        relation = cvo_turtle(in_file)
    return relation


def cvo_turtle(in_file):
    g = Graph()
    g.parse(in_file, format='turtle')

    sansyogoi_data = []
    # Extract family name from scopeNote ##############
    #
    # s :subject
    # p :predicate
    # o :object <= scopeNote
    POS_MEISHI = "名詞"

    prefLabel = ''
    uri = ''
    prfLbl_pipeline = _getTriples(g, None, SKOS.prefLabel, None, 'ja')
    for s0, p0, o0 in prfLbl_pipeline:
        # Create preferred label record

        # print('o0:', o0)
        prefLabel = str(o0)
        uri = str(s0)

        broader = ''
        brdr_pipeline = _getTriples(g, s0, SKOS.broader, None)
        for s1, p1, o1 in brdr_pipeline:
            # print('o1:', o1)
            brdr_lbl_pipeline =\
                _getTriples(g, o1, SKOS.prefLabel, None, 'ja')
            for s2, p2, o2 in brdr_lbl_pipeline:
                # print('o2:', o2)
                broader = str(o2)

        sansyogoi_data.append([str(o0),
                               prefLabel,
                               uri,
                               broader,
                               POS_MEISHI])

        # Create synonym record
        # Register altlabel as a synonym
        # A term for which a broader term is registered shall be a broader term
        altLbl_pipeline = _getTriples(g, s0, SKOS.altLabel, None)
        for s3, p3, o3 in altLbl_pipeline:
            # print('o3:', o3)
            brdr_pipeline = _getTriples(g, s0, SKOS.broader, None)
            for s4, p4, o4 in brdr_pipeline:
                # print('o4:', o4)
                brdr_lbl_pipeline =\
                    _getTriples(g, o4, SKOS.prefLabel, None, 'ja')
                for s5, p5, o5 in brdr_lbl_pipeline:
                    # print('o5:', o5)
                    broader = str(o5)

            # Exclude empty characters
            if str(o3):
                sansyogoi_data.append([str(o3),
                                       prefLabel,
                                       uri,
                                       broader,
                                       POS_MEISHI])

    sansyogoi_filter = []
    # Filter duplicate terms
    for idx1, item1 in enumerate(sansyogoi_data):
        isDuplex = False
        for idx2, item2 in enumerate(sansyogoi_data):
            if not idx1 == idx2:
                if item1[0] == item2[0] and not item1[0] == item1[1]:
                    # Delete terms that are not preferred labels if they have the same name
                    # print('duplex item1:', item1[0], 'item2:', item2[0])
                    isDuplex = True

        # Remove a broader term if it has the same name as a preferred label
        if item1[1] == item1[3]:
            # print('cyclic term:', item1[1])
            item1[3] = ''

        if not isDuplex:
            sansyogoi_filter.append(item1)

    return sansyogoi_filter
    # return sansyogoi_data


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
    configlist3 = ["Algorithm", "wordnet", "CVO"]
    configlist4 = ["File"]
    configlist5 = ["wordnet", "CVO"]
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
    for item in configlist5:
        if item == mode_switch:
            in_flg = True
    if in_flg is False:
        print("Algorithm pattern is invalid value: " + mode_switch)
        return False
    if mode_switch == "CVO":
        for item in configlist4:
            if item not in\
               config["SanSyogoi"]["ExternalVocabulary"]["CVO"].keys():
                print("missing config value: " + item)
                return False
        # cvo_file existed check.
        cvo_file = config["SanSyogoi"]["ExternalVocabulary"]["CVO"]["File"]
        if not os.path.isfile(cvo_file):
            print('cvo file:', cvo_file, 'is not existed.')
            return False
        # cvo file format check.
        extension = os.path.splitext(cvo_file)[1]
        if not extension == '.ttl':
            print('cvo file:', extension, 'is not supported(', cvo_file, ').')
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
    elif mode_switch == "CVO":
        in_file = config["SanSyogoi"]["ExternalVocabulary"]["CVO"]["File"]
        relation = cvo(in_file)
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
