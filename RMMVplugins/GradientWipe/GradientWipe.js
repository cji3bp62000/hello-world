//=============================================================================
// GradientWipe.js
// ----------------------------------------------------------------------------
// Copyright (c) 2018 Tsukimi
// ----------------------------------------------------------------------------
// Version
// 1.0.0 2018/01/22 リリース release
//=============================================================================

/*:en
 * @plugindesc GradientWipe
 * @author Tsukimi
 * 
 * @param -- Transition --
 * @desc -- Transition Settings --
 * 
 * @param Use Custom Transition
 * @desc use gradient wipe transition as default or not.
 * value: true/false
 * @default true
 * 
 * @param Transition Fade Image
 * @desc the Gradient Wipe Image used when Screen fading.
 * please create img/transitions folder and put img inside it.
 * @default 
 * 
 * @param Transition FadeIn Image
 * @desc the Gradient Wipe Image used when fading in.
 * blank -> will use 'Transition Fade Image' instead.
 * @default 
 * 
 * @param Transition FadeOut Image
 * @desc the Gradient Wipe Image used when fading out.
 * blank -> will use 'Transition Fade Image' instead.
 * @default 
 * 
 * @param Transition Softness
 * @desc the softness/smoothness of trasition effect.
 * 0 or value above 1 is desirable.(no upper abound)
 * @default 8
 * 
 * @param Transition Duration
 * @desc the transition Duration of fading.
 * RPG Maker Default: 24(frames)
 * @default 36
 * 
 * 
 * @param -- Message Box --
 * @desc -- Message Box Fading Settings --
 * 
 * @param Use Custom Message Fade
 * @desc use gradient wipe transition as default or not.
 * value: true/false
 * @default false
 * 
 * @param Message Fade Image
 * @desc the Gradient Wipe Image used when Message fading.
 * @default 
 * 
 * @param Message Fade Duration
 * @desc the transition time of fading message box.
 * RPG Maker Default: 8(frames)
 * @default 24
 * 
 * @help
 * *** Gradient Wipe Effect
 * or: Gradient Fade/Luma Wipe/Luma Fade ... etc.
 * Author: Tsukimi
 * 
 * This plugin will create a Transition Effect
 * such as RPG MAKER 2000/VX does.
 * 
 * *** Notice !!! ***
 * this is an webGL depending effect.
 * If your RMMV version is below 1.5.0 and your game
 * will be on website/smartphone, this effect may not work.
 * (OK for desktop application, even with version below 1.5.0)
 * 
 * Please create 'transitions' folder
 * under the img/ directory, and put Gradient Images
 * in it.
 * 
 * There are 3 kind of effect targets:
 * 1. Screen Transition
 * 2. character/picture fade
 * 3. message window
 * 
 * *** Plugin Command:
 * --------------------
 * target 1: Screen Transition
 * 
 * 　GWTransition <on/off>
 * 　　use Gradient Wipe transition or RM default 
 * 　　transition.
 * 
 * 　GWTrans_Setting FadeImg <imageName>
 * 　　set Gradient Image for transition.
 * 　　Ignore the <>.
 * 
 * 　GWTrans_Setting FadeInImg <imageName>
 * 　　set Gradient Image for transition(only for fade in).
 * 　　Ignore the <>.
 * 
 * 　GWTrans_Setting FadeOutImg <imageName>
 * 　　set Gradient Image for transition(only for fade in).
 * 　　Ignore the <>.
 * 
 * 　GWTrans_Setting Duration <frames>
 * 　　set the fading effect duration(in frame).
 * 　　Ignore the <>.
 * 
 * 
 * --------------------
 * target 2: Character/Picture Fading
 * 
 * 　GWFade character <id> [fadeIn/fadeOut] <imgName> <duration> (<softness>)
 * 
 * 　　set Gradient Wipe effect for character.
 * 　　id: -1(gamePlayer), 0(this Event), 1~(Event ID)
 * 
 * 　　if use fadeOut, will automatically turn
 * 　　the opacity of character to 0 after effect ends.
 * 
 * 　　softness is an optional parameter.
 * 　　default is 0, and mostly 5~10 is enough.
 * 
 * 　　example:
 * 　　GWFade character -1 fadeOut Circle 60
 * 　　-> game Player will fade out using 'Circle.png' in 60f.
 * 
 * 
 * 　GWFade picture <id> [fadeIn/fadeOut] <imgName> <duration> (<softness>)
 * 
 * 　　set Gradient Wipe effect for picture.
 * 　　parameters are the same as character.
 * 
 * 　　example:
 * 　　GWFade picture 1 fadeIn Circle 60 5
 * 　　-> Picture No.1 will fade in using 'Circle.png' in 60f,
 * 　　with softness 5.
 * 
 * 
 * --------------------
 * target 3: Message Window Fading
 * 
 * 　GWMessageFade <on/off>
 * 　　use Gradient Wipe fade or RM default open/close
 * 　　window effect.
 * 
 * 　GWMessage_Setting FadeImg <imageName>
 * 　　set Gradient Image for transition.
 * 　　Ignore the <>.
 * 
 * 　GWMessage_Setting Duration <frames>
 * 　　set the fading effect duration(in frame).
 * 　　Ignore the <>.
 * 
 */


(function() {
    "use strict";
    
    var getBoolean = function(bString) { if(bString.toLowerCase() === 'off')return false; return true; };
    var getNumber  = function(nString) { return Number((nString || '')) || 0; };
    var pluginName = 'GradientWipe';
    var getParamString = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name) return name;
        }
        return null;
    };
    var getParamNumber = function(paramNames) {
        var value = getParamString(paramNames);
        return Number((value || '')) || 0;
    };
    var getParamBoolean = function(paramNames) {
        var value = getParamString(paramNames);
        return (value || '').toUpperCase() === 'TRUE';
    };
    
    //=============================================================================
    // Game_Interpreter
    //  Plugin Command setting.
    //=============================================================================
    
    var _Game_Interpreter_pluginCommand      = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.apply(this, arguments);
        
        switch ((command || '').toUpperCase()) {
            case 'GWTRANSITION':
                $gameScreen._useGWTrans = getBoolean(args[0]);
                break;
                
            case 'GWTRANS_SETTING':
                switch ((args[0] || '').toUpperCase()) {
                    case 'FADEIMG':
                        $gameScreen._GWImg = args[1];
                        break;
                        
                    case 'FADEINIMG':
                        $gameScreen._GWInImg = args[1];
                        break;
                        
                    case 'FADEOUTIMG':
                        $gameScreen._GWOutImg = args[1];
                        break;
                        
                    case 'DURATION':
                        $gameScreen._fadeDuration = getNumber(args[1]);
                        break;
                                                     }
                break;
                
            case 'GWFADE':
                // GWFADE PICTURE ID FADEIN IMG DURATION (SOFTNESS)
                switch ((args[0] || '').toUpperCase()) {
                    case 'CHARACTER':
                        var target = this.character(getNumber(args[1]));
                        if(target) {
                            target._GWInfo = $gameScreen.createGWInfo(args.slice(2));
                        }
                        break;
                        
                    case 'PICTURE':
                        var target = $gameScreen.picture(getNumber(args[1]));
                        if(target) {
                            target._GWInfo = $gameScreen.createGWInfo(args.slice(2));
                        }
                        break;
                                                     }
                break;
                
            case 'GWMESSAGEFADE':
                $gameSystem.GWMessageSetting.useGW = getBoolean(args[0]);
                break;
                
            case 'GWMESSAGE_SETTING':
                switch ((args[0] || '').toUpperCase()) {
                    case 'FADEIMG':
                        $gameSystem.GWMessageSetting.imgName = args[1];
                        break;
                        
                    case 'DURATION':
                        $gameSystem.GWMessageSetting.fadeSpeed = 256 / getNumber(args[1]);
                        break;
                                                     }
                break;
                                             }
    };
    
    //=============================================================================
    //  ***Manager
    //  necessary settings of ImageManager/SceneManager
    //=============================================================================
    if(!ImageManager.loadTransitions) {
        ImageManager.loadTransitions = function(filename, hue) {
            return this.loadBitmap('img/transitions/', filename, hue, false);
        };
    }
    
    SceneManager._useGWTrans    = getParamBoolean(['Use Custom Transition']);
    SceneManager._GWImg         = getParamString(['Transition Fade Image']);
    SceneManager._GWInImg       = getParamString(['Transition FadeIn Image']);
    SceneManager._GWOutImg      = getParamString(['Transition FadeOut Image']);
    SceneManager.GWSoftness     = getParamNumber(['Transition Softness']);
    SceneManager._fadeDuration  = parseInt( getParamNumber(['Transition Duration']) );
    
    SceneManager.useGWTrans = function() {
        return $gameScreen ? $gameScreen.useGWTrans() : this._useGWTrans;
    };
    
    SceneManager.GWImg = function() {
        return $gameScreen ? $gameScreen.GWImg() : this._GWImg;
    };
    
    SceneManager.GWInImg = function() {
        return $gameScreen ? $gameScreen.GWInImg() : (this._GWInImg || this._GWImg);
    };
    
    SceneManager.GWOutImg = function() {
        return $gameScreen ? $gameScreen.GWOutImg() : (this._GWOutImg || this._GWImg);
    };
    
    SceneManager.fadeDuration = function() {
        return $gameScreen ? $gameScreen.fadeDuration() : (this._fadeDuration || 24);
    };
    
    //=============================================================================
    //  custom function: apply/remove Fade GWFilter (for Screen Fading)
    //  for Scene_Base and SpriteSet_Base (they share property: _fadeSprite)
    //=============================================================================
    var applyFadeGWFilter = function(imgName) {
        var GWsprite = new Sprite(ImageManager.loadTransitions(imgName)),
            f = new PIXI.filters.GradientWipeFilter(GWsprite, SceneManager.GWSoftness);
        this.removeFadeGWFilter();
        var fArr = this._fadeSprite.filters || [];
        this._GWFadeFilter = f;
        fArr.push(f);
        this._fadeSprite.filters = fArr;
    };
    
    var removeFadeGWFilter = function() {
        if(!this._GWFadeFilter) return;
        var fArr = this._fadeSprite.filters || [];
        var index = fArr.indexOf(this._GWFadeFilter);
        if(index >= 0) fArr.splice(index, 1);
        this._fadeSprite.filters = fArr;
        this._GWFadeFilter = undefined;
    };
    
    //=============================================================================
    //  custom function: apply/remove GWFilter (for Sprite/Window Fading)
    //  for Sprite_Base and Window_Base
    //=============================================================================
    
    var applyGWFilter = function(imgName, softness) {
        var GWsprite = new Sprite(ImageManager.loadTransitions(imgName)),
            f = new PIXI.filters.GradientWipeFilter(GWsprite, softness);
        this.removeGWFilter();
        var fArr = this.filters || [];
        this._GWFilter = f;
        fArr.push(f);
        this.filters = fArr;
    };
    
    var removeGWFilter = function() {
        if(!this._GWFilter) return;
        var fArr = this.filters || [];
        var index = fArr.indexOf(this._GWFilter);
        if(index >= 0) fArr.splice(index, 1);
        console.log(fArr);
        this.filters = fArr;
        this._GWFilter = undefined;
    };
    
    //=============================================================================
    //  Scene_Base
    //  necessary settings of Scene fading
    //=============================================================================
    
    Scene_Base.prototype.applyFadeGWFilter  = applyFadeGWFilter;
    Scene_Base.prototype.removeFadeGWFilter = removeFadeGWFilter;
    
    var _Scene_Base_startFadeIn = Scene_Base.prototype.startFadeIn;
    Scene_Base.prototype.startFadeIn = function(duration, white) {
        _Scene_Base_startFadeIn.apply(this, arguments);
        if(SceneManager.useGWTrans() && SceneManager.GWInImg()) {
            this.applyFadeGWFilter(SceneManager.GWInImg());
            this._GWFadeFilter.time = 255 + this._GWFadeFilter.softness;
            this._GWSpeed = (this._GWFadeFilter.time + 1) / this._fadeDuration;
        }
    };
    
    var _Scene_Base_startFadeOut = Scene_Base.prototype.startFadeOut;
    Scene_Base.prototype.startFadeOut = function(duration, white) {
        _Scene_Base_startFadeOut.apply(this, arguments);
        if(SceneManager.useGWTrans() && SceneManager.GWOutImg()) {
            this._fadeSprite.opacity = 255;
            this.applyFadeGWFilter(SceneManager.GWOutImg());
            this._GWSpeed = (255+1 + this._GWFadeFilter.softness) / this._fadeDuration;
        }
    };
    
    var _Scene_Base_updateFade = Scene_Base.prototype.updateFade;
    Scene_Base.prototype.updateFade = function() {
        if(!SceneManager.useGWTrans()) _Scene_Base_updateFade.apply(this, arguments);
        else {
            if (this._fadeDuration > 0 && this._GWFadeFilter) {
                this._GWFadeFilter.time += - this._fadeSign * (this._GWSpeed || 0);
                this._fadeDuration--;
                if(this._fadeDuration === 0) {
                    this.removeFadeGWFilter();
                    this._fadeSprite.opacity = 127.5 - this._fadeSign * 127.5;
                }
            }
        }
    };
    
    // overload fadeSpeed <- weird name?
    Scene_Base.prototype.fadeSpeed = function() {
        return SceneManager.fadeDuration();
    };
        
    //=============================================================================
    //  Game_Screen
    //  necessary settings of game screen fading
    //=============================================================================
    Game_Screen.prototype.fadeDuration = function() {
        return this._fadeDuration;
    };
    
    Game_Interpreter.prototype.fadeSpeed = function() {
        return $gameScreen.fadeDuration();
    };
    
    var _Game_Screen_initialize = Game_Screen.prototype.initialize;
    Game_Screen.prototype.initialize = function() {
        _Game_Screen_initialize.apply(this, arguments);
        this._fadeDuration  = parseInt( getParamNumber(['Transition Duration']) );
        this._useGWTrans    = getParamBoolean(['Use Custom Transition']);
        this._GWImg         = getParamString(['Transition Fade Image']);
        this._GWInImg       = getParamString(['Transition FadeIn Image']);
        this._GWOutImg      = getParamString(['Transition FadeOut Image']);
    };
    
    Game_Screen.prototype.useGWTrans = function() {return this._useGWTrans;};
    
    var _Game_Screen_startFadeOut = Game_Screen.prototype.startFadeOut;
    Game_Screen.prototype.startFadeOut = function(duration) {
        _Game_Screen_startFadeOut.apply(this, arguments);
        this._needFilter = -1;
    };

    var _Game_Screen_startFadeIn = Game_Screen.prototype.startFadeIn;
    Game_Screen.prototype.startFadeIn = function(duration) {
        _Game_Screen_startFadeIn.apply(this, arguments);
        this._needFilter = 1;
    };
    
    Game_Screen.prototype.GWImg = function() {
        return this._GWImg;
    };
    
    Game_Screen.prototype.GWInImg = function() {
        return this._GWInImg || this._GWImg;
    };
    
    Game_Screen.prototype.GWOutImg = function() {
        return this._GWOutImg || this._GWImg;
    };
    
    //=============================================================================
    //  Spriteset
    //  necessary settings of game screen fading (actually applying/removing GWFilter)
    //=============================================================================
    
    Spriteset_Base.prototype.applyFadeGWFilter  = applyFadeGWFilter;
    Spriteset_Base.prototype.removeFadeGWFilter = removeFadeGWFilter;
    
    var _Spriteset_Base_updateScreenSprites = Spriteset_Base.prototype.updateScreenSprites;
    Spriteset_Base.prototype.updateScreenSprites = function() {
        _Spriteset_Base_updateScreenSprites.apply(this, arguments);
        if(!$gameScreen.useGWTrans()) return;
        if($gameScreen._needFilter) {
            this.applyFadeGWFilter($gameScreen._needFilter>0 ? $gameScreen.GWInImg():$gameScreen.GWOutImg());
            $gameScreen._needFilter = undefined;
        }
        if($gameScreen._fadeOutDuration || $gameScreen._fadeInDuration) {
            this._fadeSprite.opacity = 255;
            var f = this._GWFadeFilter;
            f.time = (255+1 + f.softness) * (255-$gameScreen.brightness())/255;
        }
        else {
            this.removeFadeGWFilter();
        }
    };
    
    //=============================================================================
    //  Sprite
    //  necessary settings of sprite
    //=============================================================================
    var _Sprite_update = Sprite.prototype.update;
    Sprite.prototype.update = function() {
        _Sprite_update.apply(this, arguments);
        this.updateGW();
    };
    
    Sprite.prototype.updateGW = function() {
        var info = this.getGWInfo();
        this.checkGWNeed(info);
        if(this._GWFilter) this.updateGWParam(info);
    };
    
    // for overload
    Sprite.prototype.getGWInfo = function() {
        return null;
    };
    
    Sprite.prototype.applyGWFilter = function(info) {
        applyGWFilter.apply(this, [info.imgName, info.softness]);
    };
    
    Sprite.prototype.removeGWFilter = function() {
        removeGWFilter.apply(this, arguments);
    };
    
    Sprite.prototype.checkGWNeed = function(info) {
        if(!info) {
            this.removeGWFilter();
            return;
        }
        if(!this._GWFilter || info.isNew) {
            this.applyGWFilter(info);
            info.isNew = false;
        }
    };
    
    Sprite.prototype.updateGWParam = function(info) {
        this._GWFilter.time = info.time;
    };
    
    //=============================================================================
    //  Sprite_*
    //  overload of function 'getGWInfo'
    //=============================================================================
    Sprite_Character.prototype.getGWInfo = function() {
        if(!this._character) return null;
        return this._character.GWInfo();
    };
    
    Sprite_Picture.prototype.getGWInfo = function() {
        if(!this.picture()) return null;
        return this.picture().GWInfo();
    };
    
    //=============================================================================
    //  Game_*
    //  overload function 'GWInfo', and update param of info; +createInfo
    //=============================================================================
    Game_Character.prototype.GWInfo = function() {
        return this._GWInfo;
    };
    
    Game_Picture.prototype.GWInfo = function() {
        return this._GWInfo;
    };
    
    var _Game_Character_update = Game_Character.prototype.update;
    Game_Character.prototype.update = function() {
        _Game_Character_update.apply(this, arguments);
        this.updateGWInfo();
    };
    
    Game_Character.prototype.updateGWInfo = function() {
        if(!this._GWInfo) return;
        this._GWInfo.time += this._GWInfo.fadeSpeed;
        if(this._GWInfo.time>(255+this._GWInfo.softness)) {
            this._GWInfo = undefined;
        }
        else if(this._GWInfo.time<0) {
            this._GWInfo = undefined;
            this._opacity = 0;
        }
    };
    
    var _Game_Picture_update = Game_Picture.prototype.update;
    Game_Picture.prototype.update = function() {
        _Game_Picture_update.apply(this, arguments);
        this.updateGWInfo();
    };
    
    Game_Picture.prototype.updateGWInfo = function() {
        if(!this._GWInfo) return;
        this._GWInfo.time += this._GWInfo.fadeSpeed;
        if(this._GWInfo.time>(255+this._GWInfo.softness)) {
            this._GWInfo = undefined;
        }
        else if(this._GWInfo.time<0) {
            this._GWInfo = undefined;
            this._opacity = 0;
        }
    };
    
    Game_Screen.prototype.createGWInfo = function(args) {
        // args: 0-IMGNAME, 1-DURATION, 2-SOFTNESS
        var info = {};
        if(!args[1]) return undefined;
        info.isNew = true;
        info.imgName = args[1];
        var duration = getNumber(args[2]) || 1;
        info.softness = getNumber(args[3]);
        if(args[0].toUpperCase() === "FADEIN") {
            info.time = 0;
            info.fadeSpeed = (255+1 + info.softness) / duration;
            return info;
        }
        else if(args[0].toUpperCase() === "FADEOUT") {
            info.time = 255 + info.softness;
            info.fadeSpeed = -(255+1 + info.softness) / duration;
            return info;
        }
        return undefined;
    };
    
    //=============================================================================
    //  Window_Base
    //  Garadient Wipe Effect on all Window 
    //  -> default not used. please override initGW to customize
    //=============================================================================
    var _Window_Base_initialize = Window_Base.prototype.initialize;
    Window_Base.prototype.initialize = function(x, y, width, height) {
        _Window_Base_initialize.apply(this, arguments);
        this.initGW();
    };
    
    // for override
    Window_Base.prototype.initGW = function() {
        var setting = {};
        setting.useGW = false;
        setting.imgName = "";
        setting.fadeSpeed = 256/8;
        this.GWSetting = setting;
        if(typeof(this._GWopenness)==='undefined') this._GWopenness = this.openness;
    };
    
    Window_Base.prototype.useGW = function() {
        return this.GWSetting.useGW;
    };
    
    Window_Base.prototype.GWFadeSpeed = function() {
        return this.GWSetting.fadeSpeed;
    };
    
    Window_Base.prototype.GWImgName = function() {
        return this.GWSetting.imgName;
    };
    
    var _Window_Base_updateOpen = Window_Base.prototype.updateOpen;
    Window_Base.prototype.updateOpen = function() {
        if(!this.useGW()) {
            _Window_Base_updateOpen.apply(this, arguments);
            this._GWopenness = this.openness; // Sync or there will be bug
            return;
        }
        if (this._opening) {
            this._GWopenness += this.GWSetting.fadeSpeed;
            this.checkGWNeed();
            this._GWFilter.time = this._GWopenness;
            if (this.isOpen()) {
                this._opening = false;
                this.removeGWFilter();
            }
        }
    };

    var _Window_Base_updateClose = Window_Base.prototype.updateClose;
    Window_Base.prototype.updateClose = function() {
        if(!this.useGW()) {
            _Window_Base_updateClose.apply(this, arguments);
            this._GWopenness = this.openness; // Sync or there will be bug
            return;
        }
        if (this._closing) {
            this._GWopenness -= this.GWSetting.fadeSpeed;
            this.checkGWNeed();
            this._GWFilter.time = this._GWopenness;
            if (this.isClosed()) {
                this._closing = false;
                this.openness = 0;
                this.removeGWFilter();
            }
        }
    };

    var _Window_Base_open = Window_Base.prototype.open;
    Window_Base.prototype.open = function() {
        if(!this.useGW()) {
            _Window_Base_open.apply(this, arguments);
            return;
        }
        if (!this.isOpen()) {
            this.applyGWFilter();
            this._GWFilter.time = this._GWopenness;
            this._opening = true;
            this.openness = 255;
        }
        this._closing = false;
    };

    var _Window_Base_close = Window_Base.prototype.close;
    Window_Base.prototype.close = function() {
        if(!this.useGW()) {
            _Window_Base_close.apply(this, arguments);
            return;
        }
        if (!this.isClosed()) {
            this.applyGWFilter();
            this._GWFilter.time = this._GWopenness;
            if(this.contents) this.contents.clear();
            this._closing = true;
        }
        this._opening = false;
    };

    var _Window_Base_isOpen = Window_Base.prototype.isOpen;
    Window_Base.prototype.isOpen = function() {
        if(!this.useGW()) return _Window_Base_isOpen.apply(this, arguments);
        return this._GWopenness >= 255;
    };

    var _Window_Base_isClosed = Window_Base.prototype.isClosed;
    Window_Base.prototype.isClosed = function() {
        if(!this.useGW()) return _Window_Base_isClosed.apply(this, arguments);
        return this._GWopenness <= 0;
    };
    
    Window_Base.prototype.checkGWNeed = function() {
        if( !this._GWFilter && (this._closing || this._opening) ) {
            this.applyGWFilter();
            this._GWFilter.time = this._GWopenness = this.openness;
            this.openness = 255;
            if(this.contents) this.contents.clear();
        }
    };
    
    Window_Base.prototype.applyGWFilter = function() {
        applyGWFilter.apply(this, [this.GWSetting.imgName, 0]);
    };
    
    Window_Base.prototype.removeGWFilter = function() {
        removeGWFilter.apply(this, arguments);
    };
    
    //=============================================================================
    //  Window_Message
    //  Garadient Wipe Effect on all Window
    //=============================================================================
    Window_Message.prototype.initGW = function() {
        this.GWSetting = $gameSystem.GWMessageSetting;
        if(typeof(this._GWopenness)==='undefined') this._GWopenness = 0;
    };
    
    //=============================================================================
    //  Game_System
    //  Save parameters of message
    //=============================================================================
    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.apply(this, arguments);
        var setting = {};
        setting.useGW = getParamBoolean(['Use Custom Message Fade']);
        setting.imgName = getParamString(['Message Fade Image']);
        setting.fadeSpeed = 256 / (getParamNumber(['Message Fade Duration']) || 8);
        this.GWMessageSetting = setting;
    };
    
})();

/************************************************************
/* PIXI Gradient Wipe Filter
/* DO NOT RERODUCE THE FOLLOWING SCRIPT BEFORE AGREEMENT.
*************************************************************/

/**
 * The GradientWipeFilter applies a Luma Wipe effect to an object. (or, Luma Fade/Gradient Fade ...)
 * TODO -> Description about Gradient Wipe Filter ... <br>
 * ![original](../tools/screenshots/dist/original.png)![filter](../tools/screenshots/dist/bloom.png)
 *
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @param {PIXI.Sprite} [gradientSprite] set gradient sprite. See 'gradientSprite' property.
 * @param {number} [softness=0] set softness of fading(wiping). See 'softness' property.
 * @param {boolean} [reverse=false] set brightness reverse. See 'reverse' property.
 * @param {number} [time=0] set current time. See 'time' property.
 */

PIXI.filters.GradientWipeFilter = function(gradientSprite, softness, reverse, time) {
    // gradientSprite.renderable = false;
    this._gradientSprite = gradientSprite;
    if (softness === null || softness === undefined) {
        softness = 0;
    }
    if (time === null || time === undefined) {
        time = 0;
    }
    reverse = !!reverse;
    
     /**
     * Current time. Fading(wiping) time duration is from 0 to 255+softness.
     * Increasing means fading(wiping) in; decreasing means fading(wiping) out.
     * 
     * @member {number}
     * @default 0
     */
    this.time = time;
    
    
    var vertexShader = null;
    var fragmentShader = [
        'precision mediump float;',
        '',
        'varying vec2 vTextureCoord;',
        '',
        "uniform vec2 dimensions;",
        "uniform vec4 filterArea;",
        'uniform float softness;',
        'uniform bool reverse;',
        'uniform float time;',
        'uniform sampler2D uSampler;',
        'uniform sampler2D gradSampler;',
        '',
        'float getBrightness(vec4 color)',
        '{',
        'return (0.299*color.r + 0.587*color.g + 0.114*color.b);',
        '}',
        '',
        'void main(void)',
        '{',
        "   vec2 realCoord = (vTextureCoord * filterArea.xy) / dimensions;",
        '   float alpha = 0.0;',
        '   float brightness = getBrightness(texture2D(gradSampler, realCoord));',
        '   if(reverse) brightness = 1.0 - brightness;',
        '',
        '   if(softness > 1.0) { // softness between 0.0~1.0 means nothing',
        '       alpha = (- brightness * 255.0 + time) / softness;',
        '   }',
        '   else {',
        '       alpha = - brightness * 255.0 + time;',
        '   }',
        '',
        '   alpha = clamp(alpha, 0.0, 1.0);',
        '   vec4 finalColor = texture2D(uSampler, vTextureCoord);',
        '   finalColor *= alpha;',
        '   gl_FragColor = finalColor;',
        '',
        '}'
    ].join('\r\n');
  
    var uniforms = {};
    uniforms.gradSampler = {type: 'sampler2D', value: gradientSprite._texture};
    uniforms.softness = {type: '1f', value: softness};
    uniforms.reverse = {type: 'bool', value: reverse};
    uniforms.time = {type: '1f', value: this.time};
    uniforms.dimensions= { type: '4fv', value: new Float32Array([0, 0, 0, 0]) };

    PIXI.Filter.call(this,
        vertexShader,
        fragmentShader,
        uniforms
    );
};

PIXI.filters.GradientWipeFilter.prototype = Object.create(PIXI.Filter.prototype);
PIXI.filters.GradientWipeFilter.prototype.constructor = PIXI.filters.GradientWipeFilter;

PIXI.filters.GradientWipeFilter.prototype.apply = function(filterManager, input, output, clear){
        this.uniforms.dimensions[0] = parseFloat(input.sourceFrame.width);
        this.uniforms.dimensions[1] = parseFloat(input.sourceFrame.height);
        this.uniforms.time = this.time;
        
        filterManager.applyFilter(this, input, output, clear);
};

Object.defineProperties(PIXI.filters.GradientWipeFilter.prototype, {
    
     /**
     * The gradient sprite of the wiping effect.
     * Will be referenced and autofit to the render object.
     * 
     * @member {PIXI.Sprite}
     */
    gradientSprite: {
        get: function() {
            return this._gradientSprite;
        },
        set: function(value) {
            // value.renderable = false;
            this._gradientSprite = value;
            this.uniforms.gradSampler = value._texture;
        }
    },
    
     /**
     * The softness of the Transiting Effect. 0 or positive integer would be desirable.
     * One Pixel will take "softness" time to turn from transparent(alpha=0.0) to non-transparent(alpha=1.0).
     * 
     * @member {number}
     * @default 0
     */
    softness: {
        get: function() {
            return this.uniforms.softness;
        },
        set: function(value) {
            this.uniforms.softness = value;
        }
    },
    
     /**
     * At normal, Render Object will first fade(wipe) in from darker part of the gradientSprite.
     * If 'reverse' property is true, Render Object will first fade in from brighter part.
     * 
     * @member {boolean}
     * @default false
     */
    reverse: {
        get: function() {
            return this.uniforms.reverse;
        },
        set: function(value) {
            this.uniforms.reverse = value;
        }
    },
    
     /**
     * Check if the wiping effect(fade in) is end.
     * Won't affect any parameter of the wiping effect, just for user convinience.
     * 
     * @member {boolean}
     */
    isFadeInEnd: {
        get: function() {
            return (this.time >= this.softness+255);
        }
    },
    
     /**
     * Check if the wiping effect(fade out) is end.
     * Won't affect any parameter of the wiping effect, just for user convinience.
     * 
     * @member {boolean}
     */
    isFadeOutEnd: {
        get: function() {
            return (this.time <= 0);
        }
    }
});