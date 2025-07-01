PLANTUML_FILES = $(wildcard doc/*.puml)
DIAGRAM_FILES = $(subst .puml,.png,$(PLANTUML_FILES))

all: check

check:
	npx prettier --check .

format:
	npx prettier --write .

doc: $(DIAGRAM_FILES)

$(DIAGRAM_FILES): %.png: %.puml
	plantuml $^

.PHONY: \
	all \
	check format \
	doc
