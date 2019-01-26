'use strict';
// エンターキーを押すたびに3つのボールがシャッフルされるアルゴリズム
let interval = 60; // ボール間の間隔
const MOVE_FRAME = 30;  // 移動フレーム数
const COUNT = 10; // シャッフル回数
let circles = [];
let three_shuffler;
let moveState = {wait:0, move:1};

function setup(){
  createCanvas(320, 480);
  fill('blue');   // 中身は青
  stroke('blue'); // 縁取りも青
  three_shuffler = new shuffler(3);
  for(let i = 0; i < 3; i++){
    let c = new circle(100 + interval * i, 100);
    circles.push(c);
  }
}

function draw(){
  background(220);
  circles.forEach(function(c){ c.display(); });
}

class circle{
  constructor(x, y){
    this.offX = x;
    this.offY = y;
    this.frame = 0;
    this.moveArray = []; // 1とか-2とか入ってて、それにframeを掛けると変位が出る
    this.state = moveState['wait']; // 待機中
  }
  setMoveArray(array){ // 移動の詳細をここで。
    this.moveArray = array;
    console.log(this.moveArray);
    console.log('%d %d', this.offX, this.offY)
    this.state = moveState['move'];
  }
  display(){
    if(this.moveArray.length === 0){
      ellipse(this.offX, this.offY, 20, 20);
      return;
    }
    if(this.frame < MOVE_FRAME){
      this.frame++;
      ellipse(this.offX + this.frame * this.moveArray[0] * interval / MOVE_FRAME, this.offY, 20, 20);
      if(this.frame === MOVE_FRAME){
        this.offX += this.moveArray[0] * interval; // 変化するのはXだけ
        this.moveArray.shift();
        this.frame = 0;
        if(this.moveArray.length === 0){ this.state = moveState['wait']; }
      }
    }
  }
  moveOn(){ return this.state === moveState['move']; } // 動いてるー
}

class shuffler{
  constructor(n){
    this.size = n;
    this.seed = getShuffleSeed(n);
    this.currentPosition = 0; // たとえばn=3なら[0, 1, 2]の配置であることを示す、この場合0~5が候補となる。
  }
  getShuffleData(count){
    // count回シャッフルするとして、その際の移動のデータ。それを手に入れる感じ。
    let trail = [];
    trail.push(this.seed[this.currentPosition]);
    let len = this.seed.length;
    for(let i = 0; i < count; i++){
      this.currentPosition += Math.floor(random(1, len)); // 1~len-1のいずれかを足す。そして、lenで割って余りを取る。
      this.currentPosition = this.currentPosition % len;
      trail.push(this.seed[this.currentPosition]);
    }
    // trailには初期状態から最終状態までの配置に関するすべてのデータが入ってる。
    // これの階差数列によりdataを構成する。
    // data[0]が0番の、data[1]が1番の・・といった感じ。
    let data = [];
    for(let k = 0; k < this.size; k++){
      let array = [];
      for(let i = 0; i < count; i++){
        array.push(trail[i + 1][k] - trail[i][k]);
      }
      data.push(array);
    }
    return data;
  }
  shufflePrepare(){
    // シャッフルの準備（エンターキーで呼び出される関数）
    let data = this.getShuffleData(COUNT);
    circles[0].setMoveArray(data[0]);
    circles[1].setMoveArray(data[1]);
    circles[2].setMoveArray(data[2]);
  }
}

// 入力：n=3, 4, 5など。
// 出力：0, 1, ..., n-1の並び替えの配列の列（長さn!）で、すべてのパターンを網羅。
// example: n=3のとき[[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]].
function getShuffleSeed(n){
  if(n > 7){ return []; } // 念のため
  if(n === 1){ return [[0]]; }
  if(n === 2){ return [[0, 1], [1, 0]]; }
  let seed = getShuffleSeed(n - 1); // 元手。
  let a = [];
  for(let i = 0; i < n; i++){ a.push(i); } // a = [0, 1, 2, ..., n-1]
  let perm = [];
  for(let k = 0; k < n; k++){
    // kから始まってひとつずつ
    seed.forEach(function(subPerm){
      let seq = [k];
      // 各々のsubPermについて、0からn-2までの並び替えがあるので、
      // それらに1を足したものをkに足してnでモジュロしてseqに放り込んで行って
      // 完成したらpermに追加。それを延々と。
      for(let j = 0; j < n - 1; j++){ seq.push((k + subPerm[j] + 1) % n); }
      perm.push(seq);
    })
  }
  return perm;
}

function keyTyped(){
  if(keyCode === KEY['ENTER']){
    if(circles[0].moveOn()){ return; }
    three_shuffler.shufflePrepare(COUNT);
  }
}
function mouseClicked(){
  if(circles[0].moveOn()){ return; }
  three_shuffler.shufflePrepare(COUNT);
  console.log("シャッフルの実験")
  console.log(shuffle([2, 3, 4])) // ただし、同じものが出る場合もあるので、その場合はもう1回やる。
}

// 問題点は？
// シャッフル中は再計算不可なんだけれど、その状態を取得するためにcircles[0]に直接アクセスしてる。
// shufflerとか名付けてるんならシャッフル関連の状態はすべて把握しておくべき。

// 最終的には3つとか4つとか5つとか2x2とか3x3とか選べるようにしたい。
// そのためにももっと洗練させる必要がある。
// というか、・・シャッフルって関数あったっけ、あれ使った方がいいかもね。デフォルトであるんだって。
// ・・まぁ、3x3とかなるとね・・9はさすがにね・・・シャッフル、ああそういえばインターバル問題集の時実装したなぁ。
// 思えば色んなプログラム書いてきたなぁって走馬燈。

// 2番目以降をシャッフルして1番目とそのうちのどれかを入れ替えれば確実だけどね。
