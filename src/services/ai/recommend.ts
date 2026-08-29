import "server-only";

import { aiConfig } from "@/lib/ai/config";
import { generateStructured } from "@/lib/ai/gemini";
import {
  aiFeature,
  extractedNeedsSchema,
  extractionResponseSchema,
  extractionSystemPrompt,
  rankingResponseSchema,
  rankingSchema,
  rankingSystemPrompt,
  type ExtractedNeeds,
  type Ranking,
  type RecommendRequest,
  type RecommendResult,
  type Recommendation,
  type RecommendedVehicle,
} from "@/lib/ai/recommendation";
import { rankByFit, type ScoredVehicle } from "@/lib/ai/scoring";
import { rentalDays } from "@/lib/booking";
import type { Json } from "@/lib/supabase/database.types";
import { findCandidates } from "./candidates";
import { logAiInteraction } from "./interactions";

export async function recommendVehicles(request: RecommendRequest): Promise<RecommendResult> {
  const startedAt = Date.now();

  const extraction = await generateStructured({
    system: extractionSystemPrompt,
    prompt: buildExtractionPrompt(request),
    responseSchema: extractionResponseSchema,
    validator: extractedNeedsSchema,
    temperature: 0,
  });

  const needs = applyHints(extraction.data, request);
  const { candidates, relaxed } = await findCandidates({
    startDate: needs.startDate,
    endDate: needs.endDate,
    minSeats: needs.passengers,
    minLuggage: needs.luggage,
    maxPricePerDay: needs.maxPricePerDay,
    category: needs.category,
    transmission: needs.transmission,
    limit: aiConfig.candidatePool,
  });

  if (candidates.length === 0) {
    const result: RecommendResult = {
      status: "no_candidates",
      interactionId: null,
      model: extraction.model,
      summary:
        "Nothing in our fleet matches those requirements for the dates you gave. Try widening the budget or the dates.",
      understood: needs,
      relaxed,
      unmetRequirements: [],
      recommendations: [],
      alternative: null,
    };

    result.interactionId = await logAiInteraction({
      feature: aiFeature,
      model: extraction.model,
      request: auditRequest(request, needs),
      response: { status: "no_candidates", relaxed } as Json,
      latencyMs: Date.now() - startedAt,
    });

    return result;
  }

  // Deterministic scoring decides which candidates are worth the model's time,
  // so truncation follows fit rather than the price ordering the query returns.
  const shortlist = rankByFit(candidates, needs, aiConfig.shortlist);

  // Short keys instead of UUIDs: cheaper, and a bogus key is easy to reject.
  const byRef = new Map(shortlist.map((scored, index) => [`C${index + 1}`, scored]));

  const ranking = await generateStructured({
    system: rankingSystemPrompt,
    prompt: buildRankingPrompt(request, needs, byRef, relaxed),
    responseSchema: rankingResponseSchema,
    validator: rankingSchema,
    temperature: 0.3,
  });

  const result = assemble(ranking.data, byRef, needs, relaxed, extraction.model);
  const latencyMs = Date.now() - startedAt;

  result.interactionId = await logAiInteraction({
    feature: aiFeature,
    model: ranking.model,
    request: auditRequest(
      request,
      needs,
      shortlist.map((scored) => ({ id: scored.vehicle.id, fitScore: scored.fit.score })),
    ),
    response: {
      raw: ranking.data as unknown as Json,
      returnedVehicleIds: result.recommendations.map((item) => item.vehicle.id),
      usage: {
        extraction: extraction.usage,
        ranking: ranking.usage,
      },
    } as Json,
    latencyMs,
  });

  return result;
}

/**
 * Explicit form fields beat anything inferred from prose — the customer picked
 * those on purpose. Trip length is derived from dates when both are present.
 */
function applyHints(needs: ExtractedNeeds, request: RecommendRequest): ExtractedNeeds {
  const startDate = request.startDate ?? needs.startDate;
  const endDate = request.endDate ?? needs.endDate;
  const days =
    startDate && endDate && endDate >= startDate ? rentalDays(startDate, endDate) : needs.days;

  return {
    ...needs,
    startDate,
    endDate,
    days,
    passengers: request.passengers ?? needs.passengers,
  };
}

function buildExtractionPrompt(request: RecommendRequest) {
  const hints = [
    request.startDate ? `Pick-up date selected in the form: ${request.startDate}` : null,
    request.endDate ? `Drop-off date selected in the form: ${request.endDate}` : null,
    request.passengers ? `Passenger count selected in the form: ${request.passengers}` : null,
    `Today's date is ${new Date().toISOString().slice(0, 10)}.`,
  ].filter(Boolean);

  return [
    "Customer message:",
    quoteBlock(request.prompt),
    "",
    "Context:",
    hints.map((hint) => `- ${hint}`).join("\n"),
  ].join("\n");
}

function buildRankingPrompt(
  request: RecommendRequest,
  needs: ExtractedNeeds,
  byRef: Map<string, ScoredVehicle>,
  relaxed: string[],
) {
  const lines = [...byRef].map(([ref, { vehicle: car, fit }]) =>
    [
      `${ref}: ${car.name}`,
      `category=${car.category}`,
      `pricePerDay=$${car.pricePerDay}`,
      `seats=${car.seats}`,
      `transmission=${car.transmission}`,
      `fuel=${car.fuelType}`,
      `largeSuitcases=${car.luggageCapacity}`,
      `availableForRequestedDates=${car.available}`,
      `fitScore=${fit.score ?? "n/a"}`,
    ].join(", "),
  );

  const requirements = [
    needs.passengers ? `passengers: ${needs.passengers}` : null,
    needs.luggage ? `large suitcases: ${needs.luggage}` : null,
    needs.maxPricePerDay ? `budget per day: $${needs.maxPricePerDay}` : null,
    needs.days ? `trip length: ${needs.days} days` : null,
    needs.startDate && needs.endDate ? `dates: ${needs.startDate} to ${needs.endDate}` : null,
    needs.category ? `preferred body style: ${needs.category}` : null,
    needs.transmission ? `transmission: ${needs.transmission}` : null,
    needs.fuelPreference ? `fuel preference: ${needs.fuelPreference}` : null,
    needs.priorities.length ? `priorities: ${needs.priorities.join(", ")}` : null,
  ].filter(Boolean);

  return [
    "Customer message:",
    quoteBlock(request.prompt),
    "",
    "Structured requirements:",
    requirements.length ? requirements.map((line) => `- ${line}`).join("\n") : "- none stated",
    relaxed.length
      ? `\nNo car satisfied every requirement, so we relaxed: ${relaxed.join(", ")}. Say so in unmetRequirements.`
      : "",
    "",
    `Candidate vehicles (choose only from these ${byRef.size} keys):`,
    lines.join("\n"),
  ].join("\n");
}

/** Fences the untrusted message so it reads as data rather than instructions. */
function quoteBlock(text: string) {
  return ["<customer_message>", text.replaceAll("<", "‹"), "</customer_message>"].join("\n");
}

/**
 * Rebuilds the answer from database rows. The model contributes prose and
 * ordering; anything factual is looked up by reference key, and a key we do not
 * recognise is dropped rather than trusted.
 */
function assemble(
  ranking: Ranking,
  byRef: Map<string, ScoredVehicle>,
  needs: ExtractedNeeds,
  relaxed: string[],
  model: string,
): RecommendResult {
  const seen = new Set<string>();
  const recommendations: Recommendation[] = [];

  for (const item of [...ranking.recommendations].sort((a, b) => a.rank - b.rank)) {
    const scored = byRef.get(item.ref);
    if (!scored || seen.has(scored.vehicle.id)) continue;
    seen.add(scored.vehicle.id);

    recommendations.push({
      rank: recommendations.length + 1,
      matchScore: scored.fit.score,
      explanation: deref(item.explanation, byRef),
      reasons: scored.fit.reasons,
      vehicle: scored.vehicle,
      estimate: estimateFor(scored.vehicle, needs),
    });
  }

  if (recommendations.length === 0) {
    // Every reference was invented. Fall back to the best-scoring candidate
    // rather than failing, and attribute no prose to the model.
    const fallback = byRef.values().next().value as ScoredVehicle;
    recommendations.push({
      rank: 1,
      matchScore: fallback.fit.score,
      explanation: "The closest available match in our fleet for what you described.",
      reasons: fallback.fit.reasons,
      vehicle: fallback.vehicle,
      estimate: estimateFor(fallback.vehicle, needs),
    });
  }

  const alternativeScored = ranking.alternative ? byRef.get(ranking.alternative.ref) : undefined;
  const alternative =
    ranking.alternative && alternativeScored && !seen.has(alternativeScored.vehicle.id)
      ? { reason: deref(ranking.alternative.reason, byRef), vehicle: alternativeScored.vehicle }
      : null;

  // Shortfalls the scorer found beat anything the model might phrase loosely.
  const computedUnmet = [...new Set(recommendations.flatMap((item) => unmetFor(item, byRef)))];

  return {
    status: "ok",
    interactionId: null,
    model,
    summary: deref(ranking.summary, byRef),
    understood: needs,
    relaxed,
    unmetRequirements: computedUnmet.length ? computedUnmet : ranking.unmetRequirements,
    recommendations,
    alternative,
  };
}

function unmetFor(item: Recommendation, byRef: Map<string, ScoredVehicle>) {
  for (const scored of byRef.values()) {
    if (scored.vehicle.id === item.vehicle.id) return scored.fit.unmet;
  }
  return [];
}

/**
 * The prompt tells the model to keep reference keys out of prose; this makes sure
 * of it, swapping any that slip through for the real vehicle name.
 */
function deref(text: string, byRef: Map<string, ScoredVehicle>) {
  return text.replace(/\bC(\d{1,2})\b/g, (match) => byRef.get(match)?.vehicle.name ?? match);
}

function estimateFor(candidate: RecommendedVehicle, needs: ExtractedNeeds) {
  if (!needs.days) return null;
  return {
    days: needs.days,
    total: Math.round(candidate.pricePerDay * needs.days * 100) / 100,
  };
}

function auditRequest(
  request: RecommendRequest,
  needs: ExtractedNeeds,
  shortlist?: { id: string; fitScore: number | null }[],
): Json {
  return {
    prompt: request.prompt,
    hints: {
      startDate: request.startDate ?? null,
      endDate: request.endDate ?? null,
      passengers: request.passengers ?? null,
    },
    extracted: needs as unknown as Json,
    ...(shortlist ? { shortlist } : {}),
  } as Json;
}
