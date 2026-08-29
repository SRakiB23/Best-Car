import { priorityForScore, type LeadQualification } from "./lead-qualification";

/**
 * The prompt tells the model not to invent customer details. This checks that it
 * did not, because a sales rep acting on a fabricated budget or date is the one
 * failure mode of this feature that actually costs the business something.
 *
 * Every rule here only ever removes a claim or replaces it with a value derived
 * from the record. Nothing is added on the model's behalf.
 */
export function groundQualification(
  raw: LeadQualification,
  lead: { message: string; phone: string },
): { value: LeadQualification; adjustments: string[] } {
  const adjustments: string[] = [];
  const value: LeadQualification = { ...raw };
  const message = lead.message.toLowerCase();
  const missing = new Set(value.missingInformation);

  // Score and priority are two views of the same judgement, and a mismatch makes
  // the dashboard contradict itself. The bands decide.
  const expectedPriority = priorityForScore(value.leadScore);
  if (value.priority !== expectedPriority) {
    adjustments.push(
      `priority ${value.priority} did not match a score of ${value.leadScore}, corrected to ${expectedPriority}`,
    );
    value.priority = expectedPriority;
  }

  if (value.estimatedBudgetAmount !== null && !statesAmount(message, value.estimatedBudgetAmount)) {
    adjustments.push(`dropped an unstated budget of ${value.estimatedBudgetAmount}`);
    value.estimatedBudgetAmount = null;
    value.estimatedBudgetPeriod = "unknown";
    missing.add("budget");
  }

  // A period without an amount says nothing and reads as though we know more
  // than we do.
  if (value.estimatedBudgetAmount === null && value.estimatedBudgetPeriod !== "unknown") {
    value.estimatedBudgetPeriod = "unknown";
  }

  if (value.rentalDurationDays !== null && !statesDuration(message)) {
    adjustments.push(`dropped an unstated rental length of ${value.rentalDurationDays} days`);
    value.rentalDurationDays = null;
    missing.add("rental dates");
  }

  // A label with nothing behind it is noise; an empty string is not "unknown".
  value.rentalDurationLabel = value.rentalDurationLabel?.trim() || null;
  value.vehiclePreference = value.vehiclePreference?.trim() || null;

  if (value.vehiclePreference === null && value.vehiclePreferenceCategory === null) {
    missing.add("vehicle preference");
  }

  // We know for a fact whether we hold a phone number, so this never depends on
  // the model noticing.
  if (!lead.phone.trim()) missing.add("phone number");

  value.missingInformation = [...missing].slice(0, 8);

  return { value, adjustments };
}

const numberWords =
  /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|couple|few)\b/;

const durationWords = /\b(day|days|night|nights|weekend|week|weeks|fortnight|month|months|year|years)\b/;

/**
 * Accepts an amount only if the customer's own text could have produced it: the
 * digits appear in the message (so "$1,200" backs 1200), or they wrote the
 * figure in words.
 */
function statesAmount(message: string, amount: number) {
  const digits = message.replace(/\D/g, "");

  if (digits) {
    const whole = String(Math.round(amount));
    if (digits.includes(whole)) return true;

    // "180k" and "1.5k" style shorthand, where the written digits are shorter
    // than the number they mean.
    if (/\d\s*[km]\b/.test(message)) return true;
  }

  return numberWords.test(message);
}

function statesDuration(message: string) {
  return /\d/.test(message) || numberWords.test(message) || durationWords.test(message);
}
