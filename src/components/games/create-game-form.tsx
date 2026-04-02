import { createGameAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateInputValue } from "@/lib/format";

export function CreateGameForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a game</CardTitle>
        <CardDescription>
          New games pull in all active players and create a stat row for each one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createGameAction} className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="game_date">Game date</Label>
            <Input
              defaultValue={formatDateInputValue()}
              id="game_date"
              name="game_date"
              required
              type="date"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="opponent">Opponent</Label>
            <Input id="opponent" name="opponent" placeholder="Westbrook Wolves" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" placeholder="Home court" />
          </div>
          <div className="grid gap-2 lg:col-span-2">
            <Label htmlFor="notes">Game notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Anything useful to remember before tip-off."
            />
          </div>
          <div>
            <Button type="submit">Create game</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
