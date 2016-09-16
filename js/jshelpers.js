// Different helpers for JS

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function zeroArray(n) {
 arr = [];
 for (var i = 0; i < n; ++i) {
   arr = arr.concat([0]);
 }
 return arr;
}

function multiIndexIncrement(idx, dimensions) {
  idx[idx.length - 1]++;
  last = idx.length - 1;
  while (last > 0) {
    if (idx[last] >= dimensions[last]) {
      idx[last - 1] += 1;
      idx[last] = 0;
    } else {
      return true;
    }
    last -= 1;
  }
  if (idx[0] >= dimensions[0]) {
    return false;
  } else {
    return true;
  }
}

function isZeroArray(arr) {
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] != 0) {
      return false;
    }
  }
  return true;
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}


function rep3(x) {
  return [x, x, x];
}

