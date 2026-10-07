import { signOut } from "@/app/(auth)/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="btn btn-secondary">
        Sign out
      </button>
    </form>
  );
}
