# JavaScript configuration
JS := bun
PM := bun
RUN := bunx

all: dist check e2e

clean:
	rm -rf apps/*/build packages/*/build
	rm -rf apps/*/coverage packages/*/coverage
	rm -rf node_modules/.cache apps/*/node_modules/.cache packages/*/node_modules/.cache

distclean: clean
	rm -rf dist apps/*/dist packages/*/dist
	rm -rf node_modules apps/*/node_modules packages/*/node_modules

dist: build
	$(PM) run --workspaces --if-present dist

dev: prepare
	$(PM) run --parallel --workspaces --if-present dev

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
	$(PM) run --workspaces --if-present test

coverage: prepare
	$(PM) run --workspaces --if-present test:coverage

watch: prepare
	$(PM) run --workspaces --if-present test:watch

e2e: build
	$(PM) run --workspaces --if-present test:e2e

build: prepare
	$(PM) run --workspaces --if-present build

prepare:
	$(PM) install

.PHONY: \
	all clean distclean dist \
	dev esdm-visualizer \
	check fix \
	test coverage watch  e2e \
	build prepare
