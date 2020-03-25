let hex = string => parseInt(string, 0x10)

let input = document.querySelector("#file")

let characters = document.querySelector("#characters")
let scales = document.querySelectorAll("[data-offset]")

let buffer
let view

let floatView = new DataView(new ArrayBuffer(4))
let setFloat = (offset, float) =>
{
	floatView.setFloat32(0, float)
	view.setUint8(offset + 0, floatView.getUint8(3))
	view.setUint8(offset + 1, floatView.getUint8(2))
	view.setUint8(offset + 2, floatView.getUint8(1))
	view.setUint8(offset + 3, floatView.getUint8(0))
}
let getFloat = offset =>
{
	floatView.setUint8(0, view.getUint8(offset + 3))
	floatView.setUint8(1, view.getUint8(offset + 2))
	floatView.setUint8(2, view.getUint8(offset + 1))
	floatView.setUint8(3, view.getUint8(offset + 0))
	return floatView.getFloat32(0)
}

let load = document.querySelector("#load")
let main = document.querySelector("main > div")

input.addEventListener("change", async () =>
{
	let file = input.files[0]
	if (!file) return
	
	load.hidden = true
	buffer = await file.arrayBuffer()
	view = new DataView(buffer)
	input.value = ""
	main.hidden = false
})

for (let button of document.querySelectorAll("[data-preset]"))
{
	let url = button.dataset.preset
	button.addEventListener("click", async () =>
	{
		load.hidden = true
		buffer = await (await fetch(url)).arrayBuffer()
		view = new DataView(buffer)
		main.hidden = false
	})
}

for (let input of scales)
{
	input.type = "number"
	input.step = "any"
	input.min = "0"
	input.step = "0.05"
	input.addEventListener("change", () =>
	{
		for (let option of characters.querySelectorAll("option:checked"))
			setFloat(hex(input.dataset.offset) + hex(option.value), input.valueAsNumber)
	})
	
	let fieldset = input.closest("fieldset")
	if (fieldset)
	{
		let compound = fieldset.querySelector("legend > input")
		input.addEventListener("dblclick", () => { if (!input.classList.toggle("free")) compound.value = "" })
	}
}

// Derived from this: https://stackoverflow.com/a/35708911
// Note that the problem is a little different, since we’re trying to find the double precision number whose shortest decimal representation round‐trips back to the given “single precision number” (represented as a double precision).
// Whereas the problem in the question is to find the shortest string that round‐trips.
// (Hopefully this makes sense and works, and there are no edge‐cases.)
let powers = [6, 7, 8, 9]
let round = float =>
{
	floatView.setFloat32(0, float)
	let short = floatView.getFloat32(0)
	for (let power of powers)
	{
		let scale = 10 ** power
		
		let rounded = Math.round(float * scale) / scale
		floatView.setFloat32(0, rounded)
		if (floatView.getFloat32(0) === short)
			return rounded
	}
	// Should never get here. (Hopefully.)
}

let compound = document.querySelectorAll("legend > input")

characters.addEventListener("input", () =>
{
	for (let input of compound) input.value = ""
	for (let input of scales) input.value = ""
	
	let offsets = [...characters.querySelectorAll("option:checked")].map(option => hex(option.value))
	
	if (offsets.length === 0) return
	
	for (let input of scales)
	{
		let partOffset = hex(input.dataset.offset)
		
		let [first, ...values] = offsets.map(characterOffset => view.getUint32(partOffset + characterOffset))
		if (values.every(value => value === first))
			input.valueAsNumber = round(getFloat(partOffset + offsets[0]))
	}
})

document.querySelector("#download").addEventListener("click", () =>
{
	let a = document.createElement("a")
	document.body.append(a)
	let url = URL.createObjectURL(new Blob([buffer]))
	a.href = url
	a.download = "plbodyscl.bin"
	a.click()
	URL.revokeObjectURL(url)
	a.remove()
})

for (let input of compound)
{
	input.type = "number"
	input.step = "any"
	input.min = "0"
	input.step = "0.05"
	let inputs = input.closest("fieldset").querySelectorAll(":not(legend) > input")
	input.addEventListener("input", () =>
	{
		let value = input.valueAsNumber
		if (value !== value) return
		for (let subInput of inputs)
			if (!subInput.matches(".free")) subInput.valueAsNumber = value
	})
	
	input.addEventListener("change", () =>
	{
		for (let subInput of inputs)
		for (let option of characters.querySelectorAll("option:checked"))
			if (!subInput.matches(".free")) setFloat(hex(subInput.dataset.offset) + hex(option.value), subInput.valueAsNumber)
	})
	
	for (let subInput of inputs) subInput.addEventListener("input", () => input.value = "")
}

let preview

let details = document.querySelector("#preview")
details.addEventListener("toggle", async () =>
{
	if (!preview) preview = await import("./preview.mjs")
	if (details.open) preview.enable()
	else preview.disable()
})
