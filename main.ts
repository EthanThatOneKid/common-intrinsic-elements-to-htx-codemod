import { MuxAsyncIterator } from "@std/async/mux-async-iterator";
import type { WalkEntry } from "@std/fs/walk";
import { expandGlob } from "@std/fs/expand-glob";
import { getDescriptors } from "@fartlabs/ht/cli/codegen";
import type { Tree } from "deno-tree-sitter/tree_sitter.js";
import { parserFromWasm } from "deno-tree-sitter/main.js";
import tsx from "common-tree-sitter-languages/tsx.js";

export const htxSpecifier = "@fartlabs/htx";
export const intrinsicElements = new Set(
  getDescriptors().map((descriptor) => descriptor.tag),
);
export const tsxParser = await parserFromWasm(tsx);

if (import.meta.main) {
  for (const entry of await expandTsxFiles(Deno.args)) {
    await processTsxFileEntry(entry);
  }
}

async function processTsxFileEntry(entry: WalkEntry): Promise<void> {
  await Deno.writeTextFile(
    entry.path,
    processTsxFile(tsxParser.parse(await Deno.readTextFile(entry.path)))
      .rootNode.toString(),
  );
}

// TODO: Add Tree-Sitter parser.

function processTsxFile(tree: Tree): Tree {
  // TODO: Find @fartlabs/htx import statement.
  // TODO: As Tsx intrinsics are encountered, add them to the import statement and capitalize them.
  //

  return tree;
}

async function expandTsxFiles(globs: string[]): Promise<WalkEntry[]> {
  const entries = await Array.fromAsync(expandGlobs(globs));
  for (const entry of entries) {
    if (!entry.isFile) {
      throw new Error(`Expected file, got ${entry.path}`);
    }

    const isTsx = /\.[jt]sx$/.test(entry.path);
    if (!isTsx) {
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
