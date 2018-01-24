//=============================================================================
// FilterController.js
// ----------------------------------------------------------------------------
// Copyright (c) 2018 Tsukimi
// ----------------------------------------------------------------------------
// Version
// 2.0.0 2018/01/23 refactor code. change version because no comatibility with v1.x
// *****
// 1.0.4 2018/01/08 効果ターゲット追加、Godrayにパラメータ追加
// 1.0.0 2018/01/03 リリース
//=============================================================================

/*:
 * @plugindesc FilterController
 * @author Tsukimi
 * 
 * @help
 * *** pixi-filter Controller
 * Author: Tsukimi
 * This plugin is a controller, to control pixi-filters,
 * making fancy effects.
 * 
 * *** Notice !!! ***
 * this is an webGL depending effect.
 * If your RMMV version is below 1.5.0 and your game
 * will be on website/smartphone, this effect may not work.
 * (OK for desktop application, even with version below 1.5.0)
 * 
 * 
 * You can create filters by three method:
 * 1. Plugin Command
 * 2. Map Tags(->map dependent filter)
 * 3. Event Tags(->event dependent filter)
 * 
 * 
 * *** Plugin Command:
 * ---------------------------
 * 　createFilter <id> <filterType> <filter-target> (<character>)
 * 　　create filter.
 * 
 * 　　id: id of this controller. choose a name you like!
 * 　　filtertype: please look at the list of filter-type.
 * 　　filter-target: what will be included in the effect.
 * 　　　0: screen(map+pictures)
 * 　　　1: whole-screen(including message window)
 *      2: map(tiles+characters)
 *      3: tiles
 *      4: all characers
 *      5: all pictures
 *    character: optional parameter. Make filter Location 
 *               depend on character, and will erase itself
 *               when leaving current map.
 *      ~-1: game Player (inBattle: enemy id)
 *        0: this event  (inBattle: current actor)
 *       0~: event ID    (inBattle: party member id)
 *       screen: screen.(mostly used for restricting to current map)
 * 
 * 　　example:
 * 　　　createFilter tw#1 twist 0
 * 　　　createFilter GLOW godray 2 screen
 * 
 * 
 * 　eraseFilter <id>
 * 　　erase the filter of controller name <id>.
 * 
 * 
 *   setFilter <id> <filter parameters ...>
 *    set the filter<id> to the <parameters>.
 *    please take a look at filter parameter list.
 * 
 *    Take twist as example.
 *    assume I created a twist filter named tw#1.
 *    twist has 4 parameters: x,y,radius,angle;
 *    so write:
 * 　　　setFilter tw#1 0 0 96 4
 * 
 * 　　Besides numbers, you can also set:
 * 　　x: Don't change from current parameter value
 * 　　v<Number>: value of Game Variable<Number>
 * 　　r<#1>~<#2>: Random value between #1 and #2.
 * 　　            #1 and #2 can also be variables.
 * 　　example:
 * 　　　setFilter tw#1 v1 v2 r50~v3 x
 * 
 * 
 *   moveFilter <id> <filter parameters ...> <duration>
 *    move filter<id> to <parameters> within <duration>
 * 
 * 　　example:
 * 　　　moveFilter tw#1 0 0 96 4 60
 * 
 * 
 *   moveFilterQ <id> <filter parameters ...> <duration>
 *    push the movement to Queue. will execute next move
 *    after the last move is end.
 * 
 * 　　example:
 * 　　　moveFilterQ tw#1 0 0 96 4 60
 * 　　　moveFilterQ tw#1 x x x x 120
 * 　　　　(↑ no param changing -> wait 120f between move)
 * 
 * 
 *   eraseFilterAfterMove <id>
 *    erase Filter itself after move and moveQueue are end.
 * 
 * 
 *   setFilterSpeed <id> <speed>
 *    some filter has auto-animation(such as godray).
 *    set the animation speed.
 * 　　　default value: godray, shockwave : 0.01
 * 　　　               oldfilm, noise    : 1
 * 
 * 
 * 
 * *** Map Tags/Event Tags:
 * ---------------------------
 * 　<Filter:[id],[filterType],[filter-target]>
 * 　　Basically same as createfilter.
 * 　　Creating filter when entering map.
 * 　　<char> will be set to the eventID/screen.
 * 
 * 　　example:
 * 　　　<Filter:GODRAY#1,godray,0>
 * 
 * 
 * 　<SetFilter:[id],[filter parameters ...]>
 * 　　Basically same as setfilter.
 * 　　Set the parameter created by <Filter:...>.
 * 
 * 　　example:
 * 　　　<Filter:GODRAY#1,godray,0>
 * 　　　<SetFilter:GODRAY#1,-30,0.5,2.5,1>
 * 
 * 
 * 　<SetFilterSpeed:[id],[speed]>
 * 　　Basically same as setfilterSpeed.
 * 　　Set the parameter created by <Filter:...>.
 * 
 * 　　example:
 * 　　　<Filter:GODRAY#1,godray,0>
 * 　　　<SetFilterSpeed:GODRAY#1,0.03>
 * 
 * 
 * 
 */

/*:ja
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
 *   　  <SetFilter:発光,-30,0.5,2.5,1>
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
        var id, dur;
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
                        if(char === 0) { // this event/battle unit
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
                $gameMap.setFilter( id , ParamProcess(args.slice(1)) );
                break;
                
            case 'MOVEFILTER' :
                id = args[0];
                dur = Number(args[args.length-1]) || 1 ;
                $gameMap.moveFilter(id , ParamProcess(args.slice(1,-1)), dur);
                break;
                
            case 'MOVEFILTERQ' :
                id = args[0];
                var dur = Number(args[args.length-1]) || 1 ;
                $gameMap.moveFilterQueue(id , ParamProcess(args.slice(1,-1)), dur);
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
                $gameMap.setFilterAddiTime(id, Number(args[1]) || 0);
                break;
        }
    };
    
    // string -> number / undefined
    function getNumberOrX(string) {
        var num;
        if(string === '' || string === 'x') return undefined;
        var num = Number(string);
        if(typeof(num) === "number" && !isNaN(num)) return num;
        if(string[0] === 'v') {
            num = Number(string.slice(1)) || 0;
            return $gameVariables.value(num);
        }
        if(string[0] === 'r') {
            num = string.slice(1).split('~');
            var num1 = getNumberOrX(num[0]) || 0, 
                num2 = getNumberOrX(num[1]) || 0;
            if(num1>num2) {var t=num1; num1=num2; num2=t;}
            return ( Math.random()*(num2-num1) + num1 );
        }
        return undefined;
    };
    
    // resultArray:parameters
    // undefined parts are unused parts
    function ParamProcess(array) {
        var resultArray = [];
        for(var i = 0; i < array.length; i++) {
            resultArray.push( getNumberOrX(array[i]) );
        }
        return resultArray;
    };
    
    //=============================================================================
    // Filter_Controller
    //
    // The Controller class for a filter.
    //=============================================================================
    
    Filter_Controller.prototype.initialize = function(filterName, id, targetObj, char, mapId) {
        this.initBasic(id, targetObj, char, mapId);
        this.initFilterParam(filterName);
        this.initTarget();
    };

    Filter_Controller.prototype.initBasic = function(id, targetObj, char, mapId) {
        this._filterType = "";
        this._erase = false;
        this._eraseAfterMove = false;
        this._moveQueue = [];
        this._time = 0;
        this._addiTime = 0;
        this._id = id;
        this._targetObj = targetObj;
        this._character = char;
        this._charMapId = mapId;
        this.currentParams = null;
        this.targetParams = null;
    };

    Filter_Controller.prototype.initTarget = function() {
        this.targetParams = this.currentParams.slice(); // fast array copy
        this._duration = 0;
    };
    
    var _FNMap = {};
    _FNMap["bulgepinch"]  = PIXI.filters.BulgePinchFilter;
    _FNMap["radialblur"]  = PIXI.filters.RadialBlurFilter;
    _FNMap["godray"]      = PIXI.filters.GodrayFilter;
    _FNMap["ascii"]       = PIXI.filters.AsciiFilter;
    _FNMap["crosshatch"]  = PIXI.filters.CrossHatchFilter;
    _FNMap["dot"]         = PIXI.filters.DotFilter;
    _FNMap["emboss"]      = PIXI.filters.EmbossFilter;
    _FNMap["shockwave"]   = PIXI.filters.ShockwaveFilter;
    _FNMap["twist"]       = PIXI.filters.TwistFilter;
    _FNMap["zoomblur"]    = PIXI.filters.ZoomBlurFilter;
    _FNMap["noise"]       = PIXI.filters.NoiseFilter;
    _FNMap["blur"]        = PIXI.filters.KawaseBlurFilter; // -> KawaseBlur: fast!
    _FNMap["oldfilm"]     = PIXI.filters.OldFilmFilter;
    _FNMap["rgbsplit"]    = PIXI.filters.RGBSplitFilter;
    _FNMap["bloom"]       = PIXI.filters.AdvancedBloomFilter;
    
    Filter_Controller.filterNameMap = _FNMap;
    
    var _FSInit = {};
    _FSInit["oldfilm"]    = function(filter) {
        filter.vignetting = 0;
        filter.vignettingAlpha = 0;
        filter.vignettingBlur = 0;
        filter.scratch = 0.7;
    };
    Filter_Controller.filterSpecialInit = _FSInit;
    
    Filter_Controller.prototype.createFilter = function() {
        var filter;
        if(Filter_Controller.filterNameMap[this._filterType]) {
            filter = new Filter_Controller.filterNameMap[this._filterType]();
        }
        // special settings for filter
        var spInit = Filter_Controller.filterSpecialInit[this._filterType];
        if(!!spInit) {
            spInit.apply(this, [filter]);
        }
        return filter;
    };

    var _defaultParam = {};
    _defaultParam["bulgepinch"] = [0,0,0,1];
    _defaultParam["radialblur"] = [0,0,0,0,9];
    _defaultParam["godray"] = [30,0.5,2.5,1.0];
    _defaultParam["ascii"] = [8];
    _defaultParam["crosshatch"] = [];
    _defaultParam["dot"] = [5,1];
    _defaultParam["emboss"] = [5];
    _defaultParam["shockwave"] = [0,0,-1,30,160,1];
    _defaultParam["twist"] = [0,0,0,4];
    _defaultParam["zoomblur"] = [0,0,0,0.1];
    _defaultParam["noise"] = [0.5];
    _defaultParam["blur"] = [8];
    _defaultParam["oldfilm"] = [0.5,0.15,0.3];
    _defaultParam["rgbsplit"] = [0,0];
    _defaultParam["bloom"] = [0,1,0.5,1];
    
    Filter_Controller.defaultFilterParam = _defaultParam;
    
    Filter_Controller.prototype.initFilterParam = function(filterName) {
        this._filterType = filterName.toLowerCase();
        var defaultParam = Filter_Controller.defaultFilterParam[this._filterType];
        if( !defaultParam ) {
            this._filterType = "";
            this._erase = true;
            return;
        }
        this.currentParams = defaultParam.slice(); // fast array copy
        switch(this._filterType) {
            case "godray":
                this._addiTime = 0.01;
                break;

            case "shockwave":
                this._addiTime = 0.01;
                break;

            case "oldfilm":
                this._addiTime = 1;
                break;

            case "noise":
                this._addiTime = 1;
                break;
                                   }
    };

    Filter_Controller.prototype.update = function() {
        this.updateMove();
        this.checkErase();
    };

    Filter_Controller.prototype.updateMove = function() {
        if(this._duration <= 0) {
            if(this._moveQueue.length > 0) {
                var targetData = this._moveQueue.shift();
                this.move(targetData[0], targetData[1]);
            }
            else if(this._eraseAfterMove) this.erase();
        }
        if (this._duration > 0) {
            var d = this._duration, cp = this.currentParams, tp = this.targetParams;
            for(var i = 0; i < cp.length; i++) {
                cp[i] = (cp[i] * (d - 1) + tp[i]) / d;
            }
            this._duration--;
        }
        this._time += this._addiTime;
    };

    Filter_Controller.prototype.checkErase = function() {
        if(typeof(this._character) === "number") {
            if( !!this._charMapId && !this.isOnCurrentMap() ) {
                this.erase();
            }
            else if(!this._charMapId && !$gameParty.inBattle()) {
                this.erase();
            }
        }
    };
    
    //=============================================================================
    //  updateFilter_Handler
    //  function handler of updating actual filter object
    //=============================================================================
    
    var _updateFilterHandler = {};
    
    var bp = function(filter, cp) {
        var loc = this.getCharLoc();
        filter.center = [ (loc[0] + cp[0]) / Graphics.width , (loc[1] + cp[1]) / Graphics.height];
        filter.radius   = cp[2];
        filter.strength = cp[3];
    };
    _updateFilterHandler["bulgepinch"] = bp;
    
    var rb = function(filter, cp) {
        var loc = this.getCharLoc();
        filter.center = [ (loc[0] + cp[0]), (loc[1] + cp[1]) ];
        filter.radius   = cp[2];
        filter.angle = cp[3];
        filter.kernelSize   = Math.round(cp[4]);
    };
    _updateFilterHandler["radialblur"] = rb;
    
    var gr = function(filter, cp) {
        filter.angle = cp[0];
        filter.gain = cp[1];
        filter.lacunarity = cp[2];
        filter.strength = cp[3];
        filter.time = this._time;
    };
    _updateFilterHandler["godray"] = gr;
    
    var as = function(filter, cp) {
        filter.size = cp[0];
    };
    _updateFilterHandler["ascii"] = as;
    
    var cs = function(filter, cp) {
    };
    _updateFilterHandler["crosshatch"] = cs;
    
    var dot = function(filter, cp) {
        filter.angle = cp[0];
        filter.scale = cp[1];
    };
    _updateFilterHandler["dot"] = dot;
    
    var em = function(filter, cp) {
        filter.strength = cp[0];
    };
    _updateFilterHandler["emboss"] = em;
    
    var sw = function(filter, cp) {
        var loc = this.getCharLoc();
        filter.center = [ (loc[0] + cp[0]), (loc[1] + cp[1]) ];
        filter.radius = cp[2];
        filter.amplitude = cp[3];
        filter.wavelength = cp[4];
        filter.brightness = cp[5];
        filter.time = this._time;
        if(this._time > 10) this.erase(); // 必要ある？
    };
    _updateFilterHandler["shockwave"] = sw;
    
    var tw = function(filter, cp) {
        var loc = this.getCharLoc();
        filter.offset = [ (loc[0] + cp[0]), (loc[1] + cp[1]) ];
        filter.radius = cp[2];
        filter.angle = cp[3];
    };
    _updateFilterHandler["twist"] = tw;
    
    var zb = function(filter, cp) {
        var loc = this.getCharLoc();
        filter.center = [ (loc[0] + cp[0]), (loc[1] + cp[1]) ];
        filter.innerRadius = cp[2];
        filter.strength = cp[3];
    };
    _updateFilterHandler["zoomblur"] = zb;
    
    var no = function(filter, cp) {
        filter.noise = cp[0];
        if(this._time > 1) {
            filter.seed = Math.random()*3;
            this._time = 0;
        }
    };
    _updateFilterHandler["noise"] = no;
    
    var blr = function(filter, cp) {
        filter.blur = cp[0];
    };
    _updateFilterHandler["blur"] = blr;
    
    var of = function(filter, cp) {
        filter.sepia = cp[0];
        filter.noise = cp[1];
        filter.scratchDensity = cp[2];
        if(this._time > 1) {
            filter.seed = Math.random();
            this._time = 0;
        }
    };
    _updateFilterHandler["oldfilm"] = of;
    
    var rgb = function(filter, cp) {
        var r = cp[0], sita = cp[1];
        filter.red = [r*Math.sin(Math.PI/180*sita), r*Math.cos(Math.PI/180*sita)];
        sita += 120;
        filter.green = [r*Math.sin(Math.PI/180*sita), r*Math.cos(Math.PI/180*sita)];
        sita += 120;
        filter.blue = [r*Math.sin(Math.PI/180*sita), r*Math.cos(Math.PI/180*sita)];
    };
    _updateFilterHandler["rgbsplit"] = rgb;

    
    var blm = function(filter, cp) {
        filter.blur = cp[0]
        filter.bloomScale = cp[1];
        filter.threshold = cp[2];
        filter.brightness = cp[3];
    };
    _updateFilterHandler["bloom"] = blm;
    
    Filter_Controller.updateFilterHandler = _updateFilterHandler;
    //=============================================================================
    //  updateFilter_Handler
    //  END!!
    //=============================================================================

    Filter_Controller.prototype.updateFilter = function(filter) {
        var handler = Filter_Controller.updateFilterHandler[this._filterType];
        if( !handler ) return;
        handler.apply(this, [filter, this.currentParams]);
    };
    
    Filter_Controller.prototype.set = function(target) {
        this.clearMoveQueue();
        var cp = this.currentParams;
        for(var i = 0; i < cp.length; i++) {
            cp[i] = typeof(target[i]) === "number" ? target[i]:cp[i];
        }
        this.initTarget();
    };

    Filter_Controller.prototype.move = function(target, duration) {
        this.initTarget();
        var tp = this.targetParams;
        for(var i = 0; i < tp.length; i++) {
            tp[i] = typeof(target[i]) === "number" ? target[i]:tp[i];
        }
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
        this._addiTime = time || 0;
    };
    
    Filter_Controller.prototype.getCharLoc = function() {
        if(!this._character) return [0,0]; // no specified character
        if(!!this._charMapId) { // search event screen Loc
            if(this._character < 0) return [$gamePlayer.screenX(), $gamePlayer.screenY()];
            else {
                char = $gameMap.event(this._character);
                if(char) return [char.screenX(), char.screenY()];
            }
        }
        else { // search Battler screen X
            if(!$gameParty.inBattle()) return [0,0];
            var char;
            if(this._character < 0) char = BattleManager._spriteset._enemySprites[-this._character-1];
            else char = BattleManager._spriteset._actorSprites[this._character-1];
            if(char) return [char.x, char.y];
        }
        return [0,0];
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
            SceneManager._scene.removeFilterOf(lastFilter);
        }
        targetObj = targetObj || 0;
        var f = new Filter_Controller( filter, id, targetObj, char, (typeof(char) === "number" && !$gameParty.inBattle() ? this.mapId():undefined) );
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
                this.setFilter( id , ParamProcess(f.slice(1)) );
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
            $gameMap.setFilter( id , ParamProcess(f.slice(1)) );
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
        var arr, targets = this.getTKMFilterObj(targetObj);
        for(var i = 0; i < targets.length; i++) {
            var target = targets[i];
            if(!target) continue;
            arr = target.filters || [];
            arr.push(filter);
            target.filters = arr;
            
            if([2,3,4].indexOf(targetObj) !== -1 && !target.filterArea) {
                var margin = 48;
                var width = Graphics.width + margin * 2;
                var height = Graphics.height + margin * 2;
                target.filterArea = new Rectangle(-margin, -margin, width, height);
            }
        }
    };

    Scene_Base.prototype.removeTKMFilter = function(filter, targetObj) {
        var arr, targets = this.getTKMFilterObj(targetObj);
        for(var i = 0; i < targets.length; i++) {
            var target = targets[i];
            if(!target) continue;
            arr = target.filters || [];
            var index = arr.indexOf(filter);
            if(index >= 0) arr.splice(index, 1);
            target.filters = arr;
        }
    };

    Scene_Base.prototype.getTKMFilterObj = function(targetObj) {
        var targets = [];
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
        return targets;
    };
    
    Scene_Base.prototype.removeFilterOf = function(FC) {
        if(this._TKMFilters.has(FC._id)) {
            this.removeTKMFilter(this._TKMFilters.get(FC._id), FC._targetObj);
            this._TKMFilters.delete(FC._id);
        }
    };
    
    var _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
    Scene_Map.prototype.updateMain = function() {
        _Scene_Map_updateMain.apply(this, arguments);
        this.updateTKMfilters();
    };
    
    Scene_Map.prototype.updateTKMfilters = function() {
        $gameMap._filterConArr.forEach(function(FC, key, map) {
            var filter = this._TKMFilters.get(FC._id);
            if(FC._erase) {
                if(filter) {
                    // remove Filter from target
                    this.removeTKMFilter(filter, FC._targetObj);
                    this._TKMFilters.delete(FC._id);
                }
                map.delete(key);
                return;
            }
            if(!filter) {
                filter = FC.createFilter();
                this._TKMFilters.set(FC._id, filter);
                this.applyTKMFilter(filter, FC._targetObj);
            }
            FC.updateFilter(filter);
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
            var filter = this._TKMFilters.get(FC._id);
            if(FC._erase) {
                if(filter) {
                    // remove Filter from target
                    this.removeTKMFilter(filter, FC._targetObj);
                }
                map.delete(key);
                return;
            }
            if(!filter) {
                filter = FC.createFilter();
                this._TKMFilters.set(FC._id, filter);
                this.applyTKMFilter(filter, FC._targetObj);
            }
            FC.updateFilter(filter);
        }, this);
    };
    
})();


/*!
 * pixi-filters - v2.5.1
 * Compiled Wed, 17 Jan 2018 02:35:33 UTC
 *
 * pixi-filters is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
var __filters=function(e,t){"use strict";var n="attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}",r="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform float gamma;\nuniform float contrast;\nuniform float saturation;\nuniform float brightness;\nuniform float red;\nuniform float green;\nuniform float blue;\nuniform float alpha;\n\nvoid main(void)\n{\n    vec4 c = texture2D(uSampler, vTextureCoord);\n\n    if (c.a > 0.0) {\n        c.rgb /= c.a;\n\n        vec3 rgb = pow(c.rgb, vec3(1. / gamma));\n        rgb = mix(vec3(.5), mix(vec3(dot(vec3(.2125, .7154, .0721), rgb)), rgb, saturation), contrast);\n        rgb.r *= red;\n        rgb.g *= green;\n        rgb.b *= blue;\n        c.rgb = rgb * brightness;\n\n        c.rgb *= c.a;\n    }\n\n    gl_FragColor = c * alpha;\n}\n",o=function(e){function t(t){e.call(this,n,r),Object.assign(this,{gamma:1,saturation:1,contrast:1,brightness:1,red:1,green:1,blue:1,alpha:1},t)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.apply=function(e,t,n,r){this.uniforms.gamma=Math.max(this.gamma,1e-4),this.uniforms.saturation=this.saturation,this.uniforms.contrast=this.contrast,this.uniforms.brightness=this.brightness,this.uniforms.red=this.red,this.uniforms.green=this.green,this.uniforms.blue=this.blue,this.uniforms.alpha=this.alpha,e.applyFilter(this,t,n,r)},t}(t.Filter),i=n,l="\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec2 uOffset;\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n\n    // Sample top left pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y));\n\n    // Sample top right pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y));\n\n    // Sample bottom right pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y));\n\n    // Sample bottom left pixel\n    color += texture2D(uSampler, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y));\n\n    // Average\n    color *= 0.25;\n\n    gl_FragColor = color;\n}\n",s=function(e){function n(n,r){void 0===n&&(n=4),void 0===r&&(r=3),e.call(this,i,l),this._pixelSize=new t.Point,this.pixelSize=1,this._kernels=null,Array.isArray(n)?this.kernels=n:(this._blur=n,this.quality=r)}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={kernels:{configurable:!0},pixelSize:{configurable:!0},quality:{configurable:!0},blur:{configurable:!0}};return n.prototype.apply=function(e,t,n,r){var o,i=this.pixelSize.x/t.size.width,l=this.pixelSize.y/t.size.height;if(1===this._quality||0===this._blur)o=this._kernels[0]+.5,this.uniforms.uOffset[0]=o*i,this.uniforms.uOffset[1]=o*l,e.applyFilter(this,t,n,r);else{for(var s,a=e.getRenderTarget(!0),u=t,c=a,f=this._quality-1,d=0;d<f;d++)o=this._kernels[d]+.5,this.uniforms.uOffset[0]=o*i,this.uniforms.uOffset[1]=o*l,e.applyFilter(this,u,c,!0),s=u,u=c,c=s;o=this._kernels[f]+.5,this.uniforms.uOffset[0]=o*i,this.uniforms.uOffset[1]=o*l,e.applyFilter(this,u,n,r),e.returnRenderTarget(a)}},n.prototype._generateKernels=function(){var e=this._blur,t=this._quality,n=[e];if(e>0)for(var r=e,o=e/t,i=1;i<t;i++)r-=o,n.push(r);this._kernels=n},r.kernels.get=function(){return this._kernels},r.kernels.set=function(e){Array.isArray(e)&&e.length>0?(this._kernels=e,this._quality=e.length,this._blur=Math.max.apply(Math,e)):(this._kernels=[0],this._quality=1)},r.pixelSize.set=function(e){"number"==typeof e?(this._pixelSize.x=e,this._pixelSize.y=e):Array.isArray(e)?(this._pixelSize.x=e[0],this._pixelSize.y=e[1]):e instanceof t.Point?(this._pixelSize.x=e.x,this._pixelSize.y=e.y):(this._pixelSize.x=1,this._pixelSize.y=1)},r.pixelSize.get=function(){return this._pixelSize},r.quality.get=function(){return this._quality},r.quality.set=function(e){this._quality=Math.max(1,Math.round(e)),this._generateKernels()},r.blur.get=function(){return this._blur},r.blur.set=function(e){this._blur=e,this._generateKernels()},Object.defineProperties(n.prototype,r),n}(t.Filter),a=n,u="\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform float threshold;\n\nvoid main() {\n    vec4 color = texture2D(uSampler, vTextureCoord);\n\n    // A simple & fast algorithm for getting brightness.\n    // It's inaccuracy , but good enought for this feature.\n    float _max = max(max(color.r, color.g), color.b);\n    float _min = min(min(color.r, color.g), color.b);\n    float brightness = (_max + _min) * 0.5;\n\n    if(brightness > threshold) {\n        gl_FragColor = color;\n    } else {\n        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);\n    }\n}\n",c=function(e){function t(t){void 0===t&&(t=.5),e.call(this,a,u),this.threshold=t}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={threshold:{configurable:!0}};return n.threshold.get=function(){return this.uniforms.threshold},n.threshold.set=function(e){this.uniforms.threshold=e},Object.defineProperties(t.prototype,n),t}(t.Filter),f="uniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform sampler2D bloomTexture;\nuniform float bloomScale;\nuniform float brightness;\n\nvoid main() {\n    vec4 color = texture2D(uSampler, vTextureCoord);\n    color.rgb *= brightness;\n    vec4 bloomColor = vec4(texture2D(bloomTexture, vTextureCoord).rgb, 0.0);\n    bloomColor.rgb *= bloomScale;\n    gl_FragColor = color + bloomColor;\n}\n",d=function(e){function n(n){e.call(this,a,f),"number"==typeof n&&(n={threshold:n}),n=Object.assign({threshold:.5,bloomScale:1,brightness:1,kernels:null,blur:8,quality:4,pixelSize:1,resolution:t.settings.RESOLUTION},n),this.bloomScale=n.bloomScale,this.brightness=n.brightness;var r=n.kernels,o=n.blur,i=n.quality,l=n.pixelSize,u=n.resolution;this._extractFilter=new c(n.threshold),this._extractFilter.resolution=u,this._blurFilter=r?new s(r):new s(o,i),this.pixelSize=l,this.resolution=u}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={resolution:{configurable:!0},threshold:{configurable:!0},blur:{configurable:!0},kernels:{configurable:!0},quality:{configurable:!0},pixelSize:{configurable:!0}};return n.prototype.apply=function(e,t,n,r,o){var i=e.getRenderTarget(!0);this._extractFilter.apply(e,t,i,!0,o);var l=e.getRenderTarget(!0);this._blurFilter.apply(e,i,l,!0,o),this.uniforms.bloomScale=this.bloomScale,this.uniforms.brightness=this.brightness,this.uniforms.bloomTexture=l,e.applyFilter(this,t,n,r),e.returnRenderTarget(l),e.returnRenderTarget(i)},r.resolution.get=function(){return this._resolution},r.resolution.set=function(e){this._resolution=e,this._blurFilter&&(this._blurFilter.resolution=e)},r.threshold.get=function(){return this._extractFilter.threshold},r.threshold.set=function(e){this._extractFilter.threshold=e},r.blur.get=function(){return this._blurFilter.blur},r.blur.set=function(e){this._blurFilter.blur=e},r.kernels.get=function(){return this._blurFilter.kernels},r.kernels.set=function(e){this._blurFilter.kernels=e},r.quality.get=function(){return this._blurFilter.quality},r.quality.set=function(e){this._blurFilter.quality=e},r.pixelSize.get=function(){return this._blurFilter.pixelSize},r.pixelSize.set=function(e){this._blurFilter.pixelSize=e},Object.defineProperties(n.prototype,r),n}(t.Filter),p=n,g="varying vec2 vTextureCoord;\n\nuniform vec4 filterArea;\nuniform float pixelSize;\nuniform sampler2D uSampler;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= filterArea.xy;\n    coord += filterArea.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= filterArea.zw;\n    coord /= filterArea.xy;\n\n    return coord;\n}\n\nvec2 pixelate(vec2 coord, vec2 size)\n{\n    return floor( coord / size ) * size;\n}\n\nvec2 getMod(vec2 coord, vec2 size)\n{\n    return mod( coord , size) / size;\n}\n\nfloat character(float n, vec2 p)\n{\n    p = floor(p*vec2(4.0, -4.0) + 2.5);\n    if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y)\n    {\n        if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;\n    }\n    return 0.0;\n}\n\nvoid main()\n{\n    vec2 coord = mapCoord(vTextureCoord);\n\n    // get the rounded color..\n    vec2 pixCoord = pixelate(coord, vec2(pixelSize));\n    pixCoord = unmapCoord(pixCoord);\n\n    vec4 color = texture2D(uSampler, pixCoord);\n\n    // determine the character to use\n    float gray = (color.r + color.g + color.b) / 3.0;\n\n    float n =  65536.0;             // .\n    if (gray > 0.2) n = 65600.0;    // :\n    if (gray > 0.3) n = 332772.0;   // *\n    if (gray > 0.4) n = 15255086.0; // o\n    if (gray > 0.5) n = 23385164.0; // &\n    if (gray > 0.6) n = 15252014.0; // 8\n    if (gray > 0.7) n = 13199452.0; // @\n    if (gray > 0.8) n = 11512810.0; // #\n\n    // get the mod..\n    vec2 modd = getMod(coord, vec2(pixelSize));\n\n    gl_FragColor = color * character( n, vec2(-1.0) + modd * 2.0);\n\n}",h=function(e){function t(t){void 0===t&&(t=8),e.call(this,p,g),this.size=t}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={size:{configurable:!0}};return n.size.get=function(){return this.uniforms.pixelSize},n.size.set=function(e){this.uniforms.pixelSize=e},Object.defineProperties(t.prototype,n),t}(t.Filter),m=t.filters,v=m.BlurXFilter,x=m.BlurYFilter,y=m.AlphaFilter,b=function(e){function n(n,r,o,i){var l,s;void 0===n&&(n=2),void 0===r&&(r=4),void 0===o&&(o=t.settings.RESOLUTION),void 0===i&&(i=5),e.call(this),"number"==typeof n?(l=n,s=n):n instanceof t.Point?(l=n.x,s=n.y):Array.isArray(n)&&(l=n[0],s=n[1]),this.blurXFilter=new v(l,r,o,i),this.blurYFilter=new x(s,r,o,i),this.blurYFilter.blendMode=t.BLEND_MODES.SCREEN,this.defaultFilter=new y}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={blur:{configurable:!0},blurX:{configurable:!0},blurY:{configurable:!0}};return n.prototype.apply=function(e,t,n){var r=e.getRenderTarget(!0);this.defaultFilter.apply(e,t,n),this.blurXFilter.apply(e,t,r),this.blurYFilter.apply(e,r,n),e.returnRenderTarget(r)},r.blur.get=function(){return this.blurXFilter.blur},r.blur.set=function(e){this.blurXFilter.blur=this.blurYFilter.blur=e},r.blurX.get=function(){return this.blurXFilter.blur},r.blurX.set=function(e){this.blurXFilter.blur=e},r.blurY.get=function(){return this.blurYFilter.blur},r.blurY.set=function(e){this.blurYFilter.blur=e},Object.defineProperties(n.prototype,r),n}(t.Filter),_=n,C="uniform float radius;\nuniform float strength;\nuniform vec2 center;\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoord;\n\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nuniform vec2 dimensions;\n\nvoid main()\n{\n    vec2 coord = vTextureCoord * filterArea.xy;\n    coord -= center * dimensions.xy;\n    float distance = length(coord);\n    if (distance < radius) {\n        float percent = distance / radius;\n        if (strength > 0.0) {\n            coord *= mix(1.0, smoothstep(0.0, radius / distance, percent), strength * 0.75);\n        } else {\n            coord *= mix(1.0, pow(percent, 1.0 + strength * 0.75) * radius / distance, 1.0 - percent);\n        }\n    }\n    coord += center * dimensions.xy;\n    coord /= filterArea.xy;\n    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);\n    gl_FragColor = texture2D(uSampler, clampedCoord);\n    if (coord != clampedCoord) {\n        gl_FragColor *= max(0.0, 1.0 - length(coord - clampedCoord));\n    }\n}\n",S=function(e){function t(t,n,r){e.call(this,_,C),this.center=t||[.5,.5],this.radius=n||100,this.strength=r||1}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={radius:{configurable:!0},strength:{configurable:!0},center:{configurable:!0}};return t.prototype.apply=function(e,t,n,r){this.uniforms.dimensions[0]=t.sourceFrame.width,this.uniforms.dimensions[1]=t.sourceFrame.height,e.applyFilter(this,t,n,r)},n.radius.get=function(){return this.uniforms.radius},n.radius.set=function(e){this.uniforms.radius=e},n.strength.get=function(){return this.uniforms.strength},n.strength.set=function(e){this.uniforms.strength=e},n.center.get=function(){return this.uniforms.center},n.center.set=function(e){this.uniforms.center=e},Object.defineProperties(t.prototype,n),t}(t.Filter),F=n,z="varying vec2 vTextureCoord;\nuniform sampler2D texture;\nuniform vec3 originalColor;\nuniform vec3 newColor;\nuniform float epsilon;\nvoid main(void) {\n    vec4 currentColor = texture2D(texture, vTextureCoord);\n    vec3 colorDiff = originalColor - (currentColor.rgb / max(currentColor.a, 0.0000000001));\n    float colorDistance = length(colorDiff);\n    float doReplace = step(colorDistance, epsilon);\n    gl_FragColor = vec4(mix(currentColor.rgb, (newColor + colorDiff) * currentColor.a, doReplace), currentColor.a);\n}\n",A=function(e){function n(t,n,r){void 0===t&&(t=16711680),void 0===n&&(n=0),void 0===r&&(r=.4),e.call(this,F,z),this.originalColor=t,this.newColor=n,this.epsilon=r}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={originalColor:{configurable:!0},newColor:{configurable:!0},epsilon:{configurable:!0}};return r.originalColor.set=function(e){var n=this.uniforms.originalColor;"number"==typeof e?(t.utils.hex2rgb(e,n),this._originalColor=e):(n[0]=e[0],n[1]=e[1],n[2]=e[2],this._originalColor=t.utils.rgb2hex(n))},r.originalColor.get=function(){return this._originalColor},r.newColor.set=function(e){var n=this.uniforms.newColor;"number"==typeof e?(t.utils.hex2rgb(e,n),this._newColor=e):(n[0]=e[0],n[1]=e[1],n[2]=e[2],this._newColor=t.utils.rgb2hex(n))},r.newColor.get=function(){return this._newColor},r.epsilon.set=function(e){this.uniforms.epsilon=e},r.epsilon.get=function(){return this.uniforms.epsilon},Object.defineProperties(n.prototype,r),n}(t.Filter),T=n,w="precision mediump float;\n\nvarying mediump vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec2 texelSize;\nuniform float matrix[9];\n\nvoid main(void)\n{\n   vec4 c11 = texture2D(uSampler, vTextureCoord - texelSize); // top left\n   vec4 c12 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - texelSize.y)); // top center\n   vec4 c13 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y - texelSize.y)); // top right\n\n   vec4 c21 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y)); // mid left\n   vec4 c22 = texture2D(uSampler, vTextureCoord); // mid center\n   vec4 c23 = texture2D(uSampler, vec2(vTextureCoord.x + texelSize.x, vTextureCoord.y)); // mid right\n\n   vec4 c31 = texture2D(uSampler, vec2(vTextureCoord.x - texelSize.x, vTextureCoord.y + texelSize.y)); // bottom left\n   vec4 c32 = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + texelSize.y)); // bottom center\n   vec4 c33 = texture2D(uSampler, vTextureCoord + texelSize); // bottom right\n\n   gl_FragColor =\n       c11 * matrix[0] + c12 * matrix[1] + c13 * matrix[2] +\n       c21 * matrix[3] + c22 * matrix[4] + c23 * matrix[5] +\n       c31 * matrix[6] + c32 * matrix[7] + c33 * matrix[8];\n\n   gl_FragColor.a = c22.a;\n}\n",D=function(e){function t(t,n,r){e.call(this,T,w),this.matrix=t,this.width=n,this.height=r}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={matrix:{configurable:!0},width:{configurable:!0},height:{configurable:!0}};return n.matrix.get=function(){return this.uniforms.matrix},n.matrix.set=function(e){this.uniforms.matrix=new Float32Array(e)},n.width.get=function(){return 1/this.uniforms.texelSize[0]},n.width.set=function(e){this.uniforms.texelSize[0]=1/e},n.height.get=function(){return 1/this.uniforms.texelSize[1]},n.height.set=function(e){this.uniforms.texelSize[1]=1/e},Object.defineProperties(t.prototype,n),t}(t.Filter),O=n,R="precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\n\nvoid main(void)\n{\n    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);\n\n    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n\n    if (lum < 1.00)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.75)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.50)\n    {\n        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n\n    if (lum < 0.3)\n    {\n        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0)\n        {\n            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n        }\n    }\n}\n",P=function(e){function t(){e.call(this,O,R)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t}(t.Filter),M=n,L="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\nuniform vec2 dimensions;\n\nconst float SQRT_2 = 1.414213;\n\nconst float light = 1.0;\n\nuniform float curvature;\nuniform float lineWidth;\nuniform float lineContrast;\nuniform bool verticalLine;\nuniform float noise;\nuniform float noiseSize;\n\nuniform float vignetting;\nuniform float vignettingAlpha;\nuniform float vignettingBlur;\n\nuniform float seed;\nuniform float time;\n\nfloat rand(vec2 co) {\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main(void)\n{\n    vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;\n    vec2 coord = pixelCoord / dimensions;\n\n    vec2 dir = vec2(coord - vec2(0.5, 0.5));\n\n    float _c = curvature > 0. ? curvature : 1.;\n    float k = curvature > 0. ?(length(dir * dir) * 0.25 * _c * _c + 0.935 * _c) : 1.;\n    vec2 uv = dir * k;\n\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n    vec3 rgb = gl_FragColor.rgb;\n\n\n    if (noise > 0.0 && noiseSize > 0.0)\n    {\n        pixelCoord.x = floor(pixelCoord.x / noiseSize);\n        pixelCoord.y = floor(pixelCoord.y / noiseSize);\n        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;\n        rgb += _noise * noise;\n    }\n\n    if (lineWidth > 0.0) {\n        float v = (verticalLine ? uv.x * dimensions.x : uv.y * dimensions.y) * min(1.0, 2.0 / lineWidth ) / _c;\n        float j = 1. + cos(v * 1.2 - time) * 0.5 * lineContrast;\n        rgb *= j;\n        float segment = verticalLine ? mod((dir.x + .5) * dimensions.x, 4.) : mod((dir.y + .5) * dimensions.y, 4.);\n        rgb *= 0.99 + ceil(segment) * 0.015;\n    }\n\n    if (vignetting > 0.0)\n    {\n        float outter = SQRT_2 - vignetting * SQRT_2;\n        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);\n        rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);\n    }\n\n    gl_FragColor.rgb = rgb;\n}\n",j=function(e){function t(t){e.call(this,M,L),this.time=0,this.seed=0,Object.assign(this,{curvature:1,lineWidth:1,lineContrast:.25,verticalLine:!1,noise:0,noiseSize:1,seed:0,vignetting:.3,vignettingAlpha:1,vignettingBlur:.3,time:0},t)}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={curvature:{configurable:!0},lineWidth:{configurable:!0},lineContrast:{configurable:!0},verticalLine:{configurable:!0},noise:{configurable:!0},noiseSize:{configurable:!0},vignetting:{configurable:!0},vignettingAlpha:{configurable:!0},vignettingBlur:{configurable:!0}};return t.prototype.apply=function(e,t,n,r){this.uniforms.dimensions[0]=t.sourceFrame.width,this.uniforms.dimensions[1]=t.sourceFrame.height,this.uniforms.seed=this.seed,this.uniforms.time=this.time,e.applyFilter(this,t,n,r)},n.curvature.set=function(e){this.uniforms.curvature=e},n.curvature.get=function(){return this.uniforms.curvature},n.lineWidth.set=function(e){this.uniforms.lineWidth=e},n.lineWidth.get=function(){return this.uniforms.lineWidth},n.lineContrast.set=function(e){this.uniforms.lineContrast=e},n.lineContrast.get=function(){return this.uniforms.lineContrast},n.verticalLine.set=function(e){this.uniforms.verticalLine=e},n.verticalLine.get=function(){return this.uniforms.verticalLine},n.noise.set=function(e){this.uniforms.noise=e},n.noise.get=function(){return this.uniforms.noise},n.noiseSize.set=function(e){this.uniforms.noiseSize=e},n.noiseSize.get=function(){return this.uniforms.noiseSize},n.vignetting.set=function(e){this.uniforms.vignetting=e},n.vignetting.get=function(){return this.uniforms.vignetting},n.vignettingAlpha.set=function(e){this.uniforms.vignettingAlpha=e},n.vignettingAlpha.get=function(){return this.uniforms.vignettingAlpha},n.vignettingBlur.set=function(e){this.uniforms.vignettingBlur=e},n.vignettingBlur.get=function(){return this.uniforms.vignettingBlur},Object.defineProperties(t.prototype,n),t}(t.Filter),I=n,k="precision mediump float;\n\nvarying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform vec4 filterArea;\nuniform sampler2D uSampler;\n\nuniform float angle;\nuniform float scale;\n\nfloat pattern()\n{\n   float s = sin(angle), c = cos(angle);\n   vec2 tex = vTextureCoord * filterArea.xy;\n   vec2 point = vec2(\n       c * tex.x - s * tex.y,\n       s * tex.x + c * tex.y\n   ) * scale;\n   return (sin(point.x) * sin(point.y)) * 4.0;\n}\n\nvoid main()\n{\n   vec4 color = texture2D(uSampler, vTextureCoord);\n   float average = (color.r + color.g + color.b) / 3.0;\n   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);\n}\n",E=function(e){function t(t,n){void 0===t&&(t=1),void 0===n&&(n=5),e.call(this,I,k),this.scale=t,this.angle=n}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={scale:{configurable:!0},angle:{configurable:!0}};return n.scale.get=function(){return this.uniforms.scale},n.scale.set=function(e){this.uniforms.scale=e},n.angle.get=function(){return this.uniforms.angle},n.angle.set=function(e){this.uniforms.angle=e},Object.defineProperties(t.prototype,n),t}(t.Filter),B=n,X="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform float alpha;\nuniform vec3 color;\nvoid main(void){\n    vec4 sample = texture2D(uSampler, vTextureCoord);\n\n    // Un-premultiply alpha before applying the color\n    if (sample.a > 0.0) {\n        sample.rgb /= sample.a;\n    }\n\n    // Premultiply alpha again\n    sample.rgb = color.rgb * sample.a;\n\n    // alpha user alpha\n    sample *= alpha;\n\n    gl_FragColor = sample;\n}",N=function(e){function n(n,r,o,i,l){void 0===n&&(n=45),void 0===r&&(r=5),void 0===o&&(o=2),void 0===i&&(i=0),void 0===l&&(l=.5),e.call(this),this.tintFilter=new t.Filter(B,X),this.blurFilter=new t.filters.BlurFilter,this.blurFilter.blur=o,this.targetTransform=new t.Matrix,this.rotation=n,this.padding=r,this.distance=r,this.alpha=l,this.color=i}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={distance:{configurable:!0},rotation:{configurable:!0},blur:{configurable:!0},alpha:{configurable:!0},color:{configurable:!0}};return n.prototype.apply=function(e,t,n,r){var o=e.getRenderTarget();o.transform=this.targetTransform,this.tintFilter.apply(e,t,o,!0),this.blurFilter.apply(e,o,n),e.applyFilter(this,t,n,r),o.transform=null,e.returnRenderTarget(o)},n.prototype._updatePadding=function(){this.padding=this.distance+2*this.blur},n.prototype._updateTargetTransform=function(){this.targetTransform.tx=this.distance*Math.cos(this.angle),this.targetTransform.ty=this.distance*Math.sin(this.angle)},r.distance.get=function(){return this._distance},r.distance.set=function(e){this._distance=e,this._updatePadding(),this._updateTargetTransform()},r.rotation.get=function(){return this.angle/t.DEG_TO_RAD},r.rotation.set=function(e){this.angle=e*t.DEG_TO_RAD,this._updateTargetTransform()},r.blur.get=function(){return this.blurFilter.blur},r.blur.set=function(e){this.blurFilter.blur=e,this._updatePadding()},r.alpha.get=function(){return this.tintFilter.uniforms.alpha},r.alpha.set=function(e){this.tintFilter.uniforms.alpha=e},r.color.get=function(){return t.utils.rgb2hex(this.tintFilter.uniforms.color)},r.color.set=function(e){t.utils.hex2rgb(e,this.tintFilter.uniforms.color)},Object.defineProperties(n.prototype,r),n}(t.Filter),K=n,q="precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float strength;\nuniform vec4 filterArea;\n\n\nvoid main(void)\n{\n\tvec2 onePixel = vec2(1.0 / filterArea);\n\n\tvec4 color;\n\n\tcolor.rgb = vec3(0.5);\n\n\tcolor -= texture2D(uSampler, vTextureCoord - onePixel) * strength;\n\tcolor += texture2D(uSampler, vTextureCoord + onePixel) * strength;\n\n\tcolor.rgb = vec3((color.r + color.g + color.b) / 3.0);\n\n\tfloat alpha = texture2D(uSampler, vTextureCoord).a;\n\n\tgl_FragColor = vec4(color.rgb * alpha, alpha);\n}\n",G=function(e){function t(t){void 0===t&&(t=5),e.call(this,K,q),this.strength=t}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={strength:{configurable:!0}};return n.strength.get=function(){return this.uniforms.strength},n.strength.set=function(e){this.uniforms.strength=e},Object.defineProperties(t.prototype,n),t}(t.Filter),W=n,Y="// precision highp float;\n\nvarying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nuniform vec2 dimensions;\nuniform float aspect;\n\nuniform sampler2D displacementMap;\nuniform float offset;\nuniform float sinDir;\nuniform float cosDir;\nuniform int fillMode;\n\nuniform float seed;\nuniform vec2 red;\nuniform vec2 green;\nuniform vec2 blue;\n\nconst int TRANSPARENT = 0;\nconst int ORIGINAL = 1;\nconst int LOOP = 2;\nconst int CLAMP = 3;\nconst int MIRROR = 4;\n\nvoid main(void)\n{\n    vec2 coord = (vTextureCoord * filterArea.xy) / dimensions;\n\n    if (coord.x > 1.0 || coord.y > 1.0) {\n        return;\n    }\n\n    float cx = coord.x - 0.5;\n    float cy = (coord.y - 0.5) * aspect;\n    float ny = (-sinDir * cx + cosDir * cy) / aspect + 0.5;\n\n    // displacementMap: repeat\n    // ny = ny > 1.0 ? ny - 1.0 : (ny < 0.0 ? 1.0 + ny : ny);\n\n    // displacementMap: mirror\n    ny = ny > 1.0 ? 2.0 - ny : (ny < 0.0 ? -ny : ny);\n\n    vec4 dc = texture2D(displacementMap, vec2(0.5, ny));\n\n    float displacement = (dc.r - dc.g) * (offset / filterArea.x);\n\n    coord = vTextureCoord + vec2(cosDir * displacement, sinDir * displacement * aspect);\n\n    if (fillMode == CLAMP) {\n        coord = clamp(coord, filterClamp.xy, filterClamp.zw);\n    } else {\n        if( coord.x > filterClamp.z ) {\n            if (fillMode == ORIGINAL) {\n                gl_FragColor = texture2D(uSampler, vTextureCoord);\n                return;\n            } else if (fillMode == LOOP) {\n                coord.x -= filterClamp.z;\n            } else if (fillMode == MIRROR) {\n                coord.x = filterClamp.z * 2.0 - coord.x;\n            } else {\n                gl_FragColor = vec4(0., 0., 0., 0.);\n                return;\n            }\n        } else if( coord.x < filterClamp.x ) {\n            if (fillMode == ORIGINAL) {\n                gl_FragColor = texture2D(uSampler, vTextureCoord);\n                return;\n            } else if (fillMode == LOOP) {\n                coord.x += filterClamp.z;\n            } else if (fillMode == MIRROR) {\n                coord.x *= -filterClamp.z;\n            } else {\n                gl_FragColor = vec4(0., 0., 0., 0.);\n                return;\n            }\n        }\n\n        if( coord.y > filterClamp.w ) {\n            if (fillMode == ORIGINAL) {\n                gl_FragColor = texture2D(uSampler, vTextureCoord);\n                return;\n            } else if (fillMode == LOOP) {\n                coord.y -= filterClamp.w;\n            } else if (fillMode == MIRROR) {\n                coord.y = filterClamp.w * 2.0 - coord.y;\n            } else {\n                gl_FragColor = vec4(0., 0., 0., 0.);\n                return;\n            }\n        } else if( coord.y < filterClamp.y ) {\n            if (fillMode == ORIGINAL) {\n                gl_FragColor = texture2D(uSampler, vTextureCoord);\n                return;\n            } else if (fillMode == LOOP) {\n                coord.y += filterClamp.w;\n            } else if (fillMode == MIRROR) {\n                coord.y *= -filterClamp.w;\n            } else {\n                gl_FragColor = vec4(0., 0., 0., 0.);\n                return;\n            }\n        }\n    }\n\n    gl_FragColor.r = texture2D(uSampler, coord + red * (1.0 - seed * 0.4) / filterArea.xy).r;\n    gl_FragColor.g = texture2D(uSampler, coord + green * (1.0 - seed * 0.3) / filterArea.xy).g;\n    gl_FragColor.b = texture2D(uSampler, coord + blue * (1.0 - seed * 0.2) / filterArea.xy).b;\n    gl_FragColor.a = texture2D(uSampler, coord).a;\n}\n",Z=function(e){function n(n){void 0===n&&(n={}),e.call(this,W,Y),n=Object.assign({slices:5,offset:100,direction:0,fillMode:0,average:!1,seed:0,red:[0,0],green:[0,0],blue:[0,0],minSize:8,sampleSize:512},n),this.direction=n.direction,this.red=n.red,this.green=n.green,this.blue=n.blue,this.offset=n.offset,this.fillMode=n.fillMode,this.average=n.average,this.seed=n.seed,this.minSize=n.minSize,this.sampleSize=n.sampleSize,this._canvas=document.createElement("canvas"),this._canvas.width=4,this._canvas.height=this.sampleSize,this.texture=t.Texture.fromCanvas(this._canvas,t.SCALE_MODES.NEAREST),this._slices=0,this.slices=n.slices}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={sizes:{configurable:!0},offsets:{configurable:!0},slices:{configurable:!0},direction:{configurable:!0},red:{configurable:!0},green:{configurable:!0},blue:{configurable:!0}};return n.prototype.apply=function(e,t,n,r){var o=t.sourceFrame.width,i=t.sourceFrame.height;this.uniforms.dimensions[0]=o,this.uniforms.dimensions[1]=i,this.uniforms.aspect=i/o,this.uniforms.seed=this.seed,this.uniforms.offset=this.offset,this.uniforms.fillMode=this.fillMode,e.applyFilter(this,t,n,r)},n.prototype._randomizeSizes=function(){var e=this._sizes,t=this._slices-1,n=this.sampleSize,r=Math.min(this.minSize/n,.9/this._slices);if(this.average){for(var o=this._slices,i=1,l=0;l<t;l++){var s=i/(o-l),a=Math.max(s*(1-.6*Math.random()),r);e[l]=a,i-=a}e[t]=i}else{for(var u=1,c=Math.sqrt(1/this._slices),f=0;f<t;f++){var d=Math.max(c*u*Math.random(),r);e[f]=d,u-=d}e[t]=u}this.shuffle()},n.prototype.shuffle=function(){for(var e=this._sizes,t=this._slices-1;t>0;t--){var n=Math.random()*t>>0,r=e[t];e[t]=e[n],e[n]=r}},n.prototype._randomizeOffsets=function(){for(var e=0;e<this._slices;e++)this._offsets[e]=Math.random()*(Math.random()<.5?-1:1)},n.prototype.refresh=function(){this._randomizeSizes(),this._randomizeOffsets(),this.redraw()},n.prototype.redraw=function(){var e,t=this.sampleSize,n=this.texture,r=this._canvas.getContext("2d");r.clearRect(0,0,8,t);for(var o=0,i=0;i<this._slices;i++){e=Math.floor(256*this._offsets[i]);var l=this._sizes[i]*t,s=e>0?e:0,a=e<0?-e:0;r.fillStyle="rgba("+s+", "+a+", 0, 1)",r.fillRect(0,o>>0,t,l+1>>0),o+=l}n._updateID++,n.baseTexture.emit("update",n.baseTexture),this.uniforms.displacementMap=n},r.sizes.set=function(e){for(var t=Math.min(this._slices,e.length),n=0;n<t;n++)this._sizes[n]=e[n]},r.sizes.get=function(){return this._sizes},r.offsets.set=function(e){for(var t=Math.min(this._slices,e.length),n=0;n<t;n++)this._offsets[n]=e[n]},r.offsets.get=function(){return this._offsets},r.slices.get=function(){return this._slices},r.slices.set=function(e){this._slices!==e&&(this._slices=e,this.uniforms.slices=e,this._sizes=this.uniforms.slicesWidth=new Float32Array(e),this._offsets=this.uniforms.slicesOffset=new Float32Array(e),this.refresh())},r.direction.get=function(){return this._direction},r.direction.set=function(e){if(this._direction!==e){this._direction=e;var n=e*t.DEG_TO_RAD;this.uniforms.sinDir=Math.sin(n),this.uniforms.cosDir=Math.cos(n)}},r.red.get=function(){return this.uniforms.red},r.red.set=function(e){this.uniforms.red=e},r.green.get=function(){return this.uniforms.green},r.green.set=function(e){this.uniforms.green=e},r.blue.get=function(){return this.uniforms.blue},r.blue.set=function(e){this.uniforms.blue=e},n.prototype.destroy=function(){this.texture.destroy(!0),this.texture=null,this._canvas=null,this.red=null,this.green=null,this.blue=null,this._sizes=null,this._offsets=null},Object.defineProperties(n.prototype,r),n}(t.Filter);Z.TRANSPARENT=0,Z.ORIGINAL=1,Z.LOOP=2,Z.CLAMP=3,Z.MIRROR=4;var Q=n,U="varying vec2 vTextureCoord;\nvarying vec4 vColor;\n\nuniform sampler2D uSampler;\n\nuniform float distance;\nuniform float outerStrength;\nuniform float innerStrength;\nuniform vec4 glowColor;\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nconst float PI = 3.14159265358979323846264;\n\nvoid main(void) {\n    vec2 px = vec2(1.0 / filterArea.x, 1.0 / filterArea.y);\n    vec4 ownColor = texture2D(uSampler, vTextureCoord);\n    vec4 curColor;\n    float totalAlpha = 0.0;\n    float maxTotalAlpha = 0.0;\n    float cosAngle;\n    float sinAngle;\n    vec2 displaced;\n    for (float angle = 0.0; angle <= PI * 2.0; angle += %QUALITY_DIST%) {\n       cosAngle = cos(angle);\n       sinAngle = sin(angle);\n       for (float curDistance = 1.0; curDistance <= %DIST%; curDistance++) {\n           displaced.x = vTextureCoord.x + cosAngle * curDistance * px.x;\n           displaced.y = vTextureCoord.y + sinAngle * curDistance * px.y;\n           curColor = texture2D(uSampler, clamp(displaced, filterClamp.xy, filterClamp.zw));\n           totalAlpha += (distance - curDistance) * curColor.a;\n           maxTotalAlpha += (distance - curDistance);\n       }\n    }\n    maxTotalAlpha = max(maxTotalAlpha, 0.0001);\n\n    ownColor.a = max(ownColor.a, 0.0001);\n    ownColor.rgb = ownColor.rgb / ownColor.a;\n    float outerGlowAlpha = (totalAlpha / maxTotalAlpha)  * outerStrength * (1. - ownColor.a);\n    float innerGlowAlpha = ((maxTotalAlpha - totalAlpha) / maxTotalAlpha) * innerStrength * ownColor.a;\n    float resultAlpha = (ownColor.a + outerGlowAlpha);\n    gl_FragColor = vec4(mix(mix(ownColor.rgb, glowColor.rgb, innerGlowAlpha / ownColor.a), glowColor.rgb, outerGlowAlpha / resultAlpha) * resultAlpha, resultAlpha);\n}\n",V=function(e){function n(t,n,r,o,i){void 0===t&&(t=10),void 0===n&&(n=4),void 0===r&&(r=0),void 0===o&&(o=16777215),void 0===i&&(i=.1),e.call(this,Q,U.replace(/%QUALITY_DIST%/gi,""+(1/i/t).toFixed(7)).replace(/%DIST%/gi,""+t.toFixed(7))),this.uniforms.glowColor=new Float32Array([0,0,0,1]),this.distance=t,this.color=o,this.outerStrength=n,this.innerStrength=r}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={color:{configurable:!0},distance:{configurable:!0},outerStrength:{configurable:!0},innerStrength:{configurable:!0}};return r.color.get=function(){return t.utils.rgb2hex(this.uniforms.glowColor)},r.color.set=function(e){t.utils.hex2rgb(e,this.uniforms.glowColor)},r.distance.get=function(){return this.uniforms.distance},r.distance.set=function(e){this.uniforms.distance=e},r.outerStrength.get=function(){return this.uniforms.outerStrength},r.outerStrength.set=function(e){this.uniforms.outerStrength=e},r.innerStrength.get=function(){return this.uniforms.innerStrength},r.innerStrength.set=function(e){this.uniforms.innerStrength=e},Object.defineProperties(n.prototype,r),n}(t.Filter),H=n,$="vec3 mod289(vec3 x)\n{\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nvec4 mod289(vec4 x)\n{\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nvec4 permute(vec4 x)\n{\n    return mod289(((x * 34.0) + 1.0) * x);\n}\nvec4 taylorInvSqrt(vec4 r)\n{\n    return 1.79284291400159 - 0.85373472095314 * r;\n}\nvec3 fade(vec3 t)\n{\n    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\n}\n// Classic Perlin noise, periodic variant\nfloat pnoise(vec3 P, vec3 rep)\n{\n    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\n    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\n    Pi0 = mod289(Pi0);\n    Pi1 = mod289(Pi1);\n    vec3 Pf0 = fract(P); // Fractional part for interpolation\n    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n    vec4 iy = vec4(Pi0.yy, Pi1.yy);\n    vec4 iz0 = Pi0.zzzz;\n    vec4 iz1 = Pi1.zzzz;\n    vec4 ixy = permute(permute(ix) + iy);\n    vec4 ixy0 = permute(ixy + iz0);\n    vec4 ixy1 = permute(ixy + iz1);\n    vec4 gx0 = ixy0 * (1.0 / 7.0);\n    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n    gx0 = fract(gx0);\n    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n    vec4 sz0 = step(gz0, vec4(0.0));\n    gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n    gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n    vec4 gx1 = ixy1 * (1.0 / 7.0);\n    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n    gx1 = fract(gx1);\n    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n    vec4 sz1 = step(gz1, vec4(0.0));\n    gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n    gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\n    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\n    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\n    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\n    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\n    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\n    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\n    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\n    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n    g000 *= norm0.x;\n    g010 *= norm0.y;\n    g100 *= norm0.z;\n    g110 *= norm0.w;\n    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n    g001 *= norm1.x;\n    g011 *= norm1.y;\n    g101 *= norm1.z;\n    g111 *= norm1.w;\n    float n000 = dot(g000, Pf0);\n    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n    float n111 = dot(g111, Pf1);\n    vec3 fade_xyz = fade(Pf0);\n    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n    return 2.2 * n_xyz;\n}\nfloat turb(vec3 P, vec3 rep, float lacunarity, float gain)\n{\n    float sum = 0.0;\n    float sc = 1.0;\n    float totalgain = 1.0;\n    for (float i = 0.0; i < 6.0; i++)\n    {\n        sum += totalgain * pnoise(P * sc, rep);\n        sc *= lacunarity;\n        totalgain *= gain;\n    }\n    return abs(sum);\n}\n",J="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec2 dimensions;\n\nuniform vec2 light;\nuniform bool parallel;\nuniform float aspect;\n\nuniform float gain;\nuniform float lacunarity;\nuniform float time;\n\n${perlin}\n\nvoid main(void) {\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n    vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;\n\n    float d;\n\n    if (parallel) {\n        float _cos = light.x;\n        float _sin = light.y;\n        d = (_cos * coord.x) + (_sin * coord.y * aspect);\n    } else {\n        float dx = coord.x - light.x / dimensions.x;\n        float dy = (coord.y - light.y / dimensions.y) * aspect;\n        float dis = sqrt(dx * dx + dy * dy) + 0.00001;\n        d = dy / dis;\n    }\n\n    vec3 dir = vec3(d, d, 0.0);\n\n    float noise = turb(dir + vec3(time, 0.0, 62.1 + time) * 0.05, vec3(480.0, 320.0, 480.0), lacunarity, gain);\n    noise = mix(noise, 0.0, 0.3);\n    //fade vertically.\n    vec4 mist = vec4(noise, noise, noise, 1.0) * (1.0 - coord.y);\n    mist.a = 1.0;\n    gl_FragColor += mist;\n}\n",ee=function(e){function n(n){e.call(this,H,J.replace("${perlin}",$)),"number"==typeof n&&(console.warn("GodrayFilter now uses options instead of (angle, gain, lacunarity, time)"),n={angle:n},void 0!==arguments[1]&&(n.gain=arguments[1]),void 0!==arguments[2]&&(n.lacunarity=arguments[2]),void 0!==arguments[3]&&(n.time=arguments[3])),n=Object.assign({angle:30,gain:.5,lacunarity:2.5,time:0,parallel:!0,center:[0,0]},n),this._angleLight=new t.Point,this.angle=n.angle,this.gain=n.gain,this.lacunarity=n.lacunarity,this.parallel=n.parallel,this.center=n.center,this.time=n.time}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={angle:{configurable:!0},gain:{configurable:!0},lacunarity:{configurable:!0}};return n.prototype.apply=function(e,t,n,r){var o=t.sourceFrame,i=o.width,l=o.height;this.uniforms.light=this.parallel?this._angleLight:this.center,this.uniforms.parallel=this.parallel,this.uniforms.dimensions[0]=i,this.uniforms.dimensions[1]=l,this.uniforms.aspect=l/i,this.uniforms.time=this.time,e.applyFilter(this,t,n,r)},r.angle.get=function(){return this._angle},r.angle.set=function(e){this._angle=e;var n=e*t.DEG_TO_RAD;this._angleLight.x=Math.cos(n),this._angleLight.y=Math.sin(n)},r.gain.get=function(){return this.uniforms.gain},r.gain.set=function(e){this.uniforms.gain=e},r.lacunarity.get=function(){return this.uniforms.lacunarity},r.lacunarity.set=function(e){this.uniforms.lacunarity=e},Object.defineProperties(n.prototype,r),n}(t.Filter),te=n,ne="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform vec2 uVelocity;\nuniform int uKernelSize;\nuniform float uOffset;\n\nconst int MAX_KERNEL_SIZE = 2048;\nconst int ITERATION = MAX_KERNEL_SIZE - 1;\n\nvec2 velocity = uVelocity / filterArea.xy;\n\n// float kernelSize = min(float(uKernelSize), float(MAX_KERNELSIZE));\n\n// In real use-case , uKernelSize < MAX_KERNELSIZE almost always.\n// So use uKernelSize directly.\nfloat kernelSize = float(uKernelSize);\nfloat k = kernelSize - 1.0;\nfloat offset = -uOffset / length(uVelocity) - 0.5;\n\nvoid main(void)\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n\n    if (uKernelSize == 0)\n    {\n        return;\n    }\n\n    for(int i = 0; i < ITERATION; i++) {\n        if (i == int(k)) {\n            break;\n        }\n        vec2 bias = velocity * (float(i) / k + offset);\n        gl_FragColor += texture2D(uSampler, vTextureCoord + bias);\n    }\n    gl_FragColor /= kernelSize;\n}\n",re=function(e){function n(n,r,o){void 0===n&&(n=[0,0]),void 0===r&&(r=5),void 0===o&&(o=0),e.call(this,te,ne),this._velocity=new t.Point(0,0),this.velocity=n,this.kernelSize=r,this.offset=o}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={velocity:{configurable:!0},offset:{configurable:!0}};return n.prototype.apply=function(e,t,n,r){var o=this.velocity,i=o.x,l=o.y;this.uniforms.uKernelSize=0!==i||0!==l?this.kernelSize:0,e.applyFilter(this,t,n,r)},r.velocity.set=function(e){Array.isArray(e)?(this._velocity.x=e[0],this._velocity.y=e[1]):e instanceof t.Point&&(this._velocity.x=e.x,this._velocity.y=e.y),this.uniforms.uVelocity[0]=this._velocity.x,this.uniforms.uVelocity[1]=this._velocity.y},r.velocity.get=function(){return this._velocity},r.offset.set=function(e){this.uniforms.uOffset=e},r.offset.get=function(){return this.uniforms.uOffset},Object.defineProperties(n.prototype,r),n}(t.Filter),oe=n,ie="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform float epsilon;\n\nconst int MAX_COLORS = %maxColors%;\n\nuniform vec3 originalColors[MAX_COLORS];\nuniform vec3 targetColors[MAX_COLORS];\n\nvoid main(void)\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n\n    float alpha = gl_FragColor.a;\n    if (alpha < 0.0001)\n    {\n      return;\n    }\n\n    vec3 color = gl_FragColor.rgb / alpha;\n\n    for(int i = 0; i < MAX_COLORS; i++)\n    {\n      vec3 origColor = originalColors[i];\n      if (origColor.r < 0.0)\n      {\n        break;\n      }\n      vec3 colorDiff = origColor - color;\n      if (length(colorDiff) < epsilon)\n      {\n        vec3 targetColor = targetColors[i];\n        gl_FragColor = vec4((targetColor + colorDiff) * alpha, alpha);\n        return;\n      }\n    }\n}\n",le=function(e){function n(t,n,r){void 0===n&&(n=.05),void 0===r&&(r=null),r=r||t.length,e.call(this,oe,ie.replace(/%maxColors%/g,r)),this.epsilon=n,this._maxColors=r,this._replacements=null,this.uniforms.originalColors=new Float32Array(3*r),this.uniforms.targetColors=new Float32Array(3*r),this.replacements=t}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={replacements:{configurable:!0},maxColors:{configurable:!0},epsilon:{configurable:!0}};return r.replacements.set=function(e){var n=this.uniforms.originalColors,r=this.uniforms.targetColors,o=e.length;if(o>this._maxColors)throw"Length of replacements ("+o+") exceeds the maximum colors length ("+this._maxColors+")";n[3*o]=-1;for(var i=0;i<o;i++){var l=e[i],s=l[0];"number"==typeof s?s=t.utils.hex2rgb(s):l[0]=t.utils.rgb2hex(s),n[3*i]=s[0],n[3*i+1]=s[1],n[3*i+2]=s[2];var a=l[1];"number"==typeof a?a=t.utils.hex2rgb(a):l[1]=t.utils.rgb2hex(a),r[3*i]=a[0],r[3*i+1]=a[1],r[3*i+2]=a[2]}this._replacements=e},r.replacements.get=function(){return this._replacements},n.prototype.refresh=function(){this.replacements=this._replacements},r.maxColors.get=function(){return this._maxColors},r.epsilon.set=function(e){this.uniforms.epsilon=e},r.epsilon.get=function(){return this.uniforms.epsilon},Object.defineProperties(n.prototype,r),n}(t.Filter),se=n,ae="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec2 dimensions;\n\nuniform float sepia;\nuniform float noise;\nuniform float noiseSize;\nuniform float scratch;\nuniform float scratchDensity;\nuniform float scratchWidth;\nuniform float vignetting;\nuniform float vignettingAlpha;\nuniform float vignettingBlur;\nuniform float seed;\n\nconst float SQRT_2 = 1.414213;\nconst vec3 SEPIA_RGB = vec3(112.0 / 255.0, 66.0 / 255.0, 20.0 / 255.0);\n\nfloat rand(vec2 co) {\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvec3 Overlay(vec3 src, vec3 dst)\n{\n    // if (dst <= 0.5) then: 2 * src * dst\n    // if (dst > 0.5) then: 1 - 2 * (1 - dst) * (1 - src)\n    return vec3((dst.x <= 0.5) ? (2.0 * src.x * dst.x) : (1.0 - 2.0 * (1.0 - dst.x) * (1.0 - src.x)),\n                (dst.y <= 0.5) ? (2.0 * src.y * dst.y) : (1.0 - 2.0 * (1.0 - dst.y) * (1.0 - src.y)),\n                (dst.z <= 0.5) ? (2.0 * src.z * dst.z) : (1.0 - 2.0 * (1.0 - dst.z) * (1.0 - src.z)));\n}\n\n\nvoid main()\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n    vec3 color = gl_FragColor.rgb;\n\n    if (sepia > 0.0)\n    {\n        float gray = (color.x + color.y + color.z) / 3.0;\n        vec3 grayscale = vec3(gray);\n\n        color = Overlay(SEPIA_RGB, grayscale);\n\n        color = grayscale + sepia * (color - grayscale);\n    }\n\n    vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;\n\n    if (vignetting > 0.0)\n    {\n        float outter = SQRT_2 - vignetting * SQRT_2;\n        vec2 dir = vec2(vec2(0.5, 0.5) - coord);\n        dir.y *= dimensions.y / dimensions.x;\n        float darker = clamp((outter - length(dir) * SQRT_2) / ( 0.00001 + vignettingBlur * SQRT_2), 0.0, 1.0);\n        color.rgb *= darker + (1.0 - darker) * (1.0 - vignettingAlpha);\n    }\n\n    if (scratchDensity > seed && scratch != 0.0)\n    {\n        float phase = seed * 256.0;\n        float s = mod(floor(phase), 2.0);\n        float dist = 1.0 / scratchDensity;\n        float d = distance(coord, vec2(seed * dist, abs(s - seed * dist)));\n        if (d < seed * 0.6 + 0.4)\n        {\n            highp float period = scratchDensity * 10.0;\n\n            float xx = coord.x * period + phase;\n            float aa = abs(mod(xx, 0.5) * 4.0);\n            float bb = mod(floor(xx / 0.5), 2.0);\n            float yy = (1.0 - bb) * aa + bb * (2.0 - aa);\n\n            float kk = 2.0 * period;\n            float dw = scratchWidth / dimensions.x * (0.75 + seed);\n            float dh = dw * kk;\n\n            float tine = (yy - (2.0 - dh));\n\n            if (tine > 0.0) {\n                float _sign = sign(scratch);\n\n                tine = s * tine / period + scratch + 0.1;\n                tine = clamp(tine + 1.0, 0.5 + _sign * 0.5, 1.5 + _sign * 0.5);\n\n                color.rgb *= tine;\n            }\n        }\n    }\n\n    if (noise > 0.0 && noiseSize > 0.0)\n    {\n        vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;\n        pixelCoord.x = floor(pixelCoord.x / noiseSize);\n        pixelCoord.y = floor(pixelCoord.y / noiseSize);\n        // vec2 d = pixelCoord * noiseSize * vec2(1024.0 + seed * 512.0, 1024.0 - seed * 512.0);\n        // float _noise = snoise(d) * 0.5;\n        float _noise = rand(pixelCoord * noiseSize * seed) - 0.5;\n        color += _noise * noise;\n    }\n\n    gl_FragColor.rgb = color;\n}\n",ue=function(e){function t(t,n){void 0===n&&(n=0),e.call(this,se,ae),"number"==typeof t?(this.seed=t,t=null):this.seed=n,Object.assign(this,{sepia:.3,noise:.3,noiseSize:1,scratch:.5,scratchDensity:.3,scratchWidth:1,vignetting:.3,vignettingAlpha:1,vignettingBlur:.3},t)}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={sepia:{configurable:!0},noise:{configurable:!0},noiseSize:{configurable:!0},scratch:{configurable:!0},scratchDensity:{configurable:!0},scratchWidth:{configurable:!0},vignetting:{configurable:!0},vignettingAlpha:{configurable:!0},vignettingBlur:{configurable:!0}};return t.prototype.apply=function(e,t,n,r){this.uniforms.dimensions[0]=t.sourceFrame.width,this.uniforms.dimensions[1]=t.sourceFrame.height,this.uniforms.seed=this.seed,e.applyFilter(this,t,n,r)},n.sepia.set=function(e){this.uniforms.sepia=e},n.sepia.get=function(){return this.uniforms.sepia},n.noise.set=function(e){this.uniforms.noise=e},n.noise.get=function(){return this.uniforms.noise},n.noiseSize.set=function(e){this.uniforms.noiseSize=e},n.noiseSize.get=function(){return this.uniforms.noiseSize},n.scratch.set=function(e){this.uniforms.scratch=e},n.scratch.get=function(){return this.uniforms.scratch},n.scratchDensity.set=function(e){this.uniforms.scratchDensity=e},n.scratchDensity.get=function(){return this.uniforms.scratchDensity},n.scratchWidth.set=function(e){this.uniforms.scratchWidth=e},n.scratchWidth.get=function(){return this.uniforms.scratchWidth},n.vignetting.set=function(e){this.uniforms.vignetting=e},n.vignetting.get=function(){return this.uniforms.vignetting},n.vignettingAlpha.set=function(e){this.uniforms.vignettingAlpha=e},n.vignettingAlpha.get=function(){return this.uniforms.vignettingAlpha},n.vignettingBlur.set=function(e){this.uniforms.vignettingBlur=e},n.vignettingBlur.get=function(){return this.uniforms.vignettingBlur},Object.defineProperties(t.prototype,n),t}(t.Filter),ce=n,fe="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec2 thickness;\nuniform vec4 outlineColor;\nuniform vec4 filterClamp;\n\nconst float DOUBLE_PI = 3.14159265358979323846264 * 2.;\n\nvoid main(void) {\n    vec4 ownColor = texture2D(uSampler, vTextureCoord);\n    vec4 curColor;\n    float maxAlpha = 0.;\n    vec2 displaced;\n    for (float angle = 0.; angle <= DOUBLE_PI; angle += ${angleStep}) {\n        displaced.x = vTextureCoord.x + thickness.x * cos(angle);\n        displaced.y = vTextureCoord.y + thickness.y * sin(angle);\n        curColor = texture2D(uSampler, clamp(displaced, filterClamp.xy, filterClamp.zw));\n        maxAlpha = max(maxAlpha, curColor.a);\n    }\n    float resultAlpha = max(maxAlpha, ownColor.a);\n    gl_FragColor = vec4((ownColor.rgb + outlineColor.rgb * (1. - ownColor.a)) * resultAlpha, resultAlpha);\n}\n",de=function(e){function n(t,r,o){void 0===t&&(t=1),void 0===r&&(r=0),void 0===o&&(o=.1);var i=Math.max(o*n.MAX_SAMPLES,n.MIN_SAMPLES),l=(2*Math.PI/i).toFixed(7);e.call(this,ce,fe.replace(/\$\{angleStep\}/,l)),this.uniforms.thickness=new Float32Array([0,0]),this.thickness=t,this.uniforms.outlineColor=new Float32Array([0,0,0,1]),this.color=r,this.quality=o}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={color:{configurable:!0}};return n.prototype.apply=function(e,t,n,r){this.uniforms.thickness[0]=this.thickness/t.size.width,this.uniforms.thickness[1]=this.thickness/t.size.height,e.applyFilter(this,t,n,r)},r.color.get=function(){return t.utils.rgb2hex(this.uniforms.outlineColor)},r.color.set=function(e){t.utils.hex2rgb(e,this.uniforms.outlineColor)},Object.defineProperties(n.prototype,r),n}(t.Filter);de.MIN_SAMPLES=1,de.MAX_SAMPLES=100;var pe=n,ge="precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform vec2 size;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= filterArea.xy;\n    coord += filterArea.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= filterArea.zw;\n    coord /= filterArea.xy;\n\n    return coord;\n}\n\nvec2 pixelate(vec2 coord, vec2 size)\n{\n\treturn floor( coord / size ) * size;\n}\n\nvoid main(void)\n{\n    vec2 coord = mapCoord(vTextureCoord);\n\n    coord = pixelate(coord, size);\n\n    coord = unmapCoord(coord);\n\n    gl_FragColor = texture2D(uSampler, coord);\n}\n",he=function(e){function t(t){void 0===t&&(t=10),e.call(this,pe,ge),this.size=t}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={size:{configurable:!0}};return n.size.get=function(){return this.uniforms.size},n.size.set=function(e){"number"==typeof e&&(e=[e,e]),this.uniforms.size=e},Object.defineProperties(t.prototype,n),t}(t.Filter),me=n,ve="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform float uRadian;\nuniform vec2 uCenter;\nuniform float uRadius;\nuniform int uKernelSize;\n\nconst int MAX_KERNEL_SIZE = 2048;\nconst int ITERATION = MAX_KERNEL_SIZE - 1;\n\n// float kernelSize = min(float(uKernelSize), float(MAX_KERNELSIZE));\n\n// In real use-case , uKernelSize < MAX_KERNELSIZE almost always.\n// So use uKernelSize directly.\nfloat kernelSize = float(uKernelSize);\nfloat k = kernelSize - 1.0;\n\n\nvec2 center = uCenter.xy / filterArea.xy;\nfloat aspect = filterArea.y / filterArea.x;\n\nfloat gradient = uRadius / filterArea.x * 0.3;\nfloat radius = uRadius / filterArea.x - gradient * 0.5;\n\nvoid main(void)\n{\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n\n    if (uKernelSize == 0)\n    {\n        return;\n    }\n\n    vec2 coord = vTextureCoord;\n\n    vec2 dir = vec2(center - coord);\n    float dist = length(vec2(dir.x, dir.y * aspect));\n\n    float radianStep;\n\n    if (radius >= 0.0 && dist > radius) {\n        float delta = dist - radius;\n        float gap = gradient;\n        float scale = 1.0 - abs(delta / gap);\n        if (scale <= 0.0) {\n            return;\n        }\n        radianStep = uRadian * scale / k;\n    } else {\n        radianStep = uRadian / k;\n    }\n\n    float s = sin(radianStep);\n    float c = cos(radianStep);\n    mat2 rotationMatrix = mat2(vec2(c, -s), vec2(s, c));\n\n    for(int i = 0; i < ITERATION; i++) {\n        if (i == int(k)) {\n            break;\n        }\n\n        coord -= center;\n        coord.y *= aspect;\n        coord = rotationMatrix * coord;\n        coord.y /= aspect;\n        coord += center;\n\n        vec4 sample = texture2D(uSampler, coord);\n\n        // switch to pre-multiplied alpha to correctly blur transparent images\n        // sample.rgb *= sample.a;\n\n        gl_FragColor += sample;\n    }\n    gl_FragColor /= kernelSize;\n}\n",xe=function(e){function t(t,n,r,o){void 0===t&&(t=0),void 0===n&&(n=[0,0]),void 0===r&&(r=5),void 0===o&&(o=-1),e.call(this,me,ve),this._angle=0,this.angle=t,this.center=n,this.kernelSize=r,this.radius=o}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={angle:{configurable:!0},center:{configurable:!0},radius:{configurable:!0}};return t.prototype.apply=function(e,t,n,r){this.uniforms.uKernelSize=0!==this._angle?this.kernelSize:0,e.applyFilter(this,t,n,r)},n.angle.set=function(e){this._angle=e,this.uniforms.uRadian=e*Math.PI/180},n.angle.get=function(){return this._angle},n.center.get=function(){return this.uniforms.uCenter},n.center.set=function(e){this.uniforms.uCenter=e},n.radius.get=function(){return this.uniforms.uRadius},n.radius.set=function(e){(e<0||e===1/0)&&(e=-1),this.uniforms.uRadius=e},Object.defineProperties(t.prototype,n),t}(t.Filter),ye=n,be="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\n\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\nuniform vec2 dimensions;\n\nuniform bool mirror;\nuniform float boundary;\nuniform vec2 amplitude;\nuniform vec2 waveLength;\nuniform vec2 alpha;\nuniform float time;\n\nfloat rand(vec2 co) {\n    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n}\n\nvoid main(void)\n{\n    vec2 pixelCoord = vTextureCoord.xy * filterArea.xy;\n    vec2 coord = pixelCoord / dimensions;\n\n    if (coord.y < boundary) {\n        gl_FragColor = texture2D(uSampler, vTextureCoord);\n        return;\n    }\n\n    float k = (coord.y - boundary) / (1. - boundary + 0.0001);\n    float areaY = boundary * dimensions.y / filterArea.y;\n    float v = areaY + areaY - vTextureCoord.y;\n    float y = mirror ? v : vTextureCoord.y;\n\n    float _amplitude = ((amplitude.y - amplitude.x) * k + amplitude.x ) / filterArea.x;\n    float _waveLength = ((waveLength.y - waveLength.x) * k + waveLength.x) / filterArea.y;\n    float _alpha = (alpha.y - alpha.x) * k + alpha.x;\n\n    float x = vTextureCoord.x + cos(v * 6.28 / _waveLength - time) * _amplitude;\n    x = clamp(x, filterClamp.x, filterClamp.z);\n\n    vec4 color = texture2D(uSampler, vec2(x, y));\n\n    gl_FragColor = color * _alpha;\n}\n",_e=function(e){function t(t){e.call(this,ye,be),Object.assign(this,{mirror:!0,boundary:.5,amplitude:[0,20],waveLength:[30,100],alpha:[1,1],time:0},t)}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={mirror:{configurable:!0},boundary:{configurable:!0},amplitude:{configurable:!0},waveLength:{configurable:!0},alpha:{configurable:!0}};return t.prototype.apply=function(e,t,n,r){this.uniforms.dimensions[0]=t.sourceFrame.width,this.uniforms.dimensions[1]=t.sourceFrame.height,this.uniforms.time=this.time,e.applyFilter(this,t,n,r)},n.mirror.set=function(e){this.uniforms.mirror=e},n.mirror.get=function(){return this.uniforms.mirror},n.boundary.set=function(e){this.uniforms.boundary=e},n.boundary.get=function(){return this.uniforms.boundary},n.amplitude.set=function(e){this.uniforms.amplitude[0]=e[0],this.uniforms.amplitude[1]=e[1]},n.amplitude.get=function(){return this.uniforms.amplitude},n.waveLength.set=function(e){this.uniforms.waveLength[0]=e[0],this.uniforms.waveLength[1]=e[1]},n.waveLength.get=function(){return this.uniforms.waveLength},n.alpha.set=function(e){this.uniforms.alpha[0]=e[0],this.uniforms.alpha[1]=e[1]},n.alpha.get=function(){return this.uniforms.alpha},Object.defineProperties(t.prototype,n),t}(t.Filter),Ce=n,Se="precision mediump float;\n\nvarying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec2 red;\nuniform vec2 green;\nuniform vec2 blue;\n\nvoid main(void)\n{\n   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/filterArea.xy).r;\n   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/filterArea.xy).g;\n   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/filterArea.xy).b;\n   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;\n}\n",Fe=function(e){function t(t,n,r){void 0===t&&(t=[-10,0]),void 0===n&&(n=[0,10]),void 0===r&&(r=[0,0]),e.call(this,Ce,Se),this.red=t,this.green=n,this.blue=r}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={red:{configurable:!0},green:{configurable:!0},blue:{configurable:!0}};return n.red.get=function(){return this.uniforms.red},n.red.set=function(e){this.uniforms.red=e},n.green.get=function(){return this.uniforms.green},n.green.set=function(e){this.uniforms.green=e},n.blue.get=function(){return this.uniforms.blue},n.blue.set=function(e){this.uniforms.blue=e},Object.defineProperties(t.prototype,n),t}(t.Filter),ze=n,Ae="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec4 filterClamp;\n\nuniform vec2 center;\n\nuniform float amplitude;\nuniform float wavelength;\n// uniform float power;\nuniform float brightness;\nuniform float speed;\nuniform float radius;\n\nuniform float time;\n\nconst float PI = 3.14159;\n\nvoid main()\n{\n    float halfWavelength = wavelength * 0.5 / filterArea.x;\n    float maxRadius = radius / filterArea.x;\n    float currentRadius = time * speed / filterArea.x;\n\n    float fade = 1.0;\n\n    if (maxRadius > 0.0) {\n        if (currentRadius > maxRadius) {\n            gl_FragColor = texture2D(uSampler, vTextureCoord);\n            return;\n        }\n        fade = 1.0 - pow(currentRadius / maxRadius, 2.0);\n    }\n\n    vec2 dir = vec2(vTextureCoord - center / filterArea.xy);\n    dir.y *= filterArea.y / filterArea.x;\n    float dist = length(dir);\n\n    if (dist <= 0.0 || dist < currentRadius - halfWavelength || dist > currentRadius + halfWavelength) {\n        gl_FragColor = texture2D(uSampler, vTextureCoord);\n        return;\n    }\n\n    vec2 diffUV = normalize(dir);\n\n    float diff = (dist - currentRadius) / halfWavelength;\n\n    float p = 1.0 - pow(abs(diff), 2.0);\n\n    // float powDiff = diff * pow(p, 2.0) * ( amplitude * fade );\n    float powDiff = 1.25 * sin(diff * PI) * p * ( amplitude * fade );\n\n    vec2 offset = diffUV * powDiff / filterArea.xy;\n\n    // Do clamp :\n    vec2 coord = vTextureCoord + offset;\n    vec2 clampedCoord = clamp(coord, filterClamp.xy, filterClamp.zw);\n    gl_FragColor = texture2D(uSampler, clampedCoord);\n    if (coord != clampedCoord) {\n        gl_FragColor *= max(0.0, 1.0 - length(coord - clampedCoord));\n    }\n\n    // No clamp :\n    // gl_FragColor = texture2D(uSampler, vTextureCoord + offset);\n\n    gl_FragColor.rgb *= 1.0 + (brightness - 1.0) * p * fade;\n}\n",Te=function(e){function t(t,n,r){void 0===t&&(t=[0,0]),void 0===n&&(n={}),void 0===r&&(r=0),e.call(this,ze,Ae),this.center=t,Array.isArray(n)&&(console.warn("Deprecated Warning: ShockwaveFilter params Array has been changed to options Object."),n={}),n=Object.assign({amplitude:30,wavelength:160,brightness:1,speed:500,radius:-1},n),this.amplitude=n.amplitude,this.wavelength=n.wavelength,this.brightness=n.brightness,this.speed=n.speed,this.radius=n.radius,this.time=r}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={center:{configurable:!0},amplitude:{configurable:!0},wavelength:{configurable:!0},brightness:{configurable:!0},speed:{configurable:!0},radius:{configurable:!0}};return t.prototype.apply=function(e,t,n,r){this.uniforms.time=this.time,e.applyFilter(this,t,n,r)},n.center.get=function(){return this.uniforms.center},n.center.set=function(e){this.uniforms.center=e},n.amplitude.get=function(){return this.uniforms.amplitude},n.amplitude.set=function(e){this.uniforms.amplitude=e},n.wavelength.get=function(){return this.uniforms.wavelength},n.wavelength.set=function(e){this.uniforms.wavelength=e},n.brightness.get=function(){return this.uniforms.brightness},n.brightness.set=function(e){this.uniforms.brightness=e},n.speed.get=function(){return this.uniforms.speed},n.speed.set=function(e){this.uniforms.speed=e},n.radius.get=function(){return this.uniforms.radius},n.radius.set=function(e){this.uniforms.radius=e},Object.defineProperties(t.prototype,n),t}(t.Filter),we=n,De="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform sampler2D uLightmap;\nuniform vec4 filterArea;\nuniform vec2 dimensions;\nuniform vec4 ambientColor;\nvoid main() {\n    vec4 diffuseColor = texture2D(uSampler, vTextureCoord);\n    vec2 lightCoord = (vTextureCoord * filterArea.xy) / dimensions;\n    vec4 light = texture2D(uLightmap, lightCoord);\n    vec3 ambient = ambientColor.rgb * ambientColor.a;\n    vec3 intensity = ambient + light.rgb;\n    vec3 finalColor = diffuseColor.rgb * intensity;\n    gl_FragColor = vec4(finalColor, diffuseColor.a);\n}\n",Oe=function(e){function n(t,n,r){void 0===n&&(n=0),void 0===r&&(r=1),e.call(this,we,De),this.uniforms.ambientColor=new Float32Array([0,0,0,r]),this.texture=t,this.color=n}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={texture:{configurable:!0},color:{configurable:!0},alpha:{configurable:!0}};return n.prototype.apply=function(e,t,n,r){this.uniforms.dimensions[0]=t.sourceFrame.width,this.uniforms.dimensions[1]=t.sourceFrame.height,e.applyFilter(this,t,n,r)},r.texture.get=function(){return this.uniforms.uLightmap},r.texture.set=function(e){this.uniforms.uLightmap=e},r.color.set=function(e){var n=this.uniforms.ambientColor;"number"==typeof e?(t.utils.hex2rgb(e,n),this._color=e):(n[0]=e[0],n[1]=e[1],n[2]=e[2],n[3]=e[3],this._color=t.utils.rgb2hex(n))},r.color.get=function(){return this._color},r.alpha.get=function(){return this.uniforms.ambientColor[3]},r.alpha.set=function(e){this.uniforms.ambientColor[3]=e},Object.defineProperties(n.prototype,r),n}(t.Filter),Re=n,Pe="varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float blur;\nuniform float gradientBlur;\nuniform vec2 start;\nuniform vec2 end;\nuniform vec2 delta;\nuniform vec2 texSize;\n\nfloat random(vec3 scale, float seed)\n{\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main(void)\n{\n    vec4 color = vec4(0.0);\n    float total = 0.0;\n\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n    vec2 normal = normalize(vec2(start.y - end.y, end.x - start.x));\n    float radius = smoothstep(0.0, 1.0, abs(dot(vTextureCoord * texSize - start, normal)) / gradientBlur) * blur;\n\n    for (float t = -30.0; t <= 30.0; t++)\n    {\n        float percent = (t + offset - 0.5) / 30.0;\n        float weight = 1.0 - abs(percent);\n        vec4 sample = texture2D(uSampler, vTextureCoord + delta / texSize * percent * radius);\n        sample.rgb *= sample.a;\n        color += sample * weight;\n        total += weight;\n    }\n\n    gl_FragColor = color / total;\n    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n}\n",Me=function(e){function n(n,r,o,i){void 0===n&&(n=100),void 0===r&&(r=600),void 0===o&&(o=null),void 0===i&&(i=null),e.call(this,Re,Pe),this.uniforms.blur=n,this.uniforms.gradientBlur=r,this.uniforms.start=o||new t.Point(0,window.innerHeight/2),this.uniforms.end=i||new t.Point(600,window.innerHeight/2),this.uniforms.delta=new t.Point(30,30),this.uniforms.texSize=new t.Point(window.innerWidth,window.innerHeight),this.updateDelta()}e&&(n.__proto__=e),n.prototype=Object.create(e&&e.prototype),n.prototype.constructor=n;var r={blur:{configurable:!0},gradientBlur:{configurable:!0},start:{configurable:!0},end:{configurable:!0}};return n.prototype.updateDelta=function(){this.uniforms.delta.x=0,this.uniforms.delta.y=0},r.blur.get=function(){return this.uniforms.blur},r.blur.set=function(e){this.uniforms.blur=e},r.gradientBlur.get=function(){return this.uniforms.gradientBlur},r.gradientBlur.set=function(e){this.uniforms.gradientBlur=e},r.start.get=function(){return this.uniforms.start},r.start.set=function(e){this.uniforms.start=e,this.updateDelta()},r.end.get=function(){return this.uniforms.end},r.end.set=function(e){this.uniforms.end=e,this.updateDelta()},Object.defineProperties(n.prototype,r),n}(t.Filter),Le=function(e){function t(){e.apply(this,arguments)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.updateDelta=function(){var e=this.uniforms.end.x-this.uniforms.start.x,t=this.uniforms.end.y-this.uniforms.start.y,n=Math.sqrt(e*e+t*t);this.uniforms.delta.x=e/n,this.uniforms.delta.y=t/n},t}(Me),je=function(e){function t(){e.apply(this,arguments)}return e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t,t.prototype.updateDelta=function(){var e=this.uniforms.end.x-this.uniforms.start.x,t=this.uniforms.end.y-this.uniforms.start.y,n=Math.sqrt(e*e+t*t);this.uniforms.delta.x=-t/n,this.uniforms.delta.y=e/n},t}(Me),Ie=function(e){function t(t,n,r,o){void 0===t&&(t=100),void 0===n&&(n=600),void 0===r&&(r=null),void 0===o&&(o=null),e.call(this),this.tiltShiftXFilter=new Le(t,n,r,o),this.tiltShiftYFilter=new je(t,n,r,o)}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={blur:{configurable:!0},gradientBlur:{configurable:!0},start:{configurable:!0},end:{configurable:!0}};return t.prototype.apply=function(e,t,n){var r=e.getRenderTarget(!0);this.tiltShiftXFilter.apply(e,t,r),this.tiltShiftYFilter.apply(e,r,n),e.returnRenderTarget(r)},n.blur.get=function(){return this.tiltShiftXFilter.blur},n.blur.set=function(e){this.tiltShiftXFilter.blur=this.tiltShiftYFilter.blur=e},n.gradientBlur.get=function(){return this.tiltShiftXFilter.gradientBlur},n.gradientBlur.set=function(e){this.tiltShiftXFilter.gradientBlur=this.tiltShiftYFilter.gradientBlur=e},n.start.get=function(){return this.tiltShiftXFilter.start},n.start.set=function(e){this.tiltShiftXFilter.start=this.tiltShiftYFilter.start=e},n.end.get=function(){return this.tiltShiftXFilter.end},n.end.set=function(e){this.tiltShiftXFilter.end=this.tiltShiftYFilter.end=e},Object.defineProperties(t.prototype,n),t}(t.Filter),ke=n,Ee="varying vec2 vTextureCoord;\n\nuniform sampler2D uSampler;\nuniform float radius;\nuniform float angle;\nuniform vec2 offset;\nuniform vec4 filterArea;\n\nvec2 mapCoord( vec2 coord )\n{\n    coord *= filterArea.xy;\n    coord += filterArea.zw;\n\n    return coord;\n}\n\nvec2 unmapCoord( vec2 coord )\n{\n    coord -= filterArea.zw;\n    coord /= filterArea.xy;\n\n    return coord;\n}\n\nvec2 twist(vec2 coord)\n{\n    coord -= offset;\n\n    float dist = length(coord);\n\n    if (dist < radius)\n    {\n        float ratioDist = (radius - dist) / radius;\n        float angleMod = ratioDist * ratioDist * angle;\n        float s = sin(angleMod);\n        float c = cos(angleMod);\n        coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);\n    }\n\n    coord += offset;\n\n    return coord;\n}\n\nvoid main(void)\n{\n\n    vec2 coord = mapCoord(vTextureCoord);\n\n    coord = twist(coord);\n\n    coord = unmapCoord(coord);\n\n    gl_FragColor = texture2D(uSampler, coord );\n\n}\n",Be=function(e){function t(t,n,r){void 0===t&&(t=200),void 0===n&&(n=4),void 0===r&&(r=20),e.call(this,ke,Ee),this.radius=t,this.angle=n,this.padding=r}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={offset:{configurable:!0},radius:{configurable:!0},angle:{configurable:!0}};return n.offset.get=function(){return this.uniforms.offset},n.offset.set=function(e){this.uniforms.offset=e},n.radius.get=function(){return this.uniforms.radius},n.radius.set=function(e){this.uniforms.radius=e},n.angle.get=function(){return this.uniforms.angle},n.angle.set=function(e){this.uniforms.angle=e},Object.defineProperties(t.prototype,n),t}(t.Filter),Xe=n,Ne="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\n\nuniform vec2 uCenter;\nuniform float uStrength;\nuniform float uInnerRadius;\nuniform float uRadius;\n\nconst float MAX_KERNEL_SIZE = 32.0;\n\nfloat random(vec3 scale, float seed) {\n    // use the fragment position for a different seed per-pixel\n    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);\n}\n\nvoid main() {\n\n    float minGradient = uInnerRadius * 0.3;\n    float innerRadius = (uInnerRadius + minGradient * 0.5) / filterArea.x;\n\n    float gradient = uRadius * 0.3;\n    float radius = (uRadius - gradient * 0.5) / filterArea.x;\n\n    float countLimit = MAX_KERNEL_SIZE;\n\n    vec2 dir = vec2(uCenter.xy / filterArea.xy - vTextureCoord);\n    float dist = length(vec2(dir.x, dir.y * filterArea.y / filterArea.x));\n\n    float strength = uStrength;\n\n    float delta = 0.0;\n    float gap;\n    if (dist < innerRadius) {\n        delta = innerRadius - dist;\n        gap = minGradient;\n    } else if (radius >= 0.0 && dist > radius) { // radius < 0 means it's infinity\n        delta = dist - radius;\n        gap = gradient;\n    }\n\n    if (delta > 0.0) {\n        float normalCount = gap / filterArea.x;\n        delta = (normalCount - delta) / normalCount;\n        countLimit *= delta;\n        strength *= delta;\n        if (countLimit < 1.0)\n        {\n            gl_FragColor = texture2D(uSampler, vTextureCoord);\n            return;\n        }\n    }\n\n    // randomize the lookup values to hide the fixed number of samples\n    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n    float total = 0.0;\n    vec4 color = vec4(0.0);\n\n    dir *= strength;\n\n    for (float t = 0.0; t < MAX_KERNEL_SIZE; t++) {\n        float percent = (t + offset) / MAX_KERNEL_SIZE;\n        float weight = 4.0 * (percent - percent * percent);\n        vec2 p = vTextureCoord + dir * percent;\n        vec4 sample = texture2D(uSampler, p);\n\n        // switch to pre-multiplied alpha to correctly blur transparent images\n        // sample.rgb *= sample.a;\n\n        color += sample * weight;\n        total += weight;\n\n        if (t > countLimit){\n            break;\n        }\n    }\n\n    gl_FragColor = color / total;\n\n    // switch back from pre-multiplied alpha\n    gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n\n}\n",Ke=function(e){function t(t,n,r,o){void 0===t&&(t=.1),void 0===n&&(n=[0,0]),void 0===r&&(r=0),void 0===o&&(o=-1),e.call(this,Xe,Ne),this.center=n,this.strength=t,this.innerRadius=r,this.radius=o}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var n={center:{configurable:!0},strength:{configurable:!0},innerRadius:{configurable:!0},radius:{configurable:!0}};return n.center.get=function(){return this.uniforms.uCenter},n.center.set=function(e){this.uniforms.uCenter=e},n.strength.get=function(){return this.uniforms.uStrength},n.strength.set=function(e){this.uniforms.uStrength=e},n.innerRadius.get=function(){return this.uniforms.uInnerRadius},n.innerRadius.set=function(e){this.uniforms.uInnerRadius=e},n.radius.get=function(){return this.uniforms.uRadius},n.radius.set=function(e){(e<0||e===1/0)&&(e=-1),this.uniforms.uRadius=e},Object.defineProperties(t.prototype,n),t}(t.Filter);return e.AdjustmentFilter=o,e.AdvancedBloomFilter=d,e.AsciiFilter=h,e.BloomFilter=b,e.BulgePinchFilter=S,e.ColorReplaceFilter=A,e.ConvolutionFilter=D,e.CrossHatchFilter=P,e.CRTFilter=j,e.DotFilter=E,e.DropShadowFilter=N,e.EmbossFilter=G,e.GlitchFilter=Z,e.GlowFilter=V,e.GodrayFilter=ee,e.KawaseBlurFilter=s,e.MotionBlurFilter=re,e.MultiColorReplaceFilter=le,e.OldFilmFilter=ue,e.OutlineFilter=de,e.PixelateFilter=he,e.RadialBlurFilter=xe,e.ReflectionFilter=_e,e.RGBSplitFilter=Fe,e.ShockwaveFilter=Te,e.SimpleLightmapFilter=Oe,e.TiltShiftFilter=Ie,e.TiltShiftAxisFilter=Me,e.TiltShiftXFilter=Le,e.TiltShiftYFilter=je,e.TwistFilter=Be,e.ZoomBlurFilter=Ke,e}({},PIXI);Object.assign(PIXI.filters,this.__filters);
//# sourceMappingURL=pixi-filters.js.map


// Tsukimi-customized pixi-Godray Filter
/*!
 * @pixi/filter-godray - v2.5.0
 * Compiled Wed, 10 Jan 2018 17:38:59 UTC
 *
 * @pixi/filter-godray is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
!function(n,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("pixi.js")):"function"==typeof define&&define.amd?define(["exports","pixi.js"],e):e(n.__filters={},n.PIXI)}(this,function(n,e){"use strict";var t="attribute vec2 aVertexPosition;\nattribute vec2 aTextureCoord;\n\nuniform mat3 projectionMatrix;\n\nvarying vec2 vTextureCoord;\n\nvoid main(void)\n{\n    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);\n    vTextureCoord = aTextureCoord;\n}",i="vec3 mod289(vec3 x)\n{\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nvec4 mod289(vec4 x)\n{\n    return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\nvec4 permute(vec4 x)\n{\n    return mod289(((x * 34.0) + 1.0) * x);\n}\nvec4 taylorInvSqrt(vec4 r)\n{\n    return 1.79284291400159 - 0.85373472095314 * r;\n}\nvec3 fade(vec3 t)\n{\n    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\n}\n// Classic Perlin noise, periodic variant\nfloat pnoise(vec3 P, vec3 rep)\n{\n    vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\n    vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\n    Pi0 = mod289(Pi0);\n    Pi1 = mod289(Pi1);\n    vec3 Pf0 = fract(P); // Fractional part for interpolation\n    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n    vec4 iy = vec4(Pi0.yy, Pi1.yy);\n    vec4 iz0 = Pi0.zzzz;\n    vec4 iz1 = Pi1.zzzz;\n    vec4 ixy = permute(permute(ix) + iy);\n    vec4 ixy0 = permute(ixy + iz0);\n    vec4 ixy1 = permute(ixy + iz1);\n    vec4 gx0 = ixy0 * (1.0 / 7.0);\n    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n    gx0 = fract(gx0);\n    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n    vec4 sz0 = step(gz0, vec4(0.0));\n    gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n    gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n    vec4 gx1 = ixy1 * (1.0 / 7.0);\n    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n    gx1 = fract(gx1);\n    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n    vec4 sz1 = step(gz1, vec4(0.0));\n    gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n    gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\n    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\n    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\n    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\n    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\n    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\n    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\n    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\n    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n    g000 *= norm0.x;\n    g010 *= norm0.y;\n    g100 *= norm0.z;\n    g110 *= norm0.w;\n    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n    g001 *= norm1.x;\n    g011 *= norm1.y;\n    g101 *= norm1.z;\n    g111 *= norm1.w;\n    float n000 = dot(g000, Pf0);\n    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n    float n111 = dot(g111, Pf1);\n    vec3 fade_xyz = fade(Pf0);\n    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n    return 2.2 * n_xyz;\n}\nfloat turb(vec3 P, vec3 rep, float lacunarity, float gain)\n{\n    float sum = 0.0;\n    float sc = 1.0;\n    float totalgain = 1.0;\n    for (float i = 0.0; i < 5.0; i++)\n    {\n        sum += totalgain * pnoise(P * sc, rep);\n        sc *= lacunarity;\n        totalgain *= gain;\n    }\n    return abs(sum);\n}\n",o="varying vec2 vTextureCoord;\nuniform sampler2D uSampler;\nuniform vec4 filterArea;\nuniform vec2 dimensions;\n\nuniform vec2 light;\nuniform bool parallel;\nuniform float aspect;\n\nuniform float gain;\nuniform float lacunarity;\nuniform float strength;\nuniform float time;\n\n${perlin}\n\nvoid main(void) {\n    gl_FragColor = texture2D(uSampler, vTextureCoord);\n    vec2 coord = vTextureCoord * filterArea.xy / dimensions.xy;\n\n    float d;\n\n    if (parallel) {\n        float _cos = light.x;\n        float _sin = light.y;\n        d = (_cos * coord.x) + (_sin * coord.y * aspect);\n    } else {\n        float dx = coord.x - light.x / dimensions.x;\n        float dy = (coord.y - light.y / dimensions.y) * aspect;\n        float dis = sqrt(dx * dx + dy * dy) + 0.00001;\n        d = dy / dis;\n    }\n\n    vec3 dir = vec3(d, d, 0.0);\n\n    float noise = turb(dir + vec3(time, 0.0, 62.1 + time) * 0.05, vec3(480.0, 320.0, 480.0), lacunarity, gain);\n    noise = mix(noise, 0.0, 0.3);\n    //fade vertically.\n    vec4 mist = vec4(noise, noise, noise, 1.0) * (1.0 - coord.y);\n    mist.a = 1.0;\n    gl_FragColor += mist * strength;\n}\n",r=function(n){function r(r){n.call(this,t,o.replace("${perlin}",i)),"number"==typeof r&&(console.warn("GodrayFilter now uses options instead of (angle, gain, lacunarity, time)"),r={angle:r},void 0!==arguments[1]&&(r.gain=arguments[1]),void 0!==arguments[2]&&(r.lacunarity=arguments[2]),void 0!==arguments[3]&&(r.time=arguments[3]),void 0!==arguments[4]&&(r.strength=arguments[3])),r=Object.assign({angle:30,gain:.5,lacunarity:2.5,strength:1.0,time:0,parallel:!0,center:[0,0]},r),this._angleLight=new e.Point,this.angle=r.angle,this.gain=r.gain,this.lacunarity=r.lacunarity,this.parallel=r.parallel,this.center=r.center,this.time=r.time}n&&(r.__proto__=n),r.prototype=Object.create(n&&n.prototype),r.prototype.constructor=r;var a={angle:{configurable:!0},gain:{configurable:!0},lacunarity:{configurable:!0},strength:{configurable:!0}};return r.prototype.apply=function(n,e,t,i){var o=e.sourceFrame,r=o.width,a=o.height;this.uniforms.light=this.parallel?this._angleLight:this.center,this.uniforms.parallel=this.parallel,this.uniforms.dimensions[0]=r,this.uniforms.dimensions[1]=a,this.uniforms.aspect=a/r,this.uniforms.time=this.time,n.applyFilter(this,e,t,i)},a.angle.get=function(){return this._angle},a.angle.set=function(n){this._angle=n;var t=n*e.DEG_TO_RAD;this._angleLight.x=Math.cos(t),this._angleLight.y=Math.sin(t)},a.gain.get=function(){return this.uniforms.gain},a.gain.set=function(n){this.uniforms.gain=n},a.lacunarity.get=function(){return this.uniforms.lacunarity},a.lacunarity.set=function(n){this.uniforms.lacunarity=n},a.strength.get=function(){return this.uniforms.strength},a.strength.set=function(n){this.uniforms.strength=n},Object.defineProperties(r.prototype,a),r}(e.Filter);n.GodrayFilter=r,Object.defineProperty(n,"__esModule",{value:!0})}),Object.assign(PIXI.filters,this.__filters);
//# sourceMappingURL=filter-godray.js.map
