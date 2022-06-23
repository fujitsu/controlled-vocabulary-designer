# Controlled Vocabulary Designer (CVD)
CVDは、統制語彙の作成を視覚的なインターフェースでサポートするツールです。<br>
自然言語処理の計算結果や既存の統制語彙を参照して、同義関係や上下関係を効率的に定義できます。
さらに、アプリケーションウィンドウで語彙全体を確認しながら直感的に編集することができます。
作成された統制語彙は、RDFファイルとして出力・保存できます。<br>
CVDのヘルプページは[こちら](https://fujitsu.github.io/controlled-vocabulary-designer/)

# システム要件
- docker : バージョン19.03以上
- docker-compose : バージョン1.23以上

# セットアップ方法
0. proxy環境下で使用されるときは HTTP_PROXY, HTTPS_PROXYを環境変数に設定してください。
1. ```docker-compose up -d```
2. 作業環境のWEBブラウザで以下にアクセスします。

```
http://(hostname):10081/
```

# サポートブラウザ
* Google Chrome
* Microsoft Edge
* Firefox

# サポートファイル形式
* 読み込み用ファイル形式
  * 編集用語彙（語彙を編集するファイル） :  .xlsx, .csv
  * 参照用語彙（既存の統制語彙語彙ファイル） : .xlsx, .csv
  * コーパス（用語間が半角スペースで区切られているファイル） : .txt

* 書き出し用ファイル形式
  * 編集用語彙（語彙を編集したファイル） : .xlsx, .csv
  * 統制語彙（語彙を編集したファイル） : .n3, .nquads, .nt, .trix, .turtle, .xml, .jsonld


##  ファイル形式の変換（暫定措置）
このツールの入出力ファイル形式はcsv（あるいはxlsx）ですが、2021年度にスキーマが変更されました。したがって、ファイルを古い形式（2020年度版）から新しい形式（2021年度版）に変換する必要があります。
※すべての用語は日本語として扱われます。

### 新しいファイル形式を古いファイル形式に変換する方法
1. 変換する新しいファイルをnew2old.pyと同じディレクトリに置きます。
2. ```$ python new2old.py [input new format csv] [output old format csv]```<br>
例) python new2old.py in_new.csv out_old.csv <br>
※「言語」列の値が"en"の用語は、変換処理によって削除されます。

### 古いファイル形式を新しいファイル形式に変換する方法
1. 変換する古いファイルをold2new.pyと同じディレクトリに置きます。
2. ```python old2new.py [input old format csv] [output new format csv] [URI prefix]```<br>
例) python old2new.py in_old.csv out_new.csv http\://myVocab/ <br>
※変換後、すべての用語の「言語」列の値は"ja"となります。

## 編集用語彙のサンプル (2021年度版)

|用語名|代表語|代表語のURI|上位語|同義語候補|上位語候補|品詞|x座標値|y座標値|色1|色2|
|----|----|----|----|----|----|----|----|----|----|----|
|aphros||||||名詞|6.882962381|-0.782237226|black|black|
|api||||||名詞|-9.651039608|15.05839617|black|black|
|サメ||||shark, 鮫|selachian, elasmobranch, 板鰓類|名詞|-12.40469425|1.260754069|black|black|
|サンショウウオ||||salamander, 山椒魚|amphibian, 両生類, 両棲類|名詞|2.755970296|-1.591457808|black|black|
|靖子||||||名詞|14.85126593|-1.219740487|black|black|
|靖樹||||||名詞|7.643998834|-0.408532063|black|black|

## 参照用語彙のサンプル（2021年度版）

|用語名|代表語|代表語のURI|上位語|
|----|----|----|----|
|タビエ|タイヌビエ|http://cavoc.org/cvo/ns/2/C1312||
|飼料用アオキ|飼料用アオキ|http://cavoc.org/cvo/ns/2/C1397|アオキ|
|ブドウ|ブドウ|http://cavoc.org/cvo/ns/2/C950	||
|ケニギンデルワインガルデン|ケニギンデルワインガルデン|http://cavoc.org/cvo/ns/2/C977|ブドウ|


## コーパスのサンプル
コーパスでは、文が1行ごとに改行されており、各文では用語間が半角スペースで区切られている。

```
データ 連携 を 推進 して いく 上 で 課題 の 1つ と なって いる の が データ の 標準化 で ある
統制 語彙 作成 支援 ツール を 動作 させ た ホスト の 下記 アドレス に Web ブラウザ に よって アクセス する こと で ツール が 利用 可能 で ある
永続 ボリューム の 上 に 構成 され サービス を 終了 させても データ は 揮発 しない
```

## 入力用データの作成サンプル
入力用データの作成サンプルは下記ページを参照ください。<br>
[編集語彙、参照語彙、コーパスの作成例](example-inputdata-creation/README.md)


# URIプレフィックス
「Config.js」を使用して、URIプレフィックスの略語を設定することができます。入力したURIに、設定したURIプレフィックスが含まれている場合、対応する略語に自動的に変換されアプリケーションウィンドウ上で確認することができます。設定した略語をアプリケーションウィンドウ上で入力することもできます。いずれの場合も「Config.js」で設定したURIプレフィックスとして認識され、データベースに保存されます。


## Config.jsのサンプル
URIプレフィックスである"origin"のバリューは"equiv"のバリューに変換されます。<br>
以下のサンプルでは、`'http://cavoc.org/'`は`'cavoc:'`に、`'http://example.org/'`は`'ex:'`に変換されます。

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


# 用語の座標値のスケール倍率
編集用語彙の用語の座標値と参照用語彙の用語の座標値のスケールに大きな違いがある場合は、「Config.js」を編集することで参照用語彙の用語の座標値のスケール倍率を調整することができます。

## Config.jsのサンプル
参照用語彙の用語の座標値のスケールのデフォルトの倍率は「1」です。正の数と負の数ともに設定することができます。

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

# 謝辞
本研究テーマは、内閣府総合科学技術・イノベーション会議「戦略的イノベーション創造プログラム（SIP）ビッグデータ・AI を活用したサイバー空間基盤技術」（NEDO）の支援のもと遂行されました。

# 連絡先
contact-cvd@cs.jp.fujitsu.com
