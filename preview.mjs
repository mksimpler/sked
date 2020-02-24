import
{
	PerspectiveCamera,
	Scene,
	Color,
	WebGLRenderer,
	PolarGridHelper,
	LoadingManager,
	AmbientLight,
}
from "./node_modules/three/build/three.module.js"

import {OrbitControls} from "./node_modules/three/examples/jsm/controls/OrbitControls.js"
import {MMDLoader} from "./node_modules/three/examples/jsm/loaders/MMDLoader.js"
import {DDSLoader} from "./node_modules/three/examples/jsm/loaders/DDSLoader.js"

let manager = new LoadingManager()
manager.addHandler(/\.dds$/, new DDSLoader())

let camera = new PerspectiveCamera(45, 1, 1, 0x10000)
camera.position.z = 30

let scene = new Scene()

let canvas = document.querySelector("canvas")
let renderer = new WebGLRenderer({canvas, antialias: true, alpha: true})
renderer.setPixelRatio(devicePixelRatio)

scene.add(new AmbientLight(0xFFFFFF, 0.8))

let gridHelper = new PolarGridHelper(30, 10)
gridHelper.position.y = -10
scene.add(gridHelper)

let loader = new MMDLoader(manager)

loader.load("model/SKRyounaUniform.pmx", char => { scene.add(char) ; char.position.y -= 10 ; loaded() })

let controls = new OrbitControls(camera, canvas)

let frame

let loop = () =>
{
	frame = requestAnimationFrame(loop)
	renderer.render(scene, camera)
}

let resized = () =>
{
	let {width, height} = canvas.getBoundingClientRect()
	canvas.width = width
	canvas.height = height
	renderer.setSize(width, height)
	canvas.removeAttribute("style")
	camera.aspect = width / height
	camera.updateProjectionMatrix()
}

resized()

addEventListener("resize", resized)

export let enable = () => frame = requestAnimationFrame(loop)
export let disable = () => cancelAnimationFrame(frame)

let correspondences =
{
	"Left Chest": ["0E4", "0E8", "0EC"],
	"Right Chest": ["0CC", "0D0", "0D4"],
}

let loaded = () =>
{
	for (let name in correspondences)
	{
		let offsets = correspondences[name]
		
		let object = scene.getObjectByName(name)
		
		let update = (i, value) =>
		{
			if (value !== value) value = 1
			object.scale.setComponent(i, value)
		}
		
		for (let i = 0 ; i < 3 ; i++)
		{
			let input = document.querySelector(`[data-offset="${offsets[i]}"]`)
			input.addEventListener("input", () => update(i, input.valueAsNumber))
		}
		
		let fieldset = document.querySelector(`[data-offset="${offsets[0]}"]`).closest("fieldset")
		if (fieldset)
		{
			let input = fieldset.querySelector("legend > input")
			input.addEventListener("input", () =>
			{
				for (let i = 0 ; i < 3 ; i++)
					update(i, input.valueAsNumber)
			})
		}
	}
}
