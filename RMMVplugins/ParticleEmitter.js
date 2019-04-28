//================================================================
// ParticleEmitter.js
// ---------------------------------------------------------------
// Copyright (c) 2018 Tsukimi
// ---------------------------------------------------------------
// Version
// 0.1.2-en 2018/07/13 add english description
// 0.1.2 2018/07/13 add feature: "moveQ", "moveQR"; fix EasingFunctions
// 0.1.1 2018/07/13 add feature: "staticToPlayer", "setAsLocal"
// 0.1.0 2018/07/12 beta release
//================================================================

/*:
 * @plugindesc ParticleEmitter
 * @author Tsukimi
 * 
 * @param configName
 * @type string[]
 * @desc config files downloaded from
 * https://pixijs.io/pixi-particles-editor/
 * @default []
 * 
 * @param staticToPlayer
 * @type boolean
 * @desc should emitter set to player(-1) remain exist after map transition
 * @default true
 * 
 * @param enabledAll-Settings
 * @text ParticlesEnabled(All) ON/OFF Settings
 * 
 * @param enabledAll-ShowInOptionMenu
 * @text Show in Option Menu
 * @parent enabledAll-Settings
 * @desc Show ParticlesEnabled(All) in Option Menu
 * @type boolean
 * @default true
 * 
 * @param enabledAll-Text
 * @text Option Menu Text
 * @parent enabledAll-Settings
 * @desc text of ParticlesEnabled(All) option in option menu
 * @default Show Particles
 * 
 * @param enabledAll-DefaultValue
 * @text default ON/OFF state
 * @parent enabledAll-Settings
 * @desc default value of ParticlesEnabled(All), false -> don't apply any particles
 * @type boolean
 * @default true
 * 
 * @help
 * 
 * ParticleEmitter
 * author：tsukimi
 * 
 * description：
 * A plugin controlling pixi-particles.js
 * to make particle system in RM MV.
 * 
 * you can make particle emitter config files here!:
 * https://pixijs.io/pixi-particles-editor/
 * ** First scroll down and set Rederer to Canvas2D
 *    to get correct visual effects !!
 * 
 * ・create a folder named "particles" inside data/ 
 *   and put config file inside it
 * ・create a folder named "particles" inside img/ 
 *   and put particle image file inside it
 * 
 * for more information, check :
 * https://forums.rpgmakerweb.com/index.php?threads/.97729/
 * 
 * ---------------------------------------------------
 * plugin command：
 * 
 * 　*** You can brief all "PEmitter" to "PE" for short ***
 * 
 * 　createPEmitter {id} {config} {eventId} {imageNames ...}
 *    create particle emitter.
 * 　　id: id of this controller. choose a name you like!
 * 　　config: config name download from the website (.json no need) 
 * 　　eventId: the event which this emitter chase
 * 　　　　　　　-1：player、0：this event、1~：event#
 * 　　　　　　　x：screen、screen：screen(only on current map)
 * 　　imageNames: image name inside img/particles/. 
 * 
 *    ex: createPEmitter star#1 starEmitter x star1 star2
 * 　　　Create an emitter named star#1, config is starEmitter.json,
 * 　　　position based on screen. Images are star1.png & star2.png.
 * 
 * 
 * 　pausePEmitter {id}
 *    pause emitting.
 * 
 * 　resumePEmitter {id}
 *    resume emitting.
 * 
 * 　stopPEmitter {id}
 *    stop emitter and delete after all particle i dead.
 * 
 * 　deletePEmitter {id}
 * 　 delete emitter and all particles immediately.
 * 
 * 
 * 　setPEmitterPos {id} {x} {y}
 *    set emitter (relative) position to (x,y).
 * 　　 Besides numbers, you can also set x & y as:
 * 　　 x: Don't change from current parameter value
 * 　　 v<Number>: value of Game Variable<Number>
 * 　　 r<#1>~<#2>: Random value between #1 and #2.
 * 　　             #1 and #2 can also be variables.
 * 
 *    ex: setPEmitterPos star#1 10 x
 * 　　　　set emitter star#1's x coordinate to 10. (y doesn't change)
 * 
 * 
 * 　movePEmitterPos {id} {x} {y} {duration} (easingFunction)
 *    move emitter (relative) position to (x,y) by {duration} frame.
 * 　　input→x: don't move
 * 　　easingFunction: move easing functions at https://easings.net/
 * 　　will be 'linear' if not specified
 * 
 *    ex: movePEmitterPos star#1 -10 20 60 easeOutBounce
 * 　　　　　move emitter star#1 to (-10,20) in 60 frames, with
 * 　　　　　bouncing animation.
 * 
 * 
 * 　setPEmitterZ {id} {z}
 *    set emitter Z layer.
 * 　　z layer：
 * 　　　0 : lower tile
 * 　　　1 : lower character
 * 　　　3 : character
 * 　　　4 : upper tile
 * 　　　5 : upper character
 * 　　　6 : shadow of airship
 * 　　　7 : Balloon
 * 　　　8 : animation
 * 　　　9 : map destination (white rectangle)
 * 
 *    ex: setPEmitterZ star#1 5
 * 　　　　set emitter star#1 z-layer to upper character.
 * 
 * 
 * 　setPEmitterAsLocal {id} {true/false}
 * 　　create particle to event relative position
 * 　　instead of to the map.
 * 　　（if true, event move right -> all particle move right）
 * 
 * 
 * 　setPEmitterStaticToPlayer {id} {true/false}
 * 　　should emitter set to player(-1) remain exist
 * 　　after map transition.(true -> exist)
 * 　　*Only effect on emitter set to player.
 * 
 * 
 * Advanced moving：
 * （Q：Queue、R：Routine）
 * 
 * 　movePEmitterPosQ {id} {x} {y} {duration} (easingFunction)
 * 　　Add move command to move queue. Will start next move
 * 　　after last move is finish.
 * 
 *    ex: movePEmitterPosQ star#1 0 20 60 easeOutBounce
 *    　  movePEmitterPosQ star#1 20 x 30 easeInBounce
 * 　　　　Move to (0,20) in 60f then move to (20,20) in 30f.
 * 
 * 
 * 　movePEmitterPosQR {id} {x} {y} {duration} (easingFunction)
 * 　　Add move command to routine move queue.
 * 　　will repeat moving command in routine move queue.
 * 　　
 *    ex: movePEmitterPosQR star#1 -20 20 30
 *    　  movePEmitterPosQR star#1 20 20 30
 *    　  movePEmitterPosQR star#1 20 -20 30
 *    　  movePEmitterPosQR star#1 -20 -20 30
 * 
 * 　　　　(-20,20)→(20,20)→(20,-20)→(-20,-20)→(-20,20)→…
 * 
 * 
 * 　clearPEmitterPosQ {id}
 * 　　clear move queue.
 * 
 * 　clearPEmitterPosQR {id}
 * 　　clear routine move queue.
 * 
 * ---------------------------------------------------
 * You can also create by map and event tags.
 * 
 * 　*** You can brief all "PEmitter" to "PE" for short ***
 * 
 * Map：
 * <PEmitter:id,config,imageNames,...>
 * 　Same as createPEmitter.
 * 　However, eventId will be set to screen.
 * 
 * 　　ex：<PEmitter:star#1,starEmitter,star1,star2>
 * 
 * <SetPEmitterPos:id,x,y>
 * 　Same as setPEmitterPos.
 * 
 * <SetPEmitterZ:id,z>
 * 　Same as setPEmitterZ.
 * 
 * <MovePEmitterPosQR:id,x,y,duration,easingFunc>
 * 　Same as movePEmitterPosQR.
 * 
 * 
 * event：
 * <PEmitter:id,config,imageNames,...>
 * 　Same as createPEmitter.
 * 　However, eventId will be set to this event.
 * 
 * 　　ex：<PEmitter:star#1,starEmitter,star1,star2>
 * 
 * <SetPEmitterPos:id,x,y>
 * 　Same as setPEmitterPos.
 * 
 * <SetPEmitterZ:id,z>
 * 　Same as setPEmitterZ.
 * 
 * <SetPEmitterAsLocal:id>
 * 　Same as setPEmitterPosAsLocal.
 * 
 * <MovePEmitterPosQR:id,x,y,duration,easingFunc>
 * 　Same as movePEmitterPosQR.
 * 
 */

/*:ja
 * @plugindesc パーティクル
 * @author Tsukimi
 * 
 * @param configName
 * @text 設定ファイル名
 * @type string[]
 * @desc 使う設定ファイルの名前
 * @default []
 * 
 * @param staticToPlayer
 * @text プレイヤー固定化(staticToPlayer)
 * @type boolean
 * @desc プレイヤーに設定したエミッターはマップ移動後に消さないべきか否か
 * @default true
 * 
 * @param enabledAll-Settings
 * @text パーティクル表示ON/OFF設定
 * 
 * @param enabledAll-ShowInOptionMenu
 * @text オプションメニューに表示する
 * @parent enabledAll-Settings
 * @desc 「パーティクル表示」のON/OFFをゲーム内のオプションメニューから設定出来るようにする
 * @type boolean
 * @default true
 * 
 * @param enabledAll-Text
 * @text オプションメニューでの文言
 * @parent enabledAll-Settings
 * @desc ゲーム内オプションでのパーティクル表示ON/OFFの文言
 * @default パーティクル表示
 * 
 * @param enabledAll-DefaultValue
 * @text パーティクル表示ON/OFFの初期値
 * @parent enabledAll-Settings
 * @desc パーティクル表示ON/OFFの初期値；OFF→全パーティクルを表示しない（少し軽くなる）
 * @type boolean
 * @default true
 * 
 * @help
 * 
 * パーティクルプラグイン
 * 作者：ツキミ
 * 
 * 説明：
 * pixiビルドインの particles を pixi-particle.js で
 * コントロールするプラグインです。
 * いわゆるパーティクルシステムが出来ます！
 * 
 * ・エミッターの設定ファイルは data/ に particles フォルダー
 * 　を作り、入れてください。
 * ・パーティクルの画像ファイルは img/ に particles フォルダー
 * 　を作り、入れてください。
 * 
 * 詳しい説明は、
 * https://forum.tkool.jp/index.php?threads/.1073/
 * を見てください。
 * 
 * ---------------------------------------------------
 * プラグインコマンド：
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 * 
 * 　*** 以下の PEmitter を全部 PE に省略できます。 ***
 * 
 * 　createPEmitter {id} {config} {eventId} {imageNames ...}
 *    エミッターを作る。
 * 　　id: エミッター識別名、調整、削除の時に使う。好きな名前をどうぞ。
 * 　　config: data/particles/ に入っているエミッターの設定ファイル
 * 　　eventId: エミッターの追従対象。
 * 　　　　　　　-1：プレイヤー、0：このイベント、1~：該当イベント
 * 　　　　　　　x：画面依存、screen：画面依存（当マップのみ）
 * 　　imageNames: img/particles/ に入っているパーティクル画像名
 * 　　　　　　　　　複数あったら半角空白で区切る
 * 
 *    例: createPEmitter star#1 starEmitter x star1 star2
 * 　　　名前がstar#1のエミッターを作り、設定ファイルをstarEmitter.jsonにし、
 * 　　　画面依存にする。パーティクルの画像はstar1.pngとstar2.png。
 * 
 * 
 * 　pausePEmitter {id}
 *    エミッターを一時中断する。
 * 
 * 　resumePEmitter {id}
 *    エミッターを再開する。
 * 
 * 　stopPEmitter {id}
 *    エミッターを中止する。（パーティクルが全部消えたあと削除する）
 * 
 * 　deletePEmitter {id}
 *    エミッターを中止する。（すぐにすべてのパーティクルを削除する）
 * 
 * 
 * 　setPEmitterPos {id} {x} {y}
 *    エミッターの相対位置を(x,y)に設置する。
 * 　　x,y の値は数字以外、以下の文字も設定可能です。
 * 　　　x: 現在のパラメータ（パラメータを変えない）
 * 　　　v<数字>: 変数番号<数字>の値を代入する
 * 　　　r<#1>~<#2>: #1~#2の間の乱数生成。
 * 　　　            #1と#2もv<数字>で指定可能。
 * 
 *    例: setPEmitterPos star#1 10 x
 * 　　　　star#1のx座標を10にする。（yは変えない）
 * 
 * 
 * 　movePEmitterPos {id} {x} {y} {duration} (easingFunction)
 *    エミッターの相対位置を{duration}フレーム掛けて(x,y)に移動する。
 * 　　数値→x: 調整しない
 * 　　easingFunction: 移動のアニメーション（徐々に加速、減速等）
 * 　　指定が無ければ linear になります
 * 　　詳しくは：https://easings.net/ja
 * 
 *    例: movePEmitterPos star#1 -10 20 60 easeOutBounce
 * 　　　　star#1を60フレームかけて(-10, 20)に移動する。
 * 　　　　（アニメ：跳ね返る）
 * 
 * 
 * 　setPEmitterZ {id} {z}
 *    エミッターのzレイヤーを変える。
 * 　　zレイヤー参照：
 * 　　　0 : 下層タイル
 * 　　　1 : 通常キャラの下
 * 　　　3 : 通常キャラと同じ
 * 　　　4 : 上層タイル
 * 　　　5 : 通常キャラの上
 * 　　　6 : 飛行船の影
 * 　　　7 : フキダシ
 * 　　　8 : アニメーション
 * 　　　9 : マップタッチの行き先（白く光るヤツ）
 * 
 *    例: setPEmitterZ star#1 5
 * 　　　　発射位置を通常キャラの上にする。
 * 
 * 
 * 　setPEmitterAsLocal {id} {true/false}
 *    マップにではなく、
 * 　　イベントの相対位置にパーティクルを生成するかどうか。
 * 　　（trueにすると、キャラが右に一マス移動する
 * 　　　→全パーティクルも右に一マス移動する）
 * 
 * 
 * 　setPEmitterStaticToPlayer {id} {true/false}
 *    プレイヤーに設定したエミッターは
 *    　マップ移動後に消さないべきか否か。
 * 　　プレイヤーに適用しているエミッターにしか効果がない。
 * 
 * 
 * 高度な移動コマンド：
 * （Q：Queue、R：Routine）
 * 
 * 　movePEmitterPosQ {id} {x} {y} {duration} (easingFunction)
 * 　　移動コマンドの待ち列に新しい移動を追加する。
 * 　　前の移動が終わった後、自動で次の移動が再生される。
 * 　　主に移動コマンドを一気に指定したい時に使う。
 * 
 *    例: movePEmitterPosQ star#1 0 20 60 easeOutBounce
 *    　  movePEmitterPosQ star#1 20 x 30 easeInBounce
 * 　　　　(0,20)に移動した後、(20,20)に移動する
 * 
 * 
 * 　movePEmitterPosQR {id} {x} {y} {duration} (easingFunction)
 * 　　ループ移動コマンド配列に移動を追加する。
 * 　　
 *    例: movePEmitterPosQR star#1 -20 20 30
 *    　  movePEmitterPosQR star#1 20 20 30
 *    　  movePEmitterPosQR star#1 20 -20 30
 *    　  movePEmitterPosQR star#1 -20 -20 30
 * 
 * 　　　　(-20,20)→(20,20)→(20,-20)→(-20,-20)→(-20,20)→…
 * 　　　　辺の長さが40の正方形に沿って時計回りに移動し続ける。
 * 
 * 
 * 　clearPEmitterPosQ {id}
 * 　　移動コマンドの待ち列をクリアする。
 * 
 * 　clearPEmitterPosQR {id}
 * 　　ループ移動コマンド配列をクリアする。
 * 
 * ---------------------------------------------------
 * タグによるエミッター自動生成も可能。
 * 
 * 　*** 以下の PEmitter を全部 PE に省略できます。 ***
 * 
 * マップ：
 * <PEmitter:id,config,imageNames,...>
 * 　コマンド createPEmitter と同じ効果。
 * 　ただし、 eventId は screen になる。（指定できない）
 * 
 * 　　例：<PEmitter:star#1,starEmitter,star1,star2>
 * 
 * <SetPEmitterPos:id,x,y>
 * 　コマンド setPEmitterPos と同じ効果。
 * 
 * <SetPEmitterZ:id,z>
 * 　コマンド setPEmitterZ と同じ効果。
 * 
 * <MovePEmitterPosQR:id,x,y,duration,easingFunc>
 * 　コマンド movePEmitterPosQR と同じ効果。
 * 
 * 
 * イベント：
 * <PEmitter:id,config,imageNames,...>
 * 　コマンド createPEmitter と同じ効果。
 * 　ただし、 eventId は 該当イベントのid になる。（指定できない）
 * 
 * 　　例：<PEmitter:star#1,starEmitter,star1,star2>
 * 
 * <SetPEmitterPos:id,x,y>
 * 　コマンド setPEmitterPos と同じ効果。
 * 
 * <SetPEmitterZ:id,z>
 * 　コマンド setPEmitterZ と同じ効果。
 * 
 * <SetPEmitterAsLocal:id>
 * 　コマンド setPEmitterAsLocal id true と同じ効果。
 * 
 * <MovePEmitterPosQR:id,x,y,duration,easingFunc>
 * 　コマンド movePEmitterPosQR と同じ効果。
 * 
 */

var $particleConfig = {};

function Object_PEmitter() {
this.initialize.apply(this, arguments);
};
/*
Object_PEmitter.prototype = Object.create(Sprite.prototype);
Object_PEmitter.prototype.constructor = Object_PEmitter;
*/

function Game_PEmitter() {
    this.initialize.apply(this, arguments);
};
  
DataManager.loadParticleConfig = function(src) {
    var xhr = new XMLHttpRequest();
    var url = 'data/particles/' + src + '.json';
    xhr.open('GET', url);
    xhr.overrideMimeType('application/json');
    xhr.onload = function() {
        if (xhr.status < 400) {
            $particleConfig[src] = JSON.parse(xhr.responseText);
        }
    };
    xhr.onerror = function() {
        DataManager._errorUrl = DataManager._errorUrl || url;
    };
    xhr.send();
};

(function() {
    "use strict";
    
    //=============================================================================
    //  Plugin parameter
    //  
    //=============================================================================
    var pluginName = 'ParticleEmitter';
    var getParamString = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };
    
    var getParamBoolean = function(paramNames) {
        var value = getParamString(paramNames);
        return (value || '').toUpperCase() === 'TRUE';
    };
    
    var configArr = JSON.parse(getParamString(['configName']));
    if(configArr) {
        for(var i = 0; i < configArr.length; i++) {
            DataManager.loadParticleConfig(configArr[i]);
        }
    }
    
    //=============================================================================
    // Game_Interpreter
    //  プラグインコマンド[P_DRAG]などを追加定義します。
    //=============================================================================
    
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        var id, dur;
        switch ((command || '').toUpperCase()) {
            case 'CREATEPE' :
            case 'CREATEPEMITTER' :
            // args: id, config, eventId, [imageNames ...]
                var id = args.shift();
                var config = args.shift();
                if(!$particleConfig[config]) return;
                var eventId = args.shift();
                if(eventId.toUpperCase() === "SCREEN") eventId = 0;
                else {
                    eventId = getNumberOrX(eventId);
                    if(eventId === 0) eventId = this._eventId;
                }
                $gameMap.createPEmitter(id, args, config, eventId);
                break;
                
            case 'PAUSEPE' :
            case 'PAUSEPEMITTER' :
                $gameMap.pausePEmitter(args[0]);
                break;
                
            case 'RESUMEPE' :
            case 'RESUMEPEMITTER' :
                $gameMap.resumePEmitter(args[0]);
                break;
                
            case 'ENABLEPEMITTER' :
                $gameMap.enablePEmitter( args[0] , getBoolean(args[1]) );
                break;
                
            case 'STOPPE' :
            case 'STOPPEMITTER' :
                $gameMap.stopPEmitter(args[0]);
                break;
                
            case 'DELETEPE' :
            case 'DELETEPEMITTER' :
                $gameMap.deletePEmitter(args[0]);
                break;
                
            case 'SETPEPOS' :
            case 'SETPEMITTERPOS' :
                $gameMap.setPEmitterPos(args[0], getNumberOrX(args[1]), getNumberOrX(args[2]));
                break;
                
            case 'SETPEZ' :
            case 'SETPEMITTERZ' :
                $gameMap.setPEmitterZ(args[0], getNumberOrX(args[1]));
                break;
                
            case 'SETPEASLOCAL' :
            case 'SETPEMITTERASLOCAL' :
                $gameMap.setPEmitterAsLocal(args[0], args[1].toUpperCase() === "TRUE");
                break;
                
            case 'SETPESTATICTOPLAYER' :
            case 'SETPEMITTERSTATICTOPLAYER' :
                $gameMap.setPEmitterStaticToPlayer(args[0], args[1].toUpperCase() === "TRUE");
                break;
                
            case 'MOVEPEPOS' :
            case 'MOVEPEMITTERPOS' :
                $gameMap.movePEmitterPos(args[0], [
                                         getNumberOrX(args[1]), 
                                         getNumberOrX(args[2]),
                                         Number(args[3]) || 1,
                                         args[4] || 'linear' ]
                                        );
                break;
                
            case 'MOVEPEPOSQ' :
            case 'MOVEPEMITTERPOSQ' :
                $gameMap.movePEmitterPosQ(args[0], [
                                         getNumberOrX(args[1]), 
                                         getNumberOrX(args[2]),
                                         Number(args[3]) || 1,
                                         args[4] || 'linear' ]
                                         );
                break;
                
            case 'MOVEPEPOSQR' :
            case 'MOVEPEMITTERPOSQR' :
                $gameMap.movePEmitterPosQR(args[0], [
                                         getNumberOrX(args[1]), 
                                         getNumberOrX(args[2]),
                                         Number(args[3]) || 1,
                                         args[4] || 'linear' ]
                                          );
                break;
                
            case 'CLEARPEPOSQ' :
            case 'CLEARPEMITTERPOSQ' :
                $gameMap.ClearPEmitterPosQ(args[0]);
                break;
                
            case 'CLEARPEPOSQR' :
            case 'CLEARPEMITTERPOSQR' :
                $gameMap.ClearPEmitterPosQR(args[0]);
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
    
    function getBoolean(string) {
        return (string || '').toUpperCase() === 'TRUE';
    };
    
    //==================
    // Object_PEmitter
    //==================

    Object_PEmitter.prototype.initialize = function(e) {
        this._gameObject = e;
        this.createEmitter(e);
        var origin = SceneManager._scene._spriteset._tilemap.origin;
        this._startOPos = new Point(origin.x, origin.y);
    };

    Object_PEmitter.prototype.createEmitter = function(e) {
        var emitterContainer = new PIXI.Container();
        emitterContainer.z = e._z;
        var art = [];
        for(var i = 0; i < e._imageNames.length; i++) {
            if(e._imageNames[i] === "") continue;
            art.push( (new Sprite(ImageManager.loadParticle(e._imageNames[i]))).texture );
        }
        var emitter = new PIXI.particles.Emitter(
                    emitterContainer,
                    art,
                    $particleConfig[e._config]
                );
        emitter.emit = true;
        for (var key in e._totalParam) {
            if(this[key]) this[key] = e._totalParam[key];
        }

        this._emitterContainer = emitterContainer;
        this._emitter = emitter;

    };

    Object_PEmitter.prototype.update = function() {
        this.updateEnableState();
        this.updateParameter();
        this.updateEmit();
        this.updatePos();
        this.updateTime();
    };

    Object_PEmitter.prototype.updateEnableState = function() {
        this._emitterContainer.renderable = Game_PEmitter.enabledAll && this._gameObject.enabled;
    };

    Object_PEmitter.prototype.updateParameter = function() {
        var e = this._gameObject._updateParam;
        for (var key in e) {
            if(this[key]) this[key] = e[key];
            delete e[key];
        }
    };

    Object_PEmitter.prototype.updateEmit = function() {
        var e = this._gameObject, e2 = this._emitter;
        if( (e._stop && !this._emitter.particleCount) || e._delete ) this._delete = true;
        else if(e._pause || e._stop) this._emitter._emit = false;
        else if(e2.emitterLifetime>0 && e2._emitterLife == e2.emitterLifetime && !e2.emit) {
            if(!e2.particleCount) {
                $gameMap.deletePEmitter(e._id);
                this._delete = true;
            }
        }
        else this._emitter._emit = true;
    };

    Object_PEmitter.prototype.updateTime = function() {
        this._emitter.update(0.016);
    };

    Object_PEmitter.prototype.updatePos = function() {
        var e = this._gameObject;
        if(!isNaN(e._eventId) && e._eventId !== 0) {
            var event;
            if(e._eventId > 0) event = $gameMap.event(e._eventId);
            else if (e._eventId < 0) event = $gamePlayer;
            
            if(e._isLocal) {
                this._emitterContainer.x = event.screenX();
                this._emitterContainer.y = event.screenY();
                this._emitter.updateOwnerPos(e._shiftX, e._shiftY);
            }
            else {
                var curOPos = SceneManager._scene._spriteset._tilemap.origin;
                var dx = curOPos.x - this._startOPos.x, dy = curOPos.y - this._startOPos.y;
                this._emitterContainer.x = -dx;
                this._emitterContainer.y = -dy;
                this._emitter.updateOwnerPos(event.screenX() + dx + e._shiftX, event.screenY() + dy + e._shiftY);
            }
        }
        else this._emitter.updateOwnerPos(e._shiftX, e._shiftY);
        this._emitterContainer.z = e._z;
    };


    //==================
    // Game_PEmitter
    //==================
    
    Game_PEmitter.enabledAll = getParamBoolean("enabledAll-DefaultValue");

    Game_PEmitter.prototype.initialize = function(id, imageNames, config, eventId) {
        this._pause = false;
        this._stop = false;
        this._delete = false;

        this._id = id;
        if(typeof imageNames === "string") imageNames = [imageNames];
        this._imageNames = imageNames;
        this._config = config;

        this._eventId = eventId;
        if(this._eventId !== undefined) this._mapId = $gameMap.mapId();
        if(getParamBoolean("staticToPlayer") && this._eventId < 0) this._mapId = undefined;
        this._shiftX = 0;
        this._shiftY = 0;
        this._z = 3;
        this._isLocal = false;
        this._totalParam = {};
        this._updateParam = {};
        
        this._moveRoute = null;
        this._moveRouteQ = [];
        this._moveRouteQR = [];
        
        this.enabled = true;
    };

    Game_PEmitter.prototype.pause = function() {
        this._pause = true;
    };

    Game_PEmitter.prototype.resume = function() {
        this._pause = false;
    };

    Game_PEmitter.prototype.stop = function() {
        this._stop = true;
    };
    
    Game_PEmitter.prototype.enable = function(enabled) {
        this.enabled = enabled;
    };

    Game_PEmitter.prototype.delete = function() {
        this._delete = true;
        // if($gameMap._PEmitterArr[this._id]) delete $gameMap._PEmitterArr[this._id];
    };

    Game_PEmitter.prototype.setPos = function(x, y) {
        if(x || x === 0) this._shiftX = x;
        if(y || y === 0) this._shiftY = y;
        delete this._moveRoute;
    };

    Game_PEmitter.prototype.setZ = function(z) {
        if(z || z === 0) this._z = z;
    };

    Game_PEmitter.prototype.setAsLocal = function(isLocal) {
        this._isLocal = isLocal;
    };
    
    Game_PEmitter.prototype.setParam = function(key, value) {
        this._totalParam[key] = value;
        this._updateParam[key] = value;
    };
    
    Game_PEmitter.prototype.createMoveRoute = function(args) {
        if(!args) return;
        this._moveRoute = {
            t: 0,
            b: [this._shiftX, this._shiftY],
            c: [args[0]-this._shiftX, args[1]-this._shiftY],
            d: args[2],
            easefunc: args[3]
        }
    };
    
    Game_PEmitter.prototype.clearMoveRoute = function() {
        delete this._moveRoute;
    };
    
    Game_PEmitter.prototype.createMoveRouteQ = function(args) {
        this._moveRouteQ.push(args);
    };
    
    Game_PEmitter.prototype.clearMoveRouteQ = function() {
        this._moveRouteQ = [];
    };
    
    Game_PEmitter.prototype.createMoveRouteQR = function(args) {
        this._moveRouteQR.push(args);
    };
    
    Game_PEmitter.prototype.clearMoveRouteQR = function() {
        this._moveRouteQR = [];
    };
    
    Game_PEmitter.prototype.update = function() {
        this.updateMove();
    };
    
    Game_PEmitter.prototype.updateMove = function() {
        if(!this._moveRoute) {
            this.getMoveRouteFromQ();
            if(!this._moveRoute) {
                this.copyMoveRouteQR();
                this.getMoveRouteFromQ();
                if(!this._moveRoute) return;
            }
        }
        var m = this._moveRoute;
        m.t++;
        this._shiftX = EasingFunctions[m.easefunc](m.t, m.b[0], m.c[0], m.d);
        this._shiftY = EasingFunctions[m.easefunc](m.t, m.b[1], m.c[1], m.d);
        if(m.t >= m.d) delete this._moveRoute;
    };
    
    Game_PEmitter.prototype.getMoveRouteFromQ = function() {
        this.createMoveRoute(this._moveRouteQ.shift());
    };
    
    Game_PEmitter.prototype.copyMoveRouteQR = function() {
        this._moveRouteQ = this._moveRouteQR.slice();
    };
    
    Game_PEmitter.prototype.setStaticToPlayer = function(isStatic) {
        if(isNaN(this._eventId) || this._eventId >= 0) return;
        if( isStatic ) this._mapId = undefined;
        else this._mapId = $gameMap.mapId();
    };

    //==================
    // ImageManager
    //
    // add loadParticle
    //==================

    ImageManager.loadParticle = function(filename, hue) {
        return this.loadBitmap('img/particles/', filename, hue, true);
    };

    //===================
    // Game_Map (& Game_Screen 1 function)
    //
    // add controling functions
    //===================

    var _Game_Map_initialize = Game_Map.prototype.initialize;
    Game_Map.prototype.initialize = function() {
        _Game_Map_initialize.apply(this, arguments);
        this._PEmitterArr = {};
    };
    
    var _Game_Screen_update = Game_Screen.prototype.update;
    Game_Screen.prototype.update = function(sceneActive) {
        _Game_Screen_update.apply(this, arguments);
        var arr = $gameMap._PEmitterArr;
        for(var key in arr) {
            if( arr[key]._mapId !== undefined && arr[key]._mapId !== $gameMap.mapId() ) {
                $gameMap.deletePEmitter(key);
                continue;
            }
            arr[key].update();
        }
    };

    Game_Map.prototype.createPEmitter = function(id, imageNames, config, eventId) {
        var lastEmitter = this._PEmitterArr[id];
        if(lastEmitter) {
            // TODO:
            // REMOVE EMITTER
            this.deletePEmitter(id);
        }
        var e = new Game_PEmitter(id, imageNames, config, eventId);
        this._PEmitterArr[id] = e;
    };

    Game_Map.prototype.pausePEmitter = function(id) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.pause();
    };

    Game_Map.prototype.resumePEmitter = function(id) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.resume();
    };

    Game_Map.prototype.enablePEmitter = function(id, enabled) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.enable(enabled);
    };

    Game_Map.prototype.stopPEmitter = function(id) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.stop();
        delete this._PEmitterArr[id];
    };

    Game_Map.prototype.deletePEmitter = function(id) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.delete();
        delete this._PEmitterArr[id];
    };

    Game_Map.prototype.setPEmitterPos = function(id, x, y) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.setPos(x, y);
    };

    Game_Map.prototype.setPEmitterZ = function(id, z) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.setZ(z);
    };

    Game_Map.prototype.setPEmitterAsLocal = function(id, isLocal) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.setAsLocal(isLocal);
    };
    
    Game_Map.prototype.setPEmitterStaticToPlayer = function(id, isStatic) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.setStaticToPlayer(isStatic);
    };


    Game_Map.prototype.movePEmitterPos = function(id, args) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.createMoveRoute(args);
    };
    
    Game_Map.prototype.movePEmitterPosQ = function(id, args) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.createMoveRouteQ(args);
    };
    
    Game_Map.prototype.movePEmitterPosQR = function(id, args) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.createMoveRouteQR(args);
    };
    
    Game_Map.prototype.clearPEmitterPosQ = function(id) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.clearMoveRouteQ();
    };
    
    Game_Map.prototype.clearPEmitterPosQR = function(id) {
        var e = this._PEmitterArr[id];
        if(!e) return;
        e.clearMoveRouteQR();
    };
    
    //=========================
    // Game_Map
    //  create Emitter by tag
    //=========================
    
    var _Game_Map_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function(mapId) {
        _Game_Map_setup.apply(this, arguments);
        this.setupTKMPEmitters();
    };

    Game_Map.prototype.setupTKMPEmitters = function() {
        var ma = $dataMap.metaArray;
        if (ma === undefined) return;
        var eArray = ma.PEmitter || ma.PE;
        if(eArray) {
            for(var i = 0; i < eArray.length; i++) {
                var e = eArray[i].split(',');
                var id = e.shift().trim();
                var config = e.shift().trim();
                var eventId = 0;
                for(var i = 0; i < e.length; i++) e[i] = e[i].trim();
                this.createPEmitter(id, e, config, eventId);
            }
        }
        
        eArray = ma.SetPEmitterZ || ma.SetPEZ;
        if(eArray) {
            for(var i = 0; i < eArray.length; i++) {
                var e = eArray[i].split(',');
                var id = e.shift().trim();
                var z = Number(e.shift());
                    if(isNaN(z)) z = 3;
                this.setPEmitterZ(id, z);
            }
        }
        
        eArray = ma.SetPEmitterPos || ma.SetPEPos;
        if(eArray) {
            for(var i = 0; i < eArray.length; i++) {
                var e = eArray[i].split(',');
                var id = e.shift().trim();
                var x = getNumberOrX(e.shift());
                var y = getNumberOrX(e.shift());
                this.setPEmitterPos(id, x, y);
            }
        }
        
        eArray = ma.MovePEmitterPosQR || ma.MovePEPosQR;
        if(eArray) {
            for(var i = 0; i < eArray.length; i++) {
                var e = eArray[i].split(',');
                var id = e.shift().trim();
                var x = getNumberOrX(e.shift());
                var y = getNumberOrX(e.shift());
                var d = Number(e.shift());
                var efunc = (e.shift() || "").trim() || "linear";
                this.movePEmitterPosQR(id, [x, y, d, efunc]);
            }
        }
    };
    
    //=========================
    // Game_Event
    //  create Emitter by tag
    //=========================
    
    var _Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function(mapId, eventId) {
        _Game_Event_initialize.apply(this, arguments);
        this.setupTKMPEmitters();
    };

    Game_Event.prototype.setupTKMPEmitters = function() {
        var ma = this.event().metaArray;
        if (ma === undefined) return;
        
        var eArray = ma.PEmitter || ma.PE;
        if(eArray) {
            for(var i = 0; i < eArray.length; i++) {
                var e = eArray[i].split(',');
                var id = e.shift().trim();
                var config = e.shift().trim();
                var eventId = this._eventId;
                for(var i = 0; i < e.length; i++) e[i] = e[i].trim();
                $gameMap.createPEmitter(id, e, config, eventId);
            }
        }
        
        eArray = ma.SetPEmitterZ || ma.SetPEZ;
        if(eArray) {
            for(var i = 0; i < eArray.length; i++) {
                var e = eArray[i].split(',');
                var id = e.shift().trim();
                var z = Number(e.shift());
                    if(isNaN(z)) z = 3;
                $gameMap.setPEmitterZ(id, z);
            }
        }
        
        eArray = ma.SetPEmitterPos || ma.SetPEPos;
        if(eArray) {
            for(var i = 0; i < eArray.length; i++) {
                var e = eArray[i].split(',');
                var id = e.shift().trim();
                var x = getNumberOrX(e.shift());
                var y = getNumberOrX(e.shift());
                $gameMap.setPEmitterPos(id, x, y);
            }
        }
        
        eArray = ma.SetPEmitterAsLocal || ma.SetPEAsLocal;
        if(eArray) {
            for(var i = 0; i < eArray.length; i++) {
                var e = eArray[i].split(',');
                var id = e.shift().trim();
                $gameMap.setPEmitterAsLocal(id, true);
            }
        }
        
        eArray = ma.MovePEmitterPosQR || ma.MovePEPosQR;
        if(eArray) {
            for(var i = 0; i < eArray.length; i++) {
                var e = eArray[i].split(',');
                var id = e.shift().trim();
                var x = getNumberOrX(e.shift());
                var y = getNumberOrX(e.shift());
                var d = Number(e.shift());
                var efunc = (e.shift() || "").trim() || "linear";
                console.log(efunc);
                $gameMap.movePEmitterPosQR(id, [x, y, d, efunc]);
            }
        }
    };
    
    //=============================================================================
    // Scene_******
    //  拡張するプロパティを定義します。 filterConを観測してfilterを作ります。
    //=============================================================================
    
    var _Scene_Map_initialize = Scene_Map.prototype.initialize;
    Scene_Map.prototype.initialize = function() {
        _Scene_Map_initialize.apply(this, arguments);
        this._PEmitterArr = {};
    };
    
    var _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
    Scene_Map.prototype.updateMain = function() {
        _Scene_Map_updateMain.apply(this, arguments);
        this.updatePEmitters();
    };
    
    Scene_Map.prototype.updatePEmitters = function() {
        var createArr = [];
        var obj = $gameMap._PEmitterArr;
        for (var key in obj) {
            if(!this._PEmitterArr[key]) createArr.push(obj[key]);
        }
        
        for(var i = 0; i < createArr.length; i++) this.createPEmitter(createArr[i]);
        
        for (var key in this._PEmitterArr) {
            var value = this._PEmitterArr[key];
            value.update();
            if(value._delete) {
                value._emitterContainer.parent.removeChild(value._emitterContainer);
                delete this._PEmitterArr[key];
            }
        }
    };
    
    Scene_Map.prototype.createPEmitter = function(gameEmitter) {
        var emitter = new Object_PEmitter(gameEmitter);
        this._PEmitterArr[gameEmitter._id] = emitter;
        this._spriteset._tilemap.addChild(emitter._emitterContainer);
    };

    //========================
    // DataManager
    //  multi-tag extension, 
    //  load config json file
    //========================

    if(!DataManager.extractMetadataArray) {
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
    // Window_Options
    //  拡張するプロパティを定義します。
    //=============================================================================
    
    var _Window_Options_makeCommandList = Window_Options.prototype.makeCommandList;
    Window_Options.prototype.makeCommandList = function() {
        _Window_Options_makeCommandList.apply(this, arguments);
        this.addPEmitterOptions();
    };
    
    Window_Options.prototype.addPEmitterOptions = function() {
        if(getParamBoolean("enabledAll-ShowInOptionMenu"))
            this.addCommand(getParamString("enabledAll-Text"), 'PEmitterEnabledAll');
    };
    
    Object.defineProperty(ConfigManager, 'PEmitterEnabledAll', {
        get: function() {
            return !!Game_PEmitter.enabledAll;
        },
        set: function(value) {
            Game_PEmitter.enabledAll = !!value;
        },
        configurable: true
    });
    
    var _ConfigManager_makeData = ConfigManager.makeData;
    ConfigManager.makeData = function() {
        var config = _ConfigManager_makeData.apply(this, arguments);
        config.PEmitterEnabledAll = this.PEmitterEnabledAll;
        return config;
    };

    var _ConfigManager_applyData = ConfigManager.applyData; 
    ConfigManager.applyData = function(config) {
        _ConfigManager_applyData.apply(this, arguments);
        if (config['PEmitterEnabledAll'] === undefined) { // 初回読み込み？
            this.PEmitterEnabledAll = Game_PEmitter.enabledAll;
        } 
        else
            this.PEmitterEnabledAll = this.readFlag(config, 'PEmitterEnabledAll');
    };
    
})();

/*!
 * pixi-particles - v3.0.0
 * Compiled Mon, 12 Feb 2018 04:21:37 UTC
 * Copyright (c) 2015 CloudKid
 * 
 * pixi-particles is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
/*!
 * pixi-particles - v3.0.0
 * Compiled Mon, 12 Feb 2018 04:21:37 UTC
 *
 * pixi-particles is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
!function(t){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var e;e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,e.pixiParticles=t()}}(function(){return function(){function t(e,i,s){function a(n,o){if(!i[n]){if(!e[n]){var h="function"==typeof require&&require;if(!o&&h)return h(n,!0);if(r)return r(n,!0);var l=new Error("Cannot find module '"+n+"'");throw l.code="MODULE_NOT_FOUND",l}var p=i[n]={exports:{}};e[n][0].call(p.exports,function(t){var i=e[n][1][t];return a(i||t)},p,p.exports,t,e,i,s)}return i[n].exports}for(var r="function"==typeof require&&require,n=0;n<s.length;n++)a(s[n]);return a}return t}()({1:[function(t,e,i){"use strict";var s=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])};return function(e,i){function s(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(s.prototype=i.prototype,new s)}}();Object.defineProperty(i,"__esModule",{value:!0});var a=t("./Particle"),r=PIXI.Texture,n=function(t){function e(e){var i=t.call(this,e)||this;return i.textures=null,i.duration=0,i.framerate=0,i.elapsed=0,i.loop=!1,i}return s(e,t),e.prototype.init=function(){this.Particle_init(),this.elapsed=0,this.framerate<0&&(this.duration=this.maxLife,this.framerate=this.textures.length/this.duration)},e.prototype.applyArt=function(t){this.textures=t.textures,this.framerate=t.framerate,this.duration=t.duration,this.loop=t.loop},e.prototype.update=function(t){var e=this.Particle_update(t);if(e>=0){this.elapsed+=t,this.elapsed>this.duration&&(this.loop?this.elapsed=this.elapsed%this.duration:this.elapsed=this.duration-1e-6);var i=this.elapsed*this.framerate+1e-7|0;this.texture=this.textures[i]||PIXI.Texture.EMPTY}return e},e.prototype.destroy=function(){this.Particle_destroy(),this.textures=null},e.parseArt=function(t){for(var e,i,s,a,n,o=[],h=0;h<t.length;++h){e=t[h],o[h]=i={},i.textures=n=[],s=e.textures;for(var l=0;l<s.length;++l)if("string"==typeof(a=s[l]))n.push(r.fromImage(a));else if(a instanceof r)n.push(a);else{var p=a.count||1;for(a="string"==typeof a.texture?r.fromImage(a.texture):a.texture;p>0;--p)n.push(a)}"matchLife"==e.framerate?(i.framerate=-1,i.duration=0,i.loop=!1):(i.loop=!!e.loop,i.framerate=e.framerate>0?e.framerate:60,i.duration=n.length/i.framerate)}return o},e}(a.default);i.default=n},{"./Particle":3}],2:[function(t,e,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var s=t("./ParticleUtils"),a=t("./Particle"),r=t("./PropertyNode"),n=PIXI.ticker.shared,o=new PIXI.Point,h=function(){function t(t,e,i){this._particleConstructor=a.default,this.particleImages=null,this.startAlpha=null,this.startSpeed=null,this.minimumSpeedMultiplier=1,this.acceleration=null,this.maxSpeed=NaN,this.startScale=null,this.minimumScaleMultiplier=1,this.startColor=null,this.minLifetime=0,this.maxLifetime=0,this.minStartRotation=0,this.maxStartRotation=0,this.noRotation=!1,this.minRotationSpeed=0,this.maxRotationSpeed=0,this.particleBlendMode=0,this.customEase=null,this.extraData=null,this._frequency=1,this.spawnChance=1,this.maxParticles=1e3,this.emitterLifetime=-1,this.spawnPos=null,this.spawnType=null,this._spawnFunc=null,this.spawnRect=null,this.spawnCircle=null,this.particlesPerWave=1,this.particleSpacing=0,this.angleStart=0,this.rotation=0,this.ownerPos=null,this._prevEmitterPos=null,this._prevPosIsValid=!1,this._posChanged=!1,this._parent=null,this.addAtBack=!1,this.particleCount=0,this._emit=!1,this._spawnTimer=0,this._emitterLife=-1,this._activeParticlesFirst=null,this._activeParticlesLast=null,this._poolFirst=null,this._origConfig=null,this._origArt=null,this._autoUpdate=!1,this._destroyWhenComplete=!1,this._completeCallback=null,this.parent=t,e&&i&&this.init(e,i),this.recycle=this.recycle,this.update=this.update,this.rotate=this.rotate,this.updateSpawnPos=this.updateSpawnPos,this.updateOwnerPos=this.updateOwnerPos}return Object.defineProperty(t.prototype,"frequency",{get:function(){return this._frequency},set:function(t){this._frequency="number"==typeof t&&t>0?t:1},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"particleConstructor",{get:function(){return this._particleConstructor},set:function(t){if(t!=this._particleConstructor){this._particleConstructor=t,this.cleanup();for(var e=this._poolFirst;e;e=e.next)e.destroy();this._poolFirst=null,this._origConfig&&this._origArt&&this.init(this._origArt,this._origConfig)}},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"parent",{get:function(){return this._parent},set:function(t){this.cleanup(),this._parent=t},enumerable:!0,configurable:!0}),t.prototype.init=function(t,e){if(t&&e){this.cleanup(),this._origConfig=e,this._origArt=t,t=Array.isArray(t)?t.slice():[t];var i=this._particleConstructor;this.particleImages=i.parseArt?i.parseArt(t):t,e.alpha?this.startAlpha=r.default.createList(e.alpha):this.startAlpha=new r.default(1,0),e.speed?(this.startSpeed=r.default.createList(e.speed),this.minimumSpeedMultiplier=e.speed.minimumSpeedMultiplier||1):(this.minimumSpeedMultiplier=1,this.startSpeed=new r.default(0,0));var a=e.acceleration;a&&(a.x||a.y)?(this.startSpeed.next=null,this.acceleration=new PIXI.Point(a.x,a.y),this.maxSpeed=e.maxSpeed||NaN):this.acceleration=new PIXI.Point,e.scale?(this.startScale=r.default.createList(e.scale),this.minimumScaleMultiplier=e.scale.minimumScaleMultiplier||1):(this.startScale=new r.default(1,0),this.minimumScaleMultiplier=1),e.color?this.startColor=r.default.createList(e.color):this.startColor=new r.default({r:255,g:255,b:255},0),e.startRotation?(this.minStartRotation=e.startRotation.min,this.maxStartRotation=e.startRotation.max):this.minStartRotation=this.maxStartRotation=0,e.noRotation&&(this.minStartRotation||this.maxStartRotation)?this.noRotation=!!e.noRotation:this.noRotation=!1,e.rotationSpeed?(this.minRotationSpeed=e.rotationSpeed.min,this.maxRotationSpeed=e.rotationSpeed.max):this.minRotationSpeed=this.maxRotationSpeed=0,this.minLifetime=e.lifetime.min,this.maxLifetime=e.lifetime.max,this.particleBlendMode=s.default.getBlendMode(e.blendMode),e.ease?this.customEase="function"==typeof e.ease?e.ease:s.default.generateEase(e.ease):this.customEase=null,i.parseData?this.extraData=i.parseData(e.extraData):this.extraData=e.extraData||null,this.spawnRect=this.spawnCircle=null,this.particlesPerWave=1,e.particlesPerWave&&e.particlesPerWave>1&&(this.particlesPerWave=e.particlesPerWave),this.particleSpacing=0,this.angleStart=0;var n;switch(e.spawnType){case"rect":this.spawnType="rect",this._spawnFunc=this._spawnRect;var o=e.spawnRect;this.spawnRect=new PIXI.Rectangle(o.x,o.y,o.w,o.h);break;case"circle":this.spawnType="circle",this._spawnFunc=this._spawnCircle,n=e.spawnCircle,this.spawnCircle=new PIXI.Circle(n.x,n.y,n.r);break;case"ring":this.spawnType="ring",this._spawnFunc=this._spawnRing,n=e.spawnCircle,this.spawnCircle=new PIXI.Circle(n.x,n.y,n.r),this.spawnCircle.minRadius=n.minR;break;case"burst":this.spawnType="burst",this._spawnFunc=this._spawnBurst,this.particleSpacing=e.particleSpacing,this.angleStart=e.angleStart?e.angleStart:0;break;case"point":default:this.spawnType="point",this._spawnFunc=this._spawnPoint}this.frequency=e.frequency,this.spawnChance="number"==typeof e.spawnChance&&e.spawnChance>0?e.spawnChance:1,this.emitterLifetime=e.emitterLifetime||-1,this.maxParticles=e.maxParticles>0?e.maxParticles:1e3,this.addAtBack=!!e.addAtBack,this.rotation=0,this.ownerPos=new PIXI.Point,this.spawnPos=new PIXI.Point(e.pos.x,e.pos.y),this._prevEmitterPos=this.spawnPos.clone(),this._prevPosIsValid=!1,this._spawnTimer=0,this.emit=void 0===e.emit||!!e.emit,this.autoUpdate=void 0!==e.autoUpdate&&!!e.autoUpdate}},t.prototype.recycle=function(t){t.next&&(t.next.prev=t.prev),t.prev&&(t.prev.next=t.next),t==this._activeParticlesLast&&(this._activeParticlesLast=t.prev),t==this._activeParticlesFirst&&(this._activeParticlesFirst=t.next),t.prev=null,t.next=this._poolFirst,this._poolFirst=t,t.parent&&t.parent.removeChild(t),--this.particleCount},t.prototype.rotate=function(t){if(this.rotation!=t){var e=t-this.rotation;this.rotation=t,s.default.rotatePoint(e,this.spawnPos),this._posChanged=!0}},t.prototype.updateSpawnPos=function(t,e){this._posChanged=!0,this.spawnPos.x=t,this.spawnPos.y=e},t.prototype.updateOwnerPos=function(t,e){this._posChanged=!0,this.ownerPos.x=t,this.ownerPos.y=e},t.prototype.resetPositionTracking=function(){this._prevPosIsValid=!1},Object.defineProperty(t.prototype,"emit",{get:function(){return this._emit},set:function(t){this._emit=!!t,this._emitterLife=this.emitterLifetime},enumerable:!0,configurable:!0}),Object.defineProperty(t.prototype,"autoUpdate",{get:function(){return this._autoUpdate},set:function(t){this._autoUpdate&&!t?n.remove(this.update,this):!this._autoUpdate&&t&&n.add(this.update,this),this._autoUpdate=!!t},enumerable:!0,configurable:!0}),t.prototype.playOnceAndDestroy=function(t){this.autoUpdate=!0,this.emit=!0,this._destroyWhenComplete=!0,this._completeCallback=t},t.prototype.playOnce=function(t){this.emit=!0,this._completeCallback=t},t.prototype.update=function(t){if(this._autoUpdate&&(t=t/PIXI.settings.TARGET_FPMS/1e3),this._parent){var e,i,s;for(i=this._activeParticlesFirst;i;i=s)s=i.next,i.update(t);var a,r;this._prevPosIsValid&&(a=this._prevEmitterPos.x,r=this._prevEmitterPos.y);var n=this.ownerPos.x+this.spawnPos.x,o=this.ownerPos.y+this.spawnPos.y;if(this._emit)for(this._spawnTimer-=t;this._spawnTimer<=0;){if(this._emitterLife>0&&(this._emitterLife-=this._frequency,this._emitterLife<=0)){this._spawnTimer=0,this._emitterLife=0,this.emit=!1;break}if(this.particleCount>=this.maxParticles)this._spawnTimer+=this._frequency;else{var h=void 0;if(h=this.minLifetime==this.maxLifetime?this.minLifetime:Math.random()*(this.maxLifetime-this.minLifetime)+this.minLifetime,-this._spawnTimer<h){var l=void 0,p=void 0;if(this._prevPosIsValid&&this._posChanged){var c=1+this._spawnTimer/t;l=(n-a)*c+a,p=(o-r)*c+r}else l=n,p=o;e=0;for(var u=Math.min(this.particlesPerWave,this.maxParticles-this.particleCount);e<u;++e)if(!(this.spawnChance<1&&Math.random()>=this.spawnChance)){var d=void 0;if(this._poolFirst?(d=this._poolFirst,this._poolFirst=this._poolFirst.next,d.next=null):d=new this.particleConstructor(this),this.particleImages.length>1?d.applyArt(this.particleImages[Math.floor(Math.random()*this.particleImages.length)]):d.applyArt(this.particleImages[0]),d.alphaList.reset(this.startAlpha),1!=this.minimumSpeedMultiplier&&(d.speedMultiplier=Math.random()*(1-this.minimumSpeedMultiplier)+this.minimumSpeedMultiplier),d.speedList.reset(this.startSpeed),d.acceleration.x=this.acceleration.x,d.acceleration.y=this.acceleration.y,d.maxSpeed=this.maxSpeed,1!=this.minimumScaleMultiplier&&(d.scaleMultiplier=Math.random()*(1-this.minimumScaleMultiplier)+this.minimumScaleMultiplier),d.scaleList.reset(this.startScale),d.colorList.reset(this.startColor),this.minRotationSpeed==this.maxRotationSpeed?d.rotationSpeed=this.minRotationSpeed:d.rotationSpeed=Math.random()*(this.maxRotationSpeed-this.minRotationSpeed)+this.minRotationSpeed,d.noRotation=this.noRotation,d.maxLife=h,d.blendMode=this.particleBlendMode,d.ease=this.customEase,d.extraData=this.extraData,this._spawnFunc(d,l,p,e),d.init(),d.update(-this._spawnTimer),d.parent){var f=this._parent.children;if(f[0]==d)f.shift();else if(f[f.length-1]==d)f.pop();else{var m=f.indexOf(d);f.splice(m,1)}this.addAtBack?f.unshift(d):f.push(d)}else this.addAtBack?this._parent.addChildAt(d,0):this._parent.addChild(d);this._activeParticlesLast?(this._activeParticlesLast.next=d,d.prev=this._activeParticlesLast,this._activeParticlesLast=d):this._activeParticlesLast=this._activeParticlesFirst=d,++this.particleCount}}this._spawnTimer+=this._frequency}}this._posChanged&&(this._prevEmitterPos.x=n,this._prevEmitterPos.y=o,this._prevPosIsValid=!0,this._posChanged=!1),this._emit||this._activeParticlesFirst||(this._completeCallback&&this._completeCallback(),this._destroyWhenComplete&&this.destroy())}},t.prototype._spawnPoint=function(t,e,i){this.minStartRotation==this.maxStartRotation?t.rotation=this.minStartRotation+this.rotation:t.rotation=Math.random()*(this.maxStartRotation-this.minStartRotation)+this.minStartRotation+this.rotation,t.position.x=e,t.position.y=i},t.prototype._spawnRect=function(t,e,i){this.minStartRotation==this.maxStartRotation?t.rotation=this.minStartRotation+this.rotation:t.rotation=Math.random()*(this.maxStartRotation-this.minStartRotation)+this.minStartRotation+this.rotation,o.x=Math.random()*this.spawnRect.width+this.spawnRect.x,o.y=Math.random()*this.spawnRect.height+this.spawnRect.y,0!==this.rotation&&s.default.rotatePoint(this.rotation,o),t.position.x=e+o.x,t.position.y=i+o.y},t.prototype._spawnCircle=function(t,e,i){this.minStartRotation==this.maxStartRotation?t.rotation=this.minStartRotation+this.rotation:t.rotation=Math.random()*(this.maxStartRotation-this.minStartRotation)+this.minStartRotation+this.rotation,o.x=Math.random()*this.spawnCircle.radius,o.y=0,s.default.rotatePoint(360*Math.random(),o),o.x+=this.spawnCircle.x,o.y+=this.spawnCircle.y,0!==this.rotation&&s.default.rotatePoint(this.rotation,o),t.position.x=e+o.x,t.position.y=i+o.y},t.prototype._spawnRing=function(t,e,i){var a=this.spawnCircle;this.minStartRotation==this.maxStartRotation?t.rotation=this.minStartRotation+this.rotation:t.rotation=Math.random()*(this.maxStartRotation-this.minStartRotation)+this.minStartRotation+this.rotation,a.minRadius!==a.radius?o.x=Math.random()*(a.radius-a.minRadius)+a.minRadius:o.x=a.radius,o.y=0;var r=360*Math.random();t.rotation+=r,s.default.rotatePoint(r,o),o.x+=this.spawnCircle.x,o.y+=this.spawnCircle.y,0!==this.rotation&&s.default.rotatePoint(this.rotation,o),t.position.x=e+o.x,t.position.y=i+o.y},t.prototype._spawnBurst=function(t,e,i,s){0===this.particleSpacing?t.rotation=360*Math.random():t.rotation=this.angleStart+this.particleSpacing*s+this.rotation,t.position.x=e,t.position.y=i},t.prototype.cleanup=function(){var t,e;for(t=this._activeParticlesFirst;t;t=e)e=t.next,this.recycle(t),t.parent&&t.parent.removeChild(t);this._activeParticlesFirst=this._activeParticlesLast=null,this.particleCount=0},t.prototype.destroy=function(){this.autoUpdate=!1,this.cleanup();for(var t,e=this._poolFirst;e;e=t)t=e.next,e.destroy();this._poolFirst=this._parent=this.particleImages=this.spawnPos=this.ownerPos=this.startColor=this.startScale=this.startAlpha=this.startSpeed=this.customEase=this._completeCallback=null},t}();i.default=h},{"./Particle":3,"./ParticleUtils":4,"./PropertyNode":7}],3:[function(t,e,i){"use strict";var s=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])};return function(e,i){function s(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(s.prototype=i.prototype,new s)}}();Object.defineProperty(i,"__esModule",{value:!0});var a=t("./ParticleUtils"),r=t("./PropertyList"),n=PIXI.Sprite,o=function(t){function e(i){var s=t.call(this)||this;return s.emitter=i,s.anchor.x=s.anchor.y=.5,s.velocity=new PIXI.Point,s.maxLife=0,s.age=0,s.ease=null,s.extraData=null,s.alphaList=new r.default,s.speedList=new r.default,s.speedMultiplier=1,s.acceleration=new PIXI.Point,s.maxSpeed=NaN,s.scaleList=new r.default,s.scaleMultiplier=1,s.colorList=new r.default(!0),s._doAlpha=!1,s._doScale=!1,s._doSpeed=!1,s._doAcceleration=!1,s._doColor=!1,s._doNormalMovement=!1,s._oneOverLife=0,s.next=null,s.prev=null,s.init=s.init,s.Particle_init=e.prototype.init,s.update=s.update,s.Particle_update=e.prototype.update,s.Sprite_destroy=t.prototype.destroy,s.Particle_destroy=e.prototype.destroy,s.applyArt=s.applyArt,s.kill=s.kill,s}return s(e,t),e.prototype.init=function(){this.age=0,this.velocity.x=this.speedList.current.value*this.speedMultiplier,this.velocity.y=0,a.default.rotatePoint(this.rotation,this.velocity),this.noRotation?this.rotation=0:this.rotation*=a.default.DEG_TO_RADS,this.rotationSpeed*=a.default.DEG_TO_RADS,this.alpha=this.alphaList.current.value,this.scale.x=this.scale.y=this.scaleList.current.value,this._doAlpha=!!this.alphaList.current.next,this._doSpeed=!!this.speedList.current.next,this._doScale=!!this.scaleList.current.next,this._doColor=!!this.colorList.current.next,this._doAcceleration=0!==this.acceleration.x||0!==this.acceleration.y,this._doNormalMovement=this._doSpeed||0!==this.speedList.current.value||this._doAcceleration,this._oneOverLife=1/this.maxLife;var t=this.colorList.current.value;this.tint=a.default.combineRGBComponents(t.r,t.g,t.b),this.visible=!0},e.prototype.applyArt=function(t){this.texture=t||PIXI.Texture.EMPTY},e.prototype.update=function(t){if(this.age+=t,this.age>=this.maxLife)return this.kill(),-1;var e=this.age*this._oneOverLife;if(this.ease&&(e=4==this.ease.length?this.ease(e,0,1,1):this.ease(e)),this._doAlpha&&(this.alpha=this.alphaList.interpolate(e)),this._doScale){var i=this.scaleList.interpolate(e)*this.scaleMultiplier;this.scale.x=this.scale.y=i}if(this._doNormalMovement){if(this._doSpeed){var s=this.speedList.interpolate(e)*this.speedMultiplier;a.default.normalize(this.velocity),a.default.scaleBy(this.velocity,s)}else if(this._doAcceleration&&(this.velocity.x+=this.acceleration.x*t,this.velocity.y+=this.acceleration.y*t,this.maxSpeed)){var r=a.default.length(this.velocity);r>this.maxSpeed&&a.default.scaleBy(this.velocity,this.maxSpeed/r)}this.position.x+=this.velocity.x*t,this.position.y+=this.velocity.y*t}return this._doColor&&(this.tint=this.colorList.interpolate(e)),0!==this.rotationSpeed?this.rotation+=this.rotationSpeed*t:this.acceleration&&!this.noRotation&&(this.rotation=Math.atan2(this.velocity.y,this.velocity.x)),e},e.prototype.kill=function(){this.emitter.recycle(this)},e.prototype.destroy=function(){this.parent&&this.parent.removeChild(this),this.Sprite_destroy(),this.emitter=this.velocity=this.colorList=this.scaleList=this.alphaList=this.speedList=this.ease=this.next=this.prev=null},e.parseArt=function(t){var e;for(e=t.length;e>=0;--e)"string"==typeof t[e]&&(t[e]=PIXI.Texture.fromImage(t[e]));if(a.default.verbose)for(e=t.length-1;e>0;--e)if(t[e].baseTexture!=t[e-1].baseTexture){window.console&&console.warn("PixiParticles: using particle textures from different images may hinder performance in WebGL");break}return t},e.parseData=function(t){return t},e}(n);i.default=o},{"./ParticleUtils":4,"./PropertyList":6}],4:[function(t,e,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var s=PIXI.BLEND_MODES,a=t("./PropertyNode"),r={verbose:!1,DEG_TO_RADS:Math.PI/180,rotatePoint:function(t,e){if(t){t*=r.DEG_TO_RADS;var i=Math.sin(t),s=Math.cos(t),a=e.x*s-e.y*i,n=e.x*i+e.y*s;e.x=a,e.y=n}},combineRGBComponents:function(t,e,i){return t<<16|e<<8|i},normalize:function(t){var e=1/r.length(t);t.x*=e,t.y*=e},scaleBy:function(t,e){t.x*=e,t.y*=e},length:function(t){return Math.sqrt(t.x*t.x+t.y*t.y)},hexToRGB:function(t,e){e||(e={}),"#"==t.charAt(0)?t=t.substr(1):0===t.indexOf("0x")&&(t=t.substr(2));var i;return 8==t.length&&(i=t.substr(0,2),t=t.substr(2)),e.r=parseInt(t.substr(0,2),16),e.g=parseInt(t.substr(2,2),16),e.b=parseInt(t.substr(4,2),16),i&&(e.a=parseInt(i,16)),e},generateEase:function(t){var e=t.length,i=1/e;return function(s){var a,r,n=e*s|0;return a=(s-n*i)*e,r=t[n]||t[e-1],r.s+a*(2*(1-a)*(r.cp-r.s)+a*(r.e-r.s))}},getBlendMode:function(t){if(!t)return s.NORMAL;for(t=t.toUpperCase();t.indexOf(" ")>=0;)t=t.replace(" ","_");return s[t]||s.NORMAL},createSteppedGradient:function(t,e){void 0===e&&(e=10),("number"!=typeof e||e<=0)&&(e=10);var i=new a.default(t[0].value,t[0].time);i.isStepped=!0;for(var s=i,n=t[0],o=1,h=t[o],l=1;l<e;++l){for(var p=l/e;p>h.time;)n=h,h=t[++o];p=(p-n.time)/(h.time-n.time);var c=r.hexToRGB(n.value),u=r.hexToRGB(h.value),d={};d.r=(u.r-c.r)*p+c.r,d.g=(u.g-c.g)*p+c.g,d.b=(u.b-c.b)*p+c.b,s.next=new a.default(d,l/e),s=s.next}return i}};i.default=r},{"./PropertyNode":7}],5:[function(t,e,i){"use strict";var s=this&&this.__extends||function(){var t=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,e){t.__proto__=e}||function(t,e){for(var i in e)e.hasOwnProperty(i)&&(t[i]=e[i])};return function(e,i){function s(){this.constructor=e}t(e,i),e.prototype=null===i?Object.create(i):(s.prototype=i.prototype,new s)}}();Object.defineProperty(i,"__esModule",{value:!0});var a=t("./ParticleUtils"),r=t("./Particle"),n=new PIXI.Point,o=["pow","sqrt","abs","floor","round","ceil","E","PI","sin","cos","tan","asin","acos","atan","atan2","log"],h=new RegExp(["[01234567890\\.\\*\\-\\+\\/\\(\\)x ,]"].concat(o).join("|"),"g"),l=function(t){for(var e=t.match(h),i=e.length-1;i>=0;--i)o.indexOf(e[i])>=0&&(e[i]="Math."+e[i]);return t=e.join(""),new Function("x","return "+t+";")},p=function(t){function e(e){var i=t.call(this,e)||this;return i.path=null,i.initialRotation=0,i.initialPosition=new PIXI.Point,i.movement=0,i}return s(e,t),e.prototype.init=function(){this.initialRotation=this.rotation,this.Particle_init(),this.path=this.extraData.path,this._doNormalMovement=!this.path,this.movement=0,this.initialPosition.x=this.position.x,this.initialPosition.y=this.position.y},e.prototype.update=function(t){var e=this.Particle_update(t);if(e>=0&&this.path){var i=this.speedList.interpolate(e)*this.speedMultiplier;this.movement+=i*t,n.x=this.movement,n.y=this.path(this.movement),a.default.rotatePoint(this.initialRotation,n),this.position.x=this.initialPosition.x+n.x,this.position.y=this.initialPosition.y+n.y}return e},e.prototype.destroy=function(){this.Particle_destroy(),this.path=this.initialPosition=null},e.parseArt=function(t){return r.default.parseArt(t)},e.parseData=function(t){var e={};if(t&&t.path)try{e.path=l(t.path)}catch(t){a.default.verbose&&console.error("PathParticle: error in parsing path expression"),e.path=null}else a.default.verbose&&console.error("PathParticle requires a path string in extraData!"),e.path=null;return e},e}(r.default);i.default=p},{"./Particle":3,"./ParticleUtils":4}],6:[function(t,e,i){"use strict";function s(t){return this.ease&&(t=this.ease(t)),(this.next.value-this.current.value)*t+this.current.value}function a(t){this.ease&&(t=this.ease(t));var e=this.current.value,i=this.next.value,s=(i.r-e.r)*t+e.r,a=(i.g-e.g)*t+e.g,r=(i.b-e.b)*t+e.b;return l.default.combineRGBComponents(s,a,r)}function r(t){for(this.ease&&(t=this.ease(t));t>this.next.time;)this.current=this.next,this.next=this.next.next;return t=(t-this.current.time)/(this.next.time-this.current.time),(this.next.value-this.current.value)*t+this.current.value}function n(t){for(this.ease&&(t=this.ease(t));t>this.next.time;)this.current=this.next,this.next=this.next.next;t=(t-this.current.time)/(this.next.time-this.current.time);var e=this.current.value,i=this.next.value,s=(i.r-e.r)*t+e.r,a=(i.g-e.g)*t+e.g,r=(i.b-e.b)*t+e.b;return l.default.combineRGBComponents(s,a,r)}function o(t){for(this.ease&&(t=this.ease(t));this.next&&t>this.next.time;)this.current=this.next,this.next=this.next.next;return this.current.value}function h(t){for(this.ease&&(t=this.ease(t));this.next&&t>this.next.time;)this.current=this.next,this.next=this.next.next;var e=this.current.value;return l.default.combineRGBComponents(e.r,e.g,e.b)}Object.defineProperty(i,"__esModule",{value:!0});var l=t("./ParticleUtils"),p=function(){function t(t){void 0===t&&(t=!1),this.current=null,this.next=null,this.isColor=!!t,this.interpolate=null,this.ease=null}return t.prototype.reset=function(t){this.current=t,this.next=t.next,this.next&&this.next.time>=1?this.interpolate=this.isColor?a:s:t.isStepped?this.interpolate=this.isColor?h:o:this.interpolate=this.isColor?n:r,this.ease=this.current.ease},t}();i.default=p},{"./ParticleUtils":4}],7:[function(t,e,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var s=t("./ParticleUtils"),a=function(){function t(t,e,i){this.value="string"==typeof t?s.default.hexToRGB(t):t,this.time=e,this.next=null,this.isStepped=!1,this.ease=i?"function"==typeof i?i:s.default.generateEase(i):null}return t.createList=function(e){if(Array.isArray(e.list)){var i=e.list,s=void 0,a=void 0;if(a=s=new t(i[0].value,i[0].time,e.ease),i.length>2||2===i.length&&i[1].value!==i[0].value)for(var r=1;r<i.length;++r)s.next=new t(i[r].value,i[r].time),s=s.next;return a.isStepped=!!e.isStepped,a}var n=new t(e.start,0);return e.end!==e.start&&(n.next=new t(e.end,1)),n},t}();i.default=a},{"./ParticleUtils":4}],8:[function(t,e,i){"use strict";Object.defineProperty(i,"__esModule",{value:!0});var s=t("./ParticleUtils.js");i.ParticleUtils=s.default;var a=t("./Particle.js");i.Particle=a.default;var r=t("./Emitter.js");i.Emitter=r.default;var n=t("./PathParticle.js");i.PathParticle=n.default;var o=t("./AnimatedParticle.js");i.AnimatedParticle=o.default},{"./AnimatedParticle.js":1,"./Emitter.js":2,"./Particle.js":3,"./ParticleUtils.js":4,"./PathParticle.js":5}],9:[function(t,e,i){"use strict";if(Object.defineProperty(i,"__esModule",{value:!0}),"undefined"==typeof PIXI)throw"pixi-particles requires pixi.js to be loaded first";PIXI.particles||(PIXI.particles={});var s=t("./particles");for(var a in s)PIXI.particles[a]=s[a]},{"./particles":8}]},{},[9])(9)});
//# sourceMappingURL=pixi-particles.js.map

/* ============================================================
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Open source under the BSD License.
 *
 * Copyright c 2008 George McGinley Smith
 * All rights reserved.
 * https://raw.github.com/danro/jquery-easing/master/LICENSE
 * ======================================================== */
var EasingFunctions;
if(EasingFunctions === undefined) {
    EasingFunctions = 
    {
        // t: current time, b: begInnIng value, c: change In value, d: duration
        linear: function(t, b, c, d) {
            return c*(t/d) + b;
        },
        easeInQuad: function (t, b, c, d) {
            return c*(t/=d)*t + b;
        },
        easeOutQuad: function (t, b, c, d) {
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOutQuad: function (t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        },
        easeInCubic: function (t, b, c, d) {
            return c*(t/=d)*t*t + b;
        },
        easeOutCubic: function (t, b, c, d) {
            return c*((t=t/d-1)*t*t + 1) + b;
        },
        easeInOutCubic: function (t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        },
        easeInQuart: function (t, b, c, d) {
            return c*(t/=d)*t*t*t + b;
        },
        easeOutQuart: function (t, b, c, d) {
            return -c * ((t=t/d-1)*t*t*t - 1) + b;
        },
        easeInOutQuart: function (t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
            return -c/2 * ((t-=2)*t*t*t - 2) + b;
        },
        easeInQuint: function (t, b, c, d) {
            return c*(t/=d)*t*t*t*t + b;
        },
        easeOutQuint: function (t, b, c, d) {
            return c*((t=t/d-1)*t*t*t*t + 1) + b;
        },
        easeInOutQuint: function (t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
            return c/2*((t-=2)*t*t*t*t + 2) + b;
        },
        easeInSine: function (t, b, c, d) {
            return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
        },
        easeOutSine: function (t, b, c, d) {
            return c * Math.sin(t/d * (Math.PI/2)) + b;
        },
        easeInOutSine: function (t, b, c, d) {
            return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
        },
        easeInExpo: function (t, b, c, d) {
            return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
        },
        easeOutExpo: function (t, b, c, d) {
            return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
        },
        easeInOutExpo: function (t, b, c, d) {
            if (t==0) return b;
            if (t==d) return b+c;
            if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
            return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function (t, b, c, d) {
            return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
        },
        easeOutCirc: function (t, b, c, d) {
            return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
        },
        easeInOutCirc: function (t, b, c, d) {
            if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
            return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
        },
        easeInElastic: function (t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (c==0||t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        },
        easeOutElastic: function (t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (c==0||t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
        },
        easeInOutElastic: function (t, b, c, d) {
            var s=1.70158;var p=0;var a=c;
            if (c==0||t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
            if (a < Math.abs(c)) { a=c; var s=p/4; }
            else var s = p/(2*Math.PI) * Math.asin (c/a);
            if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
            return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
        },
        easeInBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*(t/=d)*t*((s+1)*t - s) + b;
        },
        easeOutBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        },
        easeInOutBack: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158; 
            if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
            return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
        },
        easeInBounce: function (t, b, c, d) {
            return c - this.easeOutBounce(d-t, 0, c, d) + b;
        },
        easeOutBounce: function (t, b, c, d) {
            if ((t/=d) < (1/2.75)) {
                return c*(7.5625*t*t) + b;
            } else if (t < (2/2.75)) {
                return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
            } else if (t < (2.5/2.75)) {
                return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
            } else {
                return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
            }
        },
        easeInOutBounce: function (t, b, c, d) {
            if (t < d/2) return this.easeInBounce(t*2, 0, c, d) * .5 + b;
            return this.easeOutBounce(t*2-d, 0, c, d) * .5 + c*.5 + b;
        }
    }
}


/*
 *
 * TERMS OF USE - EASING EQUATIONS
 * 
 * Open source under the BSD License. 
 * 
 * Copyright c 2001 Robert Penner
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this list of 
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list 
 * of conditions and the following disclaimer in the documentation and/or other materials 
 * provided with the distribution.
 * 
 * Neither the name of the author nor the names of contributors may be used to endorse 
 * or promote products derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
 * OF THE POSSIBILITY OF SUCH DAMAGE. 
 *
 */