import {TextureInfo} from './gl'

export type TextureQueueItem = {
	next: TextureQueueItem
	prev: TextureQueueItem
	textureInfo: TextureInfo | null
}

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
	texturesQueue: {
		head: TextureQueueItem
		sentinel: TextureQueueItem
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
	text?: string
	x: number
	y: number
	dx: number
	dy: number
	rotation: number
	move: boolean
	scale: number
	texture: TextureInfo | null
}

export type AppState = {
	isBad: boolean
	verticies: Float32Array
	iterations: number
	pointer: {
		prevX: number
		prevY: number
	}

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

	// TODO: remove gl from here completely
	gl: GLState

	// TODO: should this be accessible by 'index.ts' platform layer?
	// Or this should only be visible to 'code.ts'?
	app: AppState

	canvasW: number
	canvasH: number
	widthOverHeight: number
	// NOTE: times pixelRatio
	displayW: number
	displayH: number
}

export type Input = {
	dt: number
	pointer: {
		clientX: number
		clientY: number
		wasDown: boolean
		isDown: boolean
	}
	wheel: {
		clientX: number
		clientY: number
		deltaY: number
	}
}
