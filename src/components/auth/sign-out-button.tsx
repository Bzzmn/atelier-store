import { signOut } from "@/app/(auth)/actions";

export function SignOutButton({ className = "btn btn-secondary" }: { className?: string }) {
  return (
    <form action={signOut}>
      <button type="submit" className={className}>
        Sign out
      </button>
    </form>
  );
}
