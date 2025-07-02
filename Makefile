PLANTUML_FILES = $(wildcard doc/*.puml)
DIAGRAM_FILES = $(subst .puml,.png,$(PLANTUML_FILES))

all: dist check

clean:
	rm -rf out

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build
	mkdir -p dist
	cp out/make/zip/darwin/arm64/*.zip dist/

start:
	npm start

doc: $(DIAGRAM_FILES)

check:
	npx prettier --check .

format:
	npx prettier --write .

dev: start

build: prepare
	npm run make

prepare: version

version:
	@echo "Java $(shell java --version | head -n 1)"

$(DIAGRAM_FILES): %.png: %.puml
	plantuml $^

.PHONY: \
	all start \
	doc \
	check format \
	dev \
	build prepare version
