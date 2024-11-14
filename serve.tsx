import { route } from "@std/http";
import { Project } from "ts-morph";
import {
  A,
  BODY,
  BR,
  BUTTON,
  FOOTER,
  FORM,
  H1,
  HEAD,
  HR,
  HTML,
  LABEL,
  LINK,
  META,
  P,
  SECTION,
  SMALL,
  TEXTAREA,
  TITLE,
} from "@fartlabs/htx";
import { applyCommonIntrinsicElementsToHtxCodemod } from "./common-intrinsic-elements-to-htx-codemod.ts";

const exampleBefore = await Deno.readTextFile("./example/before.tsx");

const router = route(
  [
    {
      method: "GET",
      pattern: new URLPattern({ pathname: "/" }),
      handler: async (_request: Request) => {
        return new Response(
          <HTML>
            <HEAD>
              <TITLE>TSX to HTX Codemod</TITLE>
              <META charset="UTF-8" />
              <META
                name="description"
                content="Convert common intrinsic elements to HTX."
              />
              <LINK
                rel="icon"
                href="https://fartlabs.org/fl-logo.png"
              />
              <LINK
                rel="stylesheet"
                href="https://css.fart.tools/fart.css"
              />
            </HEAD>
            <BODY>
              <SECTION class="fart-section">
                <H1>
                  common-intrinsic-elements-to-htx-codemod
                </H1>

                <P>
                  This codemod converts common intrinsic JSX elements to their
                  respective HTX components.{" "}
                  <A
                    href="https://github.com/ethanthatonekid/common-intrinsic-elements-to-htx-codemod"
                    class="fart-button"
                    target="_blank"
                  >
                    Source code <SMALL>↗</SMALL>
                  </A>
                </P>
              </SECTION>

              <SECTION class="fart-section">
                <FORM action="/api" method="GET">
                  <LABEL for="sourceCode">Source code:</LABEL>

                  <BR />

                  <TEXTAREA
                    name="sourceCode"
                    id="sourceCode"
                    rows="10"
                    cols="50"
                  >
                    {exampleBefore}
                  </TEXTAREA>

                  <BR />
                  <BUTTON type="submit" class="fart-button">
                    Apply codemod
                  </BUTTON>
                </FORM>
              </SECTION>

              <SECTION class="fart-section">
                <HR />

                <FOOTER>
                  <P>
                    © FartLabs{" "}
                    <A
                      href="https://fartlabs.org/"
                      class="fart-logo"
                    >
                      🧪
                    </A>
                  </P>
                  <A
                    href="https://fartlabs.org/blog"
                    class="fart-button"
                    target="_blank"
                  >
                    Blog
                    <SMALL>↗</SMALL>
                  </A>
                  <A
                    href="https://github.com/FartLabs"
                    class="fart-button"
                    target="_blank"
                  >
                    GitHub
                    <SMALL>↗</SMALL>
                  </A>
                  <A
                    href="https://go.fart.tools/chat"
                    class="fart-button"
                    target="_blank"
                  >
                    Chat
                    <SMALL>↗</SMALL>
                  </A>
                </FOOTER>
              </SECTION>
            </BODY>
          </HTML>,
          { headers: new Headers({ "Content-Type": "text/html" }) },
        );
      },
    },
    {
      method: "GET",
      pattern: new URLPattern({ pathname: "/api" }),
      handler: (request: Request) => {
        const url = new URL(request.url);
        const sourceCode = url.searchParams.get("sourceCode");
        if (sourceCode === null) {
          return new Response("Missing sourceCode parameter", {
            status: 400,
          });
        }

        const project = new Project({ useInMemoryFileSystem: true });
        const sourceFile = project.createSourceFile(
          "example.tsx",
          sourceCode,
        );
        applyCommonIntrinsicElementsToHtxCodemod(sourceFile);
        return new Response(sourceFile.getText(), { status: 200 });
      },
    },
  ],
  defaultHandler,
);

function defaultHandler(_request: Request) {
  return new Response("Not found", { status: 404 });
}

if (import.meta.main) {
  Deno.serve((request) => router(request));
}
