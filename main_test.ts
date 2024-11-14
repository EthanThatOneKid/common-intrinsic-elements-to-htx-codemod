import { assertEquals } from "@std/assert";
import { Project } from "ts-morph";
import { processTsxSourceFile } from "./main.ts";

Deno.test("processTsxSourceFile replaces instances of common intrinsic JSX elements with their respective HTX components", async () => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile(
    "./example.tsx",
    await Deno.readTextFile("./example/before.tsx"),
  );
  processTsxSourceFile(sourceFile);

  assertEquals(
    await Deno.readTextFile("./example/after.tsx"),
    sourceFile.getText(),
  );
});
