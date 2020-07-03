function degreesToRadians(degrees) {
	return degrees * Math.PI / 180
}


var IS_2D = false
var IS_3D = true
if (IS_2D) {
	var m3 = {}
	m3.identity = function () {
		return [
			1, 0, 0,
			0, 1, 0,
			0, 0, 1,
		]
	}
	m3.scaling = function (sx, sy) {
		return [
			sx, 0, 0,
			0, sy, 0,
			0, 0, 1,
		]
	}
	m3.translation = function (tx, ty) {
		return [
			1, 0, 0,
			0, 1, 0,
			tx, ty, 1,
		]
	}
	m3.rotation = function (radians) {
		var c = Math.cos(radians)
		var s = Math.sin(radians)
		return [
			c, -s, 0,
			s, c, 0,
			0, 0, 1,
		]
	}
	m3.projection = function(width, height) {
		// Translate Y, so it will be on top, not on the bottom
		return [
  	  	  2 / width, 0, 0,
  	  	  0, -2 / height, 0,
  	  	  -1, 1, 1
		]
	}
	m3.multiply = function (a, b) {
		var a00 = a[0 * 3 + 0];
    	var a01 = a[0 * 3 + 1];
    	var a02 = a[0 * 3 + 2];
    	var a10 = a[1 * 3 + 0];
    	var a11 = a[1 * 3 + 1];
    	var a12 = a[1 * 3 + 2];
    	var a20 = a[2 * 3 + 0];
    	var a21 = a[2 * 3 + 1];
    	var a22 = a[2 * 3 + 2];
    	var b00 = b[0 * 3 + 0];
    	var b01 = b[0 * 3 + 1];
    	var b02 = b[0 * 3 + 2];
    	var b10 = b[1 * 3 + 0];
    	var b11 = b[1 * 3 + 1];
    	var b12 = b[1 * 3 + 2];
    	var b20 = b[2 * 3 + 0];
    	var b21 = b[2 * 3 + 1];
    	var b22 = b[2 * 3 + 2];
    	return [
      	  b00 * a00 + b01 * a10 + b02 * a20,
      	  b00 * a01 + b01 * a11 + b02 * a21,
      	  b00 * a02 + b01 * a12 + b02 * a22,
      	  b10 * a00 + b11 * a10 + b12 * a20,
      	  b10 * a01 + b11 * a11 + b12 * a21,
      	  b10 * a02 + b11 * a12 + b12 * a22,
      	  b20 * a00 + b21 * a10 + b22 * a20,
      	  b20 * a01 + b21 * a11 + b22 * a21,
      	  b20 * a02 + b21 * a12 + b22 * a22,
    	]
	}

	var VERTEX_SHADER_SOURCE = `
  	  attribute vec2 a_position;
  	  uniform mat3 u_matrix;
 	 
  	  void main() {
  		vec2 position = (u_matrix * vec3(a_position, 1)).xy;
    	gl_Position = vec4(position, 0, 1);
  	  }
	`;
	var FRAGMENT_SHADER_SOURCE = `
  	  precision mediump float;
  	  uniform vec4 u_color;
 	 
  	  void main() {
    	gl_FragColor = u_color;
  	  }
	`;

	var CANVAS_SIZE = {
  	  width: 0,
  	  height: 0,
  	  displayWidth: 0,
  	  displayHeight: 0,
  	  vpProjectionMatrix: [],
	};
	var canvas = document.createElement("canvas");
	window.addEventListener("resize", resizeCanvas);
	function resizeCanvas() {
  	  CANVAS_SIZE.width = document.documentElement.clientWidth;
  	  CANVAS_SIZE.height = document.documentElement.clientHeight;
  	  CANVAS_SIZE.displayWidth = CANVAS_SIZE.width * window.devicePixelRatio;
  	  CANVAS_SIZE.displayHeight = CANVAS_SIZE.height * window.devicePixelRatio;
  	  CANVAS_SIZE.vpProjectionMatrix = m3.projection(CANVAS_SIZE.displayWidth, CANVAS_SIZE.displayHeight)

  	  canvas.style.width = CANVAS_SIZE.width + "px";
  	  canvas.style.height = CANVAS_SIZE.height + "px";
	}
	resizeCanvas();
	document.body.appendChild(canvas);

	var gl = canvas.getContext("webgl");
	if (!gl) {
  	  throw new Error("no webgl");
	}

	function createShader(gl, type, source) {
  	  var shader = gl.createShader(type);
  	  gl.shaderSource(shader, source);
  	  gl.compileShader(shader);
  	  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  	  if (!success) {
  		console.log(gl.getShaderInfoLog(shader));
    	gl.deleteShader(shader);
    	throw new Error(
      	  "Failed to compile shader: " + type + ". Source: " + source
    	);
  	  }

  	  return shader;
	}

	var vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
  	  gl.deleteProgram(proogram);
  	  throw new Error("Program is not linked");
	}

	var a_position = gl.getAttribLocation(program, "a_position");
	var u_matrix = gl.getUniformLocation(program, 'u_matrix');
	var u_color = gl.getUniformLocation(program, 'u_color');
	var positionBuffer = gl.createBuffer();

	function resizeGl(gl) {
  	  if (
    	gl.canvas.width !== CANVAS_SIZE.displayWidth ||
    	gl.canvas.height !== CANVAS_SIZE.displayHeight
  	  ) {
    	gl.canvas.width = CANVAS_SIZE.displayWidth;
    	gl.canvas.height = CANVAS_SIZE.displayHeight;
  	  }
	}

	resizeGl(gl);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);

	gl.enableVertexAttribArray(a_position);
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

	function setRectangle(gl, x, y, width, height) {
		var x1 = x
		var x2 = x + width
		var y1 = y
		var y2 = y + height
		var positions = [
  	  	  x1, y1,
  	  	  x2, y1,
  	  	  x1, y2,
  	  	  x1, y2,
  	  	  x2, y1,
  	  	  x2, y2,
		];
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	}

	function setFGeometry(gl) {
  	  gl.bufferData(
      	  gl.ARRAY_BUFFER,
      	  new Float32Array([
          	  0, 0,
          	  30, 0,
          	  0, 150,
          	  0, 150,
          	  30, 0,
          	  30, 150,
 	 
          	  30, 0,
          	  100, 0,
          	  30, 30,
          	  30, 30,
          	  100, 0,
          	  100, 30,
 	 
          	  30, 60,
          	  67, 60,
          	  30, 90,
          	  30, 90,
          	  67, 60,
          	  67, 90,
      	  ]),
      	  gl.STATIC_DRAW);
	}

	function drawRect(gl, x, y, width, height, color) {
		setRectangle(gl, x, y, width, height)
		gl.uniform4f(u_color, color.r, color.g, color.b, color.a)
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}

	function drawF(gl) {
		setFGeometry(gl)
		gl.drawArrays(gl.TRIANGLES, 0, 18)
	}

	function randomInt(range) {
		return Math.floor(Math.random() * range)
	}

	function drawScene(gl) {
		var m = CANVAS_SIZE.vpProjectionMatrix
		m = m3.multiply(m, m3.translation(100, 50))
		m = m3.multiply(m, m3.rotation(0))
		m = m3.multiply(m, m3.scaling(1, 1))

		gl.uniformMatrix3fv(u_matrix, false, m)

		for (var i = 0; i < 50; i++) {
			var color = {
				r: Math.random(),
				g: Math.random(),
				b: Math.random(),
				a: 1
			}
			drawRect(gl, randomInt(300), randomInt(300), randomInt(300), randomInt(300), color)
		}
		drawF(gl)
	}
	drawScene(gl)
}



if (IS_3D) {
	var m4 = {}
	m4.identity = function () {
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		]
	}

	m4.scaling = function (sx, sy, sz) {
		return [
			sx, 0, 0, 0,
			0, sy, 0, 0,
			0, 0, sz, 0,
			0, 0, 0, 1,
		]
	}

	m4.translation = function (tx, ty, tz) {
		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			tx, ty, tz, 1,
		]
	}

	m4.xRotation = function (radians) {
		var c = Math.cos(radians)
		var s = Math.sin(radians)
		return [
			1, 0, 0, 0,
			0, c, s, 0,
			0, -s, c, 0,
			0, 0, 0, 1,
		]
	}

	m4.yRotation = function (radians) {
		var c = Math.cos(radians)
		var s = Math.sin(radians)
		return [
			c, 0, -s, 0,
			0, 1, 0, 0,
			s, 0, c, 0,
			0, 0, 0, 1,
		]
	}

	m4.zRotation = function (radians) {
		var c = Math.cos(radians)
		var s = Math.sin(radians)
		return [
			c, s, 0, 0,
			-s, c, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1,
		]
	}
	
	m4.projection = function(width, height, depth) {
		// Translate Y, so it will be on top, not on the bottom
		return [
  	  	  2 / width, 0, 0, 0,
  	  	  0, -2 / height, 0, 0,
  	  	  0, 0, 2 / depth, 0,
  	  	  -1, 1, 0, 1,
		]
	}
	m4.orthographic = function(left, right, bottom, top, near, far) {
		return [
		  2 / (right - left), 0, 0, 0,
      	  0, 2 / (top - bottom), 0, 0,
      	  0, 0, 2 / (near - far), 0,
 	 
      	  (left + right) / (left - right),
      	  (bottom + top) / (bottom - top),
      	  (near + far) / (near - far),
      	  1,
      	]
	}

	m4.multiply = function (a, b) {
		var a00 = a[0 * 4 + 0];
    	var a01 = a[0 * 4 + 1];
    	var a02 = a[0 * 4 + 2];
    	var a03 = a[0 * 4 + 3];
    	var a10 = a[1 * 4 + 0];
    	var a11 = a[1 * 4 + 1];
    	var a12 = a[1 * 4 + 2];
    	var a13 = a[1 * 4 + 3];
    	var a20 = a[2 * 4 + 0];
    	var a21 = a[2 * 4 + 1];
    	var a22 = a[2 * 4 + 2];
    	var a23 = a[2 * 4 + 3];
    	var a30 = a[3 * 4 + 0];
    	var a31 = a[3 * 4 + 1];
    	var a32 = a[3 * 4 + 2];
    	var a33 = a[3 * 4 + 3];
    	var b00 = b[0 * 4 + 0];
    	var b01 = b[0 * 4 + 1];
    	var b02 = b[0 * 4 + 2];
    	var b03 = b[0 * 4 + 3];
    	var b10 = b[1 * 4 + 0];
    	var b11 = b[1 * 4 + 1];
    	var b12 = b[1 * 4 + 2];
    	var b13 = b[1 * 4 + 3];
    	var b20 = b[2 * 4 + 0];
    	var b21 = b[2 * 4 + 1];
    	var b22 = b[2 * 4 + 2];
    	var b23 = b[2 * 4 + 3];
    	var b30 = b[3 * 4 + 0];
    	var b31 = b[3 * 4 + 1];
    	var b32 = b[3 * 4 + 2];
    	var b33 = b[3 * 4 + 3];
    	return [
      	  b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
      	  b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
      	  b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
      	  b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
      	  b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
      	  b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
      	  b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
      	  b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
      	  b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
      	  b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
      	  b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
      	  b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
      	  b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
      	  b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
      	  b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
      	  b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
    	];
	}

	var VERTEX_SHADER_SOURCE = `
  	  attribute vec4 a_position;
  	  attribute vec4 a_color;

  	  uniform mat4 u_matrix;

  	  varying vec4 v_color;
 	 
  	  void main() {
    	gl_Position = u_matrix * a_position;

    	v_color = a_color;
  	  }
	`;
	var FRAGMENT_SHADER_SOURCE = `
  	  precision mediump float;

  	  varying vec4 v_color;
 	 
  	  void main() {
    	gl_FragColor = v_color;
  	  }
	`;

	var CANVAS_SIZE = {
  	  width: 0,
  	  height: 0,
  	  displayWidth: 0,
  	  displayHeight: 0,
  	  vpProjectionMatrix: [],
	};
	var canvas = document.createElement("canvas");
	window.addEventListener("resize", resizeCanvas);
	function resizeCanvas() {
  	  CANVAS_SIZE.width = document.documentElement.clientWidth;
  	  CANVAS_SIZE.height = document.documentElement.clientHeight;
  	  CANVAS_SIZE.displayWidth = CANVAS_SIZE.width * window.devicePixelRatio;
  	  CANVAS_SIZE.displayHeight = CANVAS_SIZE.height * window.devicePixelRatio;
  	  CANVAS_SIZE.vpProjectionMatrix = m4.orthographic(0, CANVAS_SIZE.width, CANVAS_SIZE.height, 0, 400, -400)

  	  canvas.style.width = CANVAS_SIZE.width + "px";
  	  canvas.style.height = CANVAS_SIZE.height + "px";
	}
	resizeCanvas();
	document.body.appendChild(canvas);

	var gl = canvas.getContext("webgl");
	if (!gl) {
  	  throw new Error("no webgl");
	}

	function createShader(gl, type, source) {
  	  var shader = gl.createShader(type);
  	  gl.shaderSource(shader, source);
  	  gl.compileShader(shader);
  	  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  	  if (!success) {
  		console.log(gl.getShaderInfoLog(shader));
    	gl.deleteShader(shader);
    	throw new Error(
      	  "Failed to compile shader: " + type + ". Source: " + source
    	);
  	  }

  	  return shader;
	}

	var vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
	var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
  	  gl.deleteProgram(proogram);
  	  throw new Error("Program is not linked");
	}

	var a_position = gl.getAttribLocation(program, "a_position");
	var a_color = gl.getAttribLocation(program, 'a_color');
	var u_matrix = gl.getUniformLocation(program, 'u_matrix');

	function resizeGl(gl) {
  	  if (
    	gl.canvas.width !== CANVAS_SIZE.displayWidth ||
    	gl.canvas.height !== CANVAS_SIZE.displayHeight
  	  ) {
    	gl.canvas.width = CANVAS_SIZE.displayWidth;
    	gl.canvas.height = CANVAS_SIZE.displayHeight;
  	  }
	}

	resizeGl(gl);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.useProgram(program);

	var positionBuffer = gl.createBuffer();
	gl.enableVertexAttribArray(a_position);
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

	var colorBuffer = gl.createBuffer();
	gl.enableVertexAttribArray(a_color);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	gl.vertexAttribPointer(a_color, 3, gl.UNSIGNED_BYTE, true, 0, 0);

	function setFGeometry(gl) {
	  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	  var vertices =
  	  	  new Float32Array([
          // left column front
          0,   0,  0,
          0, 150,  0,
          30,   0,  0,
          0, 150,  0,
          30, 150,  0,
          30,   0,  0,

          // top rung front
          30,   0,  0,
          30,  30,  0,
          100,   0,  0,
          30,  30,  0,
          100,  30,  0,
          100,   0,  0,

          // middle rung front
          30,  60,  0,
          30,  90,  0,
          67,  60,  0,
          30,  90,  0,
          67,  90,  0,
          67,  60,  0,

          // left column back
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,
            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top rung back
           30,   0,  30,
          100,   0,  30,
           30,  30,  30,
           30,  30,  30,
          100,   0,  30,
          100,  30,  30,

          // middle rung back
           30,  60,  30,
           67,  60,  30,
           30,  90,  30,
           30,  90,  30,
           67,  60,  30,
           67,  90,  30,

          // top
            0,   0,   0,
          100,   0,   0,
          100,   0,  30,
            0,   0,   0,
          100,   0,  30,
            0,   0,  30,

          // top rung right
          100,   0,   0,
          100,  30,   0,
          100,  30,  30,
          100,   0,   0,
          100,  30,  30,
          100,   0,  30,

          // under top rung
          30,   30,   0,
          30,   30,  30,
          100,  30,  30,
          30,   30,   0,
          100,  30,  30,
          100,  30,   0,

          // between top rung and middle
          30,   30,   0,
          30,   60,  30,
          30,   30,  30,
          30,   30,   0,
          30,   60,   0,
          30,   60,  30,

          // top of middle rung
          30,   60,   0,
          67,   60,  30,
          30,   60,  30,
          30,   60,   0,
          67,   60,   0,
          67,   60,  30,

          // right of middle rung
          67,   60,   0,
          67,   90,  30,
          67,   60,  30,
          67,   60,   0,
          67,   90,   0,
          67,   90,  30,

          // bottom of middle rung.
          30,   90,   0,
          30,   90,  30,
          67,   90,  30,
          30,   90,   0,
          67,   90,  30,
          67,   90,   0,

          // right of bottom
          30,   90,   0,
          30,  150,  30,
          30,   90,  30,
          30,   90,   0,
          30,  150,   0,
          30,  150,  30,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,
          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,
          0,   0,   0,
          0, 150,  30,
          0, 150,   0])
  	  	gl.bufferData(
      	  gl.ARRAY_BUFFER,
      	  vertices,
      	  gl.STATIC_DRAW);
      	return vertices.length
	}

	function drawF(gl) {
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
		gl.bufferData(gl.ARRAY_BUFFER,
			new Uint8Array([
          	  	  	  // left column front
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,

          	  	  	  // top rung front
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,

          	  	  	  // middle rung front
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,
        			200,  70, 120,

          	  	  	  // left column back
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,

          	  	  	  // top rung back
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,

          	  	  	  // middle rung back
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,
        			80, 70, 200,

          	  	  	  // top
        			70, 200, 210,
        			70, 200, 210,
        			70, 200, 210,
        			70, 200, 210,
        			70, 200, 210,
        			70, 200, 210,

          	  	  	  // top rung right
        			200, 200, 70,
        			200, 200, 70,
        			200, 200, 70,
        			200, 200, 70,
        			200, 200, 70,
        			200, 200, 70,

          	  	  	  // under top rung
        			210, 100, 70,
        			210, 100, 70,
        			210, 100, 70,
        			210, 100, 70,
        			210, 100, 70,
        			210, 100, 70,

          	  	  	  // between top rung and middle
        			210, 160, 70,
        			210, 160, 70,
        			210, 160, 70,
        			210, 160, 70,
        			210, 160, 70,
        			210, 160, 70,

          	  	  	  // top of middle rung
        			70, 180, 210,
        			70, 180, 210,
        			70, 180, 210,
        			70, 180, 210,
        			70, 180, 210,
        			70, 180, 210,

          	  	  	  // right of middle rung
        			100, 70, 210,
        			100, 70, 210,
        			100, 70, 210,
        			100, 70, 210,
        			100, 70, 210,
        			100, 70, 210,

          	  	  	  // bottom of middle rung.
        			76, 210, 100,
        			76, 210, 100,
        			76, 210, 100,
        			76, 210, 100,
        			76, 210, 100,
        			76, 210, 100,

          	  	  	  // right of bottom
        			140, 210, 80,
        			140, 210, 80,
        			140, 210, 80,
        			140, 210, 80,
        			140, 210, 80,
        			140, 210, 80,

          	  	  	  // bottom
        			90, 130, 110,
        			90, 130, 110,
        			90, 130, 110,
        			90, 130, 110,
        			90, 130, 110,
        			90, 130, 110,

          	  	  	  // left side
        			160, 160, 220,
        			160, 160, 220,
        			160, 160, 220,
        			160, 160, 220,
        			160, 160, 220,
        			160, 160, 220]),
			gl.STATIC_DRAW)

		var verticesCount = setFGeometry(gl)
		gl.drawArrays(gl.TRIANGLES, 0, verticesCount / 3)
	}

	function drawScene(gl, x, z, r, g, b, a) {
		var m = CANVAS_SIZE.vpProjectionMatrix
		m = m4.multiply(m, m4.translation(x, 150, z))
		m = m4.multiply(m, m4.xRotation(degreesToRadians(40)))
		m = m4.multiply(m, m4.yRotation(degreesToRadians(25)))
		m = m4.multiply(m, m4.zRotation(degreesToRadians(325)))
		m = m4.multiply(m, m4.scaling(1, 1, 1))

		gl.uniform4f(u_color, r, g, b, a)
		gl.uniformMatrix4fv(u_matrix, false, m)

		drawF(gl)
	}
	drawScene(gl, 20, 200, 0, 0, 0, 1)
	drawScene(gl, 45, 210, 0.1, 0.5, 0.1, 1)
}
