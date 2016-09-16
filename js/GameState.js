
function GameState(dims, target, obstacles) {
  this.obstacles = typeof obstacles !== 'undefined' ? obstacles : [];
  this.target = target;
  this.dims = dims;
  var size = 1;
  for (var i = 0; i < dims.length; ++i) {
    size *= dims[i];
  }
  this.field = zeroArray(size);
  for (var i = 0; i < obstacles.length; ++i) {
    this.field[this.flattenAddr(obstacles[i])] = -1;
  }
  this.infiniteGameFlag = false;
  this.score = 0;
};

GameState.prototype.getAt = function(addr) {
  return this.field[this.flattenAddr(addr)];
}

GameState.prototype.flattenAddr = function(addr) {
  var mul = 1;
  var idx = addr[0];
  for (var i = 1; i < this.dims.length; ++i) {
    mul *= this.dims[i - 1];
    idx += addr[i] * mul;
  }
  return idx;
}

GameState.prototype.hasFreeCells = function() {
  for (var i = 0; i < this.field.length; ++i) {
    if (this.field[i] == 0) {
      return true;
    }
  }
  return false;
}

GameState.prototype.setInfiniteGame = function() {
  this.infiniteGameFlag = true;
}

GameState.prototype.isWinnerState = function() {
  if (this.infiniteGameFlag == true) {
    return false;
  } else {
    for (var i = 0; i < this.field.length; ++i) {
      if (this.field[i] == this.target) {
        return true;
      }
    }
    return false;
  }
}

GameState.prototype.isLoserState = function() {
  if (this.isWinnerState()) {
    return false;
  } else {
    // uneffective, but who the fuck cares?
    // of course game is not finished if we have neighbours with same numbers :)
    for (var i = 0; i < this.dims.length; ++i) {
      for (var j = -1; j <= 1; j += 2) {
        if (this.moveInterpolate(i, j).allZero == false) {
          return false;
        }
      }
    }
    return true;
  }
}

GameState.prototype.getMaxCell = function() {
  var mx = 0;
  for (var i = 0; i < this.field.length; ++i) {
    mx = Math.max(mx, this.field[i]);
  }
  return mx;
}

GameState.prototype.isSoClose = function() {
  if (this.infiniteGameFlag) {
    return false;
  } else {
    if (this.getMaxCell() * 2 == this.target) {
      return true;
    } else {
      return false;
    }
  }
}

GameState.prototype.getRandomFreeCellId = function() {
  if (!this.hasFreeCells()) {
    return null;
  }
  freeCellsIds = []
  for (var i = 0; i < this.field.length; ++i) {
    if (this.field[i] == 0) {
      freeCellsIds = freeCellsIds.concat([i]);
    }
  }
  return freeCellsIds[Math.floor(Math.random() * freeCellsIds.length)];
}

GameState.prototype.addNewRandomCell = function() {
  var n = 0;
  if (Math.random() < 0.9) {
    n = 2;
  } else {
    n = 4;
  }
  return this.addNumberAtRandomPlace(n);
}

GameState.prototype.addNumberAtRandomPlace = function(n) {
  cellId = this.getRandomFreeCellId();
  if (cellId == null) {
    return;
  }
  this.field[cellId] = n;
  return cellId;
}

// Magic function which calcs merges for one row
var calcMergeOffsets = function(arr) {
  var offsets = zeroArray(arr.length);
  var lastOccupiedIdx = -1;
  var lastOccupiedValue = -1;
  var mergeEnabled = false;
  for (var i = 0; i < arr.length; ++i) {
    offsets[i] = {offset:0, merge:false};
    if (arr[i] > 0) {
      if (mergeEnabled == true) {
        if (arr[i] == lastOccupiedValue) {
          offsets[i].offset = lastOccupiedIdx - i;
          offsets[i].merge = true;
          mergeEnabled = false;
        } else {
          lastOccupiedIdx++;
          lastOccupiedValue = arr[i];
          offsets[i].offset = lastOccupiedIdx - i;
        }
      } else {
        lastOccupiedIdx++;
        lastOccupiedValue = arr[i];
        offsets[i].offset = lastOccupiedIdx - i;
        mergeEnabled = true;
      }
    } else if (arr[i] == -1) {
      lastOccupiedIdx = i;
      lastOccupiedValue = -1;
      mergeEnabled = false;
    }
  }
  return offsets;
}

// dir should be -1 or 1
GameState.prototype.moveInterpolate = function(axisId, dir) {
  var begin;
  var end;
  if (dir == -1) {
    begin = 0;
    end = this.dims[axisId];
  }else if (dir == 1) {
    begin = this.dims[axisId] - 1;
    end = -1;
  } else {
    throw "Bad dir: should be -1 or 1";
  }
  result = zeroArray(this.field.length);
  result.allZero = true;
  var iterFlag = true;
  for (var idx = zeroArray(this.dims.length); iterFlag; iterFlag = multiIndexIncrement(idx, this.dims)) {
    if (idx[axisId] == 0) { // just filter by this condition :-)
      var row = [];
      for (var i = begin; i != end; i += -dir) {
        idx[axisId] = i;
	row = row.concat([this.getAt(idx)]);
      }
      // and here merge row [0 ... n-1] in <<<< direction
      var offsets = calcMergeOffsets(row);
      
      // writing offsets
      var j = 0;
      for (var i = begin; i != end; i += -dir) {
	if (offsets[j].offset != 0) {
	  result.allZero = false;
	}
        idx[axisId] = i;
	offsets[j].offset *= -dir;
	result[this.flattenAddr(idx)] = offsets[j];
	j += 1;
      }
      // Restore that zero
      idx[axisId] = 0;
    }
  }
  return result;
}

GameState.prototype.move = function(axisId, dir) {
  var score = 0;
  var interp = this.moveInterpolate(axisId, dir);
  var newField = zeroArray(this.field.length);
  var iterFlag = true;
  for (var idx = zeroArray(this.dims.length); iterFlag; iterFlag = multiIndexIncrement(idx, this.dims)) {
    var curr = this.flattenAddr(idx);
    var offset = interp[curr].offset;
    idx[axisId] += offset;
    if (newField[this.flattenAddr(idx)] != 0) {
      score += this.field[curr];
    }
    newField[this.flattenAddr(idx)] += this.field[curr];
    idx[axisId] -= offset;
  } 
  this.field = newField;
  return score;
}


