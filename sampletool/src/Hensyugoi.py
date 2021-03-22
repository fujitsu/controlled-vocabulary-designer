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
import pandas as pd
import numpy as np

def hensyugoi(tuning, hensyugoi_file, pos, vec, syn, hyper, filter_words):
    header = ['用語名', '標目', '標目のURI', '上位語', '同義語候補', '上位語候補', '品詞', 'x座標値', 'y座標値', '色1', '色2']
    with open(hensyugoi_file, 'w', newline="", errors='ignore', encoding='utf-8-sig') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        for word in filter_words:
            writer.writerow([word, word, "", "", ", ".join(syn.item()[word]), ", ".join(hyper.item().get(word)), pos.item().get(word), vec.item()[word][0]*tuning, vec.item()[word][1]*tuning, "black", "black"])


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
    endslist = [".npy", ".npy", ".npy", ".npy", ".npy"]
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
    output_file = args.output[0]

    pos = np.load(file=pos_file, allow_pickle = True)
    vec = np.load(file=vec_file, allow_pickle = True)
    syn = np.load(file=syn_file, allow_pickle = True)
    hyper = np.load(file=hyper_file, allow_pickle = True)
    filterddata =np.load(file=filterddata_file, allow_pickle = True)

    tuning = config["Hensyugoi"]["Hensyugoi"]["VectorMagnification"]
    hensyugoi(tuning, output_file, pos, vec, syn, hyper, filterddata)

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
