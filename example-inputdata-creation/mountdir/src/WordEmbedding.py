#! /usr/bin/env python3
"""
WordEmbedding.py COPYRIGHT FUJITSU LIMITED 2021
"""
# -*- coding: utf-8 -*-

import copy
import argparse
import os
import sys
import traceback
import json
from jsonpointer import resolve_pointer
import os
import re
import pandas as pd
import pickle
import logging
import itertools
import numpy as np
import unicodedata
import multiprocessing
from gensim.models import word2vec
from gensim.models import KeyedVectors
from gensim.models.fasttext import FastText
from sklearn.metrics import pairwise_distances
from sklearn.manifold import TSNE


def vector(txt_preprocessed_file, domain_words_file, domain_text_preprocessed_file, algorithm):

    ########## word2vec ##########
    os.environ['PYTHONHASHSEED'] = '0' # If you want to get the same result on the same input, set the workers = 1 argument of Word2Vec () and add "PYTHONHASHSEED = 0" on the command line (For python3.X)
    logging.basicConfig(format='%(asctime)s : %(levelname)s : %(message)s', level=logging.INFO)
    if algorithm == "word2vec":
        sentences = word2vec.LineSentence(txt_preprocessed_file)
        model = word2vec.Word2Vec(sentences, size=200, window=15, sg=1, seed=1, iter=2, workers=1, compute_loss=True, min_count=0)
    else:
        shellcommand = "fasttext skipgram -input \"" + txt_preprocessed_file + "\" -output WordEmbedding_fasttext_model"
        print("shellcommand: " + shellcommand)
        os.system(shellcommand)
        model = FastText.load_fasttext_format("WordEmbedding_fasttext_model.bin")

    vocab = model.wv.index2word # all terms
    v_word2vec = model.wv[vocab] # vectors for all terms

    ########## Import a list of terms in the field and adds terms that do not exist as vectors to the word2vec model, expressed as the average of the vectors of the divided terms ##########
    # If domain_words_file exists in the same folder, extract field terms from domain_words_file
    if os.path.exists(domain_words_file) is True:

        # Import a list of terms in a field, normalize strings of terms
        domain_words_csv = pd.read_csv(domain_words_file)
        domain_words = list(domain_words_csv["用語名"])
        domain_words = [(unicodedata.normalize("NFKC", char)).lower() for char in domain_words] # normalize term strings to match case
        domain_words = list(set(domain_words)) # normalized and lowercase to remove term duplication

    # If domain_words_file does not exist and domain _ text _ preprocessed _ file exists, extract field terms from domain _ text _ preprocessed _ file
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
        domain_words = words

    # Extracts terms that exist in the term list of the field but do not exist as vectors for word embedding
    domain_words_only = list(set(domain_words) & (set(domain_words) ^ set(vocab)))

    vocab_matched = {} # {key: value} = {First matching term in the learned model: number of characters matched}
    combination = {} # {key: value} = {Field terms: terms for multiple learned models that when combined become field terms}
    combination_buffer = [] # a list of terms in a field that stores terms from multiple learned models that, when combined, become terms in the field

    count = 0
    for str_domain_words in domain_words_only:
        print("domain_words_only search:" + str(count) + "/" + str(len(domain_words_only)))
        count += 1
        str_domain_words_loop = str_domain_words # str_domain_words minus matching strings into str_domain_words_loop
        combination_buffer = []
        while len(str_domain_words_loop) > 0: # The length of str_domain_words is greater than zero, excluding the matching string. That is, it does not match.
            vocab_matched = {}
            for str_vocab in vocab:
                try:
                    match_obj=re.match(str_vocab, str_domain_words_loop) # Find matching terms from the beginning of the learned model
                    vocab_matched[str_vocab] = match_obj.end() - match_obj.start() # Stores the first matching term and the number of characters matched
                except AttributeError:
                    pass
            try:
                combination_buffer.append(max(vocab_matched, key=vocab_matched.get))
                str_domain_words_loop = str_domain_words_loop[max(vocab_matched.values()):] # Field term string with matching characters removed from beginning
            except ValueError: # If there is no matching term in the learned model
                combination_buffer.append("")
                str_domain_words_loop = str_domain_words_loop[1:] # Delete the first character of the field term string
        combination[str_domain_words] = combination_buffer

    with open("combination.pkl", "wb") as f:
        pickle.dump(combination, f) # save

    # Add field terms and their vectors to word2vec's base model
    model.wv[""] = np.zeros(np.shape(v_word2vec)[1])
    v_word2vec_domain_words_only = {}

    count = 0
    for key in combination:
        print("combination search:" + str(count) + "/" + str(len(combination)))
        count += 1
        v_sum = [0.0] * np.shape(v_word2vec)[1] # list initialization
        for word_idx in range(len(combination[key])):
            v_sum = list(map(lambda x,y: x+y, v_sum, model.wv[combination[key][word_idx]]))
        if len(set(combination[key])) == 1 and list(set(combination[key]))[0] is "":
            model.wv[key] = model.wv[""]
        else:
            v_word2vec_domain_words_only[key] = np.array(list((map(lambda x: x/len(combination[key]), v_sum))))
            model.wv[key] = v_word2vec_domain_words_only[key]

    # Update the term names and vectors contained in the model
    vocab = model.wv.index2word # all terms
    v_word2vec = model.wv[vocab] # vectors for all terms

    ########## t-sne ##########
    #distance_matrix = pairwise_distances(v_word2vec, v_word2vec, metric='cosine', n_jobs=-1)
    #distance_matrix = pairwise_distances_chunked(v_word2vec, v_word2vec, metric='cosine', n_jobs=-1)
    #tsne = TSNE(metric="precomputed", n_jobs=multiprocessing.cpu_count(), n_components=2)
    #v_tsne = tsne.fit_transform(distance_matrix)

    # Vector normalization
    model_normalized = copy.deepcopy(model)
    v_word2vec_normalized = []
    for voc in vocab:
        if(np.linalg.norm(model.wv[voc], ord=2) == 0):
            model_normalized.wv[voc] = np.zeros(np.shape(v_word2vec)[1])
        else:
            model_normalized.wv[voc] = model.wv[voc] / np.linalg.norm(model.wv[voc], ord=2)

    v_word2vec_normalized = model_normalized.wv[vocab]

    tsne = TSNE(metric="euclidean", n_jobs=multiprocessing.cpu_count(), n_components=2)
    v_tsne = tsne.fit_transform(v_word2vec_normalized)

    # 2D vector dictionary {keys: value} = {term: [x-coordinate, y-coordinate]}
    vec = {}
    for i in range(len(vocab)):
        vec[vocab[i]] = [v_tsne[i, 0], v_tsne[i, 1]]

    return vec, model

def check_arg(args, config):
    algorithm = resolve_pointer(config, "/Hensyugoi/WordEmbedding/Algorithm", None)
    if algorithm not in ["word2vec", "fasttext"]:
        print("invalid algorithm in configfile")
        return False
    endslist = [".txt", ".csv", ".txt"]
    if not len(args.input) == len(endslist):
        print("invalid input file(s)")
        return False
    if not all(map(lambda x: x[1].endswith(endslist[x[0]]), enumerate(args.input))):
        print("invalid input file type")
        return False
    endslist = [".npy", ".model"]
    if not len(args.output) == len(endslist):
        print("invalid output file(s)")
        return False
    if not all(map(lambda x: x[1].endswith(endslist[x[0]]), enumerate(args.output))):
        print("invalid output file type")
        return False
    return True

def main(args, config):
    txt_preprocessed_file = args.input[0]
    domain_words_file = args.input[1]
    domain_text_preprocessed_file = args.input[2]
    output_file = args.output[0]
    output_file_model = args.output[1]

    algorithm = resolve_pointer(config, "/Hensyugoi/WordEmbedding/Algorithm")
    vec, model = vector(txt_preprocessed_file, domain_words_file, domain_text_preprocessed_file, algorithm)

    np.save(output_file, vec)
    model.save(output_file_model)

    #with open(output_file, 'w') as f:
    #    json.dump(vec, f, indent=2, ensure_ascii=False)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        usage = '%(prog)s [options]',
        description =
'''
example:
  $ python3 ./WordEmbedding.py -c config.json -i domain_text_wakati_preprocessed.txt domain_words.csv domain_wakati_preprocessed.txt -o WordEmbedding.npy WordEmbedding.model
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

