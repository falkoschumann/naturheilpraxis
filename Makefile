PLANTUML_FILES = $(wildcard doc/*.puml)
DIAGRAM_FILES = $(subst .puml,.png,$(PLANTUML_FILES))

all: check

start:
	npm start

doc: $(DIAGRAM_FILES)

check:
	npx prettier --check .

format:
	npx prettier --write .

dev: start

build: prepare
	./gradlew build -x test -x check

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
