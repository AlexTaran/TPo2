
function commonPerspectiveProjection(mat) {
  var aspectRatio = gl.viewportWidth / gl.viewportHeight;
  mat4.identity(mat);
  mat4.perspective(45, aspectRatio, 0.1, 100.0, mat);
}

//////////////////// 2D Projector

function Projector2D(dims) {
  this.dims = dims;
  this.delta = 2.4;
}

Projector2D.prototype.project = function(coords) {
  return [ (-this.dims[0]/2 + 0.5 + coords[0]) * this.delta,
           (-this.dims[1]/2 + 0.5 + coords[1]) * this.delta,
           -4.0];
}

Projector2D.prototype.calcProjectionMatrix = function(mat) {
  var aspectRatio = gl.viewportWidth / gl.viewportHeight;
  mat4.identity(mat);
  var K = Math.max( this.delta * (this.dims[0]/2+0.5) / aspectRatio, this.delta * (this.dims[1]/2 + 0.5) / 0.9);
  mat4.ortho(-aspectRatio*K, aspectRatio*K, -1.0*K, 1.0*K, -6.0, 6.0, mat);
}

Projector2D.prototype.calcMinLookRadius = function() {
  return 1.0;
}

//////////////////// 3D Projector

function Projector3D(dims) {
  this.dims = dims;
  this.delta = 5.5;
};

// return 3D coords (vector [xyz]) of a cube from coords (multidimensional array [i1...ik])
Projector3D.prototype.project = function(coords) {
  return [ (-this.dims[0]/2 + 0.5 + coords[0]) * this.delta,
           (-this.dims[1]/2 + 0.5 + coords[1]) * this.delta,
           (-this.dims[2]/2 + 0.5 + coords[2]) * this.delta];
}

Projector3D.prototype.calcProjectionMatrix = commonPerspectiveProjection;

Projector3D.prototype.calcMinLookRadius = function() {
  var v = [this.dims[0]/2 - 0.5, this.dims[1]/2 - 0.5, this.dims[2]/2 - 0.5];
  var r = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]) * this.delta;
  return r * 1.5;
}

//////////////////// 4D Projector

function Projector4D(dims) {
  this.dims = dims;
  this.delta = 5.5;
  this.dimdelta = this.delta * this.dims[2] * 1.5;
};

Projector4D.prototype.project = function(coords) {
  return [ (-this.dims[0]/2 + 0.5 + coords[0]) * this.delta,
           (-this.dims[1]/2 + 0.5 + coords[1]) * this.delta,
           (-this.dims[2]/2 + 0.5 + coords[2]) * this.delta + (-this.dims[3]/2 + 0.5 + coords[3]) * this.dimdelta];
}

Projector4D.prototype.calcProjectionMatrix = commonPerspectiveProjection;

Projector4D.prototype.calcMinLookRadius = function() {
  //var v = [this.dims[0]/2 - 0.5, this.dims[1]/2 - 0.5, this.dims[2]/2 - 0.5];
  var v = this.project([0, 0, 0, 0]);
  var r = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  return r * 1.5;
}

//////////////////// 5D Projector

function Projector5D(dims) {
  this.dims = dims;
  this.delta = 5.5;
  this.dimdelta = this.delta * this.dims[2] * 1.5;
};

Projector5D.prototype.project = function(coords) {
  return [ (-this.dims[0]/2 + 0.5 + coords[0]) * this.delta + (-this.dims[3]/2 + 0.5 + coords[3]) * this.dimdelta,
           (-this.dims[1]/2 + 0.5 + coords[1]) * this.delta,
           (-this.dims[2]/2 + 0.5 + coords[2]) * this.delta + (-this.dims[4]/2 + 0.5 + coords[4]) * this.dimdelta];
}

Projector5D.prototype.calcProjectionMatrix = commonPerspectiveProjection;

Projector5D.prototype.calcMinLookRadius = function() {
  var v = this.project([0, 0, 0, 0, 0]);
  var r = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  return r * 1.5;
}

//////////////////// 6D Projector

function Projector6D(dims) {
  this.dims = dims;
  this.delta = 5.5;
  this.dimdelta = this.delta * this.dims[2] * 1.5;
};

Projector6D.prototype.project = function(coords) {
  return [ (-this.dims[0]/2 + 0.5 + coords[0]) * this.delta + (-this.dims[3]/2 + 0.5 + coords[3]) * this.dimdelta,
           (-this.dims[1]/2 + 0.5 + coords[1]) * this.delta + (-this.dims[5]/2 + 0.5 + coords[5]) * this.dimdelta,
           (-this.dims[2]/2 + 0.5 + coords[2]) * this.delta + (-this.dims[4]/2 + 0.5 + coords[4]) * this.dimdelta];
}

Projector6D.prototype.calcProjectionMatrix = commonPerspectiveProjection;

Projector6D.prototype.calcMinLookRadius = function() {
  var v = this.project([0, 0, 0, 0, 0, 0]);
  var r = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
  return r * 1.5;
}

////////////////////////////////////

function createAppropriateProjector(dims) {
  if (dims.length == 2) {
    return new Projector2D(dims);
  } else if (dims.length == 3) {
    return new Projector3D(dims);
  } else if (dims.length == 4) {
    return new Projector4D(dims);
  } else if (dims.length == 5) {
    return new Projector5D(dims);
  } else if (dims.length == 6) {
    return new Projector6D(dims);
  } else {
    return null;
  }
}
