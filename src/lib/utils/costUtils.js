// No 'use server' directive here as this is a utility function

/**
 * Calculates the advertising cost based on item type and MRP.
 * @param {string} itemType - The type of item (e.g., 'Book', 'Stationary', 'Flat/PG').
 * @param {number} [mrp] - The Maximum Retail Price (required for Book/Stationary).
 * @returns {number} - The calculated advertising cost.
 */
export function calculateAdvertisingCost(itemType, mrp) {
  const monthlyFee = 100;
  const percentageFeeRate = 0.1; // 10%
  const fixedFee = 20;

  if (itemType === "Book" || itemType === "Stationary") {
    if (!mrp || typeof mrp !== "number" || mrp <= 0) {
      console.warn(
        `MRP not provided or invalid for ${itemType}. Using fixed fee.`
      );
      return fixedFee;
    }
    const percentageFee = mrp * percentageFeeRate;
    return Math.max(percentageFee, fixedFee);
  }

  if (
    itemType === "Flat/PG" ||
    itemType === "Restaurant" ||
    itemType === "Event"
  ) {
    return monthlyFee;
  }

  // Default or fallback cost if type is unknown
  console.warn(`Unknown item type: ${itemType}. Using default monthly fee.`);
  return monthlyFee;
}
