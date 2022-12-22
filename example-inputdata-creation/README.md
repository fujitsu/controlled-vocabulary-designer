# 読み込み用ファイル作成例
編集用語彙、参照用語彙の作成例です。<br>
domain_words.csv、domain_text.txt、reference.csv、reference.ttlのサンプルは「samples」ディレクトリーにあり、それぞれの説明はこのREADMEの下部に提示しています。

編集語彙_meta.csvは別途作成する必要があります。
トップフォルダの[README](../README.md)の「編集用語彙_metaのサンプル」についての項を参照ください。

## 編集用語彙を作成する方法
domain_words.csvとdomain_text.txtをmountdir/data/に置き、Linuxマシンのターミナル上で以下のコマンドを実行します。
1. ```$ cd example-inputdata-creation```
2. ```$ docker-compose build --build-arg HOST_USER_ID=$(id -u)```

以下のコマンドで、コンテナの中に入ります。<br>
3. ```$ docker-compose run python /bin/bash```

以下のスクリプトを動かすことで、編集用語彙を作成します。<br>
4. ```$ ./Hensyugoi.sh```

mountdir/data/に、Hensyugoi.csvというファイル名で編集用語彙が出力されます。

### domain_words.csv
-  分野の用語一覧が記述されたCSVファイルです。
-  「用語名」列は必須で、「代表語」列から「用語の説明」列までは任意です。また、独自の列が含まれていても問題ありません。
-  列名の重複がないことを確認してください。
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
- デフォルトでは"http\://sampleVocab/"が設定されています。デフォルトのままコマンドを実行した場合、各用語のURIは"http\://sampleVocab/1"、"http\://sampleVocab/2"などのように出力されます。
- domain_words.csvの文字コードはBOM付きUTF-8で作成してください。

### domain_text.txt
- 作成する統制語彙に関する用語を含んだテキストデータです。
- 記号が含まれていても問題ありません。
- domain_text.txtの文字コードはBOM付きUTF-8で作成してください。
- 作成する統制語彙に関する用語を含んだテキストデータがない場合は、代わりにWikipediaのダンプデータを使う方法があります。ここでは、日本語Wikipediaダンプデータをdomain_text.txtとして作成する手順を記載します。※python、gitがインストールされていることが前提です。
  - ①[日本語版Wikipediaダンプデータのページ](https://dumps.wikimedia.org/jawiki/)から、ダウンロードしたい版の日付を選択します。
  - ②「jawiki-[日付]-pages-articles-multistream.xml.bz2」のリンクからダンプデータをダウンロードします。
  - ③以下のコマンドで、日本語Wikipediaのダンプデータから記事本文を取り出すために使用するwikiextractorをインストールします。
    ```
    $ pip install wikiextractor==3.0.4
    ```
  - ④ダウンロードした日本語Wikipediaのダンプデータがあるディレクトリに移動します。
  - ⑤以下のコマンドで、日本語Wikipediaのダンプデータから記事本文を取り出します。
    ```
    $ wikiextractor [ダウンロードした日本語Wikipediaのダンプデータ]
    ```
  - ⑥処理が終了すると、textディレクトリが作成され、その中に記事本文が複数ファイルに分割して抽出されています（wiki_00, wiki_01,...）。それらのファイルの中から適当に選択し、ファイル名を「domain_text.txt」として保存します。

## 参照用語彙を作成する方法
domain_words.csvをmountdir/data/に置きます。さらに、参照したい既存の語彙がある場合は、ファイル名をreference.csvあるいはreference.ttlとしてmountdir/data/に置きます。<br>
コンテナに入るまでは「編集用語彙を作成する方法」と同じ手順です。<br>
コンテナの中で以下のスクリプトを動かすことで、参照用語彙を作成します。<br>
4. ```$ ./Sansyougoi.sh```

mountdir/data/に、SansyougoiAll.csv、SansyougoiTarget.csvというファイル名で2種類の参照用語彙が出力されます。<br>
・SansyougoiAll.csv：既存の語彙の情報全てを抽出したファイル<br>
・SansyougoiTarget.csv：既存の語彙の情報のうち、domain_words.csvに記載されている用語のみを抽出したファイル

-  上記1～4のコマンドは既存の語彙をCVDの読み込みできる形式に変換するための処理であり、domain_words.csvやreference.csvやreference.ttlの内容に不整合が存在するかどうかは検出しません。不整合が存在する場合は別途手動で修正が必要です（domain_words.csvやreference.csvの記述ルールは、トップフォルダの[README](../README.md)の「編集用語彙のサンプル」についての項を参照ください。reference.ttlの記述ルールは、このREADMEのreference.ttlのサンプルを参照ください）。
-  reference.csvあるいはreference.ttlを使用するかどうかは任意ですが、使用する場合はmountdir/src/config.jsonの以下の箇所に、"reference.csv"あるいは"reference.ttl"を記入してください。
-  reference.csvを使用する場合は、「作成日」列、「最終更新日」列、「x座標値」列、「y座標値」列のうちreference.csvに含まれない列をreference.csvに追加し、参照用語彙として作成します。reference.csvにもともと含まれている列については、その列の値をそのまま使用します（※「x座標値」列、「y座標値」列は書き換えられます）。
-  reference.ttlを使用する場合は、reference.ttlの内容をもとに参照用語彙を作成します。
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
-  列名の重複がないことを確認してください。
- 参照用語彙を作成する場合は、「用語名」列だけを使用します。
- domain_words.csvの文字コードはBOM付きUTF-8で作成してください。

### reference.csv
- 既存の語彙の情報が記述されたCSVファイルです。
- reference.csvを使用するかどうかは任意です。参照したいcsv形式の既存の語彙がある場合は、ファイル名を"reference.csv"として作成してください。
- 「用語名」列から「用語の説明」列は必須です。また、独自の列が含まれていても問題ありません。
- 列名の重複がないことを確認してください。
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
用語名
コンビニ
コンビニエンスストア
convenience store
drug store
the corner shop
店舗
店
store
shop
```

## domain_text.txtのサンプル

```
「コンビニエンスストア」は、日本では「コンビニ」と略されることが多いです。
英語では「コンビニエンスストア」は「convenience store」や「drug store」や「the corner shop」などと言います。
また、海外ではガソリンスタンドの横に24時間営業のお店があったりします。
そのため、「gas station」などのように言うこともあるようです。
「コンビニエンスストア」は「店」の1つなので、「コンビニエンスストア」の上位語として「店」を定義することもできます。
「店」は英語で「shop」や「store」と言います。
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
@prefix my: <http://sampleVocab/>.

my:
    rdf:type skos:ConceptScheme;
    dct:title "サンプル語彙"@ja, "sample vocabulary"@en;
    dct:hasVersion "1.0.0";
    dct:description "サンプル用の語彙です"@ja, "The vocabulary for sample"@en;
    dct:creator "Sample Man".

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
    skos:exactMatch <http://otherVocab/16>;
    dct:created "2021-04-01T11:40:15Z";
    dct:modified "2021-04-09T09:22:11Z".
```

<div align="right">
  <img src="https://img.shields.io/badge/python-3-blue.svg?style=plastic&logo=python">
</div>
