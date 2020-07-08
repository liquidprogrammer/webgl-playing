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

var STATE = {
  width: 0,
  height: 0,
  displayWidth: 0,
  displayHeight: 0,
  aspect: 1,
  perspectiveM: [],
};
var canvas = document.createElement("canvas");
function resizeCanvas() {
	resizeCanvas0(STATE, canvas, degreesToRadians(60), 1, 2000)
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas()
document.body.appendChild(canvas);

var gl = canvas.getContext("webgl");
if (!gl) {
  throw new Error("no webgl");
}

var vertexShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);

var program = createProgram(gl, [vertexShader, fragmentShader])
var a_position = gl.getAttribLocation(program, "a_position");
var a_color = gl.getAttribLocation(program, 'a_color');
var u_matrix = gl.getUniformLocation(program, 'u_matrix');

var positionBuffer = gl.createBuffer();
gl.enableVertexAttribArray(a_position);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);

var colorBuffer = gl.createBuffer();
gl.enableVertexAttribArray(a_color);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(a_color, 3, gl.UNSIGNED_BYTE, true, 0, 0);

var t = 0
var prevTime = 0

function drawScene(gl, dt) {
	resizeGl(gl, STATE);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);

	gl.useProgram(program);

	var radius = 200
	var cameraM = m4.yRotation(t * 0.0001)
	cameraM = m4.multiply(cameraM, m4.translation(0, 0, 1.5 * radius))

	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, F_3D_COLORS, gl.STATIC_DRAW)

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, F_3D_VERTICES, gl.STATIC_DRAW);

	var targetP = [radius, 0, 0]
	var cameraP = [cameraM[12], cameraM[13], cameraM[14]]
	var up = [0, 1, 0]
	cameraM = m4.lookAt(cameraP, targetP, up)

	var viewMatrix = m4.inverse(cameraM)
	viewMatrix = m4.multiply(STATE.perspectiveM, viewMatrix)

	var fsCount = 5
	for (var i = 0; i < fsCount; i++) {
		var angle = i * Math.PI * 2 / fsCount
  	  	var x = Math.cos(angle) * radius
  	  	var y = Math.sin(angle) * radius
  	  	var fMatrix = m4.multiply(viewMatrix, m4.translation(x, 0, y));
 	 	 
  	  	gl.uniformMatrix4fv(u_matrix, false, fMatrix);
		gl.drawArrays(gl.TRIANGLES, 0, F_3D_VERTICES.length / 3)
	}

	t += dt

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
