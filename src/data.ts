export const words = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`.split(' ')


export let stickerColors = [
	0xf5f6f8,
	0xfff9b1, // Default
	0xf5d128,
	0xd0e17a,
	0xd5f692,
	0xa6ccf5,
	0x67c6c0,
	0x23bfe7,
	0xff9d48,
	0xea94bb,
	0xf16c7f,
	0xb384bb,
].map(c => intColorToRGB(c))

function intColorToRGB(intColor: number) {
	return [
		(intColor >> 16) & 255,
		(intColor >> 8) & 255,
		intColor & 255,
		1,
	]
}
