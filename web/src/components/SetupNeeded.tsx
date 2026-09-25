import type { ConfigProblem } from '@/lib/server/env';
import { Mark } from './icons';

const TEMPLATE = `GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
SESSION_SECRET=paste-the-generated-secret-here
OPENAI_API_KEY=sk-...
APP_URL=http://localhost:3000`;

/** Shown instead of the app when required server settings are missing. Names the settings only, never their values. */
export function SetupNeeded({ problems }: { problems: ConfigProblem[] }) {
  return (
    <main className="zl-center-page">
      <div className="zl-auth-card zl-setup-card">
        <div style={{ display: 'flex', justifyContent: 'center' }}><Mark size={44} /></div>
        <h1>Finish setting up ZeroLatency</h1>
        <p>The server is missing some settings, so it can&apos;t connect to Google yet.</p>
        <ul className="zl-setup-list">
          {problems.map((p) => <li key={p.name}><code>{p.name}</code> {p.message}</li>)}
        </ul>
        <p>Add these environment variables. On Vercel: <strong>Project → Settings → Environment Variables</strong>, then redeploy. Running locally: put them in <code>.env.local</code> in the <code>web</code> folder and restart the server.</p>
        <pre className="zl-setup-code">{TEMPLATE}</pre>
        <p>Generate a session secret with:</p>
        <pre className="zl-setup-code">node -e &quot;console.log(require(&apos;crypto&apos;).randomBytes(32).toString(&apos;base64url&apos;))&quot;</pre>
        <p>Use your deployed address for <code>APP_URL</code>, and add <code>&lt;APP_URL&gt;/api/auth/callback</code> as a redirect URI on the Google OAuth client. Google Cloud setup steps are in <code>web/README.md</code>.</p>
      </div>
    </main>
  );
}
