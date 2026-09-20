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

dev: prepare

esdm-visualizer:
	docker run --rm --publish 4000:3000 --volume .:/data impierce/esdm-visualizer

check: test
	$(PM) run format
	esdm lint

fix:
	$(PM) run format:fix

test: prepare

watch: prepare

coverage: prepare

e2e: build

build: prepare

prepare:
	$(PM) install

.PHONY: \
	all clean distclean dist \
	dev esdm-visualizer \
	check fix \
	test watch coverage e2e \
	build prepare
