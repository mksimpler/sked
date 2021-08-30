#!/usr/bin/env bash
set -e

rm -rf public
mkdir -p public

ln \
	index.html \
	style.css \
	script.js \
	preview.js \
	tutorial.html \
	logo.js \
	public

cp -r model presets public
