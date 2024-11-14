import { MuxAsyncIterator } from "@std/async/mux-async-iterator";
import type { WalkEntry } from "@std/fs/walk";
import { expandGlob } from "@std/fs/expand-glob";
import { Project } from "ts-morph";
import { applyCommonIntrinsicElementsToHtxCodemod } from "./common-intrinsic-elements-to-htx-codemod.ts";

if (import.meta.main) {
  const project = new Project();
  for (const entry of await expandTsxFiles(Deno.args)) {
    const sourceFile = project.addSourceFileAtPath(entry.path);
    applyCommonIntrinsicElementsToHtxCodemod(sourceFile);
  }

  await project.save();
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
