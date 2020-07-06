'use strict'

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

var VERTEX_SHADER_TEXTURE_SOURCE = `
  attribute vec4 a_position;
  attribute vec2 a_texcoord;

  uniform mat4 u_matrix;

  varying vec2 v_texcoord;
 
  void main() {
  	gl_Position = u_matrix * a_position;
  	v_texcoord = a_texcoord;
  }
`;
var FRAGMENT_SHADER_TEXTURE_SOURCE = `
  precision mediump float;

  varying vec2 v_texcoord;

  uniform sampler2D u_texture;

  void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
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
  IMAGES_COUNT: 0,
  RECTS_COUNT: 0,
  TEXTS: new Array(100).fill(0).map(_ => words[(Math.random() * (words.length - 1)) | 0])
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

gl.clearColor(0.5, 0.5, 0.5, 1);
gl.enable(gl.BLEND); // TODO: may be this shouldn't be global? No idea for now, seems like it should
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

{
	var program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE)
	var a_position = gl.getAttribLocation(program, 'a_position');
	var u_matrix = gl.getUniformLocation(program, 'u_matrix');
	var u_color = gl.getUniformLocation(program, 'u_color');
	var positionBuffer = gl.createBuffer();

	STATE.rectProgram = {
		program: program,
		a_position: a_position,
		u_matrix: u_matrix,
		u_color: u_color,
		positionBuffer: positionBuffer,
	}
}
{
	var program = createProgram(gl, VERTEX_SHADER_TEXTURE_SOURCE, FRAGMENT_SHADER_TEXTURE_SOURCE)
	var a_position = gl.getAttribLocation(program, 'a_position')
	var a_texcoord = gl.getAttribLocation(program, 'a_texcoord')
	var u_matrix = gl.getUniformLocation(program, 'u_matrix')
	var u_texture = gl.getUniformLocation(program, 'u_texture')

	var positionBuffer = gl.createBuffer();
	var texcoordBuffer = gl.createBuffer();

	STATE.texProgram = {
		program: program,
		a_position: a_position,
		a_texcoord: a_texcoord,
		u_matrix: u_matrix,
		u_texture: u_texture,
		positionBuffer: positionBuffer,
		texcoordBuffer: texcoordBuffer,
	}
}

var _r = createRects(STATE.RECTS_COUNT, STATE.isBad)
STATE.rects = _r.rects
STATE.verticies = _r.verticies

STATE.images = {
	verticies: new Float32Array([
		0, 0,
		1, 0,
		0, 1,
		0, 1,
		1, 0,
		1, 1,
	]),
	texCoords: new Float32Array([
		0, 0,
		1, 0,
		0, 1,
		0, 1,
		1, 0,
		1, 1,
	]),
	// images are too big, 1000 images will eat all the memory on my GPU and canvas will crash :D
	// TODO: how to measure the memory amount i took? Calculate this by hand?
	// Like width * height * pixelRatio + mipMaps, thats how much per image? So i need to destroy old textures if limit is reached?
	list: new Array(STATE.IMAGES_COUNT).fill(0).map(_ => createImage('./me.JPG'))
} 
for (var i = 0; i < STATE.TEXTS.length; i++) {
	STATE.images.list.push({
		canvas: makeTextCanvas(STATE.TEXTS[i], 500, 100),
		x: 50 + randomInt(400),
		y: 50 + randomInt(400),
		dx: 0,
		dy: 0,
		scale: 1,
		texture: null,
	})
}

STATE.iterations = 0
var prevTime = 0

function updateAndRender(time) {
	time *= 0.001
	if (!prevTime) {
		prevTime = time
	}
	var dt = time - prevTime
	prevTime = time

	simulate(STATE.rects, STATE.verticies)
	STATE.images.list.forEach(function (img) {
		if (STATE.iterations % 1000 === 0) {
			img.dx = Math.random() > 0.5 ? 1 : -1
			img.dy = Math.random() > 0.5 ? 1 : -1
		}
		img.x += img.dx
		img.y += img.dy
		if (img.x > 600 && img.dx > 0) {
			img.dx = -img.dx
		}
		if (img.y > 600 && img.dy > 0) {
			img.dy = -img.dy
		}
		if (img.x < 50 && img.dx < 0) {
			img.dx = -img.dx
		}
		if (img.y < 50 && img.dy < 0) {
			img.dy = -img.dy
		}
	})
	STATE.iterations++

	resizeGl(gl, STATE);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT);

	{
		// NOTE: rects
		gl.useProgram(STATE.rectProgram.program)
		gl.enableVertexAttribArray(STATE.rectProgram.a_position);
		gl.bindBuffer(gl.ARRAY_BUFFER, STATE.rectProgram.positionBuffer);
		gl.vertexAttribPointer(STATE.rectProgram.a_position, 2, gl.FLOAT, false, 0, 0);

		var m = m3.projection(STATE.width, STATE.height)
		m = m3.multiply(m, m3.translation(100, 50))
		m = m3.multiply(m, m3.rotation(0))
		m = m3.multiply(m, m3.scaling(1, 1))

		gl.uniformMatrix3fv(STATE.rectProgram.u_matrix, false, m)

		if (!STATE.isBad) {
			gl.bindBuffer(gl.ARRAY_BUFFER, STATE.rectProgram.positionBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, STATE.verticies, gl.STATIC_DRAW);
		}
		
		for (var i = 0; i < STATE.rects.length; i++) {
			var rect = STATE.rects[i]

			if (STATE.isBad) {
				gl.bindBuffer(gl.ARRAY_BUFFER, STATE.rectProgram.positionBuffer);
				gl.bufferData(gl.ARRAY_BUFFER, rect.verticies, gl.STATIC_DRAW);
			}

			var color = rect.color
			gl.uniform4f(STATE.rectProgram.u_color, color.r, color.g, color.b, color.a)
			gl.drawArrays(gl.TRIANGLES, rect.offset, 6);
		}
	}
	{
		// NOTE: images

		gl.useProgram(STATE.texProgram.program)
		gl.enableVertexAttribArray(STATE.texProgram.a_position);
		gl.bindBuffer(gl.ARRAY_BUFFER, STATE.texProgram.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, STATE.images.verticies, gl.STATIC_DRAW)
		gl.vertexAttribPointer(STATE.texProgram.a_position, 2, gl.FLOAT, false, 0, 0);

		gl.enableVertexAttribArray(STATE.texProgram.a_texcoord);
		gl.bindBuffer(gl.ARRAY_BUFFER, STATE.texProgram.texcoordBuffer);
		gl.vertexAttribPointer(STATE.texProgram.a_texcoord, 2, gl.FLOAT, false, 0, 0);
		gl.bufferData(gl.ARRAY_BUFFER, STATE.images.texCoords, gl.STATIC_DRAW)

		// TODO: this is just a fast hack to imitate textures uploading queue
		// Let uploading took maximum 10ms, measure that and check how much per frame i can upload?
		var blockUploadTexture = false
		for (var i = 0; i < STATE.images.list.length; i++) {
			var image = STATE.images.list[i]
			if (!image.texture) {
				if (image.src) {
					image.texture = createTextureFromSrc(gl, image.src)
				} else if (image.canvas) {
					image.texture = createTextureFromCanvas(gl, image.canvas)
				}
			}
			if (image.texture) {
				if (image.texture.texLoaded) {
					gl.bindTexture(gl.TEXTURE_2D, image.texture.texture)

					var m = m4.orthographic(0, gl.canvas.width, gl.canvas.height, 0, -1, 1)
					m = m4.multiply(m, m4.translation(image.x, image.y, 0))
					m = m4.multiply(
						m,
						m4.scaling(image.texture.width * image.scale, image.texture.height * image.scale, 1))

					gl.uniformMatrix4fv(STATE.texProgram.u_matrix, false, m)
					gl.uniform1i(STATE.texProgram.u_texture, 0)
					gl.drawArrays(gl.TRIANGLES, 0, 6)
				} else if (image.texture.imgLoaded && !blockUploadTexture) {
					blockUploadTexture = true
					uploadToGpu(gl, image.texture)
				}
			}
		}
	}

	requestAnimationFrame(updateAndRender)
}
requestAnimationFrame(updateAndRender)
