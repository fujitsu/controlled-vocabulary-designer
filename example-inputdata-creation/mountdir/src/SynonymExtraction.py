#! /usr/bin/env python3
"""
SynonymExtraction.py COPYRIGHT FUJITSU LIMITED 2021
"""
# -*- coding: utf-8 -*-

import argparse
import os
import sys
import traceback
import json

import os
import sys
import csv
import itertools
import unicodedata
import pandas as pd
import numpy as np
from gensim.models import KeyedVectors
from jsonpointer import resolve_pointer

def synonymous(domain_word_file, domain_text_preprocessed_file, domain_added_model_file, syn_threshold=0.95, syn_limit=10):

    # Returns only field terms if domain _ word _ file exists in the same folder
    if os.path.exists(domain_word_file) is True:
        # Read and normalize tag data (terms for the field)
        tag_file = pd.read_csv(domain_word_file)
        tag = list(tag_file["用語名"])
        tag_no_normalized = list(set(tag))
        tag = [(unicodedata.normalize("NFKC", char)).lower() for char in tag] # normalize term strings to match case
        tag = list(set(tag)) # normalized and lowercase to remove term duplication
        target_words = tag

    # If domain _ word _ file is not present and domain _ text _ preprocessed _ file is present, returns all text data terms in the field
    elif os.path.exists(domain_text_preprocessed_file) is True:
        with open(domain_text_preprocessed_file, encoding="utf_8") as f:
            txt = f.read()
        txt_splited_newline = txt.split('\n')
        words_pre1 = []
        words_pre2 = []
        words = []
        for i in range(len(txt_splited_newline)):
            words_pre1.append(txt_splited_newline[i].split(" "))
        words_pre2 = list(itertools.chain.from_iterable(words_pre1)) # convert a two-dimensional array to a one-dimensional array
        words = set(words_pre2) # delete duplicates
        if "" in words:
            words.remove("")
        target_words = words

    # If neither domain _ word _ file nor domain _ text _ preprocessed _ file exists, returns all terms learned by word embedding
    else:
        model = KeyedVectors.load(domain_added_model_file)
        target_words = model.wv.index2word

    # For all the terms that are the target of synonym extraction, up to the n-most similarity learned in the model is extracted.
    syn_normalized = {} # {key: value} = {term name: synonym}
    model = KeyedVectors.load(domain_added_model_file)
    for word in target_words:
        results = model.most_similar(positive=word, topn=syn_limit)
        results = list(filter(lambda x: x[1] >= syn_threshold, results))
        syn_normalized[word] = [x[0] for x in results]

    con_sim = {} # {key：value} = {(term, term):cos sim}
    for w1 in tag_no_normalized:
        for w2 in tag_no_normalized:
            try:
                con_sim[w1, w2] = model.similarity(unicodedata.normalize("NFKC", w1).lower(), unicodedata.normalize("NFKC", w2).lower())
            except KeyError:
                continue

    # sort by values
    con_sim_sorted = sorted(con_sim.items(), key=lambda x:x[1], reverse=True)

    syn = {} # {key: value} = {term name: synonym}
    for word in tag_no_normalized:
        res = []
        for comb in con_sim_sorted:
            if comb[0][0] == word:
                if len(res) <= int(syn_limit * 0.5):
                    res.append(comb[0][1])
        if word in res:
            res.remove(word)
        syn[word] = res + syn_normalized[unicodedata.normalize("NFKC", word).lower()]

    return syn

def check_arg(args, config):
    endslist = [".csv", ".txt", ".model"]
    if not len(args.input) == len(endslist):
        print("invalid input file(s)")
        return False
    if not all(map(lambda x: x[1].endswith(endslist[x[0]]), enumerate(args.input))):
        print("invalid input file type")
        return False
    endslist = [".npy"]
    if not len(args.output) == len(endslist):
        print("invalid output file(s)")
        return False
    if not all(map(lambda x: x[1].endswith(endslist[x[0]]), enumerate(args.output))):
        print("invalid output file type")
        return False
    return True

def main(args, config):
    domain_word_file = args.input[0]
    domain_text_preprocessed_file = args.input[1]
    domain_added_model_file = args.input[2]
    output_file = args.output[0]
    syn_threshold = resolve_pointer(config, "/Hensyugoi/SynonymExtraction/SimilarityThreshold", 0.95)
    syn_limit = resolve_pointer(config, "/Hensyugoi/SynonymExtraction/SimilarityLimit", 10)

    syn = synonymous(domain_word_file, domain_text_preprocessed_file, domain_added_model_file,
                     syn_threshold=syn_threshold, syn_limit=syn_limit)

    np.save(output_file, syn, allow_pickle = True)
    #with open(output_file, 'w') as f:
    #    json.dump(vec, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        usage = '%(prog)s [options]',
        description =
'''
example:
  $ python3 ./SynonymExtraction.py -c config.json -i domain_words.csv domain_wakati_preprocessed.txt WordEmbedding.model -o SynonymExtraction.npy
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

