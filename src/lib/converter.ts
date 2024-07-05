import ts from "typescript";
import { parseComponent } from "vue-template-compiler";
import { getNodeByKind } from "./helper";
import { convertClass } from "./converters/classApiConverter";
import { convertOptionsApi } from "./converters/optionsApiConverter";
import { Project, SyntaxKind } from "ts-morph";

const project = new Project({
  compilerOptions: {
    allowJs: true,
  },
  useInMemoryFileSystem: true,
});

export const convertSrc = (input: string): string => {
  const sourceFile = project.createSourceFile("src.tsx", input, {
    overwrite: true,
  });

  sourceFile.forEachDescendant((node) => {
    if (node.getKind() === SyntaxKind.PropertyAssignment) {
      const propertyAssignment = node.asKind(SyntaxKind.PropertyAssignment);
      const initializer = propertyAssignment?.getInitializer();
      if (initializer && initializer.isKind(SyntaxKind.StringLiteral)) {
        if (propertyAssignment?.getName() === "label") {
          propertyAssignment.getNameNode().replaceWithText("property");
        }
      }
    }
  });

  const modifiedCode = sourceFile.getFullText();
  return modifiedCode;

  // const parsed = parseComponent(input);

  // const { script } = parsed;
  // const scriptContent = script?.content || "";

  // const sourceFile = ts.createSourceFile(
  //   "src.tsx",
  //   input,
  //   ts.ScriptTarget.Latest,
  //   true,
  //   ts.ScriptKind.JS
  // );

  // function extractMethodsAndObjects(node: ts.Node) {
  //   if (
  //     ts.isVariableDeclaration(node) &&
  //     ts.isObjectLiteralExpression(node.initializer)
  //   ) {
  //     const objectLiteralExpression = node.initializer;
  //     const properties = objectLiteralExpression.getProperties();

  //     // console.log("Object11:", node.name.getText());
  //     // console.log("Code:", node.getText());
  //     console.log("weigan visit ", ts.SyntaxKind[node.kind], properties);
  //   }

  //   ts.forEachChild(node, extractMethodsAndObjects);
  // }

  // extractMethodsAndObjects(sourceFile);

  return "hello world";

  const exportAssignNode = getNodeByKind(
    sourceFile,
    ts.SyntaxKind.ExportAssignment
  );
  if (exportAssignNode) {
    // optionsAPI
    return convertOptionsApi(sourceFile);
  }

  const classNode = getNodeByKind(sourceFile, ts.SyntaxKind.ClassDeclaration);
  if (classNode && ts.isClassDeclaration(classNode)) {
    // classAPI
    return convertClass(classNode, sourceFile);
  }

  throw new Error("no convert target");
};