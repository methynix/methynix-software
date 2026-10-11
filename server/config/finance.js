// How every development payment from a client is split. Production costs
// (hosting, domains, store fees the client pays for) are pass-through money for
// service providers and never enter these buckets.
exports.SPLIT = {
  savings: 0.5, // future dreams
  mastercard: 0.1, // online bills: Claude, subscriptions, etc.
  expenses: 0.4, // running costs
};

// Share of the agreed development price the client pays before work starts.
exports.DEPOSIT_RATE = 0.4;

exports.allocate = (amount) => {
  const n = Number(amount) || 0;
  const savings = Math.round(n * exports.SPLIT.savings);
  const mastercard = Math.round(n * exports.SPLIT.mastercard);
  // Expenses takes the remainder so the three always add up to the payment.
  return { savings, mastercard, expenses: n - savings - mastercard };
};
