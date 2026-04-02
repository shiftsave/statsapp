import { createGameAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateInputValue } from "@/lib/format";

export function CreateGameForm() {
  return (
    <Card className="northland-panel border-white/10">
      <CardHeader>
        <CardTitle className="text-3xl uppercase tracking-tight text-white">Create a game</CardTitle>
        <CardDescription className="text-[#bdd0e7]">
          New games pull in all active players and create a stat row for each one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createGameAction} className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-2">
            <Label className="text-[#d7b354]" htmlFor="game_date">Game date</Label>
            <Input
              className="min-h-14 rounded-[1.25rem] border-white/10 bg-[#0c1f34] text-white"
              defaultValue={formatDateInputValue()}
              id="game_date"
              name="game_date"
              required
              type="date"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-[#d7b354]" htmlFor="opponent">Opponent</Label>
            <Input className="min-h-14 rounded-[1.25rem] border-white/10 bg-[#0c1f34] text-white placeholder:text-[#6e89aa]" id="opponent" name="opponent" placeholder="Westbrook Wolves" />
          </div>
          <div className="grid gap-2">
            <Label className="text-[#d7b354]" htmlFor="location">Location</Label>
            <Input className="min-h-14 rounded-[1.25rem] border-white/10 bg-[#0c1f34] text-white placeholder:text-[#6e89aa]" id="location" name="location" placeholder="Home court" />
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <Label className="text-[#d7b354]" htmlFor="notes">Game notes</Label>
            <Textarea
              className="min-h-32 rounded-[1.25rem] border-white/10 bg-[#0c1f34] text-white placeholder:text-[#6e89aa]"
              id="notes"
              name="notes"
              placeholder="Anything useful to remember before tip-off."
            />
          </div>
          <div>
            <Button className="min-h-14 rounded-[1.25rem] bg-[#2e86ff] px-6 uppercase tracking-[0.16em]" type="submit">Create game</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
