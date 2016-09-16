function getShader(gl, id) {
  var shaderScript = document.getElementById(id);
  if (!shaderScript) {
    return null;
  }

  var str = "";
  var k = shaderScript.firstChild;
  while (k) {
    if (k.nodeType == 3) {
      str += k.textContent;
    }
    k = k.nextSibling;
  }

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, str);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(shaderScript.type + " : " + gl.getShaderInfoLog(shader));
    return null;
  }

  return shader;
}

function loadProgram(vsname, fsname, vars) {
  var vertexShader = getShader(gl, vsname);
  var fragmentShader = getShader(gl, fsname);

  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert("Could not initialise shaders");
  }
  program.attribs = {};
  for (var i = 0; i < vars.attribs.length; ++i) {
    program.attribs[vars.attribs[i]] = gl.getAttribLocation(program, vars.attribs[i]);
  }
  program.uniforms = {};
  for (var i = 0; i < vars.uniforms.length; ++i) {
    program.uniforms[vars.uniforms[i]] = gl.getUniformLocation(program, vars.uniforms[i]);
  }
  return program;
}
