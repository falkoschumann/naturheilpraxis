# JavaScript configuration
JS := bun
PM := bun
RUN := bunx

# PlantUML configuration
PLANTUML_FILES=$(wildcard docs/images/*.puml)
DIAGRAM_FILES=$(subst .puml,.png,$(PLANTUML_FILES))

# Make configuration
SHELL:=/bin/bash

all: dist check e2e doc

clean:
	rm -rf apps/*/build packages/*/build
	rm -rf apps/*/coverage packages/*/coverage
	rm -rf apps/*/coverage-e2e apps/*/playwright-report apps/*/test-results
	rm -rf node_modules/.cache apps/*/node_modules/.cache packages/*/node_modules/.cache

distclean: clean
	rm -rf dist apps/*/dist packages/*/dist
	rm -rf node_modules apps/*/node_modules packages/*/node_modules

dist: build
	$(PM) run --workspaces --if-present dist

dev: prepare
	$(PM) run --parallel --workspaces --if-present dev

doc: $(DIAGRAM_FILES)

esdm-visualizer:
	docker run --rm --publish 4000:3000 --volume .:/data impierce/esdm-visualizer

check: coverage
	$(PM) run --workspaces --if-present lint
	$(PM) run --workspaces --if-present check-types
	$(PM) run format
	esdm lint

fix:
	$(PM) run --workspaces --if-present lint:fix
	$(PM) run format:fix

test: prepare
	$(PM) run --workspaces --elide-lines=0 --if-present test

coverage: prepare
	$(PM) run --workspaces --elide-lines=0 --if-present test:coverage

watch: prepare
	$(PM) run --parallel --workspaces --if-present test:watch

e2e: build
	$(PM) run --workspaces --if-present test:e2e

build: prepare
	$(PM) run --workspaces --if-present build

prepare: version
ifdef CI
	$(PM) ci
else
	$(PM) install
endif

version:
	@echo "Use runtime $(JS) version $(shell $(JS) --version)"
	@echo "Use package manager $(PM) version $(shell $(PM) --version)"
	@echo "Use package runner $(RUN) version $(shell $(RUN) --version)"

# Do not generate diagrams in CI environment, because changes to the diagrams
# would not be committed
$(DIAGRAM_FILES): %.png: %.puml
ifndef CI
	plantuml $^
endif

.PHONY: \
	all clean distclean dist \
	dev doc esdm-visualizer \
	check fix \
	test coverage watch  e2e \
	build prepare version
