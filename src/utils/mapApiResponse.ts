import type { UserTree, Tree } from "@/types/Tree";

// function generateSeedFromString(str: string): number {
//   let hash = 0;
//   if (str.length === 0) {
//     return hash;
//   }
//   for (let i = 0; i < str.length; i++) {
//     const char = str.charCodeAt(i);
//     // This formula combines the existing hash with the new character code.
//     // The bitwise left shift (<< 5) is a fast way to multiply and mix the values.
//     hash = (hash << 5) - hash + char;
//     // This converts the result to a 32-bit signed integer to keep the number
//     // from growing too large.
//     hash |= 0;
//   }
//   // Return the absolute value to ensure the seed is always positive.
//   return Math.abs(hash);
// }

function MapTreeData(data: UserTree): Tree {
  console.log(data);
  const daysSinceWatered = data.days_since_watering;

  const gracePeriodDays = 7;
  // You can still adjust this value to change how fast trees wither.
  const decayRatePerDay = 0.2;

  let decayProgress = 0;

  // If the tree is overdue for water, calculate the decay.
  if (daysSinceWatered > gracePeriodDays) {
    const daysOverdue = daysSinceWatered - gracePeriodDays;
    decayProgress = daysOverdue * decayRatePerDay;
  }

  // Cap the decay at the maximum value of 2.
  const finalDecayProgress = Math.min(decayProgress, 2);
  return {
    seed: data.id,
    container: null as unknown as HTMLDivElement,
    decayProgress: finalDecayProgress,
    timesWatered: data.vitality_percent / 5,
    apples: data.apples,
  };
}

export default MapTreeData;
