ENTRY_POINT=src/program.ts
RUN_ARGS=--allow-read --allow-write --sloppy-imports

all: check

clean:
	rm -rf data/output

start:
	deno run $(RUN_ARGS) $(ENTRY_POINT)

dev:
	deno run $(RUN_ARGS) --watch $(ENTRY_POINT)

check:
	deno lint
	deno fmt --check

format:
	deno fmt
	deno lint --fix

.PHONY: all clean start dev check format
