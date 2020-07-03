var IS_2D = false
var IS_3D = true
if (IS_2D) {
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
	var positionBuffer = gl.createBuffer();

	resizeGl(gl, STATE);
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

	function drawScene(gl) {
		var m = m3.projection(STATE.width, STATE.height)
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
		// TODO: Does viewport persist?
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		// TODO: Does clear color persist?
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// TODO: Does flags persist?
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
}
