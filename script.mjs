let hex = string => parseInt(string, 0x10)

let input = document.querySelector("#file")
let offsets = document.querySelector("#offsets")

let data = document.querySelectorAll(`[data-offset]`)

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

let filename
input.addEventListener("change", async () =>
{
	let file = input.files[0]
	if (!file) return
	
	filename = file.name
	buffer = await file.arrayBuffer()
	view = new DataView(buffer)
})

for (let input of data)
{
	input.type = "number"
	input.step = "any"
	input.min = "0"
	input.addEventListener("change", () =>
	{
		for (let offset of offsets.querySelectorAll("option:checked"))
			setFloat(hex(input.dataset.offset) + hex(offset.value), input.valueAsNumber)
	})
}

// Derived from this: https://stackoverflow.com/a/35708911
// Note that the problem is a little different, since we’re trying to find the double precision number whose shortest decimal representation round‐trips back to the given “single precision number” (represented as a double precision).
// Whereas the problem in the question is to find the shortest string that round‐trips.
// (Hopefully this makes sense and works, and there are no edge‐cases.)
let powers = [6, 7, 8, 9]
let round = float =>
{
	for (let power of powers)
	{
		let scale = 10 ** power
		
		let rounded = Math.round(float * scale) / scale
		floatView.setFloat32(0, rounded)
		if (floatView.getFloat32(0) === float)
			return rounded
	}
	// Should never get here. (Hopefully.)
}

let compound = document.querySelectorAll("legend > input")

offsets.addEventListener("input", () =>
{
	for (let input of compound) input.value = ""
	
	let [first, ...rest] = offsets.querySelectorAll("option:checked")
	
	if (!first)
	{
		for (let input of data) input.value = ""
		return
	}
	
	for (let input of data)
	{
		let ioffset = hex(input.dataset.offset)
		let startOffset = ioffset + hex(first.value)
		let value = view.getUint32(startOffset)
		input.valueAsNumber = round(getFloat(startOffset))
		for (let offset of rest)
		{
			if (view.getUint32(ioffset + hex(offset.value)) !== value)
			{
				input.value = ""
				break
			}
		}
	}
})

document.querySelector("#download").addEventListener("click", () =>
{
	let a = document.createElement("a")
	document.body.append(a)
	let url = URL.createObjectURL(new Blob([buffer]))
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
	a.remove()
})

for (let input of compound)
{
	input.type = "number"
	input.step = "any"
	input.min = "0"
	let inputs = input.closest("fieldset").querySelectorAll(":not(legend) > input")
	input.addEventListener("input", () =>
	{
		let value = input.valueAsNumber
		if (value !== value) return
		for (let other of inputs) other.valueAsNumber = value
	})
	
	input.addEventListener("change", () =>
	{
		for (let other of inputs)
		for (let offset of offsets.querySelectorAll("option:checked"))
			setFloat(hex(other.dataset.offset) + hex(offset.value), other.valueAsNumber)
	})
	
	for (let other of inputs) other.addEventListener("input", () => input.value = "")
}
