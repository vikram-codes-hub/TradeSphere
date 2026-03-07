/* ============================================================
   PRICE SIMULATOR
   Generates realistic mock price movements for testing
   when Yahoo Finance is unavailable
   ============================================================ */

const simulatedPrices = {};

export const getSimulatedPrice = (symbol, basePrice) => {
  if (!simulatedPrices[symbol]) {
    simulatedPrices[symbol] = basePrice;
  }

  // Random walk ±0.5%
  const change = (Math.random() - 0.5) * 0.01 * simulatedPrices[symbol];
  simulatedPrices[symbol] = parseFloat((simulatedPrices[symbol] + change).toFixed(2));

  return simulatedPrices[symbol];
};

export const resetSimulatedPrice = (symbol) => {
  delete simulatedPrices[symbol];
};