import { MuxAsyncIterator } from "@std/async/mux-async-iterator";
import type { WalkEntry } from "@std/fs/walk";
import { expandGlob } from "@std/fs/expand-glob";
import type { SourceFile } from "ts-morph";
import { Project, ts } from "ts-morph";
import { getDescriptors, voidElements } from "@fartlabs/ht/cli/codegen";

export const htxSpecifier = "@fartlabs/htx";
export const commonIntrinsicElements = new Set(
  getDescriptors().map((descriptor) => descriptor.tag),
);

if (import.meta.main) {
  const project = new Project();
  for (const entry of await expandTsxFiles(Deno.args)) {
    const sourceFile = project.addSourceFileAtPath(entry.path);
    await processTsxSourceFile(sourceFile);
  }
}

function processTsxSourceFile(sourceFile: SourceFile) {
  // Find first instance of import to @fartlabs/htx.
  // let htxImport = sourceFile.getImportDeclaration(htxSpecifier);
  // const namedHtxImports = new Set(htxImport?.getNamedImports());

  // Find all JSX elements in the source file.
  const jsxElements = sourceFile.getDescendantsOfKind(
    ts.SyntaxKind.JsxElement,
  );

  // Modify common intrinsic elements to use htx.
  jsxElements.forEach((jsxElement) => {
    const openingElement = jsxElement.getFirstChildByKind(
      ts.SyntaxKind.JsxOpeningElement,
    );
    const tagNameNode = openingElement?.getFirstChildByKind(
      ts.SyntaxKind.Identifier,
    );
    console.log({ tagName: tagNameNode?.getText() });

    // If tag is void, then no closing tag is needed.

    // TODO: Finish.
    throw new Error("Not implemented");
  });

  // Update the htx import.
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
