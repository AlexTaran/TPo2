
function renderTexturedQuad(tex, col, xmin, ymin, xmax, ymax) {
  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
  gl.useProgram(Programs.texcolor);
  gl.enableVertexAttribArray(Programs.texcolor.attribs.pos);
  gl.enableVertexAttribArray(Programs.texcolor.attribs.tc);

  gl.bindBuffer(gl.ARRAY_BUFFER, VBOs.squareVertexPositionBuffer);
  gl.vertexAttribPointer(Programs.font.attribs.pos, VBOs.squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, VBOs.squareVertexTexcoordBuffer);
  gl.vertexAttribPointer(Programs.font.attribs.tc,  VBOs.squareVertexTexcoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

  var projection_matrix = mat4.create();
  var modelview_matrix = mat4.create(); 
  mat4.ortho(0.0, 1.0, 0.0, 1.0, -0.5, 0.5, projection_matrix);
  mat4.identity(modelview_matrix);
  mat4.translate(modelview_matrix, [xmin, ymin, 0.0]);
  mat4.scale(modelview_matrix, [xmax - xmin, ymax - ymin, 1.0]);
  
  gl.uniformMatrix4fv(Programs.texcolor.uniforms.projection_matrix, false, projection_matrix);
  gl.uniformMatrix4fv(Programs.texcolor.uniforms.modelview_matrix,  false,  modelview_matrix);
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.uniform1i(Programs.texcolor.uniforms.tex, 0);
  gl.uniform4fv(Programs.texcolor.uniforms.col, col);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, VBOs.squareVertexPositionBuffer.numItems);
  gl.useProgram(null);
  
  gl.disable(gl.BLEND);
  gl.enable(gl.DEPTH_TEST);
}
