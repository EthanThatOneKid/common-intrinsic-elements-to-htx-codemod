import { assertEquals } from "@std/assert";
import { Project } from "ts-morph";
import { applyCommonIntrinsicElementsToHtxCodemod } from "./common-intrinsic-elements-to-htx-codemod.ts";

Deno.test(
  "applyCommonIntrinsicElementsToHtxCodemod replaces instances of common intrinsic JSX elements with their respective HTX components",
  async () => {
    const project = new Project({ useInMemoryFileSystem: true });
    const sourceFile = project.createSourceFile(
      "./example.tsx",
      await Deno.readTextFile("./example/before.tsx"),
    );
    applyCommonIntrinsicElementsToHtxCodemod(sourceFile);

    assertEquals(
      sourceFile.getText(),
      await Deno.readTextFile("./example/after.tsx"),
    );
  },
);
