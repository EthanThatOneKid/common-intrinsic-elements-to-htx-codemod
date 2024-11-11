import { MuxAsyncIterator } from "@std/async/mux-async-iterator";
import type { WalkEntry } from "@std/fs/walk";
import { expandGlob } from "@std/fs/expand-glob";
import { getDescriptors } from "@fartlabs/ht/cli/codegen";

if (import.meta.main) {
  for await (const entry of expandGlobs(Deno.args)) {
    if (!entry.isFile) {
      throw new Error(`Expected file, got ${entry.path}`);
    }

    const isJsx = /\.[jt]sx$/.test(entry.path);
    if (!isJsx) {
      throw new Error(`Expected .jsx or .tsx file, got ${entry.path}`);
    }

    console.log(entry.path);
  }

  // const intrinsicElements = makeIntrinsicElements();
  // console.log(intrinsicElements);
}

function makeIntrinsicElements() {
  return new Set(
    getDescriptors().map((descriptor) => descriptor.tag),
  );
}

function expandGlobs(globs: string[]): AsyncIterableIterator<WalkEntry> {
  const mux = new MuxAsyncIterator<WalkEntry>();
  for (const glob of globs) {
    mux.add(expandGlob(glob));
  }

  return mux.iterate();
}
