// Lives outside actions.ts: a "use server" module may only export async functions.

export type BagActionState = {
  /** "notice": done, but not quite as asked (e.g. clamped to stock). */
  status: "idle" | "success" | "notice" | "error";
  message: string;
  /** Changes on every response, so clients can react to repeated identical results. */
  id: number;
};

export const initialBagState: BagActionState = { status: "idle", message: "", id: 0 };
