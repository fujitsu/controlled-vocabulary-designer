# Input data creation example

Example of generating editing vocabulary, reference vocabulary and corpus.


## How to generate

1. Put wiki.txt and tag.csv in src folder. (The examples of wiki.txt and tag.csv are shown near the bottom of this README)
2. ```$ cd example-inputdata-creation```
3. ```$ find mountdir -type d -exec chmod o+w {} \;```
4. ```$ docker-compose build --build-arg HOST_USER_ID=$(id -u)```
5. ```$ docker-compose run python /bin/bash```

### Case editing vocabulary and corpus

6. ```$ ./Hensyugoi.sh```. The following will be generated.
   * Hensyugoi.csv (editing vocabulary)
   * wiki_wakati_preprocessed.txt (corpus)


### Case reference vocabulary

7. ```$ ./Sansyougoi.sh```. The following will be generated.
   * SansyougoiAll.xlsx (reference vocabulary)


## configure

You can change the settings in 'config.json'.

|key1(Category)|key2(Phase)|key3(Param)|key4(Config)|value type|default value|detail|
| --- | --- | --- | --- | --- | --- | --- |
|Hensyugoi|Hensyugoi|-----------|VectorMagnification|Number|10|vector magnification.|
|Hensyugoi|WordEmbedding|-----------|Algorithm|String|word2vec|Select to word embedding algorithm.(word2vec or fasttext)|
|Hensyugoi|SynonymExtraction|-----------|SimilarityThreshold|Number|0.30|Synonym is filtering by threshold.|
|Hensyugoi|SynonymExtraction|-----------|SimilarityLimit|Number|10|Find the top-N most similar words.|
|Hensyugoi|HypernymExtraction|-----------|Algorithm|String|hypernym|Use wordnet.|
|SanSyogoi|ExternalVocabulary|-----------|Algorithm|String|wordnet|algorithm change(wordnet, CVO).|
|SanSyogoi|ExternalVocabulary|CVO|File|String|cvo_ver_2_03.ttl|Read file name.<br>Only Japanese is extracted from prefLabel.<br>If a term with the same name exists, the altLabel term will not be registered. (Register only prefLabel terms)<br>If the term has the same name as the broader, it will not be registered in the broader.<br>address:http://www.cavoc.org/cvo.php |
|SanSyogoi|WordEmbedding2|-----------|poincare.epochs|Number|2000|Number of iterations (epochs) over the corpus.|

## Example of wiki.txt

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

## Example of tag.csv

```
２拠点生活,
3Dデータ,
3Dプリンタ,
3Dプリンター,
5G,
AI,
AIスピーカー,
AR,
```

<div align="right">
  <img src="https://img.shields.io/badge/python-3-blue.svg?style=plastic&logo=python">
</div>
