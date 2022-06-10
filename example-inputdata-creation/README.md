# 読み込み用ファイル作成例
編集用語彙、参照用語彙の作成例です。<br>
domain_words.csv、domain_text.txt、reference.csv、reference.ttlのサンプルはそれぞれこのREADMEの下部に提示しています。


## 編集用語彙を作成する方法
domain_words.csvとdomain_text.txtをmountdir/data/に置き、Linuxマシンのターミナル上で以下のコマンドを実行します。
1. ```$ cd example-inputdata-creation```
2. ```$ docker-compose build --build-arg HOST_USER_ID=$(id -u)```
3. ```$ docker-compose run python /bin/bash```
4. ```$ ./Hensyugoi.sh```

mountdir/data/に、Hensyugoi.csvというファイル名で編集用語彙が出力されます。

### domain_words.csv
-  分野の用語一覧が記述されたCSVファイルです。
-  「用語名」列は必須で、「代表語」列から「用語の説明」列までは任意です。また、独自の列が含まれていても問題ありません。
-  上記1～4のコマンドを実行すると、CVDの読み込みに不足している列を追加し、CVDの読み込みに必要な列を含んでいる場合は、その列の値をそのまま使用して、編集用語彙として作成します（※「同義語候補」列、「上位語候補」列、「x座標値」列、「y座標値」列は書き換えられます）。
-  上記1～4のコマンドはCVDの読み込みに不足している列を追加するための処理であり、内容に不整合（記述ルールに沿って記述されていない個所）が存在するかどうかは検出しません。不整合が存在する場合は別途手動で修正が必要です（domain_words.csvの記述ルールは、トップフォルダの[README](../README.md)の「編集用語彙のサンプル」の項を参照ください）。
-  「代表語のURI」列を含んでいない場合は、mountdir/src/config.jsonの以下の箇所に語彙のURIを記入してください。
```
{
  "Hensyugoi": {
    "Hensyugoi": {
        "VectorMagnification": 10,
        "URI": "http://sampleVocab/"  ← ココ
    },
  ...
```
- デフォルトでは"http\://sampleVocab/"が設定されています。デフォルトのまま以下の手順2～5のコマンドを実行した場合、各用語のURIは"http\://sampleVocab/1"、"http\://sampleVocab/2"などのように出力されます。
- domain_words.csvの文字コードはBOM付きUTF-8で作成してください。

### domain_text.txt
- 作成する統制語彙に関する用語を含んだテキストデータです。
- 記号が含まれていても問題ありません。


## 参照用語彙を作成する方法
domain_words.csvをmountdir/data/に置きます。さらに、参照したい既存の語彙がある場合は、ファイル名をreference.csvあるいはreference.ttlとしてmountdir/data/に置きます。<br>
Linuxマシンのターミナル上で以下のコマンドを実行します。
1. ```$ cd example-inputdata-creation```
2. ```$ docker-compose build --build-arg HOST_USER_ID=$(id -u)```
3. ```$ docker-compose run python /bin/bash```
4. ```$ ./Sansyougoi.sh```. 

mountdir/data/に、SansyougoiAll.csv、SansyougoiTarget.csvというファイル名で2種類の参照用語彙が出力されます。<br>
・SansyougoiAll.csv：既存の語彙の情報全てを抽出したファイル<br>
・SansyougoiTarget.csv：既存の語彙の情報のうち、domain_words.csvに記載されている用語についての情報のみを抽出したファイル

-  上記1～4のコマンドは既存の語彙をCVDの読み込みできる形式に変換するための処理であり、domain_words.csvやreference.csvやreference.ttlの内容に不整合が存在するかどうかは検出しません。不整合が存在する場合は別途手動で修正が必要です（domain_words.csvやreference.csvの記述ルールは、トップフォルダの[README](../README.md)の「編集用語彙のサンプル」についての項を参照ください。reference.ttlの記述ルールは、このREADMEのreference.ttlのサンプルを参照ください）。
-  Reference.csvあるいはreference.ttlを使用するかどうかは任意ですが、使用する場合はmountdir/src/config.jsonの以下の箇所に、"reference.csv"あるいは"reference.ttl"を記入してください。
```
...
"SanSyogoi": {
  "ExternalVocabulary": {
      "Algorithm": "wordnet",  ← ココ
      "wordnet": {},
      "reference.csv": {},
      "reference.ttl": {}
  },
...
```
-  デフォルトでは"wordnet"が設定されています。デフォルトのまま上記1～4のコマンドを実行すると、日本語wordnetを既存の語彙として参照用語彙を作成します。
-  また、日本語wordnetを既存の語彙として使用する場合は、mountdir/src/config.jsonの以下の箇所に書かれているURIを使用します。これは、参照用語彙に記入するために必要な情報で、wordnet公式のURIではありません。
```
...
"WordnetURI": {
    "URI": "http://sampleWordnet/"  ← ココ
...
```
-  デフォルトでは、"http\://sampleWordnet/"となっていますが、必要に応じて任意のURIに書き換えてください。

### domain_words.csv
-  分野の用語一覧が記述されたCSVファイルです。
-  「用語名」列は必須で、「代表語」列から「用語の説明」列までは任意です。また、独自の列が含まれていても問題ありません。
- 参照用語彙を作成する場合は、「用語名」列だけを使用します。
- domain_words.csvの文字コードはBOM付きUTF-8で作成してください。

### reference.csv
- 既存の語彙の情報が記述されたCSVファイルです。
- reference.csvを使用するかどうかは任意です。参照したいcsv形式の既存の語彙がある場合は、ファイル名を"reference.csv"として作成してください。
- 「用語名」列から「用語の説明」列は必須です。
- reference.csvの文字コードはBOM付きUTF-8で作成してください。

### reference.ttl
- 既存の語彙の情報が記述されたTurtleファイルです。
- reference.ttlを使用するかどうかは任意です。参照したいturtle形式の既存の語彙がある場合は、ファイル名を"reference.ttl"として作成してください。
- このREADME下部に提示したサンプルのように、reference.ttlは主に[SKOS](https://www.w3.org/TR/2009/REC-skos-reference-20090818/)を使用して記述されている必要があります。


## configure
mountdir/src/config.jsonで設定を変更することができます。

|key1(Category)|key2(Phase)|key3(Config)|value type|default value|detail|
| --- | --- | --- | --- | --- | --- |
|Hensyugoi|Hensyugoi|VectorMagnification|Number|10|分散表現モデルによって計算される用語ベクトルの長さの倍率|
|Hensyugoi|Hensyugoi|URI|String|http\://sampleVocab/|語彙のURI|
|Hensyugoi|WordEmbedding|Algorithm|String|word2vec|分散表現モデル（word2vecあるいはfasttextを選択）|
|Hensyugoi|SynonymExtraction|SimilarityThreshold|Number|0.30|分散表現モデルによる用語間の類似度計算の閾値|
|Hensyugoi|SynonymExtraction|SimilarityLimit|Number|10|分散表現モデルによって計算される類似語上位表示数の閾値|
|Hensyugoi|HypernymExtraction|Algorithm|String|hypernym|上位語推定アルゴリズム（デフォルトではwordnetを使用）|
|SanSyogoi|ExternalVocabulary|Algorithm|String|wordnet|既存語彙（wordnetあるいはreference.csvあるいはreference.ttlを選択）|
|SanSyogoi|WordnetURI|URI|String|http\://sampleWordnet/|既存語彙としてwordnetを選択した際の参照用語彙に記載する語彙のURI|
|SanSyogoi|WordEmbedding2|poincare.epochs|Number|2000|モデル学習のイテレーション数（エポック数）|


## domain_words.csvのサンプル

```
用語名,代表語,言語,代表語のURI,上位語のURI,他語彙体系の同義語のURI,用語の説明
コンビニ,コンビニエンスストア,ja,http://myVocabulary/1,http://myVocabulary/2,,コンビニエンスストアの略称です
コンビニエンスストア,コンビニエンスストア,ja,http://myVocabulary/1,http://myVocabulary/2,,コンビニエンスストアの略称です
convenience store,convenience store,en,http://myVocabulary/1,http://myVocabulary/2,,Alias of convenience store
drug store,convenience store,en,http://myVocabulary/1,http://myVocabulary/2,,Alias of convenience store
the corner shop,convenience store,en,http://myVocabulary/1,http://myVocabulary/2,,Alias of convenience store
店舗,店舗,ja,http://myVocabulary/2,,http://otherVocabulary/16,
店,店舗,ja,http://myVocabulary/2,,http://otherVocabulary/16,
store,store,en,http://myVocabulary/2,,http://otherVocabulary/16,
shop,store,en,http://myVocabulary/2,,http://otherVocabulary/16,
```

## domain_text.txtのサンプル

```
<doc id="5" url="https://ja.wikipedia.org/wiki?curid=5" title="アンパサンド">
アンパサンド

アンパサンド (&、英語名：) とは並立助詞「…と…」を意味する記号である。ラテン語の の合字で、Trebuchet MSフォントでは、と表示され "et" の合字であることが容易にわかる。ampersa、すなわち "and per se and"、その意味は"and [the symbol which] by itself [is] and"である。

その使用は1世紀に遡ることができ、5世紀中葉から現代に至るまでの変遷がわかる。
Z に続くラテン文字アルファベットの27字目とされた時期もある。

アンパサンドと同じ役割を果たす文字に「のet」と呼ばれる、数字の「7」に似た記号があった(, U+204A)。この記号は現在もゲール文字で使われている。

記号名の「アンパサンド」は、ラテン語まじりの英語「& はそれ自身 "and" を表す」(& per se and) のくずれた形である。英語以外の言語での名称は多様である。

日常的な手書きの場合、欧米でアンパサンドは「ε」に縦線を引く単純化されたものが使われることがある。

また同様に、「t」または「+（プラス）」に輪を重ねたような、無声歯茎側面摩擦音を示す発音記号「」のようなものが使われることもある。

プログラミング言語では、C など多数の言語で AND 演算子として用いられる。以下は C の例。
PHPでは、変数宣言記号（$）の直前に記述することで、参照渡しを行うことができる。

BASIC 系列の言語では文字列の連結演算子として使用される。codice_4 は codice_5 を返す。また、主にマイクロソフト系では整数の十六進表記に codice_6 を用い、codice_7 （十進で15）のように表現する。

SGML、XML、HTMLでは、アンパサンドを使ってSGML実体を参照する。



</doc>
```

## reference.csvのサンプル

```
用語名,代表語,言語,代表語のURI,上位語のURI,他語彙体系の同義語のURI,用語の説明
カイトウメン,カイトウメン,ja,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,
Gossypium barbadense,カイトウメン,en,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,
ペルー綿,カイトウメン,ja,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,
シーアイランド綿,カイトウメン,ja,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,
エジプト綿,カイトウメン,ja,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,
スーダン綿,カイトウメン,ja,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,
ワタ,ワタ,ja,http://cavoc.org/cvo/ns/3/C876,,,
モメン,ワタ,ja,http://cavoc.org/cvo/ns/3/C876,,,
Cotton,Cotton,en,http://cavoc.org/cvo/ns/3/C876,,,
Gossypium arboreum,Cotton,en,http://cavoc.org/cvo/ns/3/C876,,,
Gossypium herbaceum,Cotton,en,http://cavoc.org/cvo/ns/3/C876,,,
Gossypium hirsutum,Cotton,en,http://cavoc.org/cvo/ns/3/C876,,,
食用綿実,食用綿実,ja,http://cavoc.org/cvo/ns/3/C1055,http://cavoc.org/cvo/ns/3/C876,,
Edible cotton,Edible cotton,en,http://cavoc.org/cvo/ns/3/C1055,http://cavoc.org/cvo/ns/3/C876,,
```

## reference.ttlのサンプル

```
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix skos: <http://www.w3.org/2004/02/skos/core#>.
@prefix dct: <http://purl.org/dc/terms/>.
@prefix my: <http://myVocabulary/>.

my:
    rdf:type skos:ConceptScheme;
    dct:title "サンプル語彙"@ja, "sample vocabulary"@en;
    dct:hasVersion "1.0.0";
    dct:description "サンプル用の語彙です"@ja, "The vocabulary for sample"@en;
    dct:creator "Sample Man".

<http://otherVocabulary/>
    rdf:type skos:ConceptScheme.

my:1
    rdf:type skos:Concept;
    skos:inScheme my:;
    skos:prefLabel "コンビニエンスストア"@ja, "convenience store"@en;
    skos:altLabel "コンビニ"@ja, "drug store"@en, "the corner shop"@en;
    skos:broader my:2;
    dct:description "コンビニエンスストアの略称です"@ja, "Alias of convenience store"@en;
    dct:created "2021-04-02T12:43:02Z";
    dct:modified "2021-04-08T16:07:59Z".

my:2
    rdf:type skos:Concept;
    skos:inScheme my:;
    skos:prefLabel "店舗"@ja, "store"@en;
    skos:altLabel "店"@ja, "shop"@en;
    skos:narrower my:1;
    skos:exactMatch <http://otherVocabulary/16>;
    dct:created "2021-04-01T11:40:15Z";
    dct:modified "2021-04-09T09:22:11Z".

<http://otherVocabulary/16>
    rdf:type skos:Concept;
    skos:inScheme <http://otherVocabulary/>;
    skos:exactMatch my:2.
  ```

<div align="right">
  <img src="https://img.shields.io/badge/python-3-blue.svg?style=plastic&logo=python">
</div>
