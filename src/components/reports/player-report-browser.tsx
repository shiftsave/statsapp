"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { calculateAssessment } from "@/lib/assessment";
import { formatGameDate } from "@/lib/format";
import type {
  PlayerGameStat,
  ReflectionAnswer,
  ReflectionHistoryEntry,
  ReflectionNote,
  ReflectionQuestion,
} from "@/types/app";

const statSummary = [
  { key: "offensive_rebounds", label: "Offensive rebounds" },
  { key: "defensive_rebounds", label: "Defensive rebounds" },
  { key: "steals", label: "Steals" },
  { key: "turnovers", label: "Turnovers" },
  { key: "made_baskets", label: "Made baskets" },
  { key: "made_free_throws", label: "Made free throws" },
  { key: "missed_free_throws", label: "Missed free throws" },
] as const;

const responseOptions = [
  { value: 1 as const, label: "Not at all" },
  { value: 2 as const, label: "Sort of" },
  { value: 3 as const, label: "Mostly" },
  { value: 4 as const, label: "Definitely" },
];

type AnswerValue = 1 | 2 | 3 | 4 | undefined;

type FormState = {
  answers: Record<string, AnswerValue>;
  answerNotes: Record<string, string>;
  nextGameGoal: string;
  favoriteThing: string;
};

type PromptState = {
  questionId: string;
  questionPrompt: string;
  mode: "low" | "mostly";
} | null;

function buildInitialState(
  playerId: string,
  questions: ReflectionQuestion[],
  answers: ReflectionAnswer[],
  notes: ReflectionNote[],
): FormState {
  const playerAnswers = answers.filter((answer) => answer.player_id === playerId);
  const playerNote = notes.find((note) => note.player_id === playerId);

  return {
    answers: Object.fromEntries(
      questions.map((question) => {
        const answer = playerAnswers.find((item) => item.question_id === question.id);
        return [question.id, answer?.response_value];
      }),
    ),
    answerNotes: Object.fromEntries(
      questions.map((question) => {
        const answer = playerAnswers.find((item) => item.question_id === question.id);
        return [question.id, answer?.response_note ?? ""];
      }),
    ),
    nextGameGoal: playerNote?.next_game_goal ?? "",
    favoriteThing: playerNote?.favorite_thing ?? "",
  };
}

export function PlayerReportBrowser({
  gameId,
  stats,
  questions,
  answers,
  notes,
  historyByPlayer,
}: {
  gameId: string;
  stats: PlayerGameStat[];
  questions: ReflectionQuestion[];
  answers: ReflectionAnswer[];
  notes: ReflectionNote[];
  historyByPlayer: Record<string, ReflectionHistoryEntry[]>;
}) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(stats[0]?.player_id ?? "");
  const [formByPlayer, setFormByPlayer] = useState<Record<string, FormState>>(() =>
    Object.fromEntries(
      stats.map((statLine) => [
        statLine.player_id,
        buildInitialState(statLine.player_id, questions, answers, notes),
      ]),
    ),
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [promptState, setPromptState] = useState<PromptState>(null);

  const selectedReport = stats.find((statLine) => statLine.player_id === selectedPlayerId) ?? stats[0];
  const assessment = selectedReport ? calculateAssessment(selectedReport) : null;
  const currentForm =
    formByPlayer[selectedPlayerId] ??
    buildInitialState(selectedPlayerId, questions, answers, notes);

  const history = useMemo(
    () => historyByPlayer[selectedPlayerId] ?? [],
    [historyByPlayer, selectedPlayerId],
  );

  if (!selectedReport || !assessment) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">
          No player stats are available for this game yet.
        </CardContent>
      </Card>
    );
  }

  function updateForm(updater: (current: FormState) => FormState) {
    setSaveState("idle");
    setFormByPlayer((current) => ({
      ...current,
      [selectedPlayerId]: updater(
        current[selectedPlayerId] ?? buildInitialState(selectedPlayerId, questions, answers, notes),
      ),
    }));
  }

  function chooseResponse(question: ReflectionQuestion, value: 1 | 2 | 3 | 4) {
    updateForm((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [question.id]: value,
      },
    }));

    if (value === 1 || value === 2) {
      setPromptState({
        questionId: question.id,
        questionPrompt: question.prompt,
        mode: "low",
      });
      return;
    }

    if (value === 3) {
      setPromptState({
        questionId: question.id,
        questionPrompt: question.prompt,
        mode: "mostly",
      });
    }
  }

  async function saveReflection() {
    setSaveState("saving");

    const selectedAnswers = questions
      .map((question) => {
        const value = currentForm.answers[question.id];
        if (!value) {
          return null;
        }

        return {
          question_id: question.id,
          response_value: value,
          response_note: currentForm.answerNotes[question.id] || "",
        };
      })
      .filter(Boolean) as Array<{
      question_id: string;
      response_value: 1 | 2 | 3 | 4;
      response_note?: string;
    }>;

    const response = await fetch(`/api/games/${gameId}/reflections`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playerId: selectedPlayerId,
        answers: selectedAnswers,
        nextGameGoal: currentForm.nextGameGoal,
        favoriteThing: currentForm.favoriteThing,
      }),
    });

    setSaveState(response.ok ? "saved" : "error");
  }

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Choose a player</CardTitle>
            <CardDescription>
              Each player can review their game, answer the reflection survey, and revisit older
              reflections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.map((statLine) => {
              const isSelected = statLine.player_id === selectedPlayerId;

              return (
                <button
                  key={statLine.id}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
                  onClick={() => setSelectedPlayerId(statLine.player_id)}
                  type="button"
                >
                  <p className="font-medium">{statLine.player?.name ?? "Player"}</p>
                  <p className={`text-sm ${isSelected ? "text-slate-200" : "text-slate-500"}`}>
                    {statLine.player?.jersey_number
                      ? `#${statLine.player.jersey_number}`
                      : "No jersey number"}
                  </p>
                </button>
              );
            })}
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <CardHeader className="border-b bg-slate-950 text-white">
              <CardTitle className="text-2xl">
                {selectedReport.player?.name ?? "Player report"}
              </CardTitle>
              <CardDescription className="mt-1 text-slate-300">
                Single-game report and post-game reflection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-5">
              <div className="rounded-3xl bg-sky-50 p-5 text-sky-950">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
                  Summary
                </p>
                <p className="mt-3 text-base leading-7">{assessment.summary}</p>
              </div>
              <Separator />
              <div className="grid gap-3 sm:grid-cols-2">
                {statSummary.map((item) => (
                  <div key={item.key} className="rounded-2xl border bg-slate-50/70 px-4 py-4">
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {selectedReport[item.key]}
                    </p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-950">Game reflection</h3>
                    <p className="text-sm text-slate-500">
                      Rate each statement from not at all to definitely.
                    </p>
                  </div>
                  <Button disabled={saveState === "saving"} onClick={saveReflection} type="button">
                    {saveState === "saving" ? "Saving..." : "Save reflection"}
                  </Button>
                </div>
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="rounded-2xl border bg-slate-50/70 p-4">
                      <p className="text-base leading-7 text-slate-950">{question.prompt}</p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {responseOptions.map((option) => {
                          const isSelected = currentForm.answers[question.id] === option.value;

                          return (
                            <button
                              key={option.value}
                              className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                                isSelected
                                  ? "border-slate-950 bg-slate-950 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                              }`}
                              onClick={() => chooseResponse(question, option.value)}
                              type="button"
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">My goal for the next game</p>
                    <Textarea
                      onChange={(event) =>
                        updateForm((current) => ({
                          ...current,
                          nextGameGoal: event.target.value,
                        }))
                      }
                      placeholder="What do I want to focus on next game?"
                      value={currentForm.nextGameGoal}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">
                      My favourite thing about the game was
                    </p>
                    <Textarea
                      onChange={(event) =>
                        updateForm((current) => ({
                          ...current,
                          favoriteThing: event.target.value,
                        }))
                      }
                      placeholder="What stood out as the best part of this game?"
                      value={currentForm.favoriteThing}
                    />
                  </div>
                </div>
                {saveState === "saved" ? (
                  <p className="text-sm font-medium text-emerald-700">Reflection saved.</p>
                ) : null}
                {saveState === "error" ? (
                  <p className="text-sm font-medium text-rose-700">
                    Reflection could not be saved. Please try again.
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Past reflections</CardTitle>
              <CardDescription>
                Previous survey responses and personal notes for this player.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No past reflections yet.</p>
              ) : (
                history.map((entry) => (
                  <div key={entry.game_id} className="rounded-2xl border bg-slate-50/70 p-4">
                    <p className="font-semibold text-slate-950">
                      {entry.opponent ? `vs ${entry.opponent}` : "Game reflection"} •{" "}
                      {formatGameDate(entry.game_date)}
                    </p>
                    <div className="mt-4 grid gap-3">
                      {questions.map((question) => {
                        const answer = entry.answers.find((item) => item.question_id === question.id);
                        const label =
                          responseOptions.find((option) => option.value === answer?.response_value)
                            ?.label ?? "No response";

                        return (
                          <div key={question.id} className="rounded-2xl border bg-white p-3">
                            <p className="text-sm text-slate-500">{question.prompt}</p>
                            <p className="mt-2 font-medium text-slate-950">{label}</p>
                            {answer?.response_note ? (
                              <p className="mt-2 text-sm text-slate-600">{answer.response_note}</p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                    {entry.note?.next_game_goal || entry.note?.favorite_thing ? (
                      <div className="mt-4 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-2xl border bg-white p-3">
                          <p className="text-sm text-slate-500">Goal for next game</p>
                          <p className="mt-2 text-slate-950">
                            {entry.note?.next_game_goal || "No goal recorded."}
                          </p>
                        </div>
                        <div className="rounded-2xl border bg-white p-3">
                          <p className="text-sm text-slate-500">Favourite thing</p>
                          <p className="mt-2 text-slate-950">
                            {entry.note?.favorite_thing || "No note recorded."}
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog
        open={Boolean(promptState)}
        onOpenChange={(open) => {
          if (!open) {
            setPromptState(null);
          }
        }}
      >
        {promptState ? (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {promptState.mode === "low"
                  ? "What stopped you from doing this?"
                  : "Think about how you can make this 'definitely' for next game"}
              </DialogTitle>
              <DialogDescription>{promptState.questionPrompt}</DialogDescription>
            </DialogHeader>
            {promptState.mode === "low" ? (
              <div className="space-y-4">
                <Textarea
                  onChange={(event) =>
                    updateForm((current) => ({
                      ...current,
                      answerNotes: {
                        ...current.answerNotes,
                        [promptState.questionId]: event.target.value,
                      },
                    }))
                  }
                  placeholder="Add a quick note about what got in the way."
                  value={currentForm.answerNotes[promptState.questionId] ?? ""}
                />
                <div className="flex justify-end">
                  <Button onClick={() => setPromptState(null)} type="button">
                    Save note
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button onClick={() => setPromptState(null)} type="button">
                  OK
                </Button>
              </div>
            )}
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
