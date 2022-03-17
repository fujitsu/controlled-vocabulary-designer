"""
Put the file you want to convert in the same folder as old_to_new.py.

command: 
python old_to_new.py [file name before conversion] [file name after conversion] [namespace]

ex) python old_to_new.py sample_before.csv sample_after.csv http://myVocab/

"""


##### Import library #####
import sys
import pandas as pd
import numpy as np


##### Import command line arguments #####
args = sys.argv
old_format_file_name = args[1]
new_format_file_name = args[2]
namespace = args[3]


##### Import csv file #####
old_format_file = pd.read_csv(old_format_file_name)


##### Add column #####
old_format_file.insert(2, '言語', 'ja')
old_format_file.insert(5, '他語彙体系の同義語のURI', np.nan)
old_format_file.insert(6, '用語の説明', np.nan)
old_format_file.insert(7, '作成日', np.nan)
old_format_file.insert(8, '最終更新日', np.nan)


##### Delete column #####
old_format_file.drop(columns='品詞', inplace=True)


##### Change column name #####
new_format_file = old_format_file.rename(columns={'上位語': '上位語のURI'})


##### Change value of each URI #####
# If the last character of the namespace is not "/", append "/".
if(namespace[-1] != "/"):
    namespace = namespace + "/"

# Assign a unique URI because each URI is NaN.
# Make sure that synonyms have the same URI.
# First, assign a unique URI for each preferred label.
dic_preflabel_uri = {}
for idx, term in enumerate(new_format_file['代表語']):
    dic_preflabel_uri[term] = namespace + str(idx + 1)

# Assign unique URIs for each term, taking synonyms into account
col_uri = []
for term in new_format_file['代表語']:
    col_uri.append(dic_preflabel_uri[term])

new_format_file.loc[:, "代表語のURI"] = col_uri


##### Change value of broader URI column #####
# Replace label with URI
col_broader_uri = []
for broader_term in new_format_file['上位語のURI']:
    if broader_term in dic_preflabel_uri.keys():
        col_broader_uri.append(dic_preflabel_uri[broader_term])
    else:
        col_broader_uri.append(np.nan)

new_format_file.loc[:, "上位語のURI"] = col_broader_uri


##### Export csv file #####
new_format_file.to_csv(new_format_file_name, encoding='utf-8-sig', index=False)

