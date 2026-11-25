import { types as nodeTypes } from "node:util";

/**
 * Returns a type name for a value in Node.js.
 *
 * Naming rule: primitives (including null and undefined) get the lowercase
 * name that typeof uses ("string", "number", "null", ...). Everything else is
 * an object (functions and arrays included) and is named by its class,
 * capitalized as the class is written: "Array", "Map", "Function", "User", ...
 */
export function j_typeof(value) {
  if (value === null)      return "null";
  if (value === undefined) return "undefined";

  // Functions: async and generator functions get their own names; everything else
  // (regular, arrow, classes) is reported as "Function"
  if (typeof value === "function") {
    if (nodeTypes.isAsyncFunction(value))     return "AsyncFunction";
    if (nodeTypes.isGeneratorFunction(value)) return "GeneratorFunction";
    return "Function";
  }

  // Arrays (works reliably across Node vm contexts / realms)
  if (Array.isArray(value)) return "Array";

  // Primitives (boolean, number, bigint, string, symbol)
  const rawTypeof = typeof value;
  if (rawTypeof !== "object") {
    return rawTypeof;
  }

  // Built-in object types (these checks also match subclasses, e.g. a class
  // that extends Map is still reported as "Map")
  if (nodeTypes.isDate(value))        return "Date";
  if (nodeTypes.isRegExp(value))      return "RegExp";
  if (nodeTypes.isMap(value))         return "Map";
  if (nodeTypes.isSet(value))         return "Set";
  if (nodeTypes.isWeakMap(value))     return "WeakMap";
  if (nodeTypes.isWeakSet(value))     return "WeakSet";
  if (nodeTypes.isPromise(value))     return "Promise";
  if (nodeTypes.isNativeError(value)) return "Error";

  // ArrayBuffer and SharedArrayBuffer both report "ArrayBuffer"
  if (nodeTypes.isArrayBuffer(value) || nodeTypes.isSharedArrayBuffer(value)) {
    return "ArrayBuffer";
  }

  if (ArrayBuffer.isView(value)) {
    // Matches Buffer, TypedArrays (Uint8Array, Int32Array, etc.), and DataView.
    // Reports the constructor name (e.g. "Buffer", "Uint8Array", "DataView")
    return value.constructor?.name || "TypedArray";
  }

  // Plain objects: the prototype is null, or is a root prototype (its own
  // prototype is null). Comparing to Object.prototype would fail for objects
  // created inside the REPL's vm context, which has its own Object.prototype.
  const proto = Object.getPrototypeOf(value);
  if (proto === null || Object.getPrototypeOf(proto) === null) {
    return "Object";
  }

  // Objects with a non-default Symbol.toStringTag (e.g., generator objects)
  // report that tag as-is (e.g. "Generator")
  const tag = Object.prototype.toString.call(value).slice(8, -1);
  if (tag && tag !== "Object") {
    return tag;
  }

  // Instances of custom classes (e.g., new User(), new Point(1, 2)) report their
  // constructor name as written (e.g. "User"); "Object" is the fallback when
  // there is no usable name
  return value.constructor?.name || "Object";
}
