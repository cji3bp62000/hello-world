//=============================================================================
// AnimationFrameRate.js
// by Tsukimi
// Last Updated: 2018.02.11
//=============================================================================

/*:en
 * @plugindesc AnimationFrameRate
 * @author Tsukimi
 * 
 * @param framerate:1
 * @desc animation plays 60 animation frame per sec with name start with this symbol
 * @default !
 * 
 * @param framerate:2
 * @desc animation plays 30 animation frame per sec with name start with this symbol
 * @default &
 * 
 * @param framerate:3
 * @desc animation plays 20 animation frame per sec with name start with this symbol
 * @default $
 * 
 * @param framerate:5
 * @desc animation plays 12 animation frame per sec with name start with this symbol
 * @default #
 * 
 * @param framerate:6
 * @desc animation plays 10 animation frame per sec with name start with this symbol
 * @default %
 *
 * @help
 * RPG Maker MV plays animation as
 * 4 frame(time)/ 1 animation frame.
 * With this plugin, you can adjust the frame rate of each animation.
 * 
 * -----------------
 * 
 */
/*:ja
 * @plugindesc アニメフレームレート
 * @author ツキミ
 * 
 * @param framerate:1
 * @desc 一秒あたり60フレーム再生したいアニメーションの接頭語
 * @default !
 * 
 * @param framerate:2
 * @desc 一秒あたり30フレーム再生したいアニメーションの接頭語
 * @default &
 * 
 * @param framerate:3
 * @desc 一秒あたり20フレーム再生したいアニメーションの接頭語
 * @default $
 * 
 * @param framerate:5
 * @desc 一秒あたり12フレーム再生したいアニメーションの接頭語
 * @default #
 * 
 * @param framerate:6
 * @desc 一秒あたり10フレーム再生したいアニメーションの接頭語
 * @default %
 * 
 * 
 * @help
 * ツクールMVではデフォルトで、
 * 1アニメーションフレームに 4フレーム（時間）かかりますが、
 * このプラグインを使えば、アニメーション毎のフレームレートが設定できます。
 * 
 * (デフォ：一秒あたり15フレーム再生される)
 * 
 * -----------------
 * 
 */

(function() {
    'use strict';
    
    var pluginName = 'AnimationFrameRate';
    var getParam = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return "";
    };
    
    var FR1 = getParam("framerate:1").substr(0, 1);
    var FR2 = getParam("framerate:2").substr(0, 1);
    var FR3 = getParam("framerate:3").substr(0, 1);
    var FR5 = getParam("framerate:5").substr(0, 1);
    var FR6 = getParam("framerate:6").substr(0, 1);
    
    var _Sprite_Animation_setupRate = Sprite_Animation.prototype.setupRate;
    Sprite_Animation.prototype.setupRate = function() {
        if(!this._animation) {
            _Sprite_Animation_setupRate.apply(this, arguments); 
            return;
        }
        var initial = this._animation.name.substr(0,1);
        if(initial === FR1) this._rate = 1;
        else if(initial === FR2) this._rate = 2;
        else if(initial === FR3) this._rate = 3;
        else if(initial === FR5) this._rate = 5;
        else if(initial === FR6) this._rate = 6;
        else _Sprite_Animation_setupRate.apply(this, arguments);
    };
    
})();
