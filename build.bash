#!/usr/bin/env bash

set -e

mkdir -p public

mv \
	node_modules \
	index.html \
	style.css \
	script.mjs \
	preview.mjs \
	model \
	presets \
	public
