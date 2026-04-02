import type { AssessmentResult, PlayerGameStat } from "@/types/app";

type StatLine = Pick<
  PlayerGameStat,
  | "offensive_rebounds"
  | "defensive_rebounds"
  | "steals"
  | "turnovers"
  | "made_baskets"
  | "made_free_throws"
  | "missed_free_throws"
>;

export function calculateAssessment(stats: StatLine): AssessmentResult {
  const weightedTotal =
    stats.offensive_rebounds * 2 +
    stats.defensive_rebounds +
    stats.steals * 2 +
    stats.made_baskets * 2 +
    stats.made_free_throws -
    stats.missed_free_throws -
    stats.turnovers * 2;

  const score =
    weightedTotal <= 0
      ? 1
      : weightedTotal <= 3
        ? 2
        : weightedTotal <= 6
          ? 3
          : weightedTotal <= 10
            ? 4
            : 5;

  return {
    score,
    summary: buildSummary(stats, score),
    weightedTotal,
  };
}

function buildSummary(stats: StatLine, score: number) {
  const notes: string[] = [];

  if (stats.made_baskets + stats.made_free_throws >= 6) {
    notes.push("led the scoring load");
  } else if (stats.made_baskets + stats.made_free_throws >= 3) {
    notes.push("added useful scoring");
  }

  if (stats.missed_free_throws >= 3) {
    notes.push("left some points at the line");
  }

  if (stats.offensive_rebounds + stats.defensive_rebounds >= 6) {
    notes.push("controlled the glass");
  } else if (stats.offensive_rebounds >= 2) {
    notes.push("created extra possessions");
  }

  if (stats.steals >= 3) {
    notes.push("made a big defensive impact");
  } else if (stats.steals >= 1) {
    notes.push("generated defensive pressure");
  }

  if (stats.turnovers >= 4) {
    notes.push("needs cleaner ball security");
  } else if (stats.turnovers === 0 && score >= 3) {
    notes.push("took care of the ball");
  }

  if (notes.length === 0) {
    return score >= 3
      ? "Solid all-around effort with steady contributions across the game."
      : "A quieter outing overall, with clear room to impact the game more next time.";
  }

  const summary = `${capitalize(notes[0])}${
    notes.length > 1 ? ` and ${notes.slice(1).join(", ")}` : ""
  }.`;

  return summary.replace(",.", ".");
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
