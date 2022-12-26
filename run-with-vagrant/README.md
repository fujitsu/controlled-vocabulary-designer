# run-with-vagrant

## 説明
Controlled Vocabulary DesignerをVagrantという仮想マシンを起動・マネージするツールを用いて、  
Windows OSを持つ人でも動かす方法です。Windowsのcmd.exe（通称DOS）を用いて実行します。
cmd.exeはWindowsのスタートメニューを開き、「cmd.exe」とタイプすると見つけることができます。

## 事前準備
- Virturalboxのインストール  
  - Web検索してインストールしてください。
- Vagrantのインストール  
  - Web検索してインストールしてください。

試した環境
- Windows（ホスト）の環境
  - VirtualBox 6.1.34
  - Vagrant 2.2.19


## Vagrant plugin（オプショナル）
プロクシ環境下で設定をする場合、vagrant-proxyconfプラグインがあると便利です。
Vagrantをインストール後、DOSからCUIでインストールします。
プラグインをインストールする前に、DOSのプロクシ環境設定が必要です。
下記は設定例です。もし```userid```などにアットマークを含む場合は```%40```としてください。
なお、下記のコマンド例で「>」はDOSのプロンプトを表現するものであり、実際に入力するコマンドからは外してください。
```
> set http_proxy=http://userid:PWD@your.proxy.com:8080
> set https_proxy=https://userid:PWD@your.proxy.com:8080
```
この環境変数を設定した上でプロクシプラグインをインストールします。
```
> vagrant plugin install vagrant-proxyconf
```


# VagrantによるVMの起動
- 下記の内容を「Vagrantfile」というファイル名でテキストで作成します。  
  このフォルダ―に設定例を入れています。
-  プロクシ環境下の人は```config.proxy```の列をご自身の使用している値へ変更してください。  
  その上で、コメントアウト「#」を消してください。
```
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "bento/fedora-36" 
  config.vm.box_version = "202206.03.0"
  #config.proxy.http     = "http://userid:PWD@your.proxy.com:8080"
  #config.proxy.https    = "https://userid:PWD@your.proxy.com:8080"
  #config.proxy.no_proxy = "localhost,127.0.0.1"
  
  config.vm.provider "virtualbox" do |v|
    #v.gui = true
    v.gui = false
  end
  config.vm.define "fedora36-1" do |mymachine|
    mymachine.vm.hostname = "myfedora36-1"
    mymachine.vm.network "forwarded_port", guest: 10081, host: 10081 
    mymachine.vm.provision "docker"  
    mymachine.vm.provision "shell", inline: "dnf -y install docker-compose git --allowerasing"
    mymachine.vm.provision "shell", inline: "git clone https://github.com/fujitsu/controlled-vocabulary-designer.git"
    mymachine.vm.provision "shell", inline: "docker-compose -f controlled-vocabulary-designer/docker-compose.yml up -d"
  end
end
```

DOSで「Vagrantfile」を保存したフォルダーに移動（cd）し、下記コマンドで仮想マシンを起動します。
```
> vagrant up
```
仮想マシンの作成とCVDの起動を一気に行うため１０分から３０分程度（環境に依りますが）かかります。

Vagrantfileでゲストとホストのポートフォワーディングしているので、ホストのブラウザーで、```http://localhost:10081/```にアクセスするとCVDの画面が出てきます。  


# （オプショナル）入力データの作成
上記の仮想マシンを用いて[読み込み用ファイル作成例](../example-inputdata-creation/README.md)をする方法について記載します。

DOSで上記の```vagrant up```コマンドで仮想マシンを起動した後に、同じフォルダーで下記のコマンドを実行することで仮想マシンの中に入ることができます。
```
> vagrant ssh
```

入った後は、```/home/vagrant```というところに居ます。

```/home/vagrant/controlled-vocabulary-designer```というところにCVDのソースコードがあり、
```cd controlled-vocabulary-designer/```というコマンドでディレクトリの移動が出来ます。

その後は、
[読み込み用ファイル作成例](../example-inputdata-creation/README.md)に記載の方法で実行できます。

なお、ホストOS（Windows）と仮想マシンの間のファイルの共有は下記のようにします。
まず、```/vagrant```というところがホストOSとの共有ディレクトリになっています。
```ls /vagrant/```とコマンドを打つと、```README.md  Vagrantfile```が見えます。
ホストOSの方は「Vagrantfile」を保存してあるフォルダーが上記フォルダーになります。

例えば、ホストOSの上記フォルダ―にある「tmp.csv」というファイルを仮想マシン上の
```example-inputdata-creation/mountdir/data/```にコピーするには、
下記の様にコマンドを実行します。

```sudo cp /vagrant/tmp.csv  /home/vagrant/controlled-vocabulary-designer/example-inputdata-creation/mountdir/data/```

なお、上記で「sudo」とあるのは、ディレクトリのオーナーがrootになっているためです。
もしパスワードを求められたら「vagrant」と入力してください。


