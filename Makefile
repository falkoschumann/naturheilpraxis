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

start: prepare
	npm start

doc: $(DIAGRAM_FILES)

check: test
	npx eslint .
	npx prettier --check .
	npx sheriff verify src/main/index.ts
	npx sheriff verify src/preload/index.ts
	npx sheriff verify src/renderer/index.tsx

format:
	npx eslint --fix .
	npx prettier --write .

dev: prepare
	npm run dev

test: prepare
	npx vitest run

watch: prepare
	npm test

coverage: prepare
	npx vitest run --coverage

unit-tests: prepare
	npx vitest run unit

integration-tests: prepare
	npx vitest run integration

e2e-tests: prepare
	npx vitest run e2e

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
