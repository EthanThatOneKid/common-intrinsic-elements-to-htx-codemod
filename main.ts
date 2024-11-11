import { MuxAsyncIterator } from "@std/async/mux-async-iterator";
import type { WalkEntry } from "@std/fs/walk";
import { expandGlob } from "@std/fs/expand-glob";
import { getDescriptors } from "@fartlabs/ht/cli/codegen";

export const htxSpecifier = "@fartlabs/htx";
export const intrinsicElements = new Set(
  getDescriptors().map((descriptor) => descriptor.tag),
);

if (import.meta.main) {
  for (const entry of await expandJsxFiles(Deno.args)) {
    await processJsxFileEntry(entry);
  }
}

async function processJsxFileEntry(entry: WalkEntry): Promise<void> {
  await Deno.writeTextFile(
    entry.path,
    processJsxFile(
      parserByExtension(entry.path),
      await Deno.readTextFile(entry.path),
    ),
  );
}

function parserByExtension(file: string): Parser {
  if (file.endsWith(".jsx")) {
    return "jsx";
  } else if (file.endsWith(".tsx")) {
    return "tsx";
  } else {
    throw new Error(`Expected .jsx or .tsx file, got ${file}`);
  }
}

// TODO: Add Tree-Sitter parser.

function processJsxFile(parser: Parser, sourceCode: string): string {
  // TODO: Find @fartlabs/htx import statement.
  // TODO: As jsx intrinsics are encountered, add them to the import statement and capitalize them.
  //
}

async function expandJsxFiles(globs: string[]): Promise<WalkEntry[]> {
  const entries = await Array.fromAsync(expandGlobs(globs));
  for (const entry of entries) {
    if (!entry.isFile) {
      throw new Error(`Expected file, got ${entry.path}`);
    }

    const isJsx = /\.[jt]sx$/.test(entry.path);
    if (!isJsx) {
      throw new Error(`Expected .jsx or .tsx file, got ${entry.path}`);
    }
  }

  return entries;
}

function expandGlobs(globs: string[]): AsyncIterableIterator<WalkEntry> {
  const mux = new MuxAsyncIterator<WalkEntry>();
  for (const glob of globs) {
    mux.add(expandGlob(glob));
  }

  return mux.iterate();
}
