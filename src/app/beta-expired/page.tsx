export default function BetaExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg,#0a0f1e,#0f172a)" }}>
      <div className="text-center max-w-md px-8 py-12">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-2xl font-black text-white mb-3">Beta Access Expired</h1>
        <div className="w-10 h-1 bg-indigo-500 rounded mx-auto mb-6" />
        <p className="text-slate-400 leading-relaxed mb-2">
          This beta preview expired on
        </p>
        <p className="text-slate-300 font-semibold mb-6">
          Monday, March 23, 2026 · 11:00 PM
        </p>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Beta testing window has closed.<br />
          Contact Doc Kalodski for access.
        </p>
        <div className="border border-indigo-500/25 bg-indigo-500/10 rounded-lg px-5 py-4">
          <p className="text-indigo-400 text-xs font-mono tracking-wide">
            © 2026 DOC KALODSKI · GOALGETTER FOR LEAP 99<br />
            ALL RIGHTS RESERVED · PROPRIETARY SOFTWARE
          </p>
        </div>
      </div>
    </div>
  );
}
