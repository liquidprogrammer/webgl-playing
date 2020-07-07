import {TextureInfo} from './gl'

export type GLState = {
	initialized: boolean
	gl: WebGLRenderingContext
	rectProgram: {
		program: WebGLProgram
		a_position: GLint
		u_matrix: WebGLUniformLocation
		u_color: WebGLUniformLocation
		positionBuffer: WebGLBuffer
	}
	texProgram: {
		program: WebGLProgram
		a_position: GLint
		a_texcoord: GLint
		u_matrix: WebGLUniformLocation
		u_texture: WebGLUniformLocation
		positionBuffer: WebGLBuffer
		texcoordBuffer: WebGLBuffer
	}
}

export type RectItem = {
	x: number
	y: number
	w: number
	h: number
	verticies: Float32Array
	vertPerItem: number
	offset: number
	color: number[]
}

export type ImageItem = {
	src?: string | null
	canvas?: HTMLCanvasElement | null
	x: number
	y: number
	dx: number
	dy: number
	move: boolean
	scale: number
	texture: TextureInfo | null
}

export type AppState = {
	screenW: number
	screenH: number
	aspect: number
	// NOTE: times pixelRatio
	displayW: number
	displayH: number

	isBad: boolean
	verticies: Float32Array
	iterations: number

	rects: RectItem[]
	images: {
		verticies: Float32Array
		texCoords: Float32Array
		list: ImageItem[]
	}
	camera: {
		x: number
		y: number
		rotation: number
		zoom: number
	}
	viewProjectionM3: number[]
	viewProjectionM4: number[]
}

export type State = {
	initialized: boolean
	reloaded: boolean
	gl: GLState
	app: AppState
}

export type Input = {
	dt: number
}
