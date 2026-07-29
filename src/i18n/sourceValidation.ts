/// <reference types="node" />
import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { namespaces, resources } from './resources';
import {
  resourceLookupPaths,
  type ResourceCatalog,
} from './resourceValidation';

const propertyName = (name: ts.PropertyName) => {
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteral(name) ||
    ts.isNumericLiteral(name)
  )
    return name.text;
  return null;
};
const unwrap = (node: ts.Expression): ts.Expression => {
  if (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node)
  )
    return unwrap(node.expression);
  return node;
};
export function findDuplicateResourceKeys(
  source: string,
  fileName = 'resource.ts',
): string[] {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const errors: string[] = [];
  const flattenedPaths = new Set<string>();
  const visit = (node: ts.ObjectLiteralExpression, path: string[]) => {
    const seen = new Set<string>();
    for (const property of node.properties) {
      if (ts.isSpreadAssignment(property)) {
        const position = file.getLineAndCharacterOfPosition(
          property.getStart(file),
        );
        errors.push(
          `${fileName}:${position.line + 1}:${position.character + 1} spread properties are not allowed in resources`,
        );
        continue;
      }
      if (!('name' in property) || !property.name) continue;
      const name = propertyName(property.name);
      if (name === null) {
        const position = file.getLineAndCharacterOfPosition(
          property.name.getStart(file),
        );
        errors.push(
          `${fileName}:${position.line + 1}:${position.character + 1} computed resource keys are not allowed`,
        );
        continue;
      }
      const current = [...path, ...name.split('.')];
      const canonical = current.join('.');
      if (seen.has(name)) {
        const position = file.getLineAndCharacterOfPosition(
          property.name.getStart(file),
        );
        errors.push(
          `${fileName}:${position.line + 1}:${position.character + 1} duplicate key ${canonical}`,
        );
      }
      seen.add(name);
      if (ts.isPropertyAssignment(property)) {
        const value = unwrap(property.initializer);
        if (ts.isObjectLiteralExpression(value)) {
          visit(value, current);
          continue;
        }
        if (flattenedPaths.has(canonical)) {
          const position = file.getLineAndCharacterOfPosition(
            property.name.getStart(file),
          );
          errors.push(
            `${fileName}:${position.line + 1}:${position.character + 1} duplicate flattened path ${canonical}`,
          );
        } else flattenedPaths.add(canonical);
      }
    }
  };
  const exported = file.statements.find(
    (statement): statement is ts.ExportAssignment =>
      ts.isExportAssignment(statement) && !statement.isExportEquals,
  );
  if (!exported) {
    errors.push(`${fileName}: resource must have a default object export`);
    return errors;
  }
  const root = unwrap(exported.expression);
  if (!ts.isObjectLiteralExpression(root)) {
    errors.push(
      `${fileName}: default resource export must be an object literal`,
    );
    return errors;
  }
  visit(root, []);
  return errors;
}

const stringValue = (node: ts.Expression) =>
  ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : null;
export type TranslationCallSite = {
  fileName: string;
  line: number;
  column: number;
  namespace: string;
  key: string;
};
type TranslationSourceScan = {
  callSites: TranslationCallSite[];
  errors: string[];
};
type LexicalBinding = {
  kind: 'hook' | 'translator' | 'other';
  namespace?: string;
};
type LexicalScope = {
  parent: LexicalScope | null;
  bindings: Map<string, LexicalBinding>;
};
const resolveBinding = (
  scope: LexicalScope | null | undefined,
  name: string,
): LexicalBinding | undefined => {
  for (let current = scope; current; current = current.parent) {
    const binding = current.bindings.get(name);
    if (binding) return binding;
  }
  return undefined;
};
const createLexicalScopes = (file: ts.SourceFile) => {
  const scopes = new Map<ts.Node, LexicalScope>();
  const root: LexicalScope = { parent: null, bindings: new Map() };
  const registerPattern = (name: ts.BindingName, scope: LexicalScope) => {
    scopes.set(name, scope);
    if (ts.isIdentifier(name)) {
      scope.bindings.set(name.text, { kind: 'other' });
      return;
    }
    for (const element of name.elements)
      if (ts.isBindingElement(element)) registerPattern(element.name, scope);
  };
  const bind = (node: ts.Node, scope: LexicalScope) => {
    scopes.set(node, scope);
    if (ts.isImportDeclaration(node)) {
      const reactI18next =
        ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text === 'react-i18next';
      const named = node.importClause?.namedBindings;
      if (named && ts.isNamedImports(named)) {
        for (const element of named.elements) {
          scopes.set(element.name, scope);
          const importedName = element.propertyName?.text ?? element.name.text;
          scope.bindings.set(element.name.text, {
            kind:
              reactI18next && importedName === 'useTranslation'
                ? 'hook'
                : 'other',
          });
        }
      }
      return;
    }
    if (ts.isFunctionLike(node)) {
      if (ts.isFunctionDeclaration(node) && node.name)
        scope.bindings.set(node.name.text, { kind: 'other' });
      const functionScope: LexicalScope = {
        parent: scope,
        bindings: new Map(),
      };
      if (ts.isFunctionExpression(node) && node.name)
        functionScope.bindings.set(node.name.text, { kind: 'other' });
      for (const parameter of node.parameters) {
        scopes.set(parameter, functionScope);
        registerPattern(parameter.name, functionScope);
        if (parameter.initializer) bind(parameter.initializer, functionScope);
      }
      const body = 'body' in node ? node.body : undefined;
      if (body) {
        scopes.set(body, functionScope);
        if (ts.isBlock(body))
          for (const statement of body.statements)
            bind(statement, functionScope);
        else bind(body, functionScope);
      }
      return;
    }
    if (ts.isBlock(node)) {
      const blockScope: LexicalScope = { parent: scope, bindings: new Map() };
      scopes.set(node, blockScope);
      for (const statement of node.statements) bind(statement, blockScope);
      return;
    }
    if (ts.isCatchClause(node)) {
      const catchScope: LexicalScope = { parent: scope, bindings: new Map() };
      scopes.set(node, catchScope);
      if (node.variableDeclaration)
        registerPattern(node.variableDeclaration.name, catchScope);
      bind(node.block, catchScope);
      return;
    }
    if (ts.isVariableDeclaration(node)) {
      registerPattern(node.name, scope);
      if (node.initializer) bind(node.initializer, scope);
      return;
    }
    ts.forEachChild(node, (child) => bind(child, scope));
  };
  scopes.set(file, root);
  for (const statement of file.statements) bind(statement, root);
  return scopes;
};
export function scanTranslationCallSites(
  source: string,
  catalog: ResourceCatalog = resources as unknown as ResourceCatalog,
  fileName = 'source.tsx',
): TranslationSourceScan {
  const file = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const scopes = createLexicalScopes(file);
  const errors: string[] = [];
  const callSites: TranslationCallSite[] = [];
  const collectBindings = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      resolveBinding(
        scopes.get(node.initializer.expression),
        node.initializer.expression.text,
      )?.kind === 'hook'
    ) {
      const namespace =
        node.initializer.arguments.length === 0
          ? 'common'
          : stringValue(node.initializer.arguments[0] as ts.Expression);
      if (!ts.isObjectBindingPattern(node.name)) {
        const position = file.getLineAndCharacterOfPosition(
          node.getStart(file),
        );
        errors.push(
          `${fileName}:${position.line + 1}:${position.character + 1} useTranslation result must use object destructuring`,
        );
        return;
      }
      for (const element of node.name.elements) {
        const importedName = element.propertyName
          ? propertyName(element.propertyName)
          : ts.isIdentifier(element.name)
            ? element.name.text
            : null;
        if (importedName !== 't' || !ts.isIdentifier(element.name)) continue;
        if (namespace === null) {
          const position = file.getLineAndCharacterOfPosition(
            node.initializer.getStart(file),
          );
          errors.push(
            `${fileName}:${position.line + 1}:${position.character + 1} useTranslation namespace must be a string literal`,
          );
          continue;
        }
        const binding = resolveBinding(
          scopes.get(element.name),
          element.name.text,
        );
        if (binding) {
          binding.kind = 'translator';
          binding.namespace = namespace;
        }
      }
    }
    ts.forEachChild(node, collectBindings);
  };
  collectBindings(file);
  const inventories = {} as Record<string, Record<string, Set<string>>>;
  for (const locale of ['vi', 'en'] as const) {
    inventories[locale] = {};
    for (const namespace of namespaces) {
      inventories[locale][namespace] = resourceLookupPaths(
        catalog[locale]?.[namespace] ?? {},
      );
    }
  }
  const validateCalls = (node: ts.Node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      const binding = resolveBinding(
        scopes.get(node.expression),
        node.expression.text,
      );
      if (binding?.kind !== 'translator') {
        ts.forEachChild(node, validateCalls);
        return;
      }
      const position = file.getLineAndCharacterOfPosition(node.getStart(file));
      const location = `${fileName}:${position.line + 1}:${position.character + 1}`;
      const defaultNamespace = binding.namespace!;
      const keyArgument = node.arguments[0];
      const raw = keyArgument ? stringValue(keyArgument) : null;
      if (raw === null)
        errors.push(
          `${location} dynamic translation keys require an explicit typed allow-list`,
        );
      else {
        const separator = raw.indexOf(':');
        const namespace =
          separator < 0 ? defaultNamespace : raw.slice(0, separator);
        const key = separator < 0 ? raw : raw.slice(separator + 1);
        callSites.push({
          fileName,
          line: position.line + 1,
          column: position.character + 1,
          namespace,
          key,
        });
        if (!namespaces.includes(namespace as (typeof namespaces)[number]))
          errors.push(`${location} unknown translation namespace ${namespace}`);
        else {
          const missingLocales = ['vi', 'en'].filter(
            (locale) => !inventories[locale][namespace].has(key),
          );
          if (missingLocales.length)
            errors.push(
              `${location} missing translation key ${namespace}:${key} for ${missingLocales.join(', ')}`,
            );
        }
      }
    }
    ts.forEachChild(node, validateCalls);
  };
  validateCalls(file);
  return { callSites, errors };
}
export function findTranslationCallSiteErrors(
  source: string,
  catalog: ResourceCatalog = resources as unknown as ResourceCatalog,
  fileName = 'source.tsx',
): string[] {
  return scanTranslationCallSites(source, catalog, fileName).errors;
}

const productionTypeScriptFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return productionTypeScriptFiles(path);
    return /\.(ts|tsx)$/.test(entry.name) &&
      !/\.(test|spec)\.(ts|tsx)$/.test(entry.name) &&
      !entry.name.endsWith('.d.ts')
      ? [path]
      : [];
  });

export function validateProductionResourceSources(
  projectRoot = process.cwd(),
): string[] {
  const errors: string[] = [];
  for (const locale of ['vi', 'en']) {
    for (const namespace of namespaces) {
      const fileName = join(
        projectRoot,
        'src',
        'i18n',
        'locales',
        locale,
        `${namespace}.ts`,
      );
      errors.push(
        ...findDuplicateResourceKeys(readFileSync(fileName, 'utf8'), fileName),
      );
    }
  }
  return errors;
}

export type ProductionTranslationScan = {
  filesScanned: string[];
  callSites: TranslationCallSite[];
  errors: string[];
};
export function validateProductionTranslationCallSites({
  projectRoot = process.cwd(),
  catalog = resources as unknown as ResourceCatalog,
}: {
  projectRoot?: string;
  catalog?: ResourceCatalog;
} = {}): ProductionTranslationScan {
  const filesScanned = productionTypeScriptFiles(join(projectRoot, 'src'))
    .map((fileName) => resolve(fileName))
    .sort();
  const scans = filesScanned.map((fileName) =>
    scanTranslationCallSites(readFileSync(fileName, 'utf8'), catalog, fileName),
  );
  return {
    filesScanned,
    callSites: scans.flatMap((scan) => scan.callSites),
    errors: scans.flatMap((scan) => scan.errors),
  };
}
