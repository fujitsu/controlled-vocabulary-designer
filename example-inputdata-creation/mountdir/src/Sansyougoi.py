#! /usr/bin/env python3
"""
Sansyougoi.py COPYRIGHT FUJITSU LIMITED 2021
"""
# -*- coding: utf-8 -*-

import argparse
import os
import json
import datetime
import inspect

import unicodedata
import pandas as pd
import numpy as np


def location(depth=0):
    frame = inspect.currentframe().f_back
    return os.path.basename(frame.f_code.co_filename),\
        frame.f_code.co_name, frame.f_lineno


def sansyougoi(relations_file, vec_file, input_file):

    # Import vector
    with open(relations_file) as f:
        output_all = json.load(f)

    vec = np.load(file=vec_file, allow_pickle=True)

    # Adds 2D coordinate information to variables for file output
    for idx in range(len(output_all)):
        if output_all[idx][4] != "":
            output_all[idx].append(vec.item()[output_all[idx][0]][0])
            output_all[idx].append(vec.item()[output_all[idx][0]][1])
        else:
            output_all[idx].append("")
            output_all[idx].append("")
    print(datetime.datetime.now(), "---output_all loop End:", idx, location())

    # ######### File output (all wordnet terms) ##########
    # csv
    header = ["用語名", "代表語", "言語", "代表語のURI", "上位語", "上位語のURI", "他語彙体系の同義語のURI", "用語の説明", "x座標値", "y座標値"]
    df1 = pd.DataFrame(output_all, columns=header)
    df1.drop(columns=['上位語'], inplace=True)
    # df1.to_excel(output_file_xlsx_all, index=False)

    '''
    # csv
    with open(output_file_csv, "w", encoding="utf_8_sig", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        for i in range(len(output)):
            writer.writerow(output[i])
    '''

    # ######### File output (terms relating to the terms of the field) ##########
    # Read and normalize tag data (terms for the field)
    tag_file = pd.read_csv(input_file)
    tag = list(tag_file["用語名"])
    # normalize term strings to match case
    tag = list(set(tag))

    # If there is a term name that is the same as the term name of the tag, extract the preferred label
    pref_target = []
    for idx_output in range(len(output_all)):
        if output_all[idx_output][0] in tag:
            pref_target.append(output_all[idx_output][1])

    # Extracts only the terms with preferred labels or broader terms
    output_target = []
    for idx_output in range(len(output_all)):
        if output_all[idx_output][1] in tag or\
           output_all[idx_output][4] in tag:
            output_target.append(output_all[idx_output])

    # csv
    df2 = pd.DataFrame(output_target, columns=header)
    df2.drop(columns=['上位語'], inplace=True)
    # df2.to_excel(output_file_xlsx_target, index=False)
    return df1, df2


def check_arg(args, config):
    endslist = [".json", ".npy", ".csv"]
    if not len(args.input) == len(endslist):
        print("invalid input file(s)")
        return False
    if not all(map(lambda x: x[1].endswith(endslist[x[0]]),
               enumerate(args.input))):
        print("invalid input file type")
        return False
    endslist = [".csv", ".csv"]
    if not len(args.output) == len(endslist):
        print("invalid output file(s)")
        return False
    if not all(map(lambda x: x[1].endswith(endslist[x[0]]),
               enumerate(args.output))):
        print("invalid output file type")
        return False
    return True


def main(args, config):
    relations_file = args.input[0]
    vec_file = args.input[1]
    input_file = args.input[2]
    output_file = args.output[0]
    output_file_target = args.output[1]

    df1, df2 = sansyougoi(relations_file, vec_file, input_file)

    df1.to_csv(output_file, index=False, encoding='utf-8-sig')
    df2.to_csv(output_file_target, index=False, encoding='utf-8-sig')
    # with open(output_file, 'w') as f:
    #    json.dump(vec, f, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        usage='%(prog)s [options]',
        description='''
example:
  $ python3 ./Sansyougoi.py -c config.json -i ExternalVocabulary.json
    WordEmbedding2.npy domain_words.csv -o SansyougoiAll.csv SansyougoiTarget.csv
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
    print ("start: " + os.path.basename(__file__))
    print("args: " + str(args))

    with open(args.config) as f:
        config = json.load(f)
    print("config:" + str(config))

    if check_arg(args, config):
        print(datetime.datetime.now(), "Sansyougoi Start", location())
        main(args, config)
        print(datetime.datetime.now(), "Sansyougoi End", location())
    else:
        exit(1)

    print ("finish: " + os.path.basename(__file__))
    exit(0)

