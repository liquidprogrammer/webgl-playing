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
m3.viewportProjection = function(width, height) {
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
  CANVAS_SIZE.vpProjectionMatrix = m3.viewportProjection(CANVAS_SIZE.displayWidth, CANVAS_SIZE.displayHeight)

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
