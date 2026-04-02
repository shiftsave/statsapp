import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupCallout() {
  return (
    <Card className="northland-panel border-[#d7b354]/35 bg-[#14253a]">
      <CardHeader>
        <CardTitle className="text-3xl uppercase tracking-tight text-white">
          Connect Supabase to unlock the app
        </CardTitle>
        <CardDescription>
          The app UI is scaffolded, but data actions are disabled until Supabase is configured.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-[#bdd0e7]">
        <p>
          1. Create a Supabase project and run the SQL in{" "}
          <code>supabase/migrations/001_mvp_schema.sql</code>.
        </p>
        <p>
          2. Copy <code>.env.example</code> to <code>.env.local</code> and fill in the public URL
          and anon key.
        </p>
        <p>
          3. Restart the dev server and the players, games, and report flows will use the live
          database.
        </p>
        <p>
          When you’re ready to deploy, the same env vars can be added in{" "}
          <Link className="font-medium text-[#d7b354] underline" href="https://vercel.com">
            Vercel
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
