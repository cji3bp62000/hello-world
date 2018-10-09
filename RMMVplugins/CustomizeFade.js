//=============================================================================
// CustomizeFade.js
// by Tsukimi
// Last Updated: 2018.10.05
// update history:
// 2018.10.05 v1.0 finished
//=============================================================================

/*:ja
 * @plugindesc CustomizeFade
 * @author Tsukimi
 * 
 * 
 * @help
 * 
 * カスタマイズフェード
 * 作者：ツキミ
 * 
 * コマンド「フェード」のパラメータを調整するプラグイン。
 * 
 * ***************************************************
 * プラグインコマンド：
 *  イベントコマンド「プラグインコマンド」から実行。
 *  （パラメータの間は半角スペースで区切る）
 * 
 * 　customizefade dur/duration/time [フェード時間]
 * 　　フェード時間(f)を調整する。（デフォ：24f）
 * 　　例：customizefade dur 90
 * 
 * 　customizefade color [r] [g] [b]
 * 　　フェードの色を指定する。（値範囲：0~255）
 * 　　例：customizefade color 255 0 0
 */

(function() {
    "use strict";
    
    //===========================
    // Game_Interpreter
    //  Plugin Command setting.
    //===========================
    
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        
        switch ((command || '').toUpperCase()) {
                
            case 'CUSTOMIZEFADE':
                
                switch ((args[0] || '').toUpperCase()) {
                case 'DUR':
                case 'DURATION':
                case 'TIME':
                        $gameScreen._fadeDuration = Number(args[1]) || $gameScreen._fadeDuration;
                    break;
                        
                case 'COLOR':
                        var color = $gameScreen.fadeColor();
                        var r = Number(args[1]) || color[0];
                        var g = Number(args[2]) || color[1];
                        var b = Number(args[3]) || color[2];
                        $gameScreen._fadeColor = [r,g,b];
                    break;
                }
                
                break;
                
        }
    };
    
    //===========================
    // Game_Interpreter & Game_Screen
    //  for saving
    //===========================
    
    Game_Interpreter.prototype.fadeSpeed = function() {
        return $gameScreen.fadeDuration();
    };
    
    var _Game_Screen_initialize = Game_Screen.prototype.initialize;
    Game_Screen.prototype.initialize = function() {
        _Game_Screen_initialize.apply(this, arguments);
        this._fadeColor = [0, 0, 0];
        this._fadeDuration = 24;
    };
    
    Game_Screen.prototype.fadeDuration = function() {
        return this._fadeDuration;
    };
    
    Game_Screen.prototype.fadeColor = function() {
        return this._fadeColor;
    };
    
    //===========================
    // Sprite
    //  actual sprite adjusting
    //===========================
    
    var _Spriteset_Base_updateScreenSprites = Spriteset_Base.prototype.updateScreenSprites;
    Spriteset_Base.prototype.updateScreenSprites = function() {
        _Spriteset_Base_updateScreenSprites.apply(this, arguments);
        
        var color = $gameScreen.fadeColor();
        this._fadeSprite.setColor(color[0], color[1], color[2]);
    };
    
})();