# Controlled Vocabulary Designer (CVD)

CVD is a GUI support tool for creating controlled vocabulary.
You can efficiently define synonymous and hierarchical relationships referring to
outputs of natural language processing and existing controlled vocabulary.
Moreover, you can see whole vocabulary on the application window and edit them interactively.
The created controlled vocabulary can be exported as RDF file.

# Requirement

- docker > 19.03
- docker-compose > 1.23

# How to setup

1. docker-compose up -d
2. Access this URL from your browser.

```
http://(hostname):10081/
```

# Supported browsers

* Google Chrome
* Microsoft Edge
* Firefox

# Supported File Format

* upload
  * editing vocabulary :  .xlsx, .csv format
    * The vocabulary that you are jsut or going to creating.
  * reference vocabulary : .xlsx, .csv format
    * The exsisting vocabulary (e.g. wordnet, DBpedia, other existing controlled vocabulary)
  * corpus : .txt format
    * The corpus contained words splitted by space

* download
  * editing vocabulary : .xlsx, .csv format
  * cntrolled vocabulary : .n3, .nquads, .nt, .trix, .turtle, .xml, .jsonld format

## Example of editing vocabulary

|用語名|代表語|代表語のURI|上位語|同義語候補|上位語候補|品詞|x座標値|y座標値|色1|色2|
|----|----|----|----|----|----|----|----|----|----|----|
|aphros||||||名詞|6.882962381|-0.782237226|black|black|
|api||||||名詞|-9.651039608|15.05839617|black|black|
|サメ||||shark, 鮫|selachian, elasmobranch, 板鰓類|名詞|-12.40469425|1.260754069|black|black|
|サンショウウオ||||salamander, 山椒魚|amphibian, 両生類, 両棲類|名詞|2.755970296|-1.591457808|black|black|
|靖子||||||名詞|14.85126593|-1.219740487|black|black|
|靖樹||||||名詞|7.643998834|-0.408532063|black|black|

## Example of reference vocabulary

|用語名|代表語|代表語のURI|上位語|
|----|----|----|----|
|タビエ|タイヌビエ|http://cavoc.org/cvo/ns/2/C1312||
|飼料用アオキ|飼料用アオキ|http://cavoc.org/cvo/ns/2/C1397|アオキ|
|ブドウ|ブドウ|http://cavoc.org/cvo/ns/2/C950	||
|ケニギンデルワインガルデン|ケニギンデルワインガルデン|http://cavoc.org/cvo/ns/2/C977|ブドウ|


## Example of corpus

Corpus includes set of space-separated terms which is written in one row.

```
データ 連携 を 推進 して いく 上 で 課題 の 1つ と なって いる の が データ の 標準化 で ある
統制 語彙 作成 支援 ツール を 動作 させ た ホスト の 下記 アドレス に Web ブラウザ に よって アクセス する こと で ツール が 利用 可能 で ある
永続 ボリューム の 上 に 構成 され サービス を 終了 させても データ は 揮発 しない
```

## Input data creation example

Example of generating editing vocabulary, reference vocabulary and corpus.

[Read More](example-inputdata-creation/README.md)


# URI Prefix

Use "Config.js" to set each abbreviation of URI Prefixes.
If the URI that you type on the application window includes the URI Prefix that you set, it is automatically converted to the corresponding abbreviation,
and you can see the abbreviation on the application window. You can also type the abbreviation that you set on it. In any case, it is recognized as the URI Prefix that you set in "Config.js", and saved in the database.

## Example of Config.js

"origin", which is a URI Prefix is mapped to "equiv".

```
'prefix': [
  {
    'origin': 'http://cavoc.org/',
    'equiv': 'cavoc:',
  },
  {
    'origin': 'http://example.org/',
    'equiv': 'ex:',
  },
],

```


# Zoom magnification

If there is a big difference in magnification between term data for editing and term data for reference, you can adjust it.
Use "Config.js" to set a default magnification for reference term data.

## Example of Config.js

A default magnification for reference term data is '1'.  
You can set Positive and Negative numbers.

```
'magnification': [
  {
    'reference': 1,
  },
],

```

<div align="right">
    <img src="https://img.shields.io/badge/nginx-1.19.3-color.svg?style=plastic&logo=nginx">
    <img src="https://img.shields.io/badge/npm-lts-red.svg?style=plastic&logo=npm">
    <img src="https://img.shields.io/badge/python-3-blue.svg?style=plastic&logo=python">
    <img src="https://img.shields.io/badge/postgreSQL-12.4-white.svg?style=plastic&logo=postgreSQL">
    <br>
    <img src="https://img.shields.io/badge/react--blue.svg?style=plastic&logo=react">
    <img src="https://img.shields.io/badge/MaterialUI--white.svg?style=plastic&logo=Material-UI">
    <img src="https://img.shields.io/badge/Webpack--blue.svg?style=plastic&logo=Webpack">
    <img src="https://img.shields.io/badge/Flask--white.svg?style=plastic&logo=Flask">
</div>

# Acknowledgments

This work was supported by Council for Science, Technology and Innovation, “Cross-ministerial Strategic Innovation Promotion Program (SIP), Big-data and AI-enabled Cyberspace Technologies”. (funding agency: NEDO)

# Contact
contact-cvd@cs.jp.fujitsu.com
