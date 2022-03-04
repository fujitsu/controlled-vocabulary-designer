# Input data creation example

Example of generating editing vocabulary, reference vocabulary and corpus.


## How to generate
### Case editing vocabulary and corpus
1. Put domain_words.csv and domain_text.txt in mountdir/data/. (The examples of these files are shown near the bottom of this README.)
    - domain_words.csv
      - Column "用語名" is required and columns "代表語" through "用語の説明" are optional. It may have columns after column "用語の説明".
      - Case generating an editing vocabulary from zero, it only needs to have column "用語名".
      - Case expanding the editing vocabulary to a format to be read by CVD based on the existing editing vocabulary, the existing editing vocabulary may be used as it is.
      - If it does not have column "代表語のURI", change setting of URI of mountdir/src/config.json to the URI of the controlled vocabulary. Default settings of URI is "http\://sampleVocab/", and if left at the default, the representative URIs for each term is "http\://sampleVocab/1", "http\://sampleVocab/2", and so on.
        ```
        {
          "Hensyugoi": {
            "Hensyugoi": {
                "VectorMagnification": 10,
                "URI": "http://sampleVocab/"  ← here
            },
          ...
        ```
      - Character code must be BOM-ed UTF-8.
    - domain_text.csv
      - It is text data related to a term to be controlled, and symbols may be included.
2. ```$ cd example-inputdata-creation```
3. ```$ docker-compose build --build-arg HOST_USER_ID=$(id -u)```
4. ```$ docker-compose run python /bin/bash```
5. ```$ ./Hensyugoi.sh```. The following will be generated.
   * Hensyugoi.csv (editing vocabulary)
   * wiki_wakati_preprocessed.txt (corpus)

### Case reference vocabulary
6. Put domain_words.csv and reference.csv(or reference.ttl) in mountdir/data/. (The example of reference.ttl is shown near the bottom of this README. The format of reference.csv is same as domain_words.csv)  
   Reference.csv and reference.ttl are optional. If you use reference.csv or reference.ttl, set "reference.csv" or "reference.ttl" to "Algorithm" of "ExternalVocabulary" of mountdir/src/config.json. Default settings is "wordnet".
    ```
    ...
    "SanSyogoi": {
      "ExternalVocabulary": {
          "Algorithm": "wordnet",  ← here
          "wordnet": {},
          "reference.csv": {},
          "reference.ttl": {}
      },
    ...
    ```
    - domain_words.csv
      - Column "用語名" is required and columns "代表語" through "用語の説明" are optional. It may have columns after column "用語の説明".
      - Case generating an reference vocabulary, it only needs to have column "用語名".
      - Character code must be BOM-ed UTF-8.
    - reference.csv
      - It is optional.
      - If there is a controlled vocabulary (.csv) that you want to refer to, put it in the name of "reference.csv".
      - Columns "用語名" through "用語の説明" are required.
      - Character code must be BOM-ed UTF-8.
    - reference.ttl
      - It is optional.
      - If there is a controlled vocabulary (.ttl) that you want to refer to, put it in the name of "reference.ttl".
      - As in the example, it should be written primarily using [SKOS](https://www.w3.org/TR/2009/REC-skos-reference-20090818/).
7. ```$ cd example-inputdata-creation```
8. ```$ docker-compose build --build-arg HOST_USER_ID=$(id -u)```
9. ```$ docker-compose run python /bin/bash```
10. ```$ ./Sansyougoi.sh```. The following will be generated.
     * SansyougoiAll.csv (reference vocabulary)
     * SansyougoiTarget.csv (reference vocabulary)


## Configure
You can change the settings in 'config.json'.

|key1(Category)|key2(Phase)|key3(Config)|value type|default value|detail|
| --- | --- | --- | --- | --- | --- |
|Hensyugoi|Hensyugoi|VectorMagnification|Number|10|It is the scaling factor for the two-dimensional coordinate values of terms.|
|Hensyugoi|Hensyugoi|URI|String|http\://sampleVocab/|It is URI of vocabulary.|
|Hensyugoi|WordEmbedding|Algorithm|String|word2vec|It is the alorithm of word embedding. Select word2vec or fasttext.|
|Hensyugoi|SynonymExtraction|SimilarityThreshold|Number|0.30|It is threshold filters synonyms.|
|Hensyugoi|SynonymExtraction|SimilarityLimit|Number|10|It is a threshold of how many top positions are displayed.|
|Hensyugoi|HypernymExtraction|Algorithm|String|hypernym|It is the algorithm of hypernym extraction. Use wordnet.|
|SanSyogoi|ExternalVocabulary|Algorithm|String|wordnet|It is the reference vocabulary. Select wordnet or reference.csv or reference.ttl.|
|SanSyogoi|WordEmbedding2|poincare.epochs|Number|2000|It is the number of iterations (epochs) over the corpus.|


## Example of domain_words.csv

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

## Example of domain_text.txt

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

## Example of reference.ttl

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

