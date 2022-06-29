# Controlled Vocabulary Designer (CVD)
CVDは、統制語彙の作成を独自のインターフェースで視覚的にサポートするツールです。<br>
自然言語処理の計算結果や既存の統制語彙を参照して、用語間（概念間）の同義関係や上下関係を効率的に定義できます。
また、アプリケーションウィンドウで語彙全体を視認しながら直感的に語彙を編集することができます。
さらに、作成された統制語彙をRDFファイルとして出力・保存することができます。<br>
CVDについては[こちら](https://fujitsu.github.io/controlled-vocabulary-designer/)も参照ください。

# システム要件
- docker : バージョン19.03以上
- docker-compose : バージョン1.23以上

# セットアップ方法
1. Linuxマシンのターミナル上で以下のコマンドを実行します。<br>
```docker-compose up -d```
2. 作業環境のWEBブラウザで以下にアクセスします。<br>
```http://(hostname):10081/```

# サポートブラウザ
* Google Chrome
* Microsoft Edge
* Firefox

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
サンプル語彙,sample vocabulary,1.0.0,my,http://myVocabulary/,サンプル用の語彙です,The vocabulary for sample,サンプル太郎
```
-  列名の重複がないことを確認してください。
-  「語彙の名称」列から「語彙の作成者」列まで全て必須です。
-  独自の列が含まれていても問題ありません。


## 編集用語彙のサンプル

```
用語名,代表語,言語,代表語のURI,上位語のURI,他語彙体系の同義語のURI,用語の説明,作成日,最終更新日,同義語候補,上位語候補,x座標値,y座標値,色1,色2,確定済み用語
コンビニ,コンビニエンスストア,ja,http://myVocabulary/1,http://myVocabulary/2,,コンビニエンスストアの略称です,2021-04-02T12:43:02Z,2021-04-08T16:07:59Z,"常駐警備, 警備員, 機械警備, ビルメンテナンス, 運送会社, 運転代行, 貴重品輸送警備, ホームセキュリティ, ガーディアンエンジェルス, 警備保障",,3.779367076,-44.97713738,black,black,0
コンビニエンスストア,コンビニエンスストア,ja,http://myVocabulary/1,http://myVocabulary/2,,コンビニエンスストアの略称です,2021-04-02T12:43:02Z,2021-04-08T16:07:59Z,"子育て支援センター, 介護予防, 生涯学習, 高齢者福祉, 母子生活支援施設, 育児支援, 社会的養護, 地域包括支援センター, 海士町中央図書館, 福祉",,16.81118132,-61.70717408,black,black,0
convenience store,convenience store,en,http://myVocabulary/1,http://myVocabulary/2,,Alias of convenience store,2021-04-02T12:43:02Z,2021-04-08T16:07:59Z,"郵便物, 速達郵便, 郵便局, 小包, 郵便事業, 配達, 国際郵便, 郵便サービス, 航空郵便, 集配人","デリバリー, デリヴァリー, 持参, 送達, 配信, 配送, 配達, コミュニケイション, 伝達, 通信, メッセイジ, ドキュメント, 一札, 文書, 方策, ご書, 書, 書きもの, 書付, 書付け, 書契, 書札, 書案, 書き物, 記, 記文, テキス, テキスト, 原文, 文, 文章, 本文, 正文, 正本, コレクション, 収集物, 固まり, 群, 蓄積, 集まり, 集合体, 集合物, 集団, 集積物",-7.53980653,-51.30562908,black,black,0
drug store,convenience store,en,http://myVocabulary/1,http://myVocabulary/2,,Alias of convenience store,2021-04-02T12:43:02Z,2021-04-08T16:07:59Z,"空き家問題, 空家, 廃屋, 民家, 空き室, アパート, 米軍ハウス, 公営団地, 住宅, 家賃滞納",,-7.911179493,-26.26668782,black,black,0
the corner shop,convenience store,en,http://myVocabulary/1,http://myVocabulary/2,,Alias of convenience store,2021-04-02T12:43:02Z,2021-04-08T16:07:59Z,"アムラックス, 銀座三越, モデルルーム, 日産ギャラリー, イセタン, コワーキングスペース, カリモク家具, 自社ビル, ポーゲンポール, 蔦屋家電",,-43.68659491,42.18700014,black,black,0
店舗,店舗,ja,http://myVocabulary/2,,http://otherVocabulary/16,,2021-04-01T11:40:15Z,2021-04-09T09:22:11Z,"リテラシー, 金融, 人材マネジメント, リテラシ, esg投資, コーポレートファイナンス, アントレプレナーシップ, ソーシャルマーケティング, ニューノーマル, 労働経済学",,7.237030405,-51.76710593,black,black,0
店,店舗,ja,http://myVocabulary/2,,http://otherVocabulary/16,,2021-04-01T11:40:15Z,2021-04-09T09:22:11Z,"賃貸, 不動産投資, 不動産業, 不動産仲介, 不動産会社, 信託受益権, 不動産開発, 中古マンション, サブリース, プロパティマネジメント","プロパティ, プロパティー, 保有物, 所有, 所有地, 所有物, 持物, 有形の所有物, 財産, 資産, 身代",-47.93248755,34.79784645,black,black,0
store,store,en,http://myVocabulary/2,,http://otherVocabulary/16,,2021-04-01T11:40:15Z,2021-04-09T09:22:11Z,"生体認識, 生体情報, 生体物質, 細胞, 生体材料, 分子レベル, 遺伝子改変動物, 体内, 細胞分化, 人体","生き物, 有機体, 生体, 生活体, 生物, 生き物, バディ, ししむら, 五体, 体, 体躯, 図体, 御身, 肉体, 肉叢, 肉塊, 肉身, 足手, 身, 身体, 身躯, 身骨, 躯体, 骨身",9.110486157,-80.63532085,black,black,0
shop,store,en,http://myVocabulary/2,,http://otherVocabulary/16,,2021-04-01T11:40:15Z,2021-04-09T09:22:11Z,"プラットフォーム, web, モバイルアプリケーション, ウェブ, yammer, アプリケーション, opensocial, クラウドプラットフォーム, ホスティングサービス, typepad",,32.98654788,33.62595116,black,black,0
```
-  列名の重複がないことを確認してください。
-  「語彙の名称」列から「語彙の作成者」列まで全て必須です。（各列の各行についての記述条件については、各列の説明を参照ください）
-  独自の列が含まれていても問題ありません。
-  「用語名」列
    -  分野の用語のことです。
    -  重複の無いように一行ごとに記述してください。
    -  以下の3つの状態を全て満たす場合は、該当する行の記述の省略が可能です。
        -  「代表語」列が空白
        -  「用語の説明」列が空白ではない
        -  他の行で「代表語のURI」列が同じでかつ「代表語」列が空白ではない行が存在する
-  「代表語」列
    -  同義語のうち代表とする用語名のことです。
    -  同義語それぞれに「言語」ごとに同じ代表語を記述してください。
    -  以下の状態を満たす場合は、該当する行の記述の省略が可能です。
        -  他の行で「代表語のURI」列が同じでかつ「代表語」列が空白ではない行が存在する
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
カイトウメン,カイトウメン,ja,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,3.779367076,-44.97713738
Gossypium barbadense,カイトウメン,en,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,16.81118132,-61.70717408
ペルー綿,カイトウメン,ja,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,-7.53980653,-51.30562908
シーアイランド綿,カイトウメン,ja,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,-7.911179493,-26.26668782
エジプト綿,カイトウメン,ja,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,-43.68659491,42.18700014
スーダン綿,カイトウメン,ja,http://cavoc.org/cvo/ns/3/C822,http://cavoc.org/cvo/ns/3/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,7.237030405,-51.76710593
ワタ,ワタ,ja,http://cavoc.org/cvo/ns/3/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,-47.93248755,34.79784645
モメン,ワタ,ja,http://cavoc.org/cvo/ns/3/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,9.110486157,-80.63532085
Cotton,Cotton,en,http://cavoc.org/cvo/ns/3/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,63.98654788,-13.62595116
Gossypium arboreum,Cotton,en,http://cavoc.org/cvo/ns/3/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,84.94554788,-65.64325116
Gossypium herbaceum,Cotton,en,http://cavoc.org/cvo/ns/3/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,22.86783788,-30.67687116
Gossypium hirsutum,Cotton,en,http://cavoc.org/cvo/ns/3/C876,,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,-52.98788,-42.625
食用綿実,食用綿実,ja,http://cavoc.org/cvo/ns/3/C1055,http://cavoc.org/cvo/ns/3/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,91.99742788,-43.65986116
Edible cotton,Edible cotton,en,http://cavoc.org/cvo/ns/3/C1055,http://cavoc.org/cvo/ns/3/C876,,,2017-10-02T12:02:48Z,2021-07-14T12:43:45Z,56.98865788,-77.97631116
```
-  列名の重複がないことを確認してください。
-  「用語名」列から「y座標値」列まで全て必須です。
-  独自の列が含まれていても問題ありません。
-  各列については、編集用語彙の各列の説明を参照ください。


## 読み込み用ファイルの作成方法
読み込み用ファイルの作成方法は[こちら](example-inputdata-creation/README.md)を参照ください。


# URIプレフィックス
app/app/client/config/Config.jsを使用して、URIプレフィックスの略語を設定することができます。入力したURIに設定したURIプレフィックスが含まれている場合、設定された略語に自動的に変換されCVD上で確認することができます。また、設定した略語をCVD上で入力することもできます。いずれの場合もapp/app/client/config/Config.jsに設定したURIプレフィックスとして認識され、データベースに保存されます。


## URIプレフィックスの略語の設定の例（app/app/client/config/Config.js）
URIプレフィックスである"origin"のバリューは"equiv"のバリューに変換されます。<br>
以下のサンプルでは、`'http://cavoc.org/'`は`'cavoc:'`に、`'http://example.org/'`は`'ex:'`に変換されます。

```
...
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
...
```


# 用語の座標値のスケール倍率
編集用語彙の用語の座標値と参照用語彙の用語の座標値のスケールに大きな違いがある場合は、app/app/client/config/Config.jsを編集することで参照用語彙の用語の座標値のスケール倍率（x座標値やy座標値に掛ける値のこと）を調整することができます。

## 用語の座標値のスケール倍率の設定の例（app/app/client/config/Config.js）
参照用語彙の用語の座標値のスケールのデフォルトの倍率は「1」です。正の数と負の数ともに設定することができます。

```
...
'magnification': [
  {
    'reference': 1,
  },
],
...
```

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
