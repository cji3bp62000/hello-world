/**
 * The GradientWipeFilter applies a Luma Wipe effect to an object.
 * -> Description about Gradient Wipe Filter ... <br>
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
        '   finalColor.a *= alpha;',
        '   finalColor.rgb *= finalColor.a;',
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
     * The gradient sprite of the filter effect.
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
     * Won't affect any parameter of the filter effect, just for user conviniency.
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
     * Won't affect any parameter of the filter effect, just for user conviniency.
     * 
     * @member {boolean}
     */
    isFadeOutEnd: {
        get: function() {
            return (this.time <= 0);
        }
    }
});

/*
var sprite = new Sprite(ImageManager.loadSystem("BattleStart"));
var f = new PIXI.filters.GradientWipeFilter(sprite, 30.0)
SceneManager._scene._backSprite2.filters = [f]

var sprite = new Sprite(ImageManager.loadSystem("BattleStart"));
var f = new PIXI.filters.GradientWipeFilter(sprite, 30.0)
SceneManager._scene.filters = [f]
*/