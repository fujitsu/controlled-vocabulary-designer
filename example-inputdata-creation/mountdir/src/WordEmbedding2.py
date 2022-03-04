#! /usr/bin/env python3
"""
WordEmbedding2.py COPYRIGHT FUJITSU LIMITED 2021
"""
# -*- coding: utf-8 -*-

import argparse
import os
import json
import datetime
import inspect

import numpy as np
from gensim.models.poincare import PoincareModel


def location(depth=0):
    frame = inspect.currentframe().f_back
    return os.path.basename(frame.f_code.co_filename),\
        frame.f_code.co_name, frame.f_lineno


def poincare(relations_file, key_epochs):
    # read relation file
    with open(relations_file) as f:
        output_all = json.load(f)
    relations = [(x[0], x[4]) for x in output_all if x[4] != ""]

    # ######### poincare embedding ##########
    # train
    print(datetime.datetime.now(), "---poincare embedding Start", location())
    # os.environ['PYTHONHASHSEED'] = '0'
    # If you want to get the same result for the same input, set the PoincareModel () argument to workers = 1 and lock seed.
    model = PoincareModel(train_data=relations, size=2, negative=8,
                          workers=1, seed=1)
    model.train(epochs=key_epochs)
    print(datetime.datetime.now(), "---poincare embedding End", location())

    # Create dictionary {keys: value} = {term: 2D coordinate values}
    vec = {}
    for word in model.kv.vocab.keys():
        vec[word] = model.kv.get_vector(word)
    print(datetime.datetime.now(), "---model.kv.vocab.keys End", location())

    # plot
    '''
    poincare_map = gensim.viz.poincare.poincare_2d_visualization(model=model,
                                                                tree=relations,
                                                                figure_title="tutorial",
                                                                show_node_labels=model.kv.vocab.keys())
    offline.plot(poincare_map)
    '''

    return vec, model


def check_arg(args, config):
    configlist1 = ["SanSyogoi"]
    configlist2 = ["WordEmbedding2"]
    configlist3 = ["poincare.epochs"]
    for item in configlist1:
        if item not in config.keys():
            print("missing config value: " + item)
            return False
    for item in configlist2:
        if item not in config["SanSyogoi"].keys():
            print("missing config value: " + item)
            return False
    for item in configlist3:
        if item not in config["SanSyogoi"]["WordEmbedding2"].keys():
            print("missing config value: " + item)
            return False
    endslist = [".json"]
    if not len(args.input) == len(endslist):
        print("invalid input file(s)")
        return False
    if not all(map(lambda x: x[1].endswith(endslist[x[0]]),
                   enumerate(args.input))):
        print("invalid input file type")
        return False
    endslist = [".npy", ".model"]
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
    output_file = args.output[0]
    output_file_model = args.output[1]

    # Get epochs from json data
    key_epochs = config["SanSyogoi"]["WordEmbedding2"]['poincare.epochs']

    vec, model = poincare(relations_file, key_epochs)
    np.save(output_file, vec)
    model.save(output_file_model)
    # with open(output_file, 'w') as f:
    #    json.dump(vec, f, indent=2, ensure_ascii=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        usage='%(prog)s [options]',
        description='''
example:
  $ python3 ./WordEmbedding2.py -c config.json -i ExternalVocabulary.json
   -o WordEmbedding2.npy WordEmbedding2.model
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
        print(datetime.datetime.now(), "WordEmbedding2 Start", location())
        main(args, config)
        print(datetime.datetime.now(), "WordEmbedding2 End", location())
    else:
        exit(1)

    print ("finish: " + os.path.basename(__file__))
    exit(0)

