# Controlled Vocabulary Designer (CVD)
CVDは、統制語彙の作成を視覚的なインターフェースでサポートするツールです。<br>
自然言語処理の計算結果や既存の統制語彙を参照して、同義関係や上下関係を効率的に定義できます。
さらに、アプリケーションウィンドウで語彙全体を確認しながら直感的に編集することができます。
作成された統制語彙は、RDFファイルとして出力・保存できます。<br>
CVDのヘルプページは[こちら](https://fujitsu.github.io/controlled-vocabulary-designer/)。

# システム要件
- docker : バージョン19.03以上
- docker-compose : バージョン1.23以上

# セットアップ方法
下記では、Linuxネイティブでの起動方法を説明します。Windowsでの起動は[こちら](./run-with-vagrant/README.md)をご覧ください。

0. proxy環境下で使用されるときは HTTP_PROXY, HTTPS_PROXYを環境変数に設定してください。
1. Linuxマシンのターミナル上で以下のコマンドを実行します。<br>
```docker-compose up -d```
2. 作業環境のWEBブラウザで以下にアクセスします。<br>
```http://(hostname):10081/```

# サポートブラウザ
* Google Chrome
* Microsoft Edge

# サポートファイル形式
* 読み込み用ファイル形式
  * 編集用語彙_meta（語彙のメタファイル） : .csv
  * 編集用語彙（語彙を編集するファイル） : .csv
  * 参照用語彙（既存の語彙ファイル） : .csv

* 書き出しファイル形式
  * 編集用語彙（語彙を編集したファイル） : .csv
  * 統制語彙（語彙を編集したファイル） : .n3, .nquads, .nt, .trix, .turtle, .xml, .jsonld


## 編集用語彙_metaのサンプル

```
語彙の名称,語彙の英語名称,バージョン,接頭語,語彙のURI,語彙の説明,語彙の英語説明,語彙の作成者
サンプル語彙,sample vocabulary,1.0.0,my,http://sampleVocab/,サンプル用の語彙です,The vocabulary for sample,サンプル太郎
```
-  列名の重複がないことを確認してください。
-  「語彙の名称」列から「語彙の作成者」列まで全て必須です。
-  独自の列が含まれていても問題ありません。


## 編集用語彙のサンプル

```
用語名,代表語,言語,代表語のURI,上位語のURI,他語彙体系の同義語のURI,用語の説明,作成日,最終更新日,同義語候補,上位語候補,x座標値,y座標値,色1,色2,確定済み用語
コンビニ,コンビニエンスストア,ja,http://sampleVocab/1,,,コンビニエンスストアの略称です,2021-04-02T12:43:02Z,2021-04-08T16:07:59Z,"コンビニエンスストア, store, the corner shop, drug store, convenience store","店, 店舗",3.779367076,-44.97713738,black,black,0
コンビニエンスストア,コンビニエンスストア,ja,http://sampleVocab/1,,,コンビニエンスストアの略称です,2021-04-02T12:43:02Z,2021-04-08T16:07:59Z,"コンビニ, the corner shop, store, drug store, convenience store","店, 店舗",16.81118132,-61.70717408,black,black,0
convenience store,convenience store,en,http://sampleVocab/1,,,Alias of convenience store,2021-04-02T12:43:02Z,2021-04-08T16:07:59Z,"drug store, store, the corner shop, shop, コンビニエンスストア",,-7.53980653,-51.30562908,black,black,0
drug store,convenience store,en,http://sampleVocab/1,,,Alias of convenience store,2021-04-02T12:43:02Z,2021-04-08T16:07:59Z,"store, the corner shop, convenience store, shop, コンビニエンスストア",,-7.911179493,-26.26668782,black,black,0
the corner shop,convenience store,en,http://sampleVocab/1,,,Alias of convenience store,2021-04-02T12:43:02Z,2021-04-08T16:07:59Z,"shop, drug store, convenience store, store, コンビニエンスストア",,-43.68659491,42.18700014,black,black,0
店舗,店舗,ja,http://sampleVocab/2,,http://otherVocab/16,,2021-04-01T11:40:15Z,2021-04-09T09:22:11Z,"store, drug store, コンビニエンスストア, the corner shop, コンビニ",店舗,7.237030405,-51.76710593,black,black,0
店,店舗,ja,http://sampleVocab/2,,http://otherVocab/16,,2021-04-01T11:40:15Z,2021-04-09T09:22:11Z,"the corner shop, shop, convenience store, drug store, store",店舗,-47.93248755,34.79784645,black,black,0
store,store,en,http://sampleVocab/2,,http://otherVocab/16,,2021-04-01T11:40:15Z,2021-04-09T09:22:11Z,"drug store, convenience store, the corner shop, shop, コンビニエンスストア",,9.110486157,-80.63532085,black,black,0
shop,store,en,http://sampleVocab/2,,http://otherVocab/16,,2021-04-01T11:40:15Z,2021-04-09T09:22:11Z,"the corner shop, convenience store, drug store, store, コンビニエンスストア",,32.98654788,33.62595116,black,black,0
```
-  列名の重複がないことを確認してください。
-  「語彙の名称」列から「語彙の作成者」列まで全て必須です。（各列の各行についての記述条件については、各列の説明を参照ください）
-  独自の列が含まれていても問題ありません。
-  「用語名」列
    -  分野の用語のことです。
    -  重複の無いように一行ごとに記述してください。
    -  以下の3つの状態を全て満たす場合は、該当するセルが空でも可能です。
        -  「代表語」列が空白
        -  「用語の説明」列が空白ではない
        -  「代表語のURI」列が同じである異なる言語で「代表語」列が空白ではない
-  「代表語」列
    -  同義語のうち代表とする用語名のことです。
    -  同義語それぞれに「言語」ごとに同じ代表語を記述してください。
    -  以下の状態を満たす場合は、該当するセルが空でも可能です。
        -  同じ代表語のURIを持つ同義語たちで、いずれかの言語で代表語が設定されている場合
-  「言語」列
    -  用語の記述言語のことです。
    -  日本語の場合は"ja"、英語の場合は"en"を記述してください。
    -  空白の行は、ファイル読み込み時に"ja"として処理されます。
-  「代表語のURI」列
    -  代表語に対するユニークな値のことです。
    -  同義語それぞれに同じ値を記述してください。
    -  空白以外の値を記述してください。
-  「上位語のURI」列
    -  上位語に対するユニークな値のことです。
    -  同義語それぞれに同じ値を記述してください。
    -  上下関係が循環(※)しないように記述してください。
        -  ※ここでいう循環とは、「用語Aの上位語が用語B、用語Bの上位語が用語A」のように、ある用語の上位語の上位語...と見たときにその用語が上位語として指されている状態をいいます。
    -  上位語が存在する場合のみ記述してください。
-  「他語彙体系の同義語のURI」列
    -  他の語彙で同義語が存在する場合のその同義語のURIのことです。
    -  同義語それぞれに同じ値を記述してください。
    -  他の語彙で同義語が存在する場合のみ記述してください。
-  「用語の説明」列
    -  その用語あるいはその同義語についての説明のことです。
    -  同義語の場合は、同義語それぞれに「言語」ごとに同じ値を記述してください。
    -  各用語について説明書きが必要な場合のみ記述してください。
-  「作成日」列
    -  その用語あるいはその同義語について最初に記述された日時のことです。
    -  同義語の場合は、同義語それぞれに同じ値を記述してください。
    -  作成日に関する情報がある場合のみ記述してください。
-  「最終更新日」列
    -  その用語あるいはその同義語についての情報が更新された日時のことです。
    -  同義語の場合は、同義語それぞれに同じ値を記述してください。
    -  最終更新日に関する情報がある場合のみ記述してください。
-  「同義語候補」列
    -  その用語に対するAIによる同義語推定結果のことです。
    -  編集用語彙作成手順に従って計算することができます。
    -  空白以外が記述された場合は、CVD上で同義語候補として表示されます。
-  「上位語候補」列
    -  その用語に対するAIによる上位語推定結果のことです。
    -  編集用語彙作成手順に従って計算することができます。
    -  空白以外が記述された場合は、CVD上で上位語候補として表示されます。
-  「x座標値」列
    -  CVDの可視化画面でその用語が表示されるx座標値のことです。
    -  編集用語彙作成手順に従って計算することができます。
    -  また、CVDを使用して値を変更することもできます。
    -  記述がない場合や数値以外の値が記述されている場合は、ファイル読み込み時に"0"として処理されます。
-  「y座標値」列
    -  CVDの可視化画面でその用語が表示されるy座標値のことです。
    -  編集用語彙作成手順に従って計算することができます。
    -  また、CVDを使用して値を変更することもできます。
    -  記述がない場合や数値以外の値が記述されている場合は、ファイル読み込み時に"0"として処理されます
-  「色1」列
    -  CVDの画面で用語を図形つきで表示した際につけられる図形の枠線の色のことです。
    -  デフォルトは"black"です。
    -  "black"、"red"、"orange"、"green"、"blue"、"purple"以外の値の場合は、ファイル読み込み時に"black"として処理されます。
-  「色2」列
    -  CVDの画面で用語を図形つきで表示した際につけられる図形の背景の色のことです。
    -  デフォルトは"black"です。
    -  "black"、"red"、"orange"、"green"、"blue"、"purple"以外の値の場合は、ファイル読み込み時に"black"として処理されます。
-  「確定済み用語」列
    -  その用語のCVDにおける編集確定（※）フラグのことです。
        -  ※ここでいう確定とは、CVDで用語の編集をロックした状態のことをいいます。
    -  "0"は未確定、"1"は確定済みです。
    -  デフォルトは"0"です。
    -  "0"と"1"以外の値が記述されている場合は、ファイル読み込み時に"0"として処理されます。


## 参照用語彙のサンプル

```
用語名,代表語,言語,代表語のURI,上位語のURI,他語彙体系の同義語のURI,用語の説明,作成日,最終更新日,x座標値,y座標値
果物屋,果物屋,ja,http://otherVocab/C822,http://otherVocab/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,3.779367076,-44.97713738
果物販売店,果物屋,ja,http://otherVocab/C822,http://otherVocab/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,16.81118132,-61.70717408
くだもの屋,果物屋,ja,http://otherVocab/C822,http://otherVocab/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,-7.53980653,-51.30562908
果物専門店,果物屋,ja,http://otherVocab/C822,http://otherVocab/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,-7.911179493,-26.26668782
店舗,店舗,ja,http://otherVocab/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,-47.93248755,34.79784645
ストアー,店舗,ja,http://otherVocab/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,9.110486157,-80.63532085
shop,店舗,ja,http://otherVocab/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,63.98654788,-13.62595116
店屋,店舗,ja,http://otherVocab/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,84.94554788,-65.64325116
store,店舗,ja,http://otherVocab/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,22.86783788,-30.67687116
売店,店舗,ja,http://otherVocab/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,-52.98788,-42.625
魚屋,魚屋,ja,http://otherVocab/C1055,http://otherVocab/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,91.99742788,-43.65986116
鮮魚店,魚屋,ja,http://otherVocab/C1055,http://otherVocab/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,56.98865788,-77.97631116
```
-  列名の重複がないことを確認してください。
-  「用語名」列から「y座標値」列まで全て必須です。
-  独自の列が含まれていても問題ありません。
-  各列については、編集用語彙の各列の説明を参照ください。


## 読み込み用ファイルの作成方法
読み込み用ファイルの作成方法は[こちら](example-inputdata-creation/README.md)を参照ください。


# 削除方法
Linuxマシンのターミナル上で以下のコマンドを実行します。<br>
1. ```docker-compose down```
2. ```docker volume rm controlled-vocabulary-designer-db-data```

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

# 謝辞
本研究テーマは、内閣府総合科学技術・イノベーション会議「戦略的イノベーション創造プログラム（SIP）ビッグデータ・AI を活用したサイバー空間基盤技術」（NEDO）の支援のもと遂行されました。

# 連絡先
contact-cvd@cs.jp.fujitsu.com
