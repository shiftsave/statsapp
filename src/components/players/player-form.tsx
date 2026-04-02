import { addPlayerAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PlayerForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a player</CardTitle>
        <CardDescription>Create a player record directly from the UI.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={addPlayerAction} className="grid gap-4 sm:grid-cols-[1fr_140px_auto]">
          <div className="grid gap-2">
            <Label htmlFor="name">Player name</Label>
            <Input id="name" name="name" placeholder="Jordan Lee" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="jersey_number">Jersey #</Label>
            <Input
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
            <Button className="w-full sm:w-auto" type="submit">
              Save player
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
