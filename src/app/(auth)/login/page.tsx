import { LoginForm } from "@/components/forms/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ expired?: string }>;
}) {
  const params = await searchParams;
  const isExpired = params.expired === "1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GoalGetter
          </h1>
          <p className="text-muted-foreground mt-2">
            LEAP 99 Goal Tracking Platform
          </p>
        </div>

        {isExpired && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-center">
            <p className="text-sm font-semibold text-amber-600">LEAP 99 has concluded</p>
            <p className="text-xs text-amber-600/80 mt-0.5">
              Program access ended June 27, 2026. Thank you for your journey! 🎓
            </p>
          </div>
        )}

        <div className="bg-card rounded-xl shadow-lg border border-border p-6">
          <h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
