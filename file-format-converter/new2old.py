"""
Put the file you want to convert in the same folder as new2old.py.

command: 
python new2old.py [input new format csv] [output old format csv]

ex) python new2old.py in_new.csv out_old.csv

"""


##### Import library #####
import sys
import pandas as pd
import numpy as np


##### Import command line arguments #####
args = sys.argv
new_format_file_name = args[1]
out_file_name = args[2]

#new_format_file_name ="newdatasample01.csv"
#out_file_name = "outold1.csv"

##### Import csv file #####
new_format_file = pd.read_csv(new_format_file_name)


##### Add column #####
new_format_file.insert(11, '品詞', np.nan)

##### Delete non japanese rows #####
new_format_file = pd.DataFrame(new_format_file[new_format_file['言語'] != "en"])


##### Delete column #####
new_format_file.drop(columns=['言語', '他語彙体系の同義語のURI', '用語の説明', '作成日', '最終更新日'], inplace=True)


##### Change column name #####
old_format_file = new_format_file.rename(columns={'上位語のURI': '上位語'})


##### Change value of broader term column #####
# Make mapping dictionary from uri to word

dic_uri_preflabel = {}
for index, row in old_format_file.iterrows():
    dic_uri_preflabel[row['代表語のURI']] = row['代表語']


# Replace URI with label
col_broader = []
for broader_uri in old_format_file['上位語']:
    if broader_uri in dic_uri_preflabel.keys():
        col_broader.append(dic_uri_preflabel[broader_uri])
    else:
        col_broader.append(np.nan)

old_format_file.loc[:, "上位語"] = col_broader


##### Export csv file #####
old_format_file.to_csv(out_file_name, encoding='utf-8-sig', index=False)

