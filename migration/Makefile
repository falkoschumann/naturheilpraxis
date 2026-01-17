ENTRY_POINT=src/program.ts
RUN_ARGS=--allow-read --allow-write --sloppy-imports
OUTPUT_DIR=data/output

all: start

clean:
	rm -rf $(OUTPUT_DIR)

start:
	mkdir -p $(OUTPUT_DIR)
	deno run $(RUN_ARGS) $(ENTRY_POINT) 2> $(OUTPUT_DIR)/error.log

dev:
	deno run $(RUN_ARGS) --watch $(ENTRY_POINT)

.PHONY: all clean start dev
