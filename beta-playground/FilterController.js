//=============================================================================
// FilterController.js
// ----------------------------------------------------------------------------
// Copyright (c) 2018 Tsukimi
// ----------------------------------------------------------------------------
// Version
// 1.0.4 2018/01/08 効果ターゲット追加、Godrayにパラメータ追加
// 1.0.0 2018/01/03 リリース
//=============================================================================


/*:
 * @plugindesc FilterController
 * @author Tsukimi
 * 
 * @help
 * 
 * 画面エフェクトの詰め合わせ
 * 作者：ツキミ
 * 
 * 説明：
 * pixiビルドインの filters をコントロールしやすくするための
 * プラグインです。
 * 
 * 詳しい説明は、
 * https://forum.tkool.jp/index.php?threads/.603/
 * を見てください。
 * 
 * ***************************************************
 * プラグインコマンド：
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 * 
 * 　createFilter [id] [エフェクト名] [効果ターゲット] ([キャラID])
 *    画面エフェクトを作る。
 *    - id: エフェクトに付ける識別名。 数字でなくてもいい。
 *    - エフェクト名: エフェクトの種類。
 *    - 効果ターゲット: 0:画面、 1:全画面(メッセージウィンドウ含む)
 *      2: マップ（全キャラ+地形タイル）、3: 地形タイル、 4：全キャラ、
 *      5：全ピクチャ
 * 
 *    - (キャラID): 指定した場合はエフェクトを該当キャラに付けて、
 *                 マップ/バトル から離れるとエフェクトは消える。
 *        マップ： -1: 自キャラ, 0: このイベント, 1以上: 該当イベント
 *        バトル： -1以下: 敵キャラ, 0: このキャラ, 1以上: 見方キャラ
 *  
 *        ※エフェクトをマップ/バトル限定にしたい、でもどのキャラにも
 *        　付けたくない場合は screen を入力。
 * 
 *    例: createFilter 1 twist 0 -1
 *    　  createFilter 発光 godray 1 screen
 * 
 * 
 *   eraseFilter [id]
 *    画面エフェクトを消す。
 * 
 *    例: eraseFilter 発光
 * 
 * 
 *   setFilter [id] [該当エフェクトのパラメータ ...]
 *    画面エフェクトのパラメータを設定する。
 *     - ※パラメータについては後ほど説明する。
 * 
 *    例: moveFilter 1 0
 * 
 * 
 *   moveFilter [id] [該当エフェクトのパラメータ ...] [時間]
 *    画面エフェクトのパラメータを移動、調整する。
 *    時間の単位はフレーム。
 * 
 *    例: moveFilter 1 0 60
 *        
 * 
 *   moveFilterQ [id] [該当エフェクトのパラメータ ...] [時間]
 *    画面エフェクトのパラメータを移動、調整する。
 *     moveFilterとの違いは、moveFilterは前の移動を取り消して、
 *     新しい移動ルートで移動する。
 *     こちらは連続して実行すると、移動ルートを一つずつ実行していく。
 *     （移動コマンドの列）
 * 
 *    例: moveFilterQ 1 25 60
 *    　  moveFilterQ 1 45 120
 *    　  moveFilterQ 1 50 30
 * 
 * 
 *   eraseFilterAfterMove [id]
 *    画面エフェクトを現在指定している移動ルートを全部実行した後、
 *    自動で消す。
 * 
 *    例: eraseFilterAfterMove 1
 * 
 * 
 *   setFilterSpeed [id] [変化スピード]
 *    アニメのあるエフェクトの変化スピードを指定する。
 *     主にgodray(陽射し), shockwave(波動), oldfilm(古い映像)
 *     のことを指す。
 *     デフォルト: godray, shockwave : 0.01
 *     　　　　　  oldfilm           : 1
 * 
 *    例: createFilter 陽射し godray 0
 *    　  setFilterSpeed 陽射し 0.03
 * 
 * 
 * ***************************************************
 * 各エフェクトのパラメータ：
 * https://i.imgur.com/0lXrKIo.png
 * 
 * 例えば,setFilter でbulgePinch のパラメータを調整したい時は、
 * createFilter 1 bulgePinch 0
 * setFilter 1 408 312 96 1
 *  x->408, y->312, 半径->96, 強度->1 になるように設定する。
 * 
 * ***************************************************
 * 
 * マップタグ、イベントタグ
 *  マップ開始時に自動でエフェクトを作り出し、マップから離れると
 *  エフェクトを消す。
 *  イベントのメモ欄に所定の書式で記入してください。
 * 
 *   <Filter:[id],[エフェクト名],[効果ターゲット]>
 *    - 基本的にcreateFilterと同じ。
 *       マップのメモ欄に記入すると画面依存に、
 *       イベントのメモ欄に記入するとイベント依存になる。
 * 
 *   例: <Filter:発光,godray,0>
 * 
 * 
 *   <SetFilter:[id],[該当エフェクトのパラメータ ...]>
 *    - setFilterと同じ。
 *       基本的に上の<Filter>で作ったエフェクトを設定する時に
 *       使ってください。
 * 
 *   例: <Filter:発光,godray,0>
 *   　  <SetFilter:発光,-30,0.5,2.5>
 * 
 * 
 *   <SetFilterSpeed:[id],[変化スピード]>
 *    - setFilterSpeedと同じ。
 *       基本的に上の<Filter>で作ったエフェクトを設定する時に
 *       使ってください。
 * 
 *   例: <Filter:発光,godray,0>
 *   　  <SetFilterSpeed:発光,0.03>
 * 
 * 
 */

//=============================================================================
// Filter_Controller
//
// The Controller class for a filter.
//=============================================================================
function Filter_Controller() {
    this.initialize.apply(this, arguments);
};
 
(function() {
    "use strict";

    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンド[P_DRAG]などを追加定義します。
    //=============================================================================
    
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var id;
        switch ((command || '').toUpperCase()) {
            case 'CREATEFILTER' :
                id = args[0];
                var filterType = args[1];
                var filterTarget = parseInt(args[2]) || 0;
                var char;
                if(args.length > 3) {
                    if(args[3] === "screen") char = 0;
                    else {
                        char = Number(args[3]); 
                        if(char === 0) {
                            if( !$gameParty.inBattle() ) char = this._eventId || 0;
                            else {
                                var sub = BattleManager._subject, index = 0;
                                if(sub) {
                                    index = $gameTroop.members().indexOf(sub);
                                    if(index >= 0) {
                                        index = -(index+1);
                                    } else {
                                        index = $gameParty.members().indexOf(sub);
                                        if(index < 0) index = 0;
                                        else index++;
                                    }
                                }
                                char = index;
                            }
                        }
                    }
                }
                $gameMap.createFilter(id,filterType,filterTarget,char);
                break;
                
            case 'SETFILTER' :
                id = args[0];
                var fc = $gameMap.getFilterController(id);
                if(fc) {
                    $gameMap.setFilter( id , TargetProcess(args.slice(1), fc._filterType) );
                }
                break;
                
            case 'MOVEFILTER' :
                id = args[0];
                var fc = $gameMap.getFilterController(id);
                if(fc) {
                    $gameMap.moveFilter( id , TargetProcess(args.slice(1,-1), fc._filterType) , Number(args[args.length-1]) || 1 );
                }
                break;
                
            case 'MOVEFILTERQ' :
                id = args[0];
                var fc = $gameMap.getFilterController(id);
                if(fc) {
                    $gameMap.moveFilterQueue( id , TargetProcess(args.slice(1,-1), fc._filterType) , Number(args[args.length-1]) || 1 );
                }
                break;
                
            case 'ERASEFILTER' :
                id = args[0];
                $gameMap.eraseFilter(id);
                break;
                
            case 'ERASEFILTERAFTERMOVE' :
                id = args[0];
                $gameMap.eraseFilterAfterMove(id);
                break;
                
            case 'SETFILTERSPEED' :
                id = args[0];
                $gameMap.setFilterAddiTime(id, Number(args[1]) || 0.01);
                break;
        }
    };
    
    // string -> number / undefined
    function getNumberOrX(string) {
        var num = Number(string);
        return string === "x"?undefined:(typeof(num) === "number" && !isNaN(num) ? num : undefined);
    };
    
    // resultArray:[x,y,radius,strength,strength2,strength3]
    // undefined parts are unused parts
    function TargetProcess(array, filterType) {
        var resultArray = [];
        switch(filterType) {
            case "bulgepinch":
                resultArray[0] = getNumberOrX(array[0]);
                resultArray[1] = getNumberOrX(array[1]);
                resultArray[2] = getNumberOrX(array[2]);
                resultArray[3] = getNumberOrX(array[3]);
                break;

            case "radialblur":
                resultArray[0] = getNumberOrX(array[0]);
                resultArray[1] = getNumberOrX(array[1]);
                resultArray[2] = getNumberOrX(array[2]);
                resultArray[3] = getNumberOrX(array[3]);
                resultArray[4] = getNumberOrX(array[4]);
                break;

            case "godray":
                resultArray[2] = getNumberOrX(array[0]);
                resultArray[3] = getNumberOrX(array[1]);
                resultArray[4] = getNumberOrX(array[2]);
                resultArray[5] = getNumberOrX(array[3]);
                break;

            case "ascii":
                resultArray[2] = getNumberOrX(array[0]);
                break;

            case "crosshatch":
                break;

            case "dot":
                resultArray[2] = getNumberOrX(array[0]);
                resultArray[3] = getNumberOrX(array[1]);
                break;

            case "emboss":
                resultArray[3] = getNumberOrX(array[0]);
                break;

            case "shockwave":
                resultArray[0] = getNumberOrX(array[0]);
                resultArray[1] = getNumberOrX(array[1]);
                resultArray[2] = getNumberOrX(array[2]);
                resultArray[3] = getNumberOrX(array[3]);
                resultArray[4] = getNumberOrX(array[4]);
                resultArray[5] = getNumberOrX(array[5]);
                break;

            case "twist":
                resultArray[0] = getNumberOrX(array[0]);
                resultArray[1] = getNumberOrX(array[1]);
                resultArray[2] = getNumberOrX(array[2]);
                resultArray[3] = getNumberOrX(array[3]);
                break;

            case "zoomblur":
                resultArray[0] = getNumberOrX(array[0]);
                resultArray[1] = getNumberOrX(array[1]);
                resultArray[2] = getNumberOrX(array[2]);
                resultArray[3] = getNumberOrX(array[3]);
                break;

                /*
            case "colormatrix":
                break;
                */

            case "noise":
                resultArray[3] = getNumberOrX(array[0]);
                break;

            case "blur":
                resultArray[3] = getNumberOrX(array[0]);
                break;

            case "oldfilm":
                resultArray[3] = getNumberOrX(array[0]);
                resultArray[4] = getNumberOrX(array[1]);
                resultArray[5] = getNumberOrX(array[2]);
                break;
                
            case "rgbsplit":
                resultArray[2] = getNumberOrX(array[0]);
                resultArray[3] = getNumberOrX(array[1]);
                break;
                
            case "bloom":
                resultArray[2] = getNumberOrX(array[0]);
                resultArray[3] = getNumberOrX(array[1]);
                resultArray[4] = getNumberOrX(array[2]);
                resultArray[5] = getNumberOrX(array[3]);
                break;

            default:
                break;
                                   }
        return resultArray;
    };
    
    //=============================================================================
    // Filter_Controller
    //
    // The Controller class for a filter.
    //=============================================================================
    
    Filter_Controller.prototype.initialize = function(filter, id, targetObj, char, mapId) {
        this.initBasic(id, targetObj, char, mapId);
        this.initFilterParam(filter);
        this.initTarget();
    };

    Filter_Controller.prototype.initBasic = function(id, targetObj, char, mapId) {
        this._filterType = "";
        this._filter = null;
        this._x = 0;
        this._y = 0;
        this._radius = 0;
        this._strength = 0;
        this._strength2 = 0;
        this._strength3 = 0;
        this._erase = false;
        this._eraseAfterMove = false;
        this._moveQueue = [];
        this._id = id;
        this._targetObj = targetObj;
        this._character = char;
        this._charMapId = mapId;
        this._time = 0;
        this._addiTime = 0;
    };

    Filter_Controller.prototype.initTarget = function() {
        this._targetX = this._x;
        this._targetY = this._y;
        this._targetRadius = this._radius;
        this._targetStrength = this._strength;
        this._targetStrength2 = this._strength2;
        this._targetStrength3 = this._strength3;
        this._duration = 0;
    };
    
    var _filterNameMap = {};
    _filterNameMap["bulgepinch"]  = PIXI.filters.BulgePinchFilter;
    _filterNameMap["radialblur"]  = PIXI.filters.RadialBlurFilter;
    _filterNameMap["godray"]      = PIXI.filters.GodrayFilter;
    _filterNameMap["ascii"]       = PIXI.filters.AsciiFilter;
    _filterNameMap["crosshatch"]  = PIXI.filters.CrossHatchFilter;
    _filterNameMap["dot"]         = PIXI.filters.DotFilter;
    _filterNameMap["emboss"]      = PIXI.filters.EmbossFilter;
    _filterNameMap["shockwave"]   = PIXI.filters.ShockwaveFilter;
    _filterNameMap["twist"]       = PIXI.filters.TwistFilter;
    _filterNameMap["zoomblur"]    = PIXI.filters.ZoomBlurFilter;
    _filterNameMap["noise"]       = PIXI.filters.NoiseFilter;
    _filterNameMap["blur"]        = PIXI.filters.KawaseBlurFilter; // -> KawaseBlur fast!
    _filterNameMap["oldfilm"]     = PIXI.filters.OldFilmFilter;
    _filterNameMap["rgbsplit"]    = PIXI.filters.RGBSplitFilter;
    _filterNameMap["motionblur"]  = PIXI.filters.MotionBlurFilter;
    _filterNameMap["bloom"]       = PIXI.filters.AdvancedBloomFilter;
    
    Filter_Controller.filterNameMap = _filterNameMap;
    
    Filter_Controller.prototype.createFilter = function() {
        var filter;
        if(Filter_Controller.filterNameMap[this._filterType]) {
            filter = new Filter_Controller.filterNameMap[this._filterType]();
        }
        // special settings for oldfilm filter
        if(this._filterType === 'oldfilm') {
            filter.vignetting = 0;
            filter.vignettingAlpha = 0;
            filter.vignettingBlur = 0;
            filter.scratch = 0.7;
        }
        return filter;
    };

    Filter_Controller.prototype.initFilterParam = function(filter) {
        this._filterType = filter.toLowerCase();
        switch(this._filterType) {
            case "bulgepinch":
                this._x        = 0;
                this._y        = 0;
                this._radius   = 0;
                this._strength = 1;
                break;

            case "radialblur":
                this._x        = 0;
                this._y        = 0;
                this._radius   = 0;
                this._strength = 0;
                this._strength2 = 9;
                break;

            case "godray":
                this._radius   = 30;
                this._strength = 0.5;
                this._strength2 = 2.5;
                this._strength3 = 1.0;
                this._addiTime = 0.01;
                break;

            case "ascii":
                this._strength = 8;
                break;

            case "crosshatch":
                break;

            case "dot":
                this._radius   = 5;
                this._strength = 1;
                break;

            case "emboss":
                this._strength = 5;
                break;

            case "shockwave":
                this._x        = 0;
                this._y        = 0;
                this._radius   = -1;
                this._strength = 30;
                this._strength2 = 160;
                this._strength3 = 1;
                this._addiTime = 0.01;
                break;

            case "twist":
                this._x        = 0;
                this._y        = 0;
                this._radius   = 0;
                this._strength = 4;
                break;

            case "zoomblur":
                this._x        = 0;
                this._y        = 0;
                this._radius   = 0;
                this._strength = 0.1;
                break;

            case "noise":
                this._strength = 0.5;
                break;

            case "blur":
                this._strength = 8;
                break;

            case "oldfilm":
                this._strength = 0.5;
                this._strength2 = 0.15;
                this._strength3 = 0.3;
                this._addiTime = 1;
                break;

            case "rgbsplit":
                this._radius = 0;
                this._strength = 0;
                break;

            case "motionblur":
                break;

            case "bloom":
                this._radius = 8;
                this._strength = 1;
                this._strength2 = 0.5;
                this._strength3 = 1;
                break;

            default:
                this._filterType = "";
                this._erase = true;
                break;
                                   }
    };

    Filter_Controller.prototype.update = function() {
        this.updateMove();
        if(typeof(this._character) === "number") {
            if( !!this._charMapId && !this.isOnCurrentMap() ) {
                this.erase();
            }
            else if(!this._charMapId && !$gameParty.inBattle()) {
                this.erase();
            }
        }
    };

    Filter_Controller.prototype.updateMove = function() {
        if(this._duration === 0) {
            if(this._moveQueue.length > 0) {
                var targetData = this._moveQueue.shift();
                this.move(targetData[0], targetData[1]);
            }
            else if(this._eraseAfterMove) this._erase = true;
        }
        if (this._duration > 0) {
            var d = this._duration;
            this._x = (this._x * (d - 1) + this._targetX) / d;
            this._y = (this._y * (d - 1) + this._targetY) / d;
            this._radius  = (this._radius  * (d - 1) + this._targetRadius)  / d;
            this._strength  = (this._strength  * (d - 1) + this._targetStrength)  / d;
            this._strength2  = (this._strength2  * (d - 1) + this._targetStrength2)  / d;
            this._strength3  = (this._strength3  * (d - 1) + this._targetStrength3)  / d;
            this._duration--;
        }
        this._time += this._addiTime;
    };

    Filter_Controller.prototype.updateFilterParam = function(filter) {
        switch(this._filterType.toLowerCase()) {
            case "bulgepinch":
                var dx = this.getCharX(), dy = this.getCharY();
                filter.center = [ (dx + this._x) / Graphics.width , (dy + this._y) / Graphics.height];
                filter.radius   = this._radius;
                filter.strength = this._strength;
                break;

            case "radialblur":
                var dx = this.getCharX(), dy = this.getCharY();
                filter.center = [ (dx + this._x), (dy + this._y) ];
                filter.radius   = this._radius;
                filter.angle = this._strength;
                filter.kernelSize   = Math.round(this._strength2);
                break;

            case "godray":
                filter.angle = this._radius;
                filter.gain = this._strength;
                filter.lacunarity = this._strength2;
                filter.strength = this._strength3;
                filter.time = this._time;
                break;

            case "ascii":
                filter.size = this._strength;
                break;

            case "crosshatch":
                break;

            case "dot":
                filter.angle = this._radius;
                filter.scale = this._strength;
                break;

            case "emboss":
                filter.strength = this._strength;
                break;

            case "shockwave":
                var dx = this.getCharX(), dy = this.getCharY();
                filter.center = [ (dx + this._x), (dy + this._y) ];
                filter.radius = this._radius;
                filter.amplitude = this._strength;
                filter.wavelength = this._strength2;
                filter.brightness = this._strength3;
                filter.time = this._time;
                if(this._time > 10) this.erase(); // 必要ある？
                break;

            case "twist":
                var dx = this.getCharX(), dy = this.getCharY();
                filter.offset = [ (dx + this._x), (dy + this._y) ];
                filter.radius   = this._radius;
                filter.angle = this._strength;
                break;

            case "zoomblur":
                var dx = this.getCharX(), dy = this.getCharY();
                filter.center = [ (dx + this._x), (dy + this._y) ];
                filter.innerRadius   = this._radius;
                filter.strength = this._strength;
                break;
            case "noise":
                filter.noise = this._strength;
                filter.seed = Math.random()*3;
                break;

            case "blur":
                filter.blur = this._strength;
                break;

            case "oldfilm":
                filter.sepia = this._strength;
                filter.noise = this._strength2;
                filter.scratchDensity = this._strength3;
                if(this._time > 1) {
                    filter.seed = Math.random();
                    this._time = 0;
                }
                break;

            case "rgbsplit":
                var r = this._radius, sita = this._strength;
                filter.red = [r*Math.sin(Math.PI/180*sita), r*Math.cos(Math.PI/180*sita)];
                sita += 120;
                filter.green = [r*Math.sin(Math.PI/180*sita), r*Math.cos(Math.PI/180*sita)];
                sita += 120;
                filter.blue = [r*Math.sin(Math.PI/180*sita), r*Math.cos(Math.PI/180*sita)];
                break;
                
            case "motionblur":
                var point = filter.velocity, d = $gamePlayer._stopCount===0?$gamePlayer._direction:0;
                
                point.x = (point.x + ((d===4)? -2:((d===6)? 2: Math.sign(point.x)*(-2)))).clamp(-50,50);
                point.y = (point.y + ((d===2)? 2:((d===8)? -2: Math.sign(point.y)*(-2)))).clamp(-50,50);;
                filter.velocity = point;
                break;

            case "bloom":
                filter.blur = this._radius;
                filter.bloomScale = this._strength;
                filter.threshold = this._strength2;
                filter.brightness = this._strength3;
                break;

                                   }
    };
    
    Filter_Controller.prototype.set = function(target) {
        this.clearMoveQueue();
        var x = target[0], y = target[1], r = target[2], s = target[3], s2 = target[4], s3 = target[5];
        this._x = typeof(x) === "number" ? x:this._x;
        this._y = typeof(y) === "number" ? y:this._y;
        this._radius = typeof(r) === "number" ? r:this._radius;
        this._strength = typeof(s) === "number" ? s:this._strength;
        this._strength2 = typeof(s2) === "number" ? s2:this._strength2;
        this._strength3 = typeof(s3) === "number" ? s3:this._strength3;
        this.initTarget();
    };

    Filter_Controller.prototype.move = function(target, duration) {
        this.initTarget();
        var x = target[0], y = target[1], r = target[2], s = target[3], s2 = target[4], s3 = target[5];
        this._targetX = typeof(x) === "number" ? x:this._targetX;
        this._targetY = typeof(y) === "number" ? y:this._targetY;
        this._targetRadius = typeof(r) === "number" ? r:this._targetRadius;
        this._targetStrength = typeof(s) === "number" ? s:this._targetStrength;
        this._targetStrength2 = typeof(s2) === "number" ? s2:this._targetStrength2;
        this._targetStrength3 = typeof(s3) === "number" ? s3:this._targetStrength3;
        this._duration = duration;
    };

    Filter_Controller.prototype.moveQueue = function(target, duration) {
        this._moveQueue.push(arguments);
    };

    Filter_Controller.prototype.clearMoveQueue = function() {
        this._moveQueue = [];
    };

    Filter_Controller.prototype.erase = function() {
        this._erase = true;
    };

    Filter_Controller.prototype.eraseAfterMove = function() {
        this._eraseAfterMove = true;
    };

    Filter_Controller.prototype.isOnCurrentMap = function() {
        return this._charMapId === $gameMap.mapId();
    };
    
    Filter_Controller.prototype.isMapEventOnly = function() {
        return ( !!this._character && !!this._charMapId );
    };
    
    Filter_Controller.prototype.isBattleOnly = function() {
        return ( !!this._character && !this._charMapId );
    };

    Filter_Controller.prototype.setAddiTime = function(time) {
        this._addiTime = time || 0.01;
    };
    
    Filter_Controller.prototype.getCharX = function() {
        if(!this._character) return 0; // no specified character
        if(!!this._charMapId) { // search event screen X
            if(this._character < 0) return $gamePlayer.screenX();
            else {
                char = $gameMap.event(this._character);
                if(char) return char.screenX();
                return 0;
            }
        }
        else { // search Battler screen X
            if(!$gameParty.inBattle()) return 0;
            var char;
            if(this._character < 0) char = BattleManager._spriteset._enemySprites[-this._character-1];
            else char = BattleManager._spriteset._actorSprites[this._character-1];
            if(char) return char.x;
            return 0;
        }
    };
    
    Filter_Controller.prototype.getCharY = function() {
        if(!this._character) return 0; // no specified character
        if(!!this._charMapId) { // search event screen Y
            if(this._character < 0) return $gamePlayer.screenY();
            else {
                char = $gameMap.event(this._character);
                if(char) return char.screenY();
                return 0;
            }
        }
        else { // search Battler screen Y
            if(!$gameParty.inBattle()) return 0;
            var char;
            if(this._character < 0) char = BattleManager._spriteset._enemySprites[-this._character-1];
            else char = BattleManager._spriteset._actorSprites[this._character-1];
            if(char) return char.y;
            return 0;
        }
    };

    //=============================================================================
    // Game_Map
    //
    // The game object class for a map. It contains scrolling and passage
    // determination functions.
    //=============================================================================

    var _Game_Map_initialize = Game_Map.prototype.initialize;
    Game_Map.prototype.initialize = function() {
        _Game_Map_initialize.apply(this, arguments);
        this._filterConArr = new Map();
    };

    Game_Map.prototype.createFilter = function(id, filter, targetObj, char) {
        var lastFilter = this._filterConArr.get(id);
        if(lastFilter) {
            SceneManager._scene.removeFilterCon(lastFilter);
        }
        targetObj = targetObj || 0;
        var f = new Filter_Controller( filter, id, targetObj, char, (typeof(char) === "number" && !$gameParty.inBattle() ? this.mapId():undefined) );
        f.set([0,0]);
        this._filterConArr.set(id, f);
    };

    Game_Map.prototype.updateFilterConArr = function() {
        this._filterConArr.forEach(function(FC, key, map) {
            if( FC.isMapEventOnly() && $gameParty.inBattle() ) return;
            FC.update();
        });
    };
    
    Game_Map.prototype.getFilterController = function(id) {
        return this._filterConArr.get(id);
    };

    Game_Map.prototype.setFilter = function(id, target) {
        var filterController = this._filterConArr.get(id);
        if(filterController) {
            filterController.set(target || []);
            return true;
        }
        return false;
    };

    Game_Map.prototype.moveFilter = function(id, target, d) {
        var filterController = this._filterConArr.get(id);
        if(filterController) {
            filterController.clearMoveQueue();
            filterController.move(target || [], d || 1);
            return true;
        }
        return false;
    };

    Game_Map.prototype.moveFilterQueue = function(id, target, d) {
        var filterController = this._filterConArr.get(id);
        if(filterController) {
            filterController.moveQueue(target || [], d || 1);
            return true;
        }
        return false;
    };

    Game_Map.prototype.eraseFilter = function(id) {
        var filterController = this._filterConArr.get(id);
        if(filterController) {
            filterController.erase();
            return true;
        }
        return false;
    };

    Game_Map.prototype.eraseFilterAfterMove = function(id) {
        var filterController = this._filterConArr.get(id);
        if(filterController) {
            filterController.eraseAfterMove();
            return true;
        }
        return false;
    };

    Game_Map.prototype.setFilterAddiTime = function(id, time) {
        var filterController = this._filterConArr.get(id);
        if(filterController) {
            filterController.setAddiTime(time);
            return true;
        }
        return false;
    };

    //=============================================================================
    // Game_Screen
    //
    // The game object class for screen effect data, such as changes in color tone
    // and flashes.
    //=============================================================================
    
    var _Game_Screen_update = Game_Screen.prototype.update;
    Game_Screen.prototype.update = function(sceneActive) {
        _Game_Screen_update.apply(this, arguments);
        $gameMap.updateFilterConArr();
    };
    
    //=============================================================================
    // Game_CharacterBase
    //  拡張するプロパティを定義します。
    //=============================================================================
    if(DataManager.extractMetadataArray === undefined) {
        
    var _DataManager_extractMetadata = DataManager.extractMetadata;
    DataManager.extractMetadata = function(data) {
        _DataManager_extractMetadata.apply(this, arguments);
        this.extractMetadataArray(data);
    };

    DataManager.extractMetadataArray = function(data) {
        var re = /<([^<>:]+)(:?)([^>]*)>/g;
        data.metaArray = {};
        var match = true;
        while (match) {
            match = re.exec(data.note);
            if (match) {
                var metaName = match[1];
                data.metaArray[metaName] = data.metaArray[metaName] || [];
                data.metaArray[metaName].push(match[2] === ':' ? match[3] : true);
            }
        }
    };
        
    }
    
    //=============================================================================
    // Game_Map
    //  拡張するプロパティを定義します。
    //=============================================================================
    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.apply(this, arguments);
        this.setupTKMFilters();
    };

    Game_Map.prototype.setupTKMFilters = function() {
        var fArray = $dataMap.metaArray.Filter;
        if(!fArray) return;
        for(var i = 0; i < fArray.length; i++) {
            var f = fArray[i].split(',');
            var id = f[0];
            var filterType = f[1];
            var targetObj = parseInt(f[2]) || 0;
            var char = 0;
            this.createFilter(id, filterType, targetObj, char);
        }
        var fSetArray = $dataMap.metaArray.SetFilter;
        if(!fSetArray) return;
        for(var i = 0; i < fSetArray.length; i++) {
            var f = fSetArray[i].split(',');
            var id = f[0];
            var fc = this.getFilterController(id);
            if(fc) {
                this.setFilter( id , TargetProcess(f.slice(1), fc._filterType) );
            }
        }
        fSetArray = $dataMap.metaArray.SetFilterSpeed; 
        if(!fSetArray) return;
        for(var i = 0; i < fSetArray.length; i++) {
            var f = fSetArray[i].split(',');
            var id = f[0], speed =  Number(f[1]) || 0.01;
            var fc = this.getFilterController(id);
            if(fc) {
                this.setFilterAddiTime( id , speed );
            }
        }
    };
    
    //=============================================================================
    // Game_Event
    //  拡張するプロパティを定義します。
    //=============================================================================
    
    var _Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function(mapId, eventId) {
        _Game_Event_initialize.apply(this, arguments);
        this.setupTKMFilters();
    };

    Game_Event.prototype.setupTKMFilters = function() {
        var fArray = this.event().metaArray.Filter;
        if(!fArray) return;
        for(var i = 0; i < fArray.length; i++) {
            var f = fArray[i].split(',');
            var id = f[0];
            var filterType = f[1];
            var targetObj = parseInt(f[2]) || 0;
            var char = this._eventId;
            $gameMap.createFilter(id, filterType, targetObj, char);
        }
        var fSetArray = this.event().metaArray.SetFilter; 
        if(!fSetArray) return;
        for(var i = 0; i < fSetArray.length; i++) {
            var f = fSetArray[i].split(',');
            var id = f[0];
            var fc = $gameMap.getFilterController(id);
            if(fc) {
                $gameMap.setFilter( id , TargetProcess(f.slice(1), fc._filterType) );
            }
        }
        fSetArray = this.event().metaArray.SetFilterSpeed; 
        if(!fSetArray) return;
        for(var i = 0; i < fSetArray.length; i++) {
            var f = fSetArray[i].split(',');
            var id = f[0], speed =  Number(f[1]) || 0.01;
            var fc = $gameMap.getFilterController(id);
            if(fc) {
                $gameMap.setFilterAddiTime( id , speed );
            }
        }
    };
 
    // セーブデータの生成
    // 返り値がセーブされるのでデータをcontentsに追加して返す
    var _makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function() {
        var contents = _makeSaveContents.call(this);
        contents._map_filterConArray = strMapToArray($gameMap._filterConArr);
        return contents;
    };
    
    // セーブデータの読み込み
    // 生成時と同じ形でデータがcontentsに入っているので、変数に格納する
    var extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        extractSaveContents.call(this, contents);
        $gameMap._filterConArr = new Map(contents._map_filterConArray);
        
    };
    
    function strMapToArray(strMap) {
        var arr = [];
        strMap.forEach(function(v, k, map) {
            // We don’t escape the key '__proto__'
            // which can cause problems on older engines
            arr.push([k,v]);
        });
        return arr;
    };
    
    //=============================================================================
    // Scene_******
    //  拡張するプロパティを定義します。 filterConを観測してfilterを作ります。
    //=============================================================================
    
    var _Scene_Base_initialize = Scene_Base.prototype.initialize;
    Scene_Base.prototype.initialize = function() {
        _Scene_Base_initialize.apply(this, arguments);
        this._TKMFilters = new Map();
    };
    
    Scene_Base.prototype.applyTKMFilter = function(filter, targetObj) {
        var arr, targets = [];
        switch(targetObj) {
            case 0:
                targets = [this._spriteset];
                break;

            case 1:
                targets = [this];
                break;
                
            case 2:
                if(!!this._spriteset) targets = [this._spriteset._tilemap];
                break;
                
            case 3:
                if(!!this._spriteset) {
                    if(!!this._spriteset._tilemap) {
                        targets = [this._spriteset._tilemap.lowerZLayer, this._spriteset._tilemap.upperZLayer];
                    }
                }
                break;
                
            case 4:
                if(!!this._spriteset) {
                    targets = this._spriteset._characterSprites; // special
                }
                break;
                
            case 5:
                if(!!this._spriteset) {
                    targets = [this._spriteset._pictureContainer];
                }
                break;
                         }
        for(var i = 0; i < targets.length; i++) {
            var target = targets[i];
            if(!target) continue;
            arr = target.filters || [];
            arr.push(filter);
            target.filters = arr;
            if(!target.filterArea) {
                var margin = 48;
                var width = Graphics.width + margin * 2;
                var height = Graphics.height + margin * 2;
                target.filterArea = new Rectangle(-margin, -margin, width, height);
            }
        }
    };

    Scene_Base.prototype.removeTKMFilter = function(filter, targetObj) {
        var arr, targets = [];
        switch(targetObj) {
            case 0:
                targets = [this._spriteset];
                break;

            case 1:
                targets = [this];
                break;
                
            case 2:
                if(!!this._spriteset) targets = [this._spriteset._tilemap];
                break;
                
            case 3:
                if(!!this._spriteset) {
                    if(!!this._spriteset._tilemap) {
                        targets = [this._spriteset._tilemap.lowerZLayer, this._spriteset._tilemap.upperZLayer];
                    }
                }
                break;
                
            case 4:
                if(!!this._spriteset) {
                    targets = this._spriteset._characterSprites; // special
                }
                break;
                
            case 5:
                if(!!this._spriteset) {
                    targets = [this._spriteset._pictureContainer];
                }
                break;
                         }
        for(var i = 0; i < targets.length; i++) {
            var target = targets[i];
            if(!target) continue;
            arr = target.filters || [];
            var index = arr.indexOf(filter);
            if(index >= 0) arr.splice(index, 1);
            target.filters = arr;
        }
    };
    
    Scene_Base.prototype.removeFilterCon = function(FC) {
        if(this._TKMFilters.has(FC)) {
            this.removeTKMFilter(this._TKMFilters.get(FC), FC._targetObj);
            this._TKMFilters.delete(FC);
        }
    };
    
    var _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
    Scene_Map.prototype.updateMain = function() {
        _Scene_Map_updateMain.apply(this, arguments);
        this.updateTKMfilters();
    };
    
    Scene_Map.prototype.updateTKMfilters = function() {
        $gameMap._filterConArr.forEach(function(FC, key, map) {
            var filter;
            if(FC._erase) {
                filter = this._TKMFilters.get(FC);
                if(filter) {
                    // remove Filter from target
                    this.removeTKMFilter(filter, FC._targetObj);
                    this._TKMFilters.delete(FC);
                }
                map.delete(key);
                return;
            }
            else if(!this._TKMFilters.has(FC)) {
                filter = FC.createFilter();
                this._TKMFilters.set(FC, filter);
                this.applyTKMFilter(filter, FC._targetObj);
            }
            else{
                filter = this._TKMFilters.get(FC);
            }
            FC.updateFilterParam(filter);
        }, this);
    };
    
    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.apply(this, arguments);
        this.updateTKMfilters();
    };
    
    Scene_Battle.prototype.updateTKMfilters = function() {
        $gameMap._filterConArr.forEach(function(FC, key, map) {
            if(FC.isMapEventOnly()) return;
            var filter;
            if(FC._erase) {
                filter = this._TKMFilters.get(FC);
                if(filter) {
                    // remove Filter from target
                    this.removeTKMFilter(filter, FC._targetObj);
                }
                map.delete(key);
                return;
            }
            else if(!this._TKMFilters.has(FC)) {
                filter = FC.createFilter();
                this._TKMFilters.set(FC, filter);
                this.applyTKMFilter(filter, FC._targetObj);
            }
            else{
                filter = this._TKMFilters.get(FC);
            }
            FC.updateFilterParam(filter);
        }, this);
    };
    
})();

