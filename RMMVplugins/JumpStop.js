var stopRegionId = 1;


var _Game_CharacterBase_prototype_updateJump = Game_CharacterBase.prototype.updateJump;

Game_CharacterBase.prototype.updateJump = function() {
    var lastRealX = this._realX;
    var lastRealY = this._realY;
    var nowHeight = Math.sqrt(Math.abs(this.jumpHeight()));
    _Game_CharacterBase_prototype_updateJump.call(this);
    var x = Math.round($gameMap.roundX(this._realX));
    var y = Math.round($gameMap.roundY(this._realY));
    if($gameMap.regionId(x, y) === stopRegionId) {
        this._jumpCount = Math.round(nowHeight);
        this._realX = this._x = Math.round(lastRealX);
        this._realY = this._y = Math.round(lastRealY);
    }
}