import type { SourceFile } from "ts-morph";
import { ts } from "ts-morph";
import commonIntrinsicElements from "./common-intrinsic-elements.json" with {
  type: "json",
};

const htxSpecifier = "@fartlabs/htx";
const commonIntrinsicElementsSet = new Set(commonIntrinsicElements);

/**
 * applyCommonIntrinsicElementsToHtxCodemod modifies a TSX source file to use
 * htx instead of common intrinsic elements.
 */
export function applyCommonIntrinsicElementsToHtxCodemod(
  sourceFile: SourceFile,
) {
  // Find all JSX elements in the source file.
  const tagNames = new Set<string>();

  // Find all the JSX elements with closing tags in the source file and modify them.
  sourceFile
    .getDescendantsOfKind(ts.SyntaxKind.JsxElement)
    .forEach((jsxElement) => {
      // Modify common intrinsic elements to use htx.
      const openingElementNode = jsxElement
        .getFirstChildByKind(ts.SyntaxKind.JsxOpeningElement);
      if (openingElementNode === undefined) {
        return;
      }

      const openingIdentifierNode = openingElementNode
        .getFirstChildByKind(ts.SyntaxKind.Identifier);
      const tagName = openingIdentifierNode?.getText();
      if (!tagName) {
        throw new Error("Expected tag name");
      }
      if (!commonIntrinsicElementsSet.has(tagName)) {
        return;
      }

      openingIdentifierNode?.replaceWithText(tagName.toUpperCase());
      tagNames.add(tagName);

      // Modify closing element if it exists.
      const closingElementNode = jsxElement
        .getFirstChildByKind(ts.SyntaxKind.JsxClosingElement);
      if (closingElementNode !== undefined) {
        const closingIdentifierNode = closingElementNode
          .getFirstChildByKind(ts.SyntaxKind.Identifier);
        closingIdentifierNode?.replaceWithText(tagName.toUpperCase());
      }
    });

  sourceFile
    .getDescendantsOfKind(ts.SyntaxKind.JsxSelfClosingElement)
    .forEach((jsxElement) => {
      // Modify common intrinsic elements to use htx.
      const openingElementNode = jsxElement
        .getFirstChildByKind(ts.SyntaxKind.Identifier);
      if (openingElementNode === undefined) {
        return;
      }

      const tagName = openingElementNode.getText();
      if (tagName === undefined) {
        throw new Error("Expected tag name");
      }

      if (!commonIntrinsicElementsSet.has(tagName)) {
        return;
      }

      openingElementNode.replaceWithText(tagName.toUpperCase());
      tagNames.add(tagName);
    });

  // Update the htx import or prepend it if it doesn't exist.
  const htxImport = sourceFile.getImportDeclaration(htxSpecifier) ??
    sourceFile.addImportDeclaration({ moduleSpecifier: htxSpecifier });
  Array.from(tagNames)
    .toSorted()
    .forEach((tagName) => {
      htxImport.addNamedImport({ name: tagName.toUpperCase() });
    });
}
