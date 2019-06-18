//=============================================================================
// TKM_TachieManager.js
// ----------------------------------------------------------------------------
// Copyright (c) 2016 Tsukimi
// This software released under the MIT license.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 0.0.0 2017/02/27 リリース
// 1.0.0 2017/05/13 リニューアル
// 1.0.1 2017/05/24 立ち絵更新の時にちらつくバグ解消
// 2.0.0 2019/06/18 レイヤーの数を可変に。自動トリミング。コンテナの手動追加説明。
//                  ver 1.x とは互換性はないため、2.0にしました。
//=============================================================================

/*:
 * @plugindesc 立ち絵マネージャー
 * @author Tsukimi
 * 
 * @param AutoTrimming
 * @text オートトリーミング
 * @type boolean
 * @desc 画像をロード後、外周の透明部分を自動でトリーミングするかどうか。メモリー削減用。（値：true / false）
 * @default true
 * 
 * @param tachieCampasWidth
 * @text 立ち絵キャンパスの幅
 * @desc 立ち絵キャンパスの幅(pixel)。入力例：
 * 500 (数値)
 * @default 500
 * 
 * @param tachieCampasHeight
 * @text 立ち絵キャンパスの高さ
 * @desc 立ち絵キャンパスの高さ(pixel)。入力例：
 * 1000 (数値)
 * @default 1000
 * 
 * @param ---------------
 * @desc -
 * @default ---立ち絵コンテナ設定---
 * 
 * @param tachieContainer1
 * @text 立ち絵コンテナ1番
 * @desc 立ち絵コンテナ1番の設定。
 * @type struct<container>
 * @default {"picNum":"21","x":"0","y":"0","reverse":"false"}
 * 
 * @param tachieContainer2
 * @text 立ち絵コンテナ2番
 * @desc 立ち絵コンテナ2番の設定。
 * @type struct<container>
 * @default {"picNum":"31","x":"600","y":"0","reverse":"true"}
 * 
 * @param ----------------
 * @desc -
 * @default ---立ち絵レイヤー設定---
 * 
 * @param partsNameArray
 * @text 各レイヤーのパーツ名
 * @type string[]
 * @desc 各レイヤーに表示するパーツの名前。合成は上から順番に合成される。
 * @default ["hairBack","body","pants","clothes","hairFront","face","eye"]
 * 
 *
 * @help
 * 
 *　レイヤー式立ち絵マネージャー
 * 作者：ツキミ
 * 
 * 説明：
 * レイヤー式立ち絵のマネージャーです。
 * 立ち絵のコンテナに、パーツを自動的に一枚絵に合成し表示します。
 * その後普通にピクチャの移動などもできます。
 * 
 * ***************************************************
 * プラグインコマンド：
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 * 
 * tachie_Register [キャラ名]
 *     システムに[キャラ名]を登録します。
 *     例：tachie_Register sizuru
 * 
 * 
 * tachie_ChangePart [キャラ名] [レイヤー名] [パーツ番号]
 * tachie_CP [キャラ名] [レイヤー名] [パーツ番号]
 *     キャラのパーツの番号を設定します。デフォルトでは全部0です。
 *     例：tachie_ChangePart sizuru body 1
 *     　　tachie_CP sizuru body 1
 * 
 * ※CPはChangePartの短縮表示で、効果が同じです
 * 
 * 
 * tachie_SetChar [立ち絵番号] [キャラ名]
 *     立ち絵のコンテナに表示するキャラを設定します。
 *     （まだ描画してません）
 *     例：tachie_SetChar 1 sizuru
 * 
 * 
 * tachie_Draw [立ち絵番号] [オプション]
 *     立ち絵のコンテナに設定されたキャラを描画します。
 *     オプション：
 *         invisible: 不透明度0でピクチャの表示（主にフェード演出用など）
 *         inv: 上と同じ
 *     例：tachie_Draw 1 inv
 *     　　tachie_Draw 2
 * 
 * 
 * tachie_Clear [立ち絵番号]
 *     立ち絵のコンテナに描画された立ち絵を消します。ピクチャの消去と効果は同じ
 *     例：tachie_Clear 1
 * 
 * 
 * ***************************************************
 * コンテナ追加方法：
 * 少しめんどくさいが、このプラグインをテキストエディタで開いて、
 * 50行あたりの「立ち絵コンテナ2番」の設定をコピーして、その直下に貼り付けて、
 * 番号（半角）を直してください。その後、プラグインのパラメータを確認してください。
 * 成功すると、パラメータに追加された番号の設定が出ます。
 * 
 * ↓↓↓↓↓↓↓↓↓　3番を追加したい時はこういう感じ ↓↓↓↓↓↓↓↓↓
 * （この例をコピーしないでください）
 * 
 * ...
 * ...
 * 
 * ＠param tachieContainer2
 * ＠text 立ち絵コンテナ2番
 * ＠desc 立ち絵コンテナ2番の設定。
 * ＠type struct<container>
 * ＠default {"picNum":"21","x":"0","y":"0","reverse":"false"}
 * 
 * ＠param tachieContainer3
 * ＠text 立ち絵コンテナ3番
 * ＠desc 立ち絵コンテナ3番の設定。
 * ＠type struct<container>
 * ＠default {"picNum":"21","x":"0","y":"0","reverse":"false"}
 * 
 * ...
 * ...
 * 
 */


/*~struct~container:
 * @param picNum
 * @text ピクチャ番号
 * @desc ピクチャの番号。　入力例：
 * 1 (数値) / v10 (←変数10番の値を参照)
 *
 * @param x
 * @text ピクチャx座標
 * @desc ピクチャ表示のx座標。　入力例：
 * 0 (数値) / v10 (←変数10番の値を参照)
 *
 * @param y
 * @text ピクチャy座標
 * @desc ピクチャ表示のy座標。　入力例：
 * 0 (数値) / v10 (←変数10番の値を参照)
 *
 * @param scale
 * @text ピクチャ拡大率
 * @desc ピクチャ表示の拡大率(%)。　入力例：
 * 125 (数値) / v10 (←変数10番の値を参照)
 * @default 100
 *
 * @param reverse
 * @text ピクチャ反転
 * @desc ピクチャ表示のx座標。　入力例：true / false / 
 * s10  (←スイッチ10番を参照)
 */

var $TKMvar = $TKMvar || {};
$TKMvar.tachie = $TKMvar.tachie || {};


$TKMvar.tachie.CharList; // is {} ; "キャラ名": [ 各レイヤーの番号[] ]
$TKMvar.tachie.PicData = [];  // 各立ち絵のピクチャの番号、xy座標、現キャラなど

	//customize
    //$TKMvar.tachie.PicData[0] = {}; // 左に表示するピクチャ；立ち絵1
    //$TKMvar.tachie.PicData[1] = {}; // 右に表示するピクチャ；立ち絵2
    //$TKMvar.tachie.PicData[2] = {}; // 増やしたいなら、行の前の　"//" を消してください；四番目以降も似たような変更で追加できる（PicData[3]を追加）

$TKMvar.tachie.partsNameArr = [];  // 各レイヤーのパーツ名


$TKMvar.tachie.MaxLayer = 0;

ImageManager.loadPictureInFolder = function(folder, filename, hue) {
    return this.loadBitmap('img/pictures/' + folder + '/', filename, hue, true);
};

 (function() {
    "use strict";
 
    var getNumberOrVariableFromString = function(numberString) {
		if(!numberString) return 0;
        if(numberString[0] == "v") {
            var variableId = Number(numberString.substr(1)) || -1;
            if(variableId == -1) return 0;
            return $gameVariables.value(variableId) || 0;
        }
        return Number( numberString ) || 0;
    };
    var getBooleanOrSwitchFromString = function(booleanString) {
		if(!booleanString) return false;
        if(booleanString[0] == "s") {
            var switchId = Number(booleanString.substr(1)) || -1;
            if(switchId == -1) return false;
            return $gameSwitches.value(switchId) || false;
        }
        return booleanString.toUpperCase() == "TRUE" || false;
    };

    //=======================
    // パラメータの処理
    //=======================
    var param = PluginManager.parameters('TKM_TachieManager');
    
    try {$TKMvar.tachie.partsNameArr = JSON.parse( param['partsNameArray'] );} catch(e) {partsNameArr = [];}
    $TKMvar.tachie.MaxLayer = $TKMvar.tachie.partsNameArr.length;
    $TKMvar.tachie.AutoTrimming = param['AutoTrimming'].toUpperCase() == "TRUE" || false;
    
    var containerNumber = 0;
    while(!!param['tachieContainer' + (containerNumber+1)]) {
        var struct;
        try {
            struct = JSON.parse( param['tachieContainer' + (containerNumber+1)] );
        } catch(e) {
            console.log(e); 
            containerNumber++;
            continue;
        }
		$TKMvar.tachie.PicData[containerNumber] = {};
        $TKMvar.tachie.PicData[containerNumber]["picNum"] = parseInt(struct["picNum"], 10);
        $TKMvar.tachie.PicData[containerNumber]["x"] = struct["x"];
        $TKMvar.tachie.PicData[containerNumber]["y"] = struct["y"];
        $TKMvar.tachie.PicData[containerNumber]["scale"] = struct["scale"];
        $TKMvar.tachie.PicData[containerNumber]["reverse"] = struct["reverse"];

        containerNumber++;
    }
    /*
    for(var i = 0; i < $TKMvar.tachie.PicData.length; i++) {
    }
    */
    
    $TKMvar.tachie.spriteWidth = parseInt(param['tachieCampasWidth'], 10);
    $TKMvar.tachie.spriteHeight = parseInt(param['tachieCampasHeight'], 10);
    
    //=======================
    // コマンドの処理
    //=======================
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        
        // commandの処理
        switch ((command || '').toUpperCase()) {
            case 'TACHIE_REGISTER':         // tachie_Register [キャラ名]
                var charName = args[0];
                // 取得
                var CharList = $TKMvar.tachie.CharList;
                CharList[charName] = {}; // 新しいキャラのパーツ番号の配列を作る
                
                break;
                
            case 'TACHIE_CP':               // tachie_CP [キャラ名] [レイヤー番号] [パーツ番号]
            case 'TACHIE_CHANGEPART':       // tachie_ChangePart [キャラ名] [レイヤー番号] [パーツ番号]
                if( !(args[0] in $TKMvar.tachie.CharList) ) break; // そんなキャラ名が登録されなかったら無視する
                
                // 取得
                var CharList = $TKMvar.tachie.CharList;
                var MaxLayer = $TKMvar.tachie.MaxLayer;
                var PicData = $TKMvar.tachie.PicData;
                
                // パーツの名前に対応するレイヤーを探す
                var layerNum = $TKMvar.tachie.partsNameArr.findIndex(name => name === args[1]);
                if(layerNum === -1) break; // そんなレイヤー名がなかったら無視する
                
                var partNum = parseInt(args[2], 10) || 0;
                if(CharList[args[0]][args[1]] === partNum) break; // パーツが同じなら変更する必要ない
                CharList[args[0]][args[1]] = partNum;
                
                // ついでにそのパーツのbitmapをキャッシュしよう
                for(var i = 0; i < PicData.length; i++) {
                   if(PicData[i]["char"] == args[0]) {
                       // bitmap [] の存在確認
                       if(!PicData[i]["bitmap"]) $TKMvar.tachie.preloadBitmap(i);
                       else if(partNum === 0) PicData[i]["bitmap"][layerNum] = null;
                       else PicData[i]["bitmap"][layerNum] = 
                           ImageManager.loadPictureInFolder(args[0], $TKMvar.tachie.partsNameArr[layerNum] + "_" + partNum, 0);
                   }
                }
                
                break;
                
            case 'TACHIE_SETCHAR':          // tachie_SetChar [立ち絵番号] [キャラ名]
                var tachieNum = parseInt(args[0], 10) || 0; // 立ち絵1か2か、それとも…
                tachieNum--; // データ上は0から
                if(tachieNum === -1) break;
                
                // 取得
                var CharList = $TKMvar.tachie.CharList;
                var MaxLayer = $TKMvar.tachie.MaxLayer;
                var PicData = $TKMvar.tachie.PicData;
                
                if($TKMvar.tachie.PicData[tachieNum]["char"] === args[1]) break; // キャラが同じなら変更する必要ない
                
                if( args[1] in CharList ) {
                    if(PicData.length > tachieNum) {
                        PicData[tachieNum]["char"] = args[1];
                        
                        PicData[tachieNum]["bitmap"] = null;
                        PicData[tachieNum]["bitmap"] = [];
                        $TKMvar.tachie.preloadBitmap(tachieNum);
                    }
                }
                break;
                
            case 'TACHIE_CLEARCHAR':          // tachie_ClearChar [立ち絵番号]
                var tachieNum = parseInt(args[0], 10) || 0;
                tachieNum--; // データ上は0から
                if(tachieNum === -1) break;
                var PicData = $TKMvar.tachie.PicData;
                
                PicData[tachieNum]["char"] = "";
                    
                PicData[tachieNum]["bitmap"] = null;
                break;
                
            case 'TACHIE_DRAW':             // tachie_Draw [立ち絵番号] [オプション]
                var tachieNum = parseInt(args[0], 10) || 0; // 立ち絵1か2か、それとも…
                tachieNum--; // データ上は0から
                if(tachieNum === -1) break;
                if($TKMvar.tachie.PicData.length <= tachieNum) break;
                if(!$TKMvar.tachie.PicData[tachieNum]["char"]) break;
                
                // 取得
                var CharList = $TKMvar.tachie.CharList;
                var MaxLayer = $TKMvar.tachie.MaxLayer;
                var PicData = $TKMvar.tachie.PicData;
                
                var pictureId = Number(PicData[tachieNum]["picNum"]) || 0;
                // ピクチャの名前を設定: "TKMtachie_[キャラ]_[すべてのパーツ番号]"
                var char = PicData[tachieNum]["char"];
                var name = "TKMtachie_" + char + "_";
                var partList = CharList[char];
                for(var i = 0; i < $TKMvar.tachie.MaxLayer; i++) {
                    name += partList[ $TKMvar.tachie.partsNameArr[i] ] || 0;
                }
                var _x = getNumberOrVariableFromString($TKMvar.tachie.PicData[tachieNum]["x"]) || 0;
                var _y = getNumberOrVariableFromString($TKMvar.tachie.PicData[tachieNum]["y"]) || 0;
                var _scale = getNumberOrVariableFromString($TKMvar.tachie.PicData[tachieNum]["scale"]) || 100;
                // TODO
                
                // オプション
                if(!args[1]) {
                $gameScreen.showPicture(pictureId, name, 1, _x, _y, _scale, _scale, 255, 0);
                }
                else{
                    switch(args[1].toUpperCase()) {
                        case 'INV':
                        case 'INVISIBLE':
                            $gameScreen.showPicture(pictureId, name, 1, _x, _y, _scale, _scale, 0, 0);
                            break;
                            
                        case 'OPACITY':
                        case 'OPA':
                            var opacity = (Number(args[2]) || 255).clamp(0,255);
                            $gameScreen.showPicture(pictureId, name, 1, _x, _y, _scale, _scale, opacity, 0);
                            break;
                        
                        default:
                            $gameScreen.showPicture(pictureId, name, 1, _x, _y, _scale, _scale, 255, 0);
                            break;
                    }
                }
                break;
                
            case 'TACHIE_CLEAR':            // tachie_Clear [立ち絵番号]
                var tachieNum = parseInt(args[0], 10) || 0; // 立ち絵1か2か、それとも…
                tachieNum--; // データ上は0から
                if(tachieNum === -1) break;
                if($TKMvar.tachie.PicData.length <= tachieNum) break;
                var picId = Number($TKMvar.tachie.PicData[tachieNum]["picNum"]) || 0;
                $gameScreen.erasePicture(picId);
                // $TKMvar.tachie.PicData[tachieNum]["char"] = "";
                break;
        }
        
    };
     
    //=============================================================================
    //  DataManager
    //  初回生成、セーブデータの生成、読み込みなど
    //=============================================================================
     
    // 初期値の設定
    var createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        createGameObjects.call(this);
        $TKMvar.tachie.CharList = {};
        var PicData = $TKMvar.tachie.PicData;
        for(var i = 0; i <　PicData.length; i++) {
            PicData[i]["char"] = ""; // 現キャラ名を "" にする
            PicData[i]["bitmap"] = null;
        }
    };
 
    // セーブデータの生成
    // 返り値がセーブされるのでデータをcontentsに追加して返す
    var makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        var contents = makeSaveContents.call(this);
        contents.TKMvar_tachieList = $TKMvar.tachie.CharList;
        
        var PicData = $TKMvar.tachie.PicData;
        // 現キャラだけセーブ
        contents.TKMvar_tachieCurr = [];
        for(var i = 0; i <　PicData.length; i++) {
            contents.TKMvar_tachieCurr[i] = PicData[i]["char"];
        }
        return contents;
    };
    
    // セーブデータの読み込み
    // 生成時と同じ形でデータがcontentsに入っているので、変数に格納する
    var extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        extractSaveContents.call(this, contents);
        $TKMvar.tachie.CharList = contents.TKMvar_tachieList;
        // 現キャラをロードし、前のゲームのキャッシュを削除
        var PicData = $TKMvar.tachie.PicData;
        for(var i = 0; i <　PicData.length; i++) {
            PicData[i]["char"] = contents.TKMvar_tachieCurr[i];
            PicData[i]["bitmap"] = null;
        }
    };
     
    //=============================================================================
    // Sprite_Picture
    //  ピクチャの描画
    //=============================================================================
    var _Sprite_Picture_loadBitmap = Sprite_Picture.prototype.loadBitmap;
    Sprite_Picture.prototype.loadBitmap = function() {
        if(this._pictureName.substr(0, 10) !== "TKMtachie_") {
            if(this.bitmap && this.bitmap.isTachie) delete this.bitmap; //TODO: clear WebGL things
            _Sprite_Picture_loadBitmap.call(this);
        }
        else { // ピクチャのname要素の接頭が TKMtachie_ だったら
            // 取得
            var PicData = $TKMvar.tachie.PicData;
            var MaxLayer = $TKMvar.tachie.MaxLayer;
            
            
            if(!this.bitmap || !this.bitmap.isTachie) { // Tachie専用のbitmapかどうか
                // this.bitmap = new Bitmap(Graphics.width, Graphics.height);
                this.bitmap = new Bitmap($TKMvar.tachie.spriteWidth, $TKMvar.tachie.spriteHeight);
                this.setFrame(0, 0, this._bitmap.width, this._bitmap.height);
                this.bitmap.isTachie = true;
                this.bitmap.smooth = true;
            }
            
            var controllerId = -1, checkId;
            for(var i = 0; i < PicData.length; i++) {
                checkId = Number(PicData[i]["picNum"]) || 0;
                if(this._pictureId === checkId) { // このSprite_Pictureに対応するPicDataを探す
                    controllerId = i;
                    break;
                }
            }
            if(controllerId >= 0) {
                this.TKMCanvasDrawToOneBitmapFromId(controllerId);
            }
            else {
                $gameScreen.picture(this._pictureId)._name = "";
                this._pictureName = '';
                this.bitmap = null;
            }
        }
        // end of function
    };

    Sprite_Picture.prototype.TKMCanvasDrawToOneBitmapFromId = function(id) {
        // ** if not loaded 
        if(!this.TKMBitmapLoaded(id)) {
            this._pictureName = "TKMtachie_" ; // wait for all loaded (if _pictureName !== picture's name, will execute loadBitmap again)
            return;
        }
        // 全パーツのbitmpのロードが終わったら、描画する
        this.bitmap.clear();
        // 反転するかどうか
        var doReverse = getBooleanOrSwitchFromString($TKMvar.tachie.PicData[id]["reverse"]);
		console.log(doReverse)
        if(doReverse) { // TODO: transformは遅い、もっといい方法ないか？
            this.bitmap.context.save();
            this.bitmap.context.translate(this.bitmap.width, 0);
            this.bitmap.context.scale(-1, 1);
        }
        // 本当の描画
        for(var j = 0; j < $TKMvar.tachie.MaxLayer; j++) {
            var bitemp = $TKMvar.tachie.PicData[id]["bitmap"][j];
            if(bitemp) {
                Bitmap.trimTransparent(bitemp);
				if($TKMvar.tachie.AutoTrimming) {
					this.bitmap.context.drawImage(bitemp.canvas, bitemp._tTrimBound.left, bitemp._tTrimBound.top);
				}
				else {
					this.bitmap.context.drawImage(bitemp.canvas, 0, 0);
				}
            }
        }
        
        this.bitmap._setDirty();
        if(doReverse) this.bitmap.context.restore(); // 反転の後始末
    };

    Sprite_Picture.prototype.TKMBitmapLoaded = function(checkId) {
        // ** first check if all loaded
        var loaded = true;
        $TKMvar.tachie.preloadBitmap(checkId); // 上の確認、必要？
        // *  ["bitmap"] exists; check if somebody still loading
        for(var j = 0; j < $TKMvar.tachie.MaxLayer; j++) {
            var bitemp = $TKMvar.tachie.PicData[checkId]["bitmap"][j]; // i: 立ち絵番号, j: パーツ番号
            if(bitemp) {
                if(!bitemp.isReady()) {
                    loaded = false;
                    break;
                }
            }
        }
        return loaded;
    };
    
    //=============================================================================
    //  他
    //  loadBitmap用
    //=============================================================================
    $TKMvar.tachie.preloadBitmap = function(tachieNum) {
        // 取得
        var PicData = $TKMvar.tachie.PicData;
        var MaxLayer = $TKMvar.tachie.MaxLayer;
        
        // 配列を作成
        // *  if no ["bitmap"], call preload and pass
        if(!PicData[tachieNum]["bitmap"]) PicData[tachieNum]["bitmap"] = [];
        
        var name = PicData[tachieNum]["char"];          // 設定されたキャラの名前
        var partList= $TKMvar.tachie.CharList[name];    // キャラのパーツ番号を取得
        var part;
        for(var i = 0; i < MaxLayer; i++) {
            // パーツ番号が0だったら省略する
            var part = partList[ $TKMvar.tachie.partsNameArr[i] ] || 0;
            if(part === 0) {
                PicData[tachieNum]["bitmap"][i] = null;
                continue;
            }
            else {
            PicData[tachieNum]["bitmap"][i] = 
                ImageManager.loadPictureInFolder(name, $TKMvar.tachie.partsNameArr[i] + "_" + part, 0);
            }
        }
     };
     
    //=============================================================================
    //  Bitmap
    //  透明色の切り抜き
    //=============================================================================
    Bitmap.trimTransparent = function(bitmap) {
		if(!$TKMvar.tachie.AutoTrimming) return;
        if(!!bitmap._transparentTrimmed) return;
          var c = bitmap._canvas;
          var ctx = c.getContext('2d'),
            copy = document.createElement('canvas').getContext('2d'),
            pixels = ctx.getImageData(0, 0, c.width, c.height),
            l = pixels.data.length,
            i,
            bound = {
              top: null,
              left: null,
              right: null,
              bottom: null
            },
            x, y;

          for (i = 0; i < l; i += 4) {
            if (pixels.data[i+3] !== 0) {
              x = (i / 4) % c.width;
              y = ~~((i / 4) / c.width);

              if (bound.top === null) {
                bound.top = y;
              }

              if (bound.left === null) {
                bound.left = x; 
              } else if (x < bound.left) {
                bound.left = x;
              }

              if (bound.right === null) {
                bound.right = x; 
              } else if (bound.right < x) {
                bound.right = x;
              }

              if (bound.bottom === null) {
                bound.bottom = y;
              } else if (bound.bottom < y) {
                bound.bottom = y;
              }
            }
          }

          var trimHeight = bound.bottom - bound.top,
              trimWidth = bound.right - bound.left;
          if(trimWidth <= 0 || trimHeight <= 0) bitmap.resize(1, 1);
          else {
              var trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

              bitmap.resize(trimWidth, trimHeight);
              ctx.putImageData(trimmed, 0, 0);
          }
          
          bitmap._transparentTrimmed = true;
          bitmap._tTrimBound = bound;
          if(bitmap._image) {
            bitmap._image.setAttribute('width', trimWidth > 0 ? trimWidth:1);
            bitmap._image.setAttribute('height', trimHeight > 0 ? trimHeight:1);
          }
    };
     
})();
