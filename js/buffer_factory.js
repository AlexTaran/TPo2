var BufferFactory = {
  basis: {
    createVertexPositionBuffer: function() {
      var vertices = [
        0.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 0.0,
        0.0, 0.0, 1.0
      ];
      return createBufferFromArray(vertices, 3);
    },

    createVertexColorBuffer: function() {
     var colors = [
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
      ];
      return createBufferFromArray(colors, 3);
    }
  },

  createTriangleVertexPositionBuffer: function() {
    var vertices = [
       0.0,  1.0,  0.0,
      -1.0, -1.0,  0.0,
       1.0, -1.0,  0.0
    ];
    return createBufferFromArray(vertices, 3);
  },

  createTriangleVertexColorBuffer: function() {
    var colors = [
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0
    ];
    return createBufferFromArray(colors, 4);
  },

  createSquareVertexPositionBuffer: function() {
    vertices = [
       1.0,  1.0,  0.0,
       0.0,  1.0,  0.0,
       1.0,  0.0,  0.0,
       0.0,  0.0,  0.0
    ];
    return createBufferFromArray(vertices, 3);
  },
  
  createSquareVertexTexcoordBuffer: function() {
    texcoords = [
      1.0, 1.0,
      0.0, 1.0,
      1.0, 0.0,
      0.0, 0.0
    ];
    return createBufferFromArray(texcoords, 2);
  },

  createSquareVertexColorBuffer: function() {
    colors = []
    for (var i=0; i < 4; i++) {
      colors = colors.concat([0.5, 0.5, 1.0, 1.0]);
    }
    return createBufferFromArray(colors, 4);
  },

  createPyramidVertexPositionBuffer: function() {
    var vertices = [
      // Front face
       0.0,  1.0,  0.0,
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
      // Right face
       0.0,  1.0,  0.0,
       1.0, -1.0,  1.0,
       1.0, -1.0, -1.0,
      // Back face
       0.0,  1.0,  0.0,
       1.0, -1.0, -1.0,
      -1.0, -1.0, -1.0,
      // Left face
       0.0,  1.0,  0.0,
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0
    ];
    return createBufferFromArray(vertices, 3);
  },

  createPyramidVertexColorBuffer: function() {
    var colors = [
      // Front face
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
      // Right face
      1.0, 0.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      // Back face
      1.0, 0.0, 0.0, 1.0,
      0.0, 1.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
      // Left face
      1.0, 0.0, 0.0, 1.0,
      0.0, 0.0, 1.0, 1.0,
      0.0, 1.0, 0.0, 1.0
    ];
    return createBufferFromArray(colors, 4);
  },

  createCubeVertexPositionBuffer: function() {
    vertices = [
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0,
    ];
    return createBufferFromArray(vertices, 3);
  },

  createCubeVertexColorBuffer: function() {
    colors = [
      [1.0, 0.0, 0.0, 1.0],     // Front face
      [1.0, 1.0, 0.0, 1.0],     // Back face
      [0.0, 1.0, 0.0, 1.0],     // Top face
      [1.0, 0.5, 0.5, 1.0],     // Bottom face
      [1.0, 0.0, 1.0, 1.0],     // Right face
      [0.0, 0.0, 1.0, 1.0],     // Left face
    ];
    var unpackedColors = [];
    for (var i in colors) {
      var color = colors[i];
      for (var j=0; j < 4; j++) {
        unpackedColors = unpackedColors.concat(color);
      }
    }
    return createBufferFromArray(unpackedColors, 4);
  },

  createCubeVertexTexCoordBuffer: function() {
    var textureCoords = [
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ];
    return createBufferFromArray(textureCoords, 2);
  },

  createCubeIndexBuffer: function() {
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    var indexes = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
    buffer.itemSize = 1;
    buffer.numItems = 36;
    return buffer;
  },

  
};

function createBufferFromArray(arr, itemSize) {
  buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
  buffer.itemSize = itemSize;
  buffer.numItems = arr.length / itemSize;
  return buffer;
}
