include .env.local
export $(shell sed 's/=.*//' .env.local)

PLANTUML_FILES = $(wildcard doc/*.puml)
DIAGRAM_FILES = $(subst .puml,.png,$(PLANTUML_FILES))

all: dist check

clean:
	rm -rf dist
	rm -rf out/Naturheilpraxis-*

distclean: clean
	rm -rf out
	rm -rf node_modules

dist: build
	npm run make

start:
	npm start

doc: $(DIAGRAM_FILES)

check:
	npx eslint .
	npx prettier --check .


format:
	npx eslint --fix .
	npx prettier --write .

dev:
	npm run dev

# TODO Build only one platform and configure platform, arch and target via environment variable
build: prepare
	npm run build
#	npm run make -- --platform darwin --arch arm64 --targets @electron-forge/maker-zip
#	npm run make -- --platform darwin --arch x64 --targets @electron-forge/maker-zip
#	npm run make -- --platform win32 --arch x64 --targets @electron-forge/maker-zip
#	npm run make -- --platform win32 --arch arm64 --targets @electron-forge/maker-zip

prepare: version
	@if [ -n "$(CI)" ] ; then \
  		echo "CI detected, run npm ci"; \
  		npm ci; \
  	else \
  		npm install; \
  	fi

version:
	@echo "Node.js $(shell node --version)"
	@echo "NPM $(shell npm --version)"

$(DIAGRAM_FILES): %.png: %.puml
	plantuml $^

.PHONY: \
	all clean distclean dist start \
	doc \
	check format \
	dev \
	build prepare version
