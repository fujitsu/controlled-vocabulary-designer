# 入力用データ作成例
編集用語彙、参照用語彙、コーパスの作成例です。


## 作成方法
1. wiki.txtとtag.csvをmountdir/data/に置きます。（wiki.txtとtag.csvのサンプルは、このREADMEの下部に提示しています。）
2. ```$ cd example-inputdata-creation```
3. ```$ docker-compose build --build-arg HOST_USER_ID=$(id -u)```
4. ```$ docker-compose run python /bin/bash```

### 編集用語彙とコーパスを作成する場合
5. ```$ ./Hensyugoi.sh```. 以下のファイルが生成されます。
   * Hensyugoi.csv (編集用語彙)
   * wiki_wakati_preprocessed.txt (コーパス)


### 参照用語彙を作成する場合
6. ```$ ./Sansyougoi.sh```. 以下のファイルが生成されます。
   * SansyougoiAll.xlsx (参照用語彙)


## configure
「config.json」で設定を変更することができます。

|key1(Category)|key2(Phase)|key3(Param)|key4(Config)|value type|default value|detail|
| --- | --- | --- | --- | --- | --- | --- |
|Hensyugoi|Hensyugoi|-----------|VectorMagnification|Number|10|分散表現モデルによって計算される用語ベクトルの長さの倍率|
|Hensyugoi|WordEmbedding|-----------|Algorithm|String|word2vec|分散表現モデル（word2vecあるいはfasttextを選択）|
|Hensyugoi|SynonymExtraction|-----------|SimilarityThreshold|Number|0.30|分散表現モデルによる用語間の類似度計算の閾値|
|Hensyugoi|SynonymExtraction|-----------|SimilarityLimit|Number|10|分散表現モデルによって計算される類似語上位数の閾値|
|Hensyugoi|HypernymExtraction|-----------|Algorithm|String|hypernym|上位語推定アルゴリズム（デフォルトではwordnetを使用）|
|SanSyogoi|ExternalVocabulary|-----------|Algorithm|String|wordnet|参照用語彙（wordnetあるいはCVOを選択）|
|SanSyogoi|ExternalVocabulary|CVO|File|String|cvo_ver_2_03.ttl|既存語彙のファイル名。<br>※skos:prefLabelの日本語のみを抽出する。同じ用語名が重複して存在する場合は、skos:altLabelの方は無視する。（skos:prefLabelだけを抽出する）また、用語名が上位語と同じ場合は上位語として登録しない。CVOのURL:http://cavoc.org/cvo/ |
|SanSyogoi|WordEmbedding2|-----------|poincare.epochs|Number|2000|モデル学習のイテレーション数（エポック数）|

## wiki.txtのサンプル

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

## tag.csvのサンプル

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
