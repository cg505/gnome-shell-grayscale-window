#!/usr/bin/env fish

glib-compile-schemas schemas

set -l file "grayscale-window@cg505.com.zip"

rm $file
zip -r $file metadata.json extension.js schemas
