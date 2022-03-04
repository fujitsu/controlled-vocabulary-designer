#! /usr/bin/env python3
"""
HypernymExtraction.py COPYRIGHT FUJITSU LIMITED 2021
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
from nltk.corpus import wordnet as wn
import subprocess
import codecs

def hypernym(txt_preprocessed_file, domain_word_file):
    # Imort text
    words_pre1 = []
    words_pre2 = []

    with codecs.open(txt_preprocessed_file, 'r', 'utf-8', 'ignore') as f:
        i = 0
        for line in f:
            words_pre1.append(line.split(" "))
            words_pre1[i][-1] = words_pre1[i][-1].replace('\n','') # exclude extra line breaks
            i += 1
        words_pre2 = list(itertools.chain.from_iterable(words_pre1)) # convert a two-dimensional array to a one-dimensional array

    # Import a list of terms in a field, normalize strings of terms
    tag_file = pd.read_csv(domain_word_file)
    tag = list(tag_file["用語名"])
    tag = [(unicodedata.normalize("NFKC", char)).lower() for char in tag] # normalize term strings to match case
    tag = list(set(tag)) # normalize term strings and reduce term duplication by using lowercase letters

    # All terms
    words = list(set(words_pre2 + tag)) # delete duplicates

    ########## Extract broader term ##########
    hyper = {} # broader term dictionary ({keys: value} = {term name: broader termx multiple}) for return values
    for word in words:
        try:
            synsets = wn.synsets(word,lang='jpn') # Don't forget lang = "jpn" for Japanese
            hypers_a_word = [] # list containing all the broader term for word
            for synset in synsets:
                for hypernym in synset.hypernyms():
                    hypers_a_word.append(hypernym.lemma_names("jpn"))
            hyper[word] = list(itertools.chain.from_iterable(hypers_a_word)) # convert a two-dimensional array to a one-dimensional array
        except ValueError:
            hyper[word] = []
    return hyper

def check_arg(args, config):
    configlist1 = ["Hensyugoi"]
    configlist2 = ["HypernymExtraction"]
    configlist3 = ["Algorithm", "hypernym"]
    configlist4 = ["Study", "Wiki"]
    studyParam = ["data", "data2", "data3"]
    for item in configlist1:
        if item not in config.keys():
            print("missing config value: " + item)
            return False
    for item in configlist2:
        if item not in config["Hensyugoi"].keys():
            print("missing config value: " + item)
            return False
    for item in configlist3:
        if item not in config["Hensyugoi"]["HypernymExtraction"].keys():
            print("missing config value: " + item)
            return False
    mode_switch = config["Hensyugoi"]["HypernymExtraction"]["Algorithm"]

    endslist = [".txt", ".csv"]
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
    txt_preprocessed_file = args.input[0]
    domain_word_file = args.input[1]
    output_file = args.output[0]

    mode_switch = config["Hensyugoi"]["HypernymExtraction"]["Algorithm"]
    if mode_switch == "hypernym":
        hyper = hypernym(txt_preprocessed_file, domain_word_file)

    np.save(output_file, hyper)
    #with open(output_file, 'w') as f:
    #    json.dump(vec, f, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        usage = '%(prog)s [options]',
        description =
'''
example:
  $ python3 ./HypernymExtraction.py -c config.json -i domain_text_wakati_preprocessed.txt domain_words.csv -o HypernymExtraction.npy
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

