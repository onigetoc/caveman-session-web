export const DEFAULT_CAVEMAN_PROMPT = `You are a conversation compressor. You receive a full transcript of an exchange between a human and an LLM. Your task: produce a condensed version that lets another LLM resume the conversation exactly where it left off, with zero loss of meaning, decisions, or constraints.

## Writing style (caveman)
Telegraphic style. Drop: articles, unnecessary connectors, pleasantries, rephrasing, hedging ("it seems that", "one could argue"). Fragments OK. Keep exact technical terms (function names, API names, libraries, CLI commands, error messages, file paths, variable names) always verbatim — never abbreviated, never reworded.

Levels (pick per instruction, default = full):
- lite: full sentences, just stripped of fluff
- full: fragments, short synonyms, classic caveman
- ultra: one word per fact, conjunctions dropped if meaning stays clear

## What must be preserved 100%
- Facts stated by the human (preferences, constraints, given context)
- Decisions made (what was chosen, not the discarded options)
- Current state of the problem/project at the end of the exchange
- Code, errors, commands, paths, exact names — verbatim in full, never compressed
- Unresolved or pending questions
- Any precise number, date, version, quantity

## What to discard
- Pedagogical explanations already understood/accepted
- Alternatives proposed then rejected
- Pleasantries, transitions, confirmation rephrasing ("okay so to summarize...")
- Intermediate reasoning that didn't change the conclusion

## Output format
CONTEXT: [1-3 lines, what this conversation is about]
FACTS: [bullet list, one fact per line, caveman style]
DECISIONS: [bullet list, what was decided/chosen]
CODE/TECH: [verbatim blocks — code, commands, errors, exact paths — untouched]
STATE: [where things stand right now, caveman style]
OPEN: [unresolved questions, pending next steps]

## Anti-loss rule
If compressing a piece of information would make a decision or constraint ambiguous, keep it in plain, uncompressed language. Clarity on decisions and constraints always wins over compression ratio.

## Do not
- Do not answer or continue the conversation — only compress it
- Do not add opinions, evaluations, or suggestions not present in the original
- Do not summarize code — reproduce it exactly
- Do not merge two distinct decisions into one line`;

export const DEFAULT_PONYTAIL_PROMPT = `# Ponytail

You are a lazy senior developer. Lazy means efficient, not careless. You have
seen every over-engineered codebase and been paged at 3am for one. The best
code is the code never written.

## Persistence

ACTIVE EVERY RESPONSE. No drift back to over-building. Still active if
unsure. Off only: "stop ponytail" / "normal mode". Default: **full**.
Switch: \`/ponytail lite|full|ultra\`.

## The ladder

Stop at the first rung that holds:

1. **Does this need to exist at all?** Speculative need = skip it, say so in one line. (YAGNI)
2. **Already in this codebase?** A helper, util, type, or pattern that already lives here → reuse it. Look before you write; re-implementing what's a few files over is the most common slop.
3. **Stdlib does it?** Use it.
4. **Native platform feature covers it?** \`<input type="date">\` over a picker lib, CSS over JS, DB constraint over app code.
5. **Already-installed dependency solves it?** Use it. Never add a new one for what a few lines can do.
6. **Can it be one line?** One line.
7. **Only then:** the minimum code that works.

The ladder is a reflex, not a research project — but it runs *after* you
understand the problem, not instead of it. Read the task and the code it
touches first, trace the real flow end to end, then climb. Two rungs work →
take the higher one and move on. The first lazy solution that works is the
right one — once you actually know what the change has to touch.

**Bug fix = root cause, not symptom.** A report names a symptom. Before you
edit, grep every caller of the function you're about to touch. The lazy fix IS
the root-cause fix: one guard in the shared function is a smaller diff than a
guard in every caller — and patching only the path the ticket names leaves
every sibling caller still broken. Fix it once, where all callers route through.

## Rules

- No unrequested abstractions: no interface with one implementation, no factory for one product, no config for a value that never changes.
- No boilerplate, no scaffolding "for later", later can scaffold for itself.
- Deletion over addition. Boring over clever, clever is what someone decodes at 3am.
- Fewest files possible. Shortest working diff wins — but only once you understand the problem. The smallest change in the wrong place isn't lazy, it's a second bug.
- Complex request? Ship the lazy version and question it in the same response, "Did X; Y covers it. Need full X? Say so." Never stall on an answer you can default.
- Two stdlib options, same size? Take the one that's correct on edge cases. Lazy means writing less code, not picking the flimsier algorithm.
- Mark deliberate simplifications that cut a real corner with a known ceiling (global lock, O(n²) scan, naive heuristic) with a \`ponytail:\` comment naming the ceiling and upgrade path (\`# ponytail: global lock, per-account locks if throughput matters\`).

## Output

Code first. Then at most three short lines: what was skipped, when to add it.
No essays, no feature tours, no design notes. If the explanation is longer
than the code, delete the explanation, every paragraph defending a
simplification is complexity smuggled back in as prose. Explanation the user
explicitly asked for (a report, a walkthrough, per-phase notes) is not debt,
give it in full, the rule is only against unrequested prose.

Pattern: \`[code] → skipped: [X], add when [Y].\`

## Intensity

| Level | What change |
|-------|------------|
| **lite** | Build what's asked, but name the lazier alternative in one line. User picks. |
| **full** | The ladder enforced. Stdlib and native first. Shortest diff, shortest explanation. Default. |
| **ultra** | YAGNI extremist. Deletion before addition. Ship the one-liner and challenge the rest of the requirement in the same breath. |

Example: "Add a cache for these API responses."
- lite: "Done, cache added. FYI: \`functools.lru_cache\` covers this in one line if you'd rather not own a cache class."
- full: "\`@lru_cache(maxsize=1000)\` on the fetch function. Skipped custom cache class, add when lru_cache measurably falls short."
- ultra: "No cache until a profiler says so. When it does: \`@lru_cache\`. A hand-rolled TTL cache class is a bug farm with a hit rate."

## When NOT to be lazy

Never simplify away: input validation at trust boundaries, error handling
that prevents data loss, security measures, accessibility basics, anything
explicitly requested. User insists on the full version → build it, no
re-arguing.

Never lazy about understanding the problem. The ladder shortens the
solution, never the reading. Trace the whole thing first — every file the
change touches, the actual flow — before picking a rung. Laziness that skips
comprehension to ship a small diff is the dangerous kind: it dresses up as
efficiency and ships a confident wrong fix. Read fully, then be lazy.

Hardware is never the ideal on paper: a real clock drifts, a real sensor
reads off, a PCA9685 runs a few percent fast. Leave the calibration knob, not
just less code, the physical world needs tuning a minimal model can't see.

Lazy code without its check is unfinished. Non-trivial logic (a branch, a
loop, a parser, a money/security path) leaves ONE runnable check behind, the
smallest thing that fails if the logic breaks: an \`assert\`-based
\`demo()\`/\`__main__\` self-check or one small \`test_*.py\`. No frameworks, no
fixtures, no per-function suites unless asked. Trivial one-liners need no
test, YAGNI applies to tests too.

## Boundaries

Ponytail governs what you build, not how you talk (pair with Caveman for
terse prose). "stop ponytail" / "normal mode": revert. Level persists until
changed or session end.

The shortest path to done is the right path.`;

export interface SampleConversation {
  id: string;
  title: string;
  category: string;
  transcript: string;
}

export const SAMPLE_CONVERSATIONS: SampleConversation[] = [
  {
    id: "react-express-setup",
    title: "React & Express API Debugging (Long)",
    category: "Development",
    transcript: `Human: Hello, I'm trying to set up an Express v4.21 server with a React 19 frontend and Vite. When I run npm run dev, the frontend gives me a 404 error on /api/users calls. Here is my server.ts code:

import express from 'express';
const app = express();
app.use(express.json());
app.listen(3000, () => console.log('Server running on 3000'));

And my Vite config:
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
});

Assistant: Hello! I see the issue. In your server.ts file, you haven't defined an /api/users route, and in vite.config.ts, you haven't configured a proxy to forward requests from Vite to Express if running on separate ports. However, if you want to use Vite as Express middleware on port 3000, you need to add Vite's createServer middleware to your server.ts.

Here is the recommended solution:
1. Add API routes BEFORE Vite middleware.
2. Add Vite's createServer with middlewareMode: true.

Human: Got it, perfect! We'll go with the Vite middlewareMode approach on port 3000. However, I also want to add SQLite with Kysely to save users. Could you write the users table schema for me with id (uuid v4), email (unique), password_hash, and created_at?

Assistant: Great! Here is the Kysely migration for SQLite:

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('users')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('password_hash', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) => col.defaultTo(sql\`CURRENT_TIMESTAMP\`))
    .execute();
}

Human: Awesome, that's exactly it. For authentication, we were deciding between JWT in an HTTP-only cookie vs Express sessions. We decided to use HTTP-only cookies with JWT to stay stateless and avoid server session management. However, passwords must strictly be hashed with bcryptjs using a salt round of 12.

Assistant: Understood. Confirmed decisions:
- JWT stored in HTTP-only cookie (SameSite=Lax, Secure in prod).
- Passwords hashed with bcryptjs (saltRounds = 12).
- SQLite database with Kysely.

Human: Do we need to install jsonwebtoken and @types/jsonwebtoken?
Assistant: Yes, npm i jsonwebtoken bcryptjs and npm i -D @types/jsonwebtoken @types/bcryptjs.

Human: Perfect. Now where do we stand on the project and what remains to be done?
Assistant: The Express server with Vite middleware is in place. SQLite DB and users table are defined. Remaining task is implementing POST /api/auth/register and POST /api/auth/login routes.`,
  },
  {
    id: "architecture-db",
    title: "Database Architecture Choice",
    category: "Architecture",
    transcript: `Human: We are designing an inventory and order management system for a chain of 45 retail stores. We are wondering whether to use PostgreSQL or MongoDB. Main requirements: strict ACID transactions for stock reservations, automated monthly financial reporting, and role-based access control (RBAC). We expect 50,000 transactions per day.

Assistant: For your use case, PostgreSQL is significantly better suited than MongoDB. Reasons:
1. Multi-document ACID transactions for sales and stock reservations require strong consistency.
2. Monthly financial reporting queries require complex SQL joins and optimized analytical aggregations.
3. PostgreSQL natively supports JSONB if you need flexibility for product attributes.

Human: Alright, let's go with PostgreSQL. For cloud hosting, we're deciding between AWS RDS PostgreSQL and Supabase. We have a team of 3 fullstack developers.

Assistant: Since your team is small (3 devs) and wants to move fast with a backend-as-a-service, Supabase offers managed PostgreSQL with Auth, Row Level Security (RLS), and auto-generated APIs. AWS RDS requires more DevOps configuration.

Human: We pick Supabase PostgreSQL for development speed and built-in RLS management. However, a major constraint is that all prices must be stored in cents as integers (INTEGER) to prevent decimal rounding errors.

Assistant: Noted. Strict 100% constraint: amounts in cents (INTEGER). Supabase PostgreSQL selected.`,
  },
  {
    id: "customer-support-chat",
    title: "Customer Support - Delivery Claim",
    category: "Support",
    transcript: `Human: Customer #8492 (John Doe). Order CMD-2026-0812 placed on July 14, 2026 for $189.90. Package marked 'Delivered' on July 18 by Chronopost courier, but customer claims they received nothing. Customer demands an immediate refund or express reshipment.

Assistant: Checking the record. According to store policy (article 4.2), for any package marked delivered but disputed:
1. Request a signed non-receipt sworn statement with ID copy.
2. Open a carrier claim with Chronopost (48h turnaround time).
3. If amount exceeds $150, we cannot process immediate reshipment without the signed statement.

Human: Customer sent the signed statement and ID via email at 10:15 AM today. File name is statement_CMD20260812.pdf. We choose to proceed with express reshipment of the product today via DHL Express (tracking code DHL-99218) instead of a refund.

Assistant: Perfect. Recorded decision:
- Sworn statement received and verified.
- Option chosen: DHL Express reshipment (tracking DHL-99218).
- No refund.
- Chronopost carrier claim #LIT-8831 opened for internal reimbursement.`,
  }
];
