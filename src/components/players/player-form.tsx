import { addPlayerAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PlayerForm() {
  return (
    <Card className="northland-panel border-white/10">
      <CardHeader>
        <CardTitle className="text-3xl uppercase tracking-tight text-white">Add a player</CardTitle>
        <CardDescription className="text-[#bdd0e7]">
          Create a player record directly from the dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={addPlayerAction} className="grid gap-4 sm:grid-cols-[1fr_140px_auto]">
          <div className="grid gap-2">
            <Label className="text-[#d7b354]" htmlFor="name">Player name</Label>
            <Input
              className="min-h-14 rounded-[1.25rem] border-white/10 bg-[#0c1f34] text-white placeholder:text-[#6e89aa]"
              id="name"
              name="name"
              placeholder="Jordan Lee"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-[#d7b354]" htmlFor="jersey_number">Jersey #</Label>
            <Input
              className="min-h-14 rounded-[1.25rem] border-white/10 bg-[#0c1f34] text-white placeholder:text-[#6e89aa]"
              id="jersey_number"
              name="jersey_number"
              inputMode="numeric"
              min={0}
              max={999}
              placeholder="12"
              type="number"
            />
          </div>
          <div className="flex items-end">
            <Button className="min-h-14 w-full rounded-[1.25rem] bg-[#2e86ff] px-6 uppercase tracking-[0.16em] sm:w-auto" type="submit">
              Save player
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
