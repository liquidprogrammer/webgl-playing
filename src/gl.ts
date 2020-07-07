import {isPowerOf2} from './utils'

export type TextureInfo = {
	error: any | null
	texture: WebGLTexture
	width: number
	height: number
	imgData: TexImageSource | null
	imgLoaded: boolean
	texLoaded: boolean
}

export function resizeGl(gl: WebGLRenderingContext, w: number, h: number) {
  	if (
    	gl.canvas.width !== w ||
    	gl.canvas.height !== h
  	) {
    	gl.canvas.width = w
    	gl.canvas.height = h
  	}
}

export function createShader(gl: WebGLRenderingContext, type: GLenum, source: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  // TODO: do not check compile status until we link all that to program and check that linking is failed,
  // that will be much faster as people say, because `getShaderParameter` is expensive
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
  if (!success) {
  	console.log(gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    throw new Error(
      "Failed to compile shader: " + type + ". Source: " + source
    )
  }

  return shader
}

export function createProgram0(gl: WebGLRenderingContext, shaders: WebGLShader[]): WebGLProgram {
	const program = gl.createProgram()!
	shaders.forEach(shader => {
		gl.attachShader(program, shader)
	})
	gl.linkProgram(program)
	const success = gl.getProgramParameter(program, gl.LINK_STATUS)
	if (!success) {
		// TODO: check shaders compile errors here, not inside `createShader` func
		gl.deleteProgram(program)
		throw new Error("Program is not linked")
	}

	return program
}

export function createProgram(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource)
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
	const program = createProgram0(gl, [vertexShader, fragmentShader])
	return program
}

// TODO: make a streaming system to monitor current textures size,
// track recently used textures and delete ones that we didn't use last frames
export function createTexture(gl: WebGLRenderingContext): TextureInfo {
	let tex = gl.createTexture()!
	gl.bindTexture(gl.TEXTURE_2D, tex)
	// TODO: fill by default with 1x1 black square? for debugging purposes?
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255])) 

	let textureInfo: TextureInfo = {
		error: null,
		texture: tex,
		width: 1,
		height: 1,
		imgData: null,
		imgLoaded: false,
		texLoaded: false,
	}

	return textureInfo
}

export function uploadToGl(gl: WebGLRenderingContext, textureInfo: TextureInfo): void {
	if (!textureInfo.imgData) {
		throw new Error('invalid case')
	}
	gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureInfo.imgData)

	if (isPowerOf2(textureInfo.width) && isPowerOf2(textureInfo.height)) {
		gl.generateMipmap(gl.TEXTURE_2D)
	} else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	}
	textureInfo.texLoaded = true
}

