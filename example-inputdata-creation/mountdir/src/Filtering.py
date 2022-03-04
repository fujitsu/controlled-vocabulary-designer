#! /usr/bin/env python3
"""
Filtering.py COPYRIGHT FUJITSU LIMITED 2021
"""
# -*- coding: utf-8 -*-

import argparse
import os
import sys
import traceback
import json

import os
import re
import logging
import unicodedata
import numpy as np
import pandas as pd
import multiprocessing
import itertools
from gensim.models import word2vec
from gensim.models import KeyedVectors
from sklearn.metrics import pairwise_distances


def filt(domain_word_file, domain_text_preprocessed_file, vec):

    # Returns only field terms if domain _ word _ file exists in the same folder
    if os.path.exists(domain_word_file) is True:
        # Read tag data (terms for the field)
        tag_file = pd.read_csv(domain_word_file)
        tag = list(tag_file["用語名"])
        tag = list(set(tag)) # reduce term duplication by using lowercase letters

        return tag

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
        words_pre2 = list(itertools.chain.from_iterable(words_pre1)) # Convert a two-dimensional array to a one-dimensional array
        # Delete duplicates
        words = set(words_pre2)
        if "" in words:
            words.remove("")
        return words

    # If no duplicate domain _ word _ file or domain _ text _ preprocessed _ file exists, returns all terms learned by word embedding
    else:
        tag = list(vec.item().keys())
        return tag

def check_arg(args, config):
    endslist = [".csv", ".txt", ".npy"]
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
    vector_file = args.input[2]
    output_file = args.output[0]

    vec = np.load(file=vector_file, allow_pickle = True)
    filterddata = filt(domain_word_file, domain_text_preprocessed_file, vec)

    np.save(output_file, filterddata)
    #with open(output_file, 'w') as f:
    #    json.dump(vec, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        usage = '%(prog)s [options]',
        description =
'''
example:
  $ python3 ./Filtering.py -c config.json -i domain_words.csv domain_wakati_preprocessed.txt WordEmbedding.npy -o Filtering.npy
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

