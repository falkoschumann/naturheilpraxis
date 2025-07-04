include .env.local
export $(shell sed 's/=.*//' .env.local)

PLANTUML_FILES = $(wildcard doc/*.puml)
DIAGRAM_FILES = $(subst .puml,.png,$(PLANTUML_FILES))

all: dist check

clean:
	rm -rf out/Naturheilpraxis-*

distclean: clean
	rm -rf out
	rm -rf node_modules

dist: build

start:
	npm start

doc: $(DIAGRAM_FILES)

check:
	npx prettier --check .

format:
	npx prettier --write .

dev:
	npm run dev

build: prepare
	npm run make
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
