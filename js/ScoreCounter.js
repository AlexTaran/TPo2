function ScoreCounter() {
  this.current = 0;
  this.target = 0;
  this.flyingPoints = []
}

ScoreCounter.prototype.addPoints = function(points, color) {
  color = typeof color !== 'undefined' ? color : [1.0, 1.0, 1.0, 1.0];
  this.target += points;
  this.flyingPoints = this.flyingPoints.concat([{color:color, points:points, animation:0.0}])
}

ScoreCounter.prototype.animate = function(elapsed) {
  var needed = this.target - this.current;
  var add = Math.min(needed, Math.ceil(needed * (1.0 - Math.pow(0.4, elapsed / 1000.0))));
  this.current += add;
  var newFlyingPoints = [];
  for (var i = 0; i < this.flyingPoints.length; ++i) {
    this.flyingPoints[i].animation += elapsed / 1000.0;
    if (this.flyingPoints[i].animation <= 1.0) {
      newFlyingPoints = newFlyingPoints.concat([this.flyingPoints[i]]);
    }
  }
  this.flyingPoints = newFlyingPoints;
}
