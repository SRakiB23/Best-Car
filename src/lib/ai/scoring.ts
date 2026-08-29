import type { ExtractedNeeds, RecommendedVehicle } from "./recommendation";

/**
 * Deterministic fit scoring.
 *
 * The model is good at language and bad at arithmetic it cannot be held to, so
 * the percentage a customer sees is computed here from database values instead
 * of being asked for. Pure function, no I/O — same inputs, same score, always.
 */

/** Weights are relative; only criteria the customer actually stated are counted. */
const weights = {
  seats: 30,
  luggage: 20,
  budget: 30,
  category: 12,
  transmission: 8,
  fuel: 8,
} as const;

type Judgement = { weight: number; ratio: number; reason?: string; unmet?: string };

export type VehicleScore = {
  /** null when the customer stated nothing measurable — better than a fake number. */
  score: number | null;
  reasons: string[];
  unmet: string[];
};

export type ScoredVehicle = { vehicle: RecommendedVehicle; fit: VehicleScore };

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function money(value: number) {
  return `$${value.toFixed(2)}`;
}

export function scoreVehicle(vehicle: RecommendedVehicle, needs: ExtractedNeeds): VehicleScore {
  const judgements: Judgement[] = [];

  if (needs.passengers != null) {
    const spare = vehicle.seats - needs.passengers;

    if (spare < 0) {
      judgements.push({
        weight: weights.seats,
        ratio: 0,
        unmet: `Only ${plural(vehicle.seats, "seat")} for ${needs.passengers} travellers`,
      });
    } else {
      // A 7-seater for two people fits, but it is not the best answer.
      judgements.push({
        weight: weights.seats,
        ratio: Math.max(0.6, 1 - spare * 0.08),
        reason: `Seats ${needs.passengers}${spare > 0 ? ` with ${spare} spare` : " exactly"}`,
      });
    }
  }

  if (needs.luggage != null && needs.luggage > 0) {
    const fits = vehicle.luggageCapacity >= needs.luggage;
    judgements.push({
      weight: weights.luggage,
      ratio: fits ? 1 : vehicle.luggageCapacity / needs.luggage,
      reason: fits ? `Takes ${plural(vehicle.luggageCapacity, "large suitcase")}` : undefined,
      unmet: fits
        ? undefined
        : `Holds ${plural(vehicle.luggageCapacity, "large suitcase")}, you have ${needs.luggage}`,
    });
  }

  if (needs.maxPricePerDay != null) {
    const over = vehicle.pricePerDay - needs.maxPricePerDay;
    judgements.push({
      weight: weights.budget,
      ratio: over <= 0 ? 1 : Math.max(0, 1 - over / needs.maxPricePerDay),
      reason:
        over <= 0
          ? `${money(vehicle.pricePerDay)} a day, within your ${money(needs.maxPricePerDay)} budget`
          : undefined,
      unmet:
        over > 0
          ? `${money(vehicle.pricePerDay)} a day is over your ${money(needs.maxPricePerDay)} budget`
          : undefined,
    });
  }

  addMatch(judgements, weights.category, needs.category, vehicle.category, {
    reason: `${vehicle.category} as requested`,
    unmet: `${vehicle.category}, not the ${needs.category} you asked for`,
  });

  addMatch(judgements, weights.transmission, needs.transmission, vehicle.transmission, {
    reason: `${vehicle.transmission} transmission`,
    unmet: `${vehicle.transmission}, not ${needs.transmission}`,
  });

  addMatch(judgements, weights.fuel, needs.fuelPreference, vehicle.fuelType, {
    reason: `${vehicle.fuelType} as preferred`,
    unmet: `${vehicle.fuelType}, not ${needs.fuelPreference}`,
  });

  const reasons = judgements.flatMap((item) => (item.reason ? [item.reason] : []));
  const unmet = judgements.flatMap((item) => (item.unmet ? [item.unmet] : []));

  const totalWeight = judgements.reduce((sum, item) => sum + item.weight, 0);

  if (totalWeight === 0) {
    // Nothing measurable was asked for, so any percentage would be invented.
    return {
      score: null,
      reasons: [
        plural(vehicle.seats, "seat"),
        vehicle.transmission,
        vehicle.fuelType,
        `${money(vehicle.pricePerDay)} a day`,
      ],
      unmet: [],
    };
  }

  const earned = judgements.reduce((sum, item) => sum + item.weight * item.ratio, 0);

  return {
    score: Math.round((earned / totalWeight) * 100),
    reasons: reasons.slice(0, 4),
    unmet,
  };
}

function addMatch(
  judgements: Judgement[],
  weight: number,
  wanted: string | null,
  actual: string,
  copy: { reason: string; unmet: string },
) {
  if (wanted == null) return;

  const matches = wanted === actual;
  judgements.push({
    weight,
    ratio: matches ? 1 : 0,
    reason: matches ? copy.reason : undefined,
    unmet: matches ? undefined : copy.unmet,
  });
}

/**
 * Best fit first, cheaper wins ties. This decides which candidates reach the
 * model, so truncation is driven by fit rather than by price.
 */
export function rankByFit(
  vehicles: RecommendedVehicle[],
  needs: ExtractedNeeds,
  limit: number,
): ScoredVehicle[] {
  return vehicles
    .map((vehicle) => ({ vehicle, fit: scoreVehicle(vehicle, needs) }))
    .sort(
      (a, b) =>
        (b.fit.score ?? 0) - (a.fit.score ?? 0) || a.vehicle.pricePerDay - b.vehicle.pricePerDay,
    )
    .slice(0, limit);
}
