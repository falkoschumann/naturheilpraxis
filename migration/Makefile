all: check

start:
	deno run --allow-read --allow-write main.ts

dev:
	deno run --allow-read --allow-write --watch main.ts

check:
	deno lint
	deno fmt --check

format:
	deno fmt
	deno lint --fix

.PHONY: all dev check format
