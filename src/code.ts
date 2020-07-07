import {State, GLState, Input} from './types'
import {resizeGl, createProgram, uploadToGl, createTexture, TextureInfo} from './gl'
import {m3, m4, randomInt, toRgba} from './utils'
import {words, stickerColors} from './data'

// TODO: pass inputs here with dt
// TODO:
// 1. create canvas outside of here
// 2. move all input processing outside of here
// 3. all matrix calculations should be done in simulation phase

export function updateAndRender(state: State, input: Input) {
	if (!state.initialized) {
		console.info('init')

		state.initialized = true

		let canvas = document.createElement('canvas')
		let gl = canvas.getContext('webgl')
		if (!gl) {
			let div = document.createElement('div')
			div.setAttribute('style', 'width: 100%; height: 100%; background: red;')
			div.innerText = 'NO WEBGL SUPPORT'
			document.body.appendChild(div)
		} else {
			state.gl = {
				gl: gl,
				initialized: false,
			} as GLState

		}
		if (state.gl) {
			const IS_BAD = false
			const RECTS_COUNT = 0
			const IMAGES_COUNT = 0//10
			const TEXTS_COUNT = 0//10
			const STICKERS_COUNT = 500

			state.app = {
				screenW: 0,
				screenH: 0,
				aspect: 0,
				displayW: 0,
				displayH: 0,

				iterations: 0,
				isBad: IS_BAD,
				verticies: null!,
				rects: [],
				images: null!,

				camera: {
					x: 0,
					y: 0,
					rotation: 0,
					zoom: 1,
				},
				viewProjectionM3: [],
				viewProjectionM4: [],
			}
			updateViewProjection(state.gl.gl, state)

			// TODO: handle gl context missing. There are some cases when context will be missed and
			// every buffer will become dead: https://www.khronos.org/webgl/wiki/HandlingContextLost
			// Reset glInitialized when context lost/restored
			let resizeCanvas = () => {
				state.app.screenW = document.documentElement.clientWidth
				state.app.screenH = document.documentElement.clientHeight
				state.app.aspect = state.app.screenW / state.app.screenH
				// TODO: devicePixelRatio is not supported everywhere, may be we need to
				// check backingStorePixelRatio too (google that)
				state.app.displayW = state.app.screenW * window.devicePixelRatio
				state.app.displayH = state.app.screenH * window.devicePixelRatio

				canvas.style.cssText = `width: ${state.app.screenW}px; height: ${state.app.screenH}px;`
			}

			let prevX = 0
			let prevY = 0
			let isDown = false
			canvas.addEventListener('mousedown', event => {
				prevX = event.clientX
				prevY = event.clientY
				isDown = true
			})
			canvas.addEventListener('mouseup', () => {
				isDown = false
			})
			canvas.addEventListener('mousemove', event => {
				if (isDown) {
  	  	  	  	  	// TODO: that x2 is stupid, we need to count camera here somehow
					let dx = (event.clientX - prevX) * 2
					let dy = (event.clientY - prevY) * 2

					prevX = event.clientX
					prevY = event.clientY

					state.app.camera.x -= dx / state.app.camera.zoom
					state.app.camera.y -= dy / state.app.camera.zoom

					updateViewProjection(state.gl.gl, state)
				}
			})

			canvas.addEventListener('wheel', (e) => {
				e.preventDefault()

				let camera = state.app.camera

				const [clipX, clipY] = getClipSpaceMousePosition(e.clientX, e.clientY, state)

				// position before zooming
				const [preZoomX, preZoomY] = m3.transformPoint(
  	  	  	  	  m3.inverse(state.app.viewProjectionM3), 
  	  	  	  	  [clipX, clipY])

				// multiply the wheel movement by the current zoom level
				// so we zoom less when zoomed in and more when zoomed out
				const newZoom = camera.zoom * Math.pow(2, e.deltaY * -0.01)
				camera.zoom = Math.max(0.02, Math.min(100, newZoom))

				updateViewProjection(state.gl.gl, state)

				// position after zooming
				const [postZoomX, postZoomY] = m3.transformPoint(
  	  	  	  	  m3.inverse(state.app.viewProjectionM3), 
  	  	  	  	  [clipX, clipY])

				// camera needs to be moved the difference of before and after
				camera.x += preZoomX - postZoomX
				camera.y += preZoomY - postZoomY

				updateViewProjection(state.gl.gl, state)
			})
			window.addEventListener("resize", resizeCanvas)
			resizeCanvas()
			document.body.appendChild(canvas)

			{
				let vertPerItem = 12
				let verticies = new Float32Array(vertPerItem * RECTS_COUNT)

				for (let i = 0; i < RECTS_COUNT; i++) {
					state.app.rects.push({
						x: 0,
						y: 0,
						w: 0,
						h: 0,
						// NOTE: bad version, verticies per object, hard pressure for GPU data channel
						verticies: state.app.isBad ? new Float32Array(vertPerItem) : verticies,
						vertPerItem: vertPerItem,
						offset: state.app.isBad ? 0 : i * vertPerItem,
						color: [0, 0, 0, Math.random() > 0.5 ? 1 : 0.5]
					})
				}

				state.app.verticies = verticies
			}
			{
				state.app.images = {
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
					list: new Array(IMAGES_COUNT).fill(0).map(_ => {
						return {
							src: require('./me.JPG'),
							x: 50 + randomInt(100),
							y: 50 + randomInt(100),
							dx: 0,
							dy: 0,
							move: true,
							scale: Math.max(0.05, Math.min(0.25, Math.random())),
							texture: null,
						}
					})
				}
			}
			{
				for (let i = 0; i < TEXTS_COUNT; i++) {
					let text = words[(Math.random() * (words.length - 1)) | 0]
					state.app.images.list.push({
						canvas: makeTextCanvas(text, 500, 100), // TODO: sizes are invalid
						x: 50 + randomInt(400),
						y: 50 + randomInt(400),
						dx: 0,
						dy: 0,
						move: true,
						scale: 1,
						texture: null,
					})
				}
			}
			{
				for (let i = 0; i < STICKERS_COUNT; i++) {
					let text = words[(Math.random() * (words.length - 1)) | 0]
					let color = stickerColors[(Math.random() * (stickerColors.length - 1)) | 0]
					let x = (Math.random() * 2 - 1) * 20000
					let y = (Math.random() * 2 - 1) * 20000
					let scale = Math.max(0.3, Math.random() * 2)
					state.app.images.list.push({
						src: require('./sticker-01.png'),
						x: x,
						y: y,
						dx: 0,
						dy: 0,
						move: false,
						scale: scale,
						texture: null,
					})
					state.app.images.list.push({
						canvas: makeTextCanvas(text, 300, 100), // TODO: sizes are invalid
						x: x + 100 * scale,
						y: y + 150 * scale,
						dx: 0,
						dy: 0,
						move: false,
						scale: scale,
						texture: null,
					})
				}
			}
		}
	}

	simulate(state)

	if (state.gl.gl) {
		let gl = state.gl.gl
		if (!state.gl.initialized) {
			console.info('init gl')
			state.gl.initialized = true

			// TODO: may be this shouldn't be global? No idea for now, seems like it should
			gl.enable(gl.BLEND)
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

			initializeGl(state)
		}
		render(gl, state, input)
	} else {
		console.warn('Render is not defined')
	}
}

function makeCameraMatrix(state: State) {
	let camera = state.app.camera
	let zoomScale = 1 / camera.zoom
	let cameraMat = m3.identity()
	cameraMat = m3.translate(cameraMat, camera.x, camera.y)
	cameraMat = m3.rotate(cameraMat, camera.rotation)
	cameraMat = m3.scale(cameraMat, zoomScale, zoomScale)
	return cameraMat
}

// TODO: remove that
function makeCameraMatrix4(state: State) {
	let camera = state.app.camera
	let zoomScale = 1 / camera.zoom
	let cameraMat = m4.identity()
	cameraMat = m4.translate(cameraMat, camera.x, camera.y, 0)
	cameraMat = m4.scale(cameraMat, zoomScale, zoomScale, 1)
	return cameraMat
}

function updateViewProjection(gl: WebGLRenderingContext, state: State) {
	// same as ortho(0, width, height, 0, -1, 1)
	{
		const projectionMat = m3.projection(gl.canvas.width, gl.canvas.height)
		const cameraMat = makeCameraMatrix(state)
		let viewMat = m3.inverse(cameraMat)
		state.app.viewProjectionM3 = m3.multiply(projectionMat, viewMat)
	}
	{
		const projectionMat = m4.projection(gl.canvas.width, gl.canvas.height, 1)
		const cameraMat = makeCameraMatrix4(state)
		let viewMat = m4.inverse(cameraMat)
		state.app.viewProjectionM4 = m4.multiply(projectionMat, viewMat)
	}
}

function getClipSpaceMousePosition(x: number, y: number, state: State) {
	// get canvas relative css position
	const canvas = state.gl.gl.canvas as HTMLCanvasElement
	const rect = canvas.getBoundingClientRect();
	const cssX = x - rect.left;
	const cssY = y - rect.top;

	// get normalized 0 to 1 position across and down canvas
	const normalizedX = cssX / canvas.clientWidth;
	const normalizedY = cssY / canvas.clientHeight;

	// convert to clip space
	const clipX = normalizedX *  2 - 1;
	const clipY = normalizedY * -2 + 1;

	return [clipX, clipY];
}

function simulate(state: State): void {
	let rects = state.app.rects
	for (let i = 0; i < rects.length; i++) {
		let rect = rects[i]

		let x = randomInt(300)
		let y = randomInt(300)
		let w = randomInt(300)
		let h = randomInt(300)
		rect.x = x
		rect.y = y
		rect.w = w
		rect.h = h
		rect.color[0] = Math.random()
		rect.color[1] = Math.random()
		rect.color[2] = Math.random()

		let offset = rect.offset
		let verts = rect.verticies

		let x1 = x
		let x2 = x + w
		let y1 = y
		let y2 = y + h
		verts[offset + 0] = x1
		verts[offset + 1] = y1
		verts[offset + 2] = x2
		verts[offset + 3] = y1
		verts[offset + 4] = x1
		verts[offset + 5] = y2
		verts[offset + 6] = x1
		verts[offset + 7] = y2
		verts[offset + 8] = x2
		verts[offset + 9] = y1
		verts[offset + 10] = x2
		verts[offset + 11] = y2
	}

	state.app.images.list.forEach(img => {
		if (img.move) {
			if (state.app.iterations % 1000 === 0) {
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
		}
	})
	state.app.iterations++
}

function render(gl: WebGLRenderingContext, state: State, input: Input) {
  	if (
    	gl.canvas.width !== state.app.displayW ||
    	gl.canvas.height !== state.app.displayH
  	) {
    	gl.canvas.width = state.app.displayW
    	gl.canvas.height = state.app.displayH
    	updateViewProjection(gl, state)
  	}

  	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)

	let r = ((13 + input.dt * 50) % 255) | 0
	let g = 123
	let b = 13

	gl.clearColor(r / 255, g / 255, b / 255, 1)
	gl.clear(gl.COLOR_BUFFER_BIT)

	{
		// NOTE: rects
		const rectProgram = state.gl.rectProgram

		gl.useProgram(rectProgram.program)
		gl.bindBuffer(gl.ARRAY_BUFFER, rectProgram.positionBuffer)
		gl.enableVertexAttribArray(rectProgram.a_position)
		gl.vertexAttribPointer(rectProgram.a_position, 2, gl.FLOAT, false, 0, 0)

		if (!state.app.isBad) {
			gl.bindBuffer(gl.ARRAY_BUFFER, rectProgram.positionBuffer)
			gl.bufferData(gl.ARRAY_BUFFER, state.app.verticies, gl.DYNAMIC_DRAW)
		}

		let m = m3.identity()
		m = m3.translate(m, 100, 50)
		m = m3.rotate(m, 0)
		m = m3.scale(m, 1, 1)
		m = m3.multiply(state.app.viewProjectionM3, m)

		gl.uniformMatrix3fv(rectProgram.u_matrix, false, m)

		for (let i = 0; i < state.app.rects.length; i++) {
			let rect = state.app.rects[i]

			if (state.app.isBad) {
				gl.bindBuffer(gl.ARRAY_BUFFER, rectProgram.positionBuffer)
				gl.bufferData(gl.ARRAY_BUFFER, rect.verticies, gl.STATIC_DRAW)
			}

			var color = rect.color
			gl.uniform4f(rectProgram.u_color, color[0], color[1], color[2], color[3])
			gl.drawArrays(gl.TRIANGLES, rect.offset, 6)
		}
	}
	{
		// NOTE: images
		const texProgram = state.gl.texProgram

		gl.useProgram(texProgram.program)
		gl.bindBuffer(gl.ARRAY_BUFFER, texProgram.positionBuffer)
		gl.enableVertexAttribArray(texProgram.a_position)
		gl.bufferData(gl.ARRAY_BUFFER, state.app.images.verticies, gl.STATIC_DRAW)
		gl.vertexAttribPointer(texProgram.a_position, 2, gl.FLOAT, false, 0, 0)

		gl.bindBuffer(gl.ARRAY_BUFFER, texProgram.texcoordBuffer)
		gl.enableVertexAttribArray(texProgram.a_texcoord)
		gl.vertexAttribPointer(texProgram.a_texcoord, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, state.app.images.texCoords, gl.STATIC_DRAW)

		// TODO: this flag is just a fast hack to imitate textures uploading queue
		// Let uploading took maximum 10ms, measure that and check how much per frame i can upload?
		let blockUploadTexture = false
		for (let i = 0; i < state.app.images.list.length; i++) {
			let image = state.app.images.list[i]
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

					// TODO: no idea why, but this doesn't work for m3, something is busted in calcs
					let m = m4.identity()
					m = m4.translate(m, image.x, image.y, 0)
					m = m4.scale(m, image.texture.width * image.scale, image.texture.height * image.scale, 1)
					const projectionMat = m4.projection(gl.canvas.width, gl.canvas.height, 1)
					m = m4.multiply(state.app.viewProjectionM4, m)

					gl.uniformMatrix4fv(texProgram.u_matrix, false, m)
					gl.uniform1i(texProgram.u_texture, 0)
					gl.drawArrays(gl.TRIANGLES, 0, 6)
				} else if (image.texture.imgLoaded && !blockUploadTexture) {
					blockUploadTexture = true
					uploadToGl(gl, image.texture)
				}
			}
		}
	}
}

function makeTextCanvas(text: string, w: number, h: number) {
	let textCtx = document.createElement('canvas').getContext('2d')!

	textCtx.canvas.width  = w
	textCtx.canvas.height = h
	textCtx.font = '60px monospace'
	textCtx.textAlign = 'center'
	textCtx.textBaseline = 'middle'
	textCtx.fillStyle = 'black'
	textCtx.clearRect(0, 0, w, h)
	textCtx.fillText(text, w / 2, h / 2)

	return textCtx.canvas
}

function createTextureFromCanvas(gl: WebGLRenderingContext, canvas: HTMLCanvasElement) {
	let textureInfo = createTexture(gl)
	textureInfo.imgData = canvas
	textureInfo.imgLoaded = true
	textureInfo.width = canvas.width
	textureInfo.height = canvas.height

	return textureInfo
}

function createTextureFromSrc(gl: WebGLRenderingContext, src: string) {
	let textureInfo = createTexture(gl)

	let img = new Image()

	// TODO: do i need to store the original img? Or this is not needed and it is better to reload it
	// from scratch if i need to restore the texture? Keeping it in memory is expensive? Plus
	// it will be doubled: in RAM and in GPU
	img.addEventListener('load', function () {
		textureInfo.width = img.width
		textureInfo.height = img.height
		textureInfo.imgLoaded = true
		textureInfo.imgData = img
	})
	img.addEventListener('error', (error) => {
		textureInfo.error = error
		console.error('Failed to load texture image', error, src)
	})
	img.src = src

	return textureInfo
}


function initializeGl(state: State) {
	let gl: WebGLRenderingContext = state.gl.gl
	{
		const VERTEX_SHADER_SOURCE = `
  	  	  attribute vec2 a_position;
  	  	  uniform mat3 u_matrix;
 	 	 
  	  	  void main() {
  			vec2 position = (u_matrix * vec3(a_position, 1)).xy;
    		gl_Position = vec4(position, 0, 1);
  	  	  }
		`;
		const FRAGMENT_SHADER_SOURCE = `
  	  	  precision mediump float;
  	  	  uniform vec4 u_color;
 	 	 
  	  	  void main() {
    		gl_FragColor = u_color;
  	  	  }
		`;

		const program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE)
		const a_position = gl.getAttribLocation(program, 'a_position')
		const u_matrix = gl.getUniformLocation(program, 'u_matrix')!
		const u_color = gl.getUniformLocation(program, 'u_color')!
		const positionBuffer = gl.createBuffer()!

		state.gl.rectProgram = {
			program: program,
			a_position: a_position,
			u_matrix: u_matrix,
			u_color: u_color,
			positionBuffer: positionBuffer,
		}
	}
	{
		const VERTEX_SHADER_SOURCE = `
  	  	  attribute vec4 a_position;
  	  	  attribute vec2 a_texcoord;

  	  	  uniform mat4 u_matrix;

  	  	  varying vec2 v_texcoord;
 	 	 
  	  	  void main() {
  			gl_Position = u_matrix * a_position;
  			v_texcoord = a_texcoord;
  	  	  }
		`;
		const FRAGMENT_SHADER_SOURCE = `
  	  	  precision mediump float;

  	  	  varying vec2 v_texcoord;

  	  	  uniform sampler2D u_texture;

  	  	  void main() {
    		gl_FragColor = texture2D(u_texture, v_texcoord);
  	  	  }
		`;

		const program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE)
		const a_position = gl.getAttribLocation(program, 'a_position')
		const a_texcoord = gl.getAttribLocation(program, 'a_texcoord')
		const u_matrix = gl.getUniformLocation(program, 'u_matrix')!
		const u_texture = gl.getUniformLocation(program, 'u_texture')!

		const positionBuffer = gl.createBuffer()!
		const texcoordBuffer = gl.createBuffer()!

		state.gl.texProgram = {
			program: program,
			a_position: a_position,
			a_texcoord: a_texcoord,
			u_matrix: u_matrix,
			u_texture: u_texture,
			positionBuffer: positionBuffer,
			texcoordBuffer: texcoordBuffer,
		}
	}
}
