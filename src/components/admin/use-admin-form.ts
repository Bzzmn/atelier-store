"use client";

import { type FormEvent, startTransition, useActionState } from "react";

import type { AdminActionState } from "@/app/admin/state";
import { initialAdminState } from "@/app/admin/state";

/**
 * useActionState, submitted from onSubmit instead of the form's `action` prop. React resets
 * forms after an `action` completes, which would wipe what the admin typed when validation
 * fails. Admin pages need JS anyway. Forms using this must set method="post": a submit before
 * hydration then reloads the page instead of putting the fields in the URL.
 */
export function useAdminForm(action: (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>) {
  const [state, dispatch, pending] = useActionState(action, initialAdminState);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, onSubmit, pending };
}
