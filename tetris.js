//canvasとcontextの取得&canvasの大きさ設定
let canvas = document.getElementById("canvas");
let context = canvas.getContext("2d");


//各クラス
class Helper {
    static calcColsCenter(){
        return Math.floor((Field.Col - Mino.size) / 2);
    }
}


class music {
  //BGM
  static LoveU = new Audio("music/Razihel - Love U [NCS Release].mp3");
  static FeelGood = new Audio("music/Syn Cole - Feel Good [NCS Release].mp3");
  static Puzzle = new Audio("music/RetroVision - Puzzle [NCS Release].mp3");
  static earthquake = new Audio("music/ROY KNOX - Earthquake [NCS Release].mp3");
  static rush = new Audio("music/Wubbaduck - Rush [NCS Release].mp3");
  //効果音
  static rotate = new Audio("music/rotate.mp3");
  static landing = new Audio("music/landing.mp3");
  static eraseLine = new Audio("music/eraseLine.mp3");
  static eraseLine2 = new Audio("music/eraseLIne2.mp3");
  static eraseLine3 = new Audio("music/eraseLine3.mp3");
  static eraseLine4 = new Audio("music/eraseLine4.mp3");
  static hold = new Audio("music/hold.mp3");
}


class Block {
    //ブロック1マスのサイズ(px)をwindow.heightによってブロックのサイズを決定します
    static windowH = window.innerHeight;
    static size = (Block.windowH > 950) ? 32 : (Block.windowH > 850) ? 30 : (Block.windowH > 750) ? 28 : 26


}
console.log(Block.windowH)

let color;

class Mino {
    constructor(x, y){
        this.x = x;
        this.y = y;
        let index = Math.floor(Math.random() * Mino.tetros.length);
        this.tetro = Mino.tetros[index];
        this.color = Mino.colors[index];
        color = this.color;
    }

    //Minoの各長さ
    static size = 4;

    static tetros = [
        [
          [0, 0, 0, 0],
          [1, 1, 0, 0],
          [0, 1, 1, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [0, 1, 0, 0],
          [1, 1, 1, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [0, 1, 1, 1],
          [0, 1, 0, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [1, 1, 1, 0],
          [0, 0, 1, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [0, 1, 1, 0],
          [0, 1, 1, 0],
          [0, 0, 0, 0],
        ],
        [
          [0, 0, 0, 0],
          [0, 0, 1, 1],
          [0, 1, 1, 0],
          [0, 0, 0, 0],
        ]
      ];
    
    /** tetoro 色配列 */
    static colors = ["cyan", "blue", "orange", "yellow", "green", "purple", "pink"];

    /**tatrominoを描写する関数*/
    draw(){
        //前にあったminoを消す
        context.clearRect(0, 0, canvas.width, canvas.height);
        //fieldを塗る
        Field.draw();

        //minoの描写
        for (let y = 0; y < Mino.size; y++){
            for(let x = 0; x < Mino.size; x++){

                if(this.tetro[y][x]==1){
                    //tetorominoの1ブロックの座標
                    let tetroX = (this.x + x) * Block.size;
                    let tetroY = (this.y + y) * Block.size;

                    //座標に1ブロック描写
                    context.fillStyle = this.color;
                    context.fillRect(tetroX, tetroY, Block.size, Block.size);
                    context.strokeStyle="rgb(0, 0, 0)";
                    context.strokeRect(tetroX, tetroY, Block.size, Block.size);
                }
            }
        }
    }

    /**
     * minoの衝突判定の結果ブーリアン値を返す関数
     * @param {*} dx x方向にずらしたい値
     * @param {*} dy y方向にずらしたい値
     */
    checkCollision(dx, dy) {
        for (let y = 0; y < Mino.size; y++) {
            for (let x = 0; x < Mino.size; x++) {
                if (this.tetro[y][x]) {
                    const newX = this.x + x + dx;
                    const newY = this.y + y + dy;

                    // 範囲外アクセスまたは他のブロックとの衝突をチェック
                    if (newX < 0 || newX >= Field.Col || newY >= Field.Row || field[newY][newX] !== "white") {
                        // 衝突がある場合はtrueを返す
                        return true;
                    }
                }
            }
        }
        // 衝突がない場合はfalseを返す
        return false;
    }
    
    /**
     * minoをdx,dyマスずつ動かす関数
     * @param {*} dx x方向にずらす値
     * @param {*} dy y方向にずらす値
     */
    move(dx, dy){
        if (!this.checkCollision(dx, dy)){
            this.x += dx;
            this.y += dy;
        }
    }

    /** minoを回転させる関数*/
    rotate() {
        const preMatrix = this.tetro;
        this.tetro = this.tetro[0].map((_, index) => this.tetro.map(row => row[index])).reverse();

        if (this.checkCollision(0, 0)) {
            // 衝突がある場合は回転前の状態に戻す
            this.tetro = preMatrix;
        }
        else {
            // 回転後のミノが範囲外に出る場合は位置を調整する
            while (this.x + this.tetro[0].length > Field.Col) {
              this.move(-1, 0);
        }
            while (this.y + this.tetro.length > Field.Row) {
              this.move(0, -1);
            }
        }
    }

    /** キャンバス上部中心に生成したminoをインスタンスとして返す関数*/
    static createMino() {
        const positionX = Helper.calcColsCenter();
        const positionY = -1;

        const newMino = new Mino(positionX, positionY);
        
        return newMino;
    }
}

class Field {
    //col(列：横に何個入るか), row(行：縦に何個入るか), colはminoの中心計算より偶数が望ましい
    static Col = 12;
    static Row = 20;

    //canvasの長さ = 行の長さ(列の長さ) * 1ブロックの大きさ
    static canvasW = Field.Col * Block.size;
    static canvasH = Field.Row * Block.size;

    /**canvasのwidthとheightを決める関数*/
    static decideCanvasScale(){
        canvas.width = Field.canvasW;
        canvas.height = Field.canvasH;
    }


    /** field行列で0の要素を白く染める&fieldに固定したミノを描く(else)関数*/
    static draw(){
      for (let y = 0; y < Field.Row; y++){
        for(let x = 0; x < Field.Col; x++){
          //fieldの座標
          let fieldX = x * Block.size;
          let fieldY = y * Block.size;

          if(field[y][x] === "white"){
            //座標に1ブロック描写
            context.fillStyle = "rgb(255, 255, 255, 0.7)";
            context.fillRect(fieldX, fieldY, Block.size, Block.size);
            context.strokeStyle="rgb(0, 0, 0, 0.1)";
            context.strokeRect(fieldX, fieldY, Block.size, Block.size);
          }
          else{
            //座標に1ブロック描写
            context.fillStyle = field[y][x];
            context.fillRect(fieldX, fieldY, Block.size, Block.size);
            context.strokeStyle="rgb(255, 255, 255)";
            context.strokeRect(fieldX, fieldY, Block.size, Block.size);
          }
        }
      }
  }

    /**field行列を返す関数 */
    static makeField(){
      let field = [];

      for(let y = 0; y < Field.Row; y++){
        field[y] = [];

        for(let x = 0; x < Field.Col; x++){
          field[y][x] = "white";
        }
      }

      return field;
    }
    // ラインを消去する関数
    static clearLines() {
      //消去ラインカウント
      let count = 0;

      for (let y = Field.Row - 1; y >= 0; y--) {
        let lineFilled = true;
        for (let x = 0; x < Field.Col; x++) {
          if (field[y][x] === "white") {
            lineFilled = false;
            break;
          }
        }
        if (lineFilled) {
          //消去ラインカウントを更新
          count += 1;
          // ラインを消去
          field.splice(y, 1);
        }
      }
      // 新しい空行を追加
      for(let i = 0; i < count; i++){
        field.unshift(new Array(Field.Col).fill("white"));
      }

      //消去音&scoreの更新
      if(count==1){
        music.eraseLine.currentTime = 0;
        music.eraseLine.play();
        score += Math.floor(100 * 1.0);
        Game.screenScore();
      }
      else if(count==2){
        music.eraseLine2.currentTime = 0;
        music.eraseLine2.play();
        score += Math.floor(200 * 1.2);
        Game.screenScore();
      }
      else if(count==3){
        music.eraseLine3.currentTime = 0;
        music.eraseLine3.play();
        score += Math.floor(300 * 1.3);
        Game.screenScore();
      }
      else if(count>=4){
        music.eraseLine4.currentTime = 0;
        music.eraseLine4.play();
        score += Math.floor(count * 100 * 1.5);
        Game.screenScore();
      }
      
      // ゲームオーバーチェック
      if (field[0].some(block => block !== "white")) {
        console.log("Game Over");
        // GAMEOVERを表示
        context.font = "35px Arial";
        context.fillStyle = "red";
        context.fillText("GAME OVER", canvas.width / 2 - 100, canvas.height / 2);
        // ゲームを停止する処理
        cancelAnimationFrame(animationFrameId);
        return true;
      }
      return false;
    }

    static moveDown() {
      if (!tetro.checkCollision(0, 1)) {
        tetro.move(0, 1);
      } else {
        // ミノが着地した場合
        // フィールドにミノのブロックを追加
        for (let y = 0; y < Mino.size; y++) {
          for (let x = 0; x < Mino.size; x++) {
            if (tetro.tetro[y][x]) {
              const fieldX = tetro.x + x;
              const fieldY = tetro.y + y;
              field[fieldY][fieldX] = tetro.color;
            }
          }
        }
        
        music.landing.currentTime = 0;
        music.landing.play();//着地音
        Field.clearLines(); // ラインの消去
        Game.changeDifficulty();//難易度変更のチェックと実行
        tetro = next; 
        next = Mino.createMino(); // 新しいミノを生成
        Field_next.draw();
      }
    }
}

let hold = null;
let holdColor = "white";
let holdCanvas = document.getElementById("holdCanvas");
let holdContext = holdCanvas.getContext("2d");
holdCanvas.width = 4 * Block.size;
holdCanvas.height = 4 * Block.size;

class Hold {
  static hold (){
    if (!hold){
      hold = tetro;
      holdColor = color;
      tetro = Mino.createMino();
      Hold.holdDraw();
    }
    else {
      const tmpTetro = tetro;
      const tmpColor = color;

      tetro = hold;
      color = holdColor;
      tetro.x = Helper.calcColsCenter();
      tetro.y = -1;
      hold = tmpTetro;
      holdColor = tmpColor;
      Hold.holdDraw();
    }
  }
  static holdDraw(){
    //前にあったminoを消す
    holdContext.clearRect(0, 0, holdCanvas.width, holdCanvas.height);

    //minoの描写
    for (let y = 0; y < Mino.size; y++){
      for(let x = 0; x < Mino.size; x++){

        if(hold.tetro[y][x]==1){
          //tetorominoの1ブロックの座標
          let tetroX = x * Block.size;
          let tetroY = y * Block.size;

          //座標に1ブロック描写
          holdContext.fillStyle = holdColor;
          holdContext.fillRect(tetroX, tetroY, Block.size, Block.size);
          holdContext.strokeStyle="rgb(0, 0, 0)";
          holdContext.strokeRect(tetroX, tetroY, Block.size, Block.size);
        }
      }
    }
  }
}


let nextCanvas = document.getElementById("nextCanvas");
let nextContext = nextCanvas.getContext("2d");

class Field_next {
  //col(列：横に何個入るか), row(行：縦に何個入るか), colはminoの中心計算より偶数が望ましい
  static Col = 4;
  static Row = 4;

  //canvasの長さ = 行の長さ(列の長さ) * 1ブロックの大きさ
  static canvasW = Field_next.Col * Block.size;
  static canvasH = Field_next.Row * Block.size;

  /**canvasのwidthとheightを決める関数*/
  static decideCanvasScale(){
      nextCanvas.width = Field_next.canvasW;
      nextCanvas.height = Field_next.canvasH;
  }

  static draw(){
    //前にあったminoを消す
    nextContext.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    //nextColor
    let nextColor = next.color;

    //minoの描写
    for (let y = 0; y < Mino.size; y++){
      for(let x = 0; x < Mino.size; x++){

        if(next.tetro[y][x]==1){
          //tetorominoの1ブロックの座標
          let tetroX = x * Block.size;
          let tetroY = y * Block.size;

          //座標に1ブロック描写
          nextContext.fillStyle = nextColor;
          nextContext.fillRect(tetroX, tetroY, Block.size, Block.size);
          nextContext.strokeStyle="rgb(0, 0, 0)";
          nextContext.strokeRect(tetroX, tetroY, Block.size, Block.size);
        }
      }
    }
  }


}



class Game {
    //** scoreによってゲーム難易度を変える関数*/
    static changeDifficulty(){
      if(score >= 1000){
        interval = 200;
        Game.changeBGM(music.earthquake);
        document.body.style.backgroundImage = "url(BG2.jpg)";
      }
      if(score >= 2000){
        interval = 130;
        Game.changeBGM(music.LoveU);
        document.body.style.backgroundImage = "url(BG12.jpg)";
      }
      if(score >= 3000){
        interval = 75;
        Game.changeBGM(music.Puzzle);
        document.body.style.backgroundImage = "url(BG13.png)";
      }
      if(score >= 5000){
        interval = 50;
        Game.changeBGM(music.rush);
        document.body.style.backgroundImage = "url(BG6.jpg)";
      }
    }

    //* scoreDOM.innerHTMLを更新する関数*/
    static screenScore(){
      scoreDOM.innerHTML = score;
    }

    /** fieldを初期化する関数*/
    static setField(){
        Field.decideCanvasScale();
        Field_next.decideCanvasScale();
    }

    //** ゲームを開始する関数*/
    static start(){
      //ゲームスタート
      BGM.volume = 0.2;
      BGM.play();
      
      drawGame();
    }

    //* BGMを変更する関数*/
    static changeBGM(music){
      BGM.pause();
      BGM = music;
      BGM.play();
    }
}


//ゲームの実行
//初期BGMの設定
let BGM = music.FeelGood;

//0.field 初期化
Game.setField();
let field = Field.makeField();

//1.mino生成
let tetro = Mino.createMino();
let next = Mino.createMino();
Field_next.draw();
tetro.draw();
//キーボードの矢印キー入力に応じてミノの移動や回転を制御
document.addEventListener('keydown', (e) => {
  switch (e.key) {
      case 'ArrowUp':
        tetro.rotate();
        tetro.draw();
        music.rotate.currentTime = 0;
        music.rotate.play();
        break;
      case 'ArrowRight':
        tetro.move(1, 0);
        tetro.draw();
        break;
      case 'ArrowLeft':
        tetro.move(-1, 0);
        tetro.draw();
        break;
      case 'ArrowDown':
        tetro.move(0, 1);
        tetro.draw();
        break;
      case 'h':
      case 'H':
        Hold.hold();
        music.hold.play();
        break;
      case ' ':
        while (!tetro.checkCollision(0, 1))
          tetro.move(0, 1);
        Field.moveDown();
        music.landing.play();
        break;
      default:
        break;
  }
});

// 描画間隔(ms)
let interval = 300;
let lastTime = 0;

//scoreの計算
let scoreDOM = document.querySelector(".scoreBoard");
let score = 0;
Game.screenScore();

// ゲームを連続的に描写
let animationFrameId;
function drawGame() {
  const currentTime = Date.now();
  const deltaTime = currentTime - lastTime;

  if (deltaTime > interval) {
    // キャンバスをクリアしフィールドとミノを描画
    context.clearRect(0, 0, canvas.width, canvas.height);
    Field.draw();
    tetro.draw();

    
    Field.moveDown(); // ミノを一つ下に移動
    if (Field.clearLines()) {
      return; // ゲームオーバー時は処理を終了
    }

    lastTime = currentTime;
  }
  animationFrameId = requestAnimationFrame(drawGame);
}


