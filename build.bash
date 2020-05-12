#!/usr/bin/env bash

set -e

mkdir -p public

mv \
	index.html \
	style.css \
	script.mjs \
	preview.mjs \
	model \
	presets \
	tutorial.html \
	public

mv node_modules public/modules
