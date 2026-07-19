import { z } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export interface ToolResult {
  content: { type: "text"; text: string }[];
  isError?: boolean;
}

// Non-generic storage shape: every registered tool is erased to this once defined, so
// arrays/lookups of mixed tools don't hit TS's function-parameter contravariance issues.
export interface ToolDef {
  name: string;
  title: string;
  description: string;
  schema: z.ZodTypeAny;
  handler: (args: any) => Promise<ToolResult>;
}

// Generic only at the definition site, so each tool's handler args are checked against its
// own schema. The returned value is deliberately widened to the non-generic ToolDef above.
export function defineTool<S extends z.ZodTypeAny>(def: {
  name: string;
  title: string;
  description: string;
  schema: S;
  handler: (args: z.infer<S>) => Promise<ToolResult>;
}): ToolDef {
  return def;
}

export function toMcpToolDescriptor(def: ToolDef) {
  return {
    name: def.name,
    title: def.title,
    description: def.description,
    // Cast to `any` — zodToJsonSchema's generic resolution over a type-erased ZodTypeAny
    // causes pathological TS instantiation depth; the cast is compile-time only, behavior
    // at runtime is identical.
    inputSchema: zodToJsonSchema(def.schema as any, { target: "jsonSchema7", $refStrategy: "none" }),
  };
}
