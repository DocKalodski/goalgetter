import { LoginForm } from "@/components/forms/LoginForm";

// Disable static generation for this page
export const dynamic = "force-dynamic";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GoalGetter-LEAP 99 v3.25
          </h1>
          <p className="text-xs text-muted-foreground/60 mt-2">by Doc Kalodski</p>
        </div>

        <div className="bg-card rounded-xl shadow-lg border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Sign in to your account</h2>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
