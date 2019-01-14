//=============================================================================
// PictureDrag.js
// extension of PictureCallCommon.js by Triacontane
// by Tsukimi 
// Last Updated: 2017.12.17
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2017/12/18 初版
//=============================================================================


/*:ja
 * @plugindesc ピクチャのドラッグ移動プラグイン
 * @author ツキミ
 *
 * @param ドラッグされたピクチャのX座標の変数番号
 * @desc ドラッグされたピクチャのX座標を常に格納するゲーム変数の番号
 * @default 0
 * @type variable
 *
 * @param ドラッグされたピクチャのY座標の変数番号
 * @desc ドラッグされたピクチャのY座標を常に格納するゲーム変数の番号
 * @default 0
 * @type variable
 * 
 * @help このプラグインは、トリアコンタンさんの「ピクチャのボタン化」プラグインを
 * 機能拡張し、ピクチャのドラッグ移動、ドラッグ中に特定の領域にいると自動で
 * コモンイベントを呼び出し、もしくは任意のスイッチをONにすることができる。
 * 
 * ご使用の際は、必ず「ピクチャのボタン化」をインポートし、このプラグインを
 * 「ピクチャのボタン化」の下に置いてください。
 * また、「ピクチャのボタン化」のパラメータ(透明色を考慮、ピクチャ番号の変数番号
 * など)を参照しますので、このプラグインにパラメータはありません。
 * 
 * 
 *   よくある使用例：
 *     P_DRAG 15
 *     P_DRAG_RESTRICT_REGION 15 x 0~816
 *     P_DRAG_RESTRICT_REGION 15 y 0~624
 *     P_DRAG_CALL_CE 15 1 10
 *     P_DRAG_CALL_CE_REGION 15 x 204~612
 *     P_DRAG_CALL_CE_REGION 15 y 156~468
 * 
 *     ピクチャ15番をドラッグ可能にし、ドラッグできる範囲を(0,0)~(816,624)にする。
 *     (204,156)~(612,468)に入ると、10フレームおきにコモンイベント1番を呼び出す。
 * 
 * 
 * 
 * プラグインコマンド詳細
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （引数の間は半角スペースで区切り、《》で括弧される引数は設定されなかった場合
 *  　デフォルトで設定される）
 * 
 * ---------------------------------------
 *  ピクチャのドラッグ化 or
 *  P_DRAG [ピクチャID] 《 [透明色を考慮] [軸制限] [リリースした場合EX] 》
 *    ・ピクチャをドラッグできるようにする。
 * 
 *    ・透明色を考慮のパラメータ(ON/OFF)を指定すると透明色を考慮するかを設定
 *      できます。
 *      ONにすると、ピクチャの透明な部分を掴んでもドラッグできません。
 * 
 *    ・軸制限のパラメータ(X/Y/ALL)はドラッグ移動可能な軸を設定します。
 *      X にすると、ピクチャは左右しか動けません。
 *      ※デフォルトはALL。
 * 
 *    ・リリースした場合EXのパラメータ(ON/OFF)は、マウスをピクチャ外で
 *      リリースした時、ピクチャのボタン化の「リリースした場合」のコモン
 *      イベントを呼び出すかを設定するパラメータです。主に移動制限がある時に
 *      ONにする。
 *      ※デフォルトはON。
 * 
 * 
 *      例：P_DRAG 15
 *         15番のピクチャをドラッグできるようにする。
 *
 *         P_DRAG 20 ON X ON
 *         20番のピクチャをX軸に沿ってドラッグできるようにする。
 *         リリース時、マウスがピクチャ外でも、P_CALL_CE で設定された
 *         「リリースした場合」のコモンイベントを呼び出す。
 * 
 * 
 * ---------------------------------------
 *  ピクチャのドラッグ化解除 or
 *  P_DRAG_REMOVE [ピクチャID]
 *    ・ピクチャをドラッグできないようにする。
 *    　※設定も全部デフォルトに戻る。
 *         
 *      例：P_DRAG_REMOVE 15
 *         15番のピクチャをドラッグできないようにする。
 * 
 * 
 * ---------------------------------------
 * ピクチャのドラッグ中強制リリース
 * P_DRAG_FORCE_RELEASE
 *    ・ドラッグ中のピクチャを強制的にリリースさせます。
 * 
 * 
 * ---------------------------------------
 *  ピクチャのドラッグ領域制限 or
 *  P_DRAG_RESTRICT_REGION [ピクチャID] [X軸/Y軸] [範囲]
 *    ・ピクチャのドラッグ可能領域を制限する。
 *    ・範囲の書き方：
 *    　  x -100~200　　 x座標の移動範囲を -100~200の間に制限する
 *    　  x ~250　　　   x座標の移動範囲を 250以下に制限する
 *    　  y ~　　　      y座標の移動範囲は 制限されない
 *
 *    　また、範囲の前に ! を入れると範囲が反転する
 *      　x !-100~200　　x座標の移動範囲を -100~200以外のところに制限する
 * 
 *    　　デフォルトは x ~ と y ~　（全域移動可能）
 * 
 * 
 *      例：P_DRAG_RESTRICT_REGION 15 x 0~816
 *      　　P_DRAG_RESTRICT_REGION 15 y 0~624
 *         15番ピクチャのドラッグできる範囲を(0,0)~(816,624)にする。
 * 
 * 
 * ---------------------------------------
 *  ピクチャのドラッグトリガーイベント or 
 *  P_DRAG_CALL_CE [ピクチャID] [コモンイベントID] 《 [間隔フレーム] 》
 *    ・ドラッグ中、ピクチャがトリガー領域に入ると、一定間隔でコモンイベントを
 *    　呼び出す。
 *    　※トリガー領域の設定については、次のコマンドを見てください。
 * 
 *    ・間隔フレームの定義（デフォルトは1）：
 *    　  1~：トリガー領域にあると間隔フレームおきに呼び出す。
 *    　   0：トリガー領域に入る度に呼び出す。
 *    　  -1：一回のドラッグで一回しか呼び出さない。
 * 
 * 
 *      例：P_DRAG_CALL_CE 15 1 60
 *         15番のピクチャがトリガー領域に入ると60フレームおきに
 *         コモンイベント1番を呼び出す。
 * 
 * 
 * ---------------------------------------
 *  ピクチャのドラッグトリガー領域 or
 *  P_DRAG_CALL_CE_REGION [ピクチャID] [X軸/Y軸] [範囲]
 *    ・ピクチャのトリガー領域を設定する。
 *    　ピクチャがトリガー領域に入ると、設定されたイベントが呼び出す。
 * 
 *    ・範囲の設定はドラッグ領域制限と同じです。
 *    　　デフォルトは x !~ と y !~　（全域トリガーしない）
 * 
 * 
 *      例：P_DRAG_CALL_CE_REGION 15 x 408~
 *      　　P_DRAG_CALL_CE_REGION 15 y 312~
 *         15番のピクチャがx座標が408、y座標が312以上の時、
 *         設定されたコモンイベントを呼び出す。
 * 
 * 
 * ---------------------------------------
 *  ピクチャのドラッグトリガースイッチ or 
 *  P_DRAG_CALL_SWITCH [ピクチャID] [スイッチID] 《 [間隔フレーム] 》
 *    ・ドラッグ中、ピクチャがトリガー領域にると、一定間隔でスイッチをONにする。
 * 
 *      例：P_DRAG_CALL_SWITCH 15 33 20
 *         15番のピクチャがトリガー領域に入ると、20フレームおきに
 *         33番スイッチをONにする。
 * 　　
 *
 * ---------------------------------------
 *  ピクチャのドラッグトリガーキーバインド or 
 *  P_DRAG_CALL_KEY_BIND [ピクチャID] [スイッチID] 《 [間隔フレーム] 》
 *    ・ドラッグ中、ピクチャがトリガー領域にあると、一定間隔で任意のボタンを
 *    　押したことにします。（ピクチャのボタン化のキーバインドを見てください）
 * 
 *      例：P_DRAG_KEY_BIND 15 ok 3
 *         15番のピクチャがトリガー領域に入ると、3フレームおきに
 *         決定キー(ok)を押したことにする。
 *
 * 
 */
/*:
 * @plugindesc picture drag plugin
 * @author Tsukimi
 * 
 */

(function() {
    'use strict';
    
    var pluginName = 'PictureDrag';

    var getParamOther = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };

    var getParamBoolean = function(paramNames) {
        var value = getParamOther(paramNames);
        return (value || '').toUpperCase() === 'ON';
    };

    var getParamNumber = function(paramNames, min, max) {
        var value = getParamOther(paramNames);
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(value, 10) || 0).clamp(min, max);
    };

    var getCommandName = function(command) {
        return (command || '').toUpperCase();
    };

    var getArgNumber = function(arg, min, max) {
        if (arguments.length < 2) min = -Infinity;
        if (arguments.length < 3) max = Infinity;
        return (parseInt(convertEscapeCharacters(arg), 10) || 0).clamp(min, max);
    };

    var getArgBoolean = function(arg) {
        return (arg || '').toUpperCase() === 'ON';
    };

    var convertEscapeCharacters = function(text) {
        if (text == null) text = '';
        var window = SceneManager._scene._windowLayer.children[0];
        return window ? window.convertEscapeCharacters(text) : text;
    };

    var iterate = function(that, handler) {
        Object.keys(that).forEach(function(key, index) {
            handler.call(that, key, that[key], index);
        });
    };
    
    //=============================================================================
    // パラメータの取得とバリデーション
    //=============================================================================
    var paramGameVariableDragX       = getParamNumber(['ドラッグされたピクチャのX座標の変数番号'], 0);
    var paramGameVariableDragY       = getParamNumber(['ドラッグされたピクチャのY座標の変数番号'], 0);
    
    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンド[P_DRAG]などを追加定義します。
    //=============================================================================
    
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var pictureId, transparent, dRestriction, releaseExtend;
        switch (getCommandName(command)) {
            case 'P_DRAG' :
            case 'ピクチャのドラッグ化':
                pictureId   = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                transparent = (args.length > 1 ? getArgBoolean(args[1]) : null);
                dRestriction = (args.length > 2 ? args[2] : "ALL").toUpperCase();
                releaseExtend = (args.length > 3 ? getArgBoolean(args[3]) : true);
                $gameScreen.setPictureDraggable(pictureId, transparent, dRestriction, releaseExtend);
                break;
                
            case 'P_DRAG_REMOVE' :
            case 'ピクチャのドラッグ化解除':
                pictureId   = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                $gameScreen.removePictureDraggable(pictureId);
                break;
                
            case 'P_DRAG_RESTRICT_REGION' :
            case 'ピクチャのドラッグ領域制限':
                pictureId   = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                var XorY = args[1].toUpperCase();
                if(XorY === "X" || XorY === "Y") {
                    var region = args[2];
                    var reverseRegion = false;
                    if(region[0] === "!") {
                        reverseRegion = true; region = region.substr(1);
                    }
                    region = region.split('~');
                    region = [ region[0] === '' ? -Infinity : Number(region[0]), 
                               region[1] === '' ?  Infinity : Number(region[1]) ];
                    $gameScreen.setDragRegion(pictureId, "mRegion", XorY, region, reverseRegion);
                }
                break;
                
            case 'P_DRAG_CALL_CE' :
            case 'ピクチャのドラッグトリガーイベント':
                pictureId   = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                var param = getArgNumber(args[1], 1, $dataCommonEvents.length - 1);
                var time = parseInt(args[2], 10); if(isNaN(time)) time = 1;
                $gameScreen.setDragCENumber(pictureId, param, time);
                break;
                
            case 'P_DRAG_CALL_SWITCH' :
            case 'ピクチャのドラッグトリガースイッチ':
                pictureId   = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                var param = getArgNumber(args[1], 1);
                var time = parseInt(args[2], 10); if(isNaN(time)) time = 1;
                $gameScreen.setDragCENumber(pictureId, param * -1, time);
                break;
                
            case 'P_DRAG_CALL_KEY_BIND' :
            case 'ピクチャのドラッグトリガーキーバインド':
                pictureId   = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                var param = convertEscapeCharacters(args[1]).toLowerCase();
                var time = parseInt(args[2], 10); if(isNaN(time)) time = 1;
                $gameScreen.setDragCENumber(pictureId, param, time);
                break;
                
            case 'P_DRAG_CALL_CE_REMOVE' :
            case 'ピクチャのドラッグトリガー解除':
                pictureId   = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                $gameScreen.setDragCENumber(pictureId, 0, 1);
                break;
                
            case 'P_DRAG_CALL_CE_REGION' :
            case 'ピクチャのドラッグトリガー領域':
                pictureId   = getArgNumber(args[0], 1, $gameScreen.maxPictures());
                args[1] = args[1].toUpperCase();
                if(args[1] === "X" || args[1] === "Y") {
                    var region = args[2];
                    var reverseRegion = false;
                    if(region[0] === "!") {
                        reverseRegion = true; region = region.substr(1);
                    }
                    region = region.split('~');
                    region = [ region[0] === '' ? -Infinity : Number(region[0]), 
                               region[1] === '' ?  Infinity : Number(region[1]) ];
                    $gameScreen.setDragRegion(pictureId, "cCERegion", args[1], region, reverseRegion);
                }
                break;
                
            case 'P_DRAG_FORCE_RELEASE' :
            case 'ピクチャのドラッグ中強制リリース':
                $gameScreen.forceReleasePicture();
                break;
        }
    };
    
    //=============================================================================
    // Game_Screen
    //  ピクチャのドラッグに対応するパラメータの配列を追加定義します。
    //=============================================================================
    
    var _Game_Screen_initPictureArray = Game_Screen.prototype.initPictureArray;
    Game_Screen.prototype.initPictureArray = function() {
        _Game_Screen_initPictureArray.apply(this, arguments);
        this._pictureDidArray         = this._pictureDidArray || []; // Drag ID Array (& restriction)
    };

    Game_Screen.prototype.setPictureDraggable = function(pictureId, transparent, dRestriction, releaseExtend) {
        var newDragPicture = {};
        newDragPicture.dRestriction = dRestriction;         // direction Restriction (X/Y)
        newDragPicture.releaseEX = releaseExtend;
        newDragPicture.mRegion = {};                        // 移動範囲 (movable Region)
        newDragPicture.mRegion.x = [-Infinity, Infinity];
        newDragPicture.mRegion.xReverse = false;
        newDragPicture.mRegion.y = [-Infinity, Infinity];
        newDragPicture.mRegion.yReverse = false;
        newDragPicture.cCENumber = 0;                       // コモンイベント番号
        newDragPicture.cCERepeat = 1;                       // 範囲内に何フレーム毎にコモンイベントを呼び出すか
        newDragPicture.cCERegion = {};                      // コモンイベント トリガー範囲 (call Common Event Region)
        newDragPicture.cCERegion.x = [-Infinity, Infinity];
        newDragPicture.cCERegion.xReverse = true;
        newDragPicture.cCERegion.y = [-Infinity, Infinity];
        newDragPicture.cCERegion.yReverse = true;
        
        var realPictureId = this.realPictureId(pictureId);
        this._pictureDidArray[pictureId] = newDragPicture;
        this._pictureTransparentArray[realPictureId]  = transparent;
    };
    
    Game_Screen.prototype.isPictureDraggable = function(pictureId) {
        return !!this._pictureDidArray[this.realPictureId(pictureId)];
    };
    
    Game_Screen.prototype.isPictureXDraggable = function(pictureId) {
        if( !this.isPictureDraggable(pictureId) ) return false;
        var restriction = this._pictureDidArray[this.realPictureId(pictureId)].dRestriction;
        if(restriction === "X" || restriction === "ALL") return true;
        return false;
    };
    
    Game_Screen.prototype.isPictureYDraggable = function(pictureId) {
        if( !this.isPictureDraggable(pictureId) ) return false;
        var restriction = this._pictureDidArray[this.realPictureId(pictureId)].dRestriction;
        if(restriction === "Y" || restriction === "ALL") return true;
        return false;
    };

    Game_Screen.prototype.removePictureDraggable = function(pictureId) {
        this._pictureDidArray[this.realPictureId(pictureId)] = null;
    };
    
    Game_Screen.prototype.setDragRegion = function(pictureId, type, XorY, region, reverse) {
        var target = this._pictureDidArray[this.realPictureId(pictureId)];
        if(!target) return; // if no drag setting, stop process
        if( (type === 'mRegion' || type === 'cCERegion') && (XorY === 'X' || XorY === 'Y') ) {
            XorY = XorY.toLowerCase();
            target[type][XorY][0] = region[0];
            target[type][XorY][1] = region[1];
            target[type][XorY + "Reverse"] = reverse;
        }
    };
    
    Game_Screen.prototype.inDragRegion = function(pictureId, type, XorY, value) {
        if( !this.isPictureDraggable(pictureId) ) return;
        var XorY = XorY.toLowerCase();
        var region = this._pictureDidArray[this.realPictureId(pictureId)][type];
        return region[XorY + "Reverse"] !== ( region[XorY][0] <= value && value <= region[XorY][1] );
    };
    
    Game_Screen.prototype.clampDragRegion = function(pictureId, type, XorY, value, addition) {
        if( !this.isPictureDraggable(pictureId) ) return 0;
        var result = value + addition;
        var XorY = XorY.toLowerCase();
        var region = this._pictureDidArray[this.realPictureId(pictureId)][type];
        if( region[XorY + "Reverse"] !== ( region[XorY][0] <= result && result <= region[XorY][1] ) ) {
            return addition;
        }
        else {
            if( !region[XorY + "Reverse"] ) {
                if(result < region[XorY][0]) return region[XorY][0] - value;
                else return region[XorY][1] - value;
            }
            else { // SPECIAL: reverse uses value to determine!!
                if(value < region[XorY][0]) return region[XorY][0]-1 - value;
                else if(value > region[XorY][1]) return region[XorY][1]+1 - value;
                return 0;
            }
        }
    };
    
    Game_Screen.prototype.isDragRegionAllReverse = function(pictureId, type) {
        if( !this.isPictureDraggable(pictureId) ) return false;
        var region = this._pictureDidArray[this.realPictureId(pictureId)][type];
        return region.xReverse && region.yReverse;
    };
    
    Game_Screen.prototype.setDragCENumber = function(pictureId, param, time) {
        if( !this.isPictureDraggable(pictureId) ) return;
        this._pictureDidArray[this.realPictureId(pictureId)].cCENumber = param;
        this._pictureDidArray[this.realPictureId(pictureId)].cCERepeat = time;
    };
    
    Game_Screen.prototype.dragCENumber = function(pictureId) {
        if( !this.isPictureDraggable(pictureId) ) return 0;
        return this._pictureDidArray[this.realPictureId(pictureId)].cCENumber;
    };
    
    Game_Screen.prototype.dragCERepeat = function(pictureId) {
        if( !this.isPictureDraggable(pictureId) ) return 1;
        return this._pictureDidArray[this.realPictureId(pictureId)].cCERepeat;
    };
    
    Game_Screen.prototype.isPictureReleaseEX = function(pictureId) {
        if( !this.isPictureDraggable(pictureId) ) return false;
        return this._pictureDidArray[this.realPictureId(pictureId)].releaseEX;
    };
    
    Game_Screen.prototype.forceReleasePicture = function() {
        SceneManager._scene.forceReleasePicture();
    };
    
    
    //=============================================================================
    // Sprite_Picture
    //  ピクチャのドラッグ移動を追加定義します
    //=============================================================================
    var _Sprite_Picture_initialize      = Sprite_Picture.prototype.initialize;
    Sprite_Picture.prototype.initialize = function(pictureId) {
        _Sprite_Picture_initialize.call(this, pictureId);
        this._startDrag      = false;
        this._isDragging     = false;
        this._endDrag        = false;
        this._callDelay      = 1;
        this._lastDX = this._curDX = this._lastDY = this._curDY = 0;
    };
    
    var _Sprite_update              = Sprite_Picture.prototype.update;
    Sprite_Picture.prototype.update = function() {
        _Sprite_update.apply(this, arguments);
        if(this.visible) this.updateDrag();
        else if(this._isDragging) {
            this._lastDX = this._curDX = this._lastDY = this._curDY = 0;
            this._isDragging = false;
            if(this._callDelay < 0) this._callDelay = 1;
        }
    };
    
    Sprite_Picture.prototype.updateDrag = function() {
        if( this._startDrag ) {
            this._lastDX = $gameScreen.disConvertPositionX(TouchInput.x);
            this._lastDY = $gameScreen.disConvertPositionY(TouchInput.y);
            this.picture().initTarget();
            this._isDragging = true;
            this._startDrag = false;
        }
        else if( this._endDrag ) {
            if(this._isDragging ) {
                this._lastDX = this._curDX = this._lastDY = this._curDY = 0;
                this._isDragging = false;
                if(this._callDelay < 0) this._callDelay = 1;
            }
            this._endDrag = false;
        }
        
        if(this._isDragging) {
            var picture = this.picture();
            this._curDX = $gameScreen.disConvertPositionX(TouchInput.x);
            this._curDY = $gameScreen.disConvertPositionY(TouchInput.y);
            // DRAGGING
            // SPECIAL CONDITION!! "x&y both reversed rigion" is not as you and me think
            var allReverse = this.allReverse("mRegion");
            if(allReverse) {
                var diffX = this._curDX-this._lastDX;
                var diffY = this._curDY-this._lastDY;
                if( !this.inDragRegion("mRegion", "x", this.x+diffX) 
                    && !this.inDragRegion("mRegion", "y", this.y+diffY) ) { // 移動目的地が中心にある
                    if(this.inDragRegion("mRegion", "x", this.x)) 
                        diffX = this.clampDragRegion("mRegion", "x", this.x, diffX);
                    else if(this.inDragRegion("mRegion", "y", this.y)) 
                        diffY = this.clampDragRegion("mRegion", "y", this.y, diffY);
                    else diffX = diffY = 0;
                }
                picture._x = this.x += diffX;
                this._lastDX += diffX;
                picture._y = this.y += diffY;
                this._lastDY += diffY;
            }
            else {
                if(this.xDraggable()) {
                    var diff = this.clampDragRegion("mRegion", "x", this.x, this._curDX - this._lastDX);
                    picture._x = this.x += diff;
                    this._lastDX += diff;
                }
                if(this.yDraggable()) {
                    var diff = this.clampDragRegion("mRegion", "y", this.y, this._curDY - this._lastDY);
                    picture._y = this.y += diff;
                    this._lastDY += diff;
                }
            }
            // TRIGGERING COMMON EVENT/SWITCH/ETC
            var xIn = this.inDragRegion("cCERegion", "x", this.x);
            var yIn = this.inDragRegion("cCERegion", "y", this.y);
            allReverse = this.allReverse("cCERegion");
            if( xIn && yIn || (allReverse && (xIn || yIn)) )
            {
                if(this._callDelay === 1  && !($gameMap.isEventRunning() || $gameMessage.isBusy()) ) {
                    this.fireTouchEvent([this.dragCENumber()], 0);
                    this._callDelay = this.dragCERepeat();
                }
                else if(this._callDelay > 1) this._callDelay--;
            }
            else {
                if(this._callDelay === 0) this._callDelay = 1;
            }
            
            // save dragged picture's coordinate to variables
            this.updateDraggingInfo();
        }
    };
    
    Sprite_Picture.prototype.updateDraggingInfo = function() {
        if (paramGameVariableDragX)
            $gameVariables._data[paramGameVariableDragX] = this.x;
        if (paramGameVariableDragY)
            $gameVariables._data[paramGameVariableDragY] = this.y;
    };
            
    Sprite_Picture.prototype.Draggable = function() {
        return $gameScreen.isPictureDraggable(this._pictureId);
    };
    
    Sprite_Picture.prototype.xDraggable = function() {
        return $gameScreen.isPictureXDraggable(this._pictureId);
    };
    
    Sprite_Picture.prototype.yDraggable = function() {
        return $gameScreen.isPictureYDraggable(this._pictureId);
    };
    
    Sprite_Picture.prototype.inDragRegion = function(type, XorY, value) {
        return $gameScreen.inDragRegion(this._pictureId, type, XorY, value);
    };
    
    Sprite_Picture.prototype.clampDragRegion = function(type, XorY, value, addition) {
        return $gameScreen.clampDragRegion(this._pictureId, type, XorY, value, addition);
    };

    Sprite_Picture.prototype.allReverse = function(type) {
        return $gameScreen.isDragRegionAllReverse(this._pictureId, type);
    };
    
    Sprite_Picture.prototype.dragCENumber = function() {
        return $gameScreen.dragCENumber(this._pictureId);
    };
    
    Sprite_Picture.prototype.dragCERepeat = function() {
        return $gameScreen.dragCERepeat(this._pictureId);
    };
    
    Sprite_Picture.prototype.releaseEX = function() {
        return $gameScreen.isPictureReleaseEX(this._pictureId);
    };
    
    var _Sprite_Picture_callTouch = Sprite_Picture.prototype.callTouch;
    Sprite_Picture.prototype.callTouch = function() {
        _Sprite_Picture_callTouch.apply(this, arguments);
        // CHANGED
        if( !this.Draggable() ) return;  // ドラッグ設定されてないと判定する必要がない
        var num = SceneManager.pictureDragging().length; // 一度に一つしかドラッグできない？
        
        if(this.isTriggered() && !this.isTransparent() && num === 0) {
            // イベント中はドラッグできない
            if( !$gameMap.isEventRunning() && !$gameMessage.isBusy() ) {
                this._startDrag = true;
                $gameTemp.clearDestination();
            }
        }
        else if( this._isDragging && TouchInput.isReleased() ) {
            this._endDrag = true; 
            $gameTemp.clearDestination();
            if( this.releaseEX() && !this.isTouchPosInRect() ) {
                var commandIds = $gameScreen.getPictureCid(this._pictureId);
                if(!!commandIds && commandIds[6]) this.fireTouchEvent(commandIds, 6);
            }
        }
    };
    
    var _Game_Temp_initialize      = Game_Temp.prototype.initialize;
    Game_Temp.prototype.initialize = function() {
        _Game_Temp_initialize.call(this);
    };
    
    var _Scene_Map_processMapTouch      = Scene_Map.prototype.processMapTouch;
    Scene_Map.prototype.    processMapTouch = function() {
        _Scene_Map_processMapTouch.apply(this, arguments);
        if (SceneManager.pictureDragging().length > 0) {
            $gameTemp.clearDestination();
        }
    };
    
    //=============================================================================
    //  SceneManager
    //  ドラッグ中のピクチャの数を取得します。
    //=============================================================================
    
    SceneManager.pictureDragging = function() {
        return this._scene.pictureDragging();
    };
    
    Scene_Base.prototype.pictureDragging = function() {
        var result = [];
        this._spriteset.iteratePictures(function(picture) {
            if (picture._isDragging || picture._startDrag) result.push(picture._pictureId);
            return true;
        });
        return result;
    };
    Scene_Base.prototype.forceReleasePicture = function() {
        this._spriteset.iteratePictures(function(picture) {
            if (picture._isDragging) picture._endDrag = true;
            return true;
        });
        return result;
    };
    
    //=============================================================================
    // Scene_Map & Window_Message
    //  ドラッグ中のイベントは早送りしないようにする
    //=============================================================================
    
    var _Scene_Map_isFastForward = Scene_Map.prototype.isFastForward;
    Scene_Map.prototype.isFastForward = function() {
        return (_Scene_Map_isFastForward.apply(this, arguments)) && !(SceneManager.pictureDragging().length > 0);
    };
    
    var _Window_Message_updateShowFast = Window_Message.prototype.updateShowFast;
    Window_Message.prototype.updateShowFast = function() {
        _Window_Message_updateShowFast.apply(this, arguments);
        if(SceneManager.pictureDragging().length > 0) this._showFast = false;
    };
    
})();