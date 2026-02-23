export ASAR?=true
export MAC_SIGN?=false

PLANTUML_FILES = $(wildcard doc/*.puml)
DIAGRAM_FILES = $(subst .puml,.png,$(PLANTUML_FILES))
RUNTIME=bun
PACKAGE_MANAGER=bun
PACKAGE_RUNNER=bunx
ifeq ("$(shell command -v $(RUNTIME))", "")
    $(warning "$(COMMAND) is not available. Fallback to Node.js and npm.")
	RUNTIME=node
	PACKAGE_MANAGER=npm --no-package-lock
	PACKAGE_RUNNER=npx
endif

all: dist check

clean:
	rm -rf coverage out testdata

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build
	$(PACKAGE_MANAGER) run build:electron
#	$(PACKAGE_MANAGER) run build:mac
#	$(PACKAGE_MANAGER) run build:win

start: prepare
	$(PACKAGE_MANAGER) start

doc: $(DIAGRAM_FILES)

check: test
	$(PACKAGE_RUNNER) eslint .
	$(PACKAGE_RUNNER) prettier --check .
	$(PACKAGE_RUNNER) sheriff verify

format:
	$(PACKAGE_RUNNER) eslint --fix .
	$(PACKAGE_RUNNER) prettier --write .

dev: prepare
	$(PACKAGE_MANAGER) run dev

test: prepare
	$(PACKAGE_RUNNER) vitest run

watch: prepare
	$(PACKAGE_MANAGER) test

coverage: prepare
	$(PACKAGE_RUNNER) vitest run --coverage

unit-tests: prepare
	$(PACKAGE_RUNNER) vitest run unit

integration-tests: prepare
	$(PACKAGE_RUNNER) vitest run integration

e2e-tests: prepare
	$(PACKAGE_RUNNER) vitest run e2e

build: prepare
	$(PACKAGE_MANAGER) run build

prepare: version
ifdef CI
ifeq ($(findstring $(DEPENDABOT), $(GITHUB_ACTOR)), $(DEPENDABOT))
	@echo "dependabot detected, run $(PACKAGE_MANAGER) install"
	$(PACKAGE_MANAGER) install
else
	@echo "CI detected, run $(PACKAGE_MANAGER) ci"
	$(PACKAGE_MANAGER) ci
endif
else
	$(PACKAGE_MANAGER) install
endif

version:
	@echo "Using $(RUNTIME) $(shell $(RUNTIME) --version)"
	@echo "Using $(PACKAGE_MANAGER) $(shell $(PACKAGE_MANAGER) --version)"

$(DIAGRAM_FILES): %.png: %.puml
	plantuml $^

.PHONY: \
	all clean distclean dist start \
	doc \
	check format \
	dev test watch coverage unit-tests integration-tests e2e-tests \
	build prepare version
