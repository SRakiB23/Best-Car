import "server-only";

import { createClient } from "@/lib/supabase/server";

/** Every fact the recommender is allowed to state about a car. All of it is DB-sourced. */
export type VehicleCandidate = {
  id: string;
  name: string;
  category: string;
  pricePerDay: number;
  seats: number;
  transmission: string;
  fuelType: string;
  luggageCapacity: number;
  imageUrl: string | null;
  available: boolean;
};

export type CandidateFilters = {
  startDate?: string | null;
  endDate?: string | null;
  minSeats?: number | null;
  minLuggage?: number | null;
  maxPricePerDay?: number | null;
  category?: string | null;
  transmission?: string | null;
  limit?: number;
};

async function query(filters: CandidateFilters): Promise<VehicleCandidate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("vehicle_candidates", {
    p_start: filters.startDate ?? undefined,
    p_end: filters.endDate ?? undefined,
    p_min_seats: filters.minSeats ?? undefined,
    p_min_luggage: filters.minLuggage ?? undefined,
    p_max_price_per_day: filters.maxPricePerDay ?? undefined,
    p_category: filters.category ?? undefined,
    p_transmission: filters.transmission ?? undefined,
    p_limit: filters.limit ?? 12,
  });

  if (error) throw new Error(`vehicle_candidates: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    pricePerDay: Number(row.price_per_day),
    seats: row.seats,
    transmission: row.transmission,
    fuelType: row.fuel_type,
    luggageCapacity: row.luggage_capacity,
    imageUrl: row.image_url,
    available: row.available,
  }));
}

/** Constraints we are willing to drop, cheapest concession first. */
const relaxable = [
  { key: "transmission", label: "preferred transmission" },
  { key: "category", label: "preferred body style" },
  { key: "maxPricePerDay", label: "daily budget" },
  { key: "minLuggage", label: "luggage space" },
  { key: "minSeats", label: "seat count" },
] as const;

export type CandidateResult = {
  candidates: VehicleCandidate[];
  /** Human-readable list of what we had to give up to find anything. */
  relaxed: string[];
};

/**
 * An empty shortlist is a worse answer than an honest compromise, so when the
 * hard filters match nothing we drop them one at a time and report what went.
 * Dates are never relaxed: an unavailable car is not a recommendation.
 */
export async function findCandidates(filters: CandidateFilters): Promise<CandidateResult> {
  const first = await query(filters);
  if (first.length > 0) return { candidates: first, relaxed: [] };

  const working: CandidateFilters = { ...filters };
  const relaxed: string[] = [];

  for (const { key, label } of relaxable) {
    if (working[key] == null) continue;

    working[key] = null;
    relaxed.push(label);

    const next = await query(working);
    if (next.length > 0) return { candidates: next, relaxed };
  }

  return { candidates: [], relaxed };
}
