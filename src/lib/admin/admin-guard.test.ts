import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

// Every admin page, Route Handler and server action must check the admin role itself:
// proxy.ts only looks for a session cookie, layouts don't re-run on navigation, and server
// actions are public POST endpoints. This fails when one doesn't start with requireAdmin().

const ROOT = join(__dirname, "../../..");
const ADMIN_DIR = join(ROOT, "src/app/admin");

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

/** Each exported function's name and the source of its body, from its opening brace. */
function exportedFunctions(source: string) {
  const found: { name: string; body: string }[] = [];
  const declaration = /export\s+(default\s+)?(?:async\s+)?function\s*(\w*)\s*\(/g;
  for (const match of source.matchAll(declaration)) {
    // Skip the parameter list (which may contain braces), then the return type, to the body.
    let index = match.index + match[0].length;
    for (let depth = 1; depth > 0; index++) {
      if (source[index] === "(") depth++;
      else if (source[index] === ")") depth--;
    }
    const open = source.indexOf("{", index);
    found.push({ name: match[1] ? "default" : match[2], body: source.slice(open + 1) });
  }
  return found;
}

/** The first statement awaits requireAdmin(), optionally assigning its result. */
const GUARDED = /^\s*(?:const\s+[^=;]+=\s*)?await\s+requireAdmin\(/;

const guarded = files(ADMIN_DIR).filter((file) => /\/(page|route)\.tsx?$/.test(file) || /\/actions\.ts$/.test(file));
const actionFiles = files(join(ROOT, "src")).filter((file) => {
  if (!/\.tsx?$/.test(file)) return false;
  return /^\s*["']use server["']/.test(readFileSync(file, "utf8"));
});

describe("admin guard", () => {
  it("finds the admin pages and actions", () => {
    expect(guarded.length).toBeGreaterThan(5);
  });

  it.each(guarded.map((file) => [relative(ROOT, file), file]))("%s checks requireAdmin() first", (_, file) => {
    const source = readFileSync(file, "utf8");
    const functions = exportedFunctions(source);
    expect(functions.length).toBeGreaterThan(0);
    for (const { name, body } of functions) {
      expect(GUARDED.test(body), `${name} must start with await requireAdmin()`).toBe(true);
    }
    if (file.endsWith("page.tsx")) {
      expect(functions.map((fn) => fn.name)).toContain("default");
      // Pages may export config consts (metadata, dynamic) but no other functions.
      expect(source).not.toMatch(/export\s+(?:let|\{|const\s+(?!metadata\b|dynamic\b)\w+)/);
    } else {
      // Arrow-function or re-exported actions and handlers would slip past the check above.
      expect(source).not.toMatch(/export\s+(?:const|let|\{|default\s+(?!async\s+function))/);
    }
  });

  it("keeps admin server actions inside src/app/admin", () => {
    const outside = actionFiles.filter(
      (file) => !file.startsWith(ADMIN_DIR) && /from\s+["']@\/lib\/admin\/catalog["']/.test(readFileSync(file, "utf8")),
    );
    expect(outside.map((file) => relative(ROOT, file))).toEqual([]);
  });
});
