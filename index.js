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

var STATE = {
  width: 0,
  height: 0,
  displayWidth: 0,
  displayHeight: 0,
  perspectiveM: [],
  rects: null,
  verticies: null,
  isBad: false,
};
var canvas = document.createElement("canvas");
function resizeCanvas() {
	resizeCanvas0(STATE, canvas, 65, 1, 2000)
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
document.body.appendChild(canvas);

var gl = canvas.getContext("webgl");
if (!gl) {
  throw new Error("no webgl");
}

var vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
var program = createProgram(gl, [vertexShader, fragmentShader])

var a_position = gl.getAttribLocation(program, "a_position");
var u_matrix = gl.getUniformLocation(program, 'u_matrix');
var u_color = gl.getUniformLocation(program, 'u_color');

resizeGl(gl, STATE);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.clearColor(0.5, 0.5, 0.5, 1);

gl.useProgram(program);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

var positionBuffer = gl.createBuffer();
gl.enableVertexAttribArray(a_position);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

function drawRect(gl, rect) {
	var color = rect.color
	gl.uniform4f(u_color, color.r, color.g, color.b, color.a)
	gl.drawArrays(gl.TRIANGLES, rect.offset, 6);
}

STATE.isBad = false

var _r = createRects(20000, STATE.isBad)
STATE.rects = _r.rects
STATE.verticies = _r.verticies

simulate(STATE.rects, STATE.verticies)

var prevTime = 0

function drawScene(gl, dt) {
	gl.clear(gl.COLOR_BUFFER_BIT);

	var m = m3.projection(STATE.width, STATE.height)
	m = m3.multiply(m, m3.translation(100, 50))
	m = m3.multiply(m, m3.rotation(0))
	m = m3.multiply(m, m3.scaling(1, 1))

	gl.uniformMatrix3fv(u_matrix, false, m)

	simulate(STATE.rects, STATE.verticies)

	if (!STATE.isBad) {
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, STATE.verticies, gl.STATIC_DRAW);
	}
	
	for (var i = 0; i < STATE.rects.length; i++) {
		var rect = STATE.rects[i]

		if (STATE.isBad) {
			gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, rect.verticies, gl.STATIC_DRAW);
		}

		drawRect(gl, rect)
	}

	requestAnimationFrame((time) => {
		if (!prevTime) {
			prevTime = time
		}
		var dt = time - prevTime
		prevTime = time
		drawScene(gl, dt)
	})
}
drawScene(gl, 0)
