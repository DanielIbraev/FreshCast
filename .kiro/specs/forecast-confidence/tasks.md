# Implementation tasks: Forecast confidence ranges

- [ ] 1. Write the correctness properties first
  - [ ] 1.1 Add fast-check and `tests/properties.test.ts` with P1–P7 and P9–P11 against existing code. _Requirements: 2.4, 4.1_
  - [ ] 1.2 Run them and record anything they catch before writing new code.
  - [ ] 1.3 Fix every bug the properties find, with a regression example test.

- [ ] 2. Residuals and ranges (`lib/uncertainty.ts`)
  - [ ] 2.1 `residuals(obs)`: walk-forward residuals by ingredient, pooled, and by day. _Requirements: 2.1, 2.4_
  - [ ] 2.2 `range(...)` with own / blended / cold-start sources and the clamp. _Requirements: 1.3, 2.1, 2.2, 2.3_
  - [ ] 2.3 Property P8 for `range`. _Requirements: 1.3_

- [ ] 3. Wire into the forecast
  - [ ] 3.1 Optional range fields on `IngredientPrediction` and `DayPrediction`.
  - [ ] 3.2 `withRanges(day, R)` with a day-level total range from `byDay` residuals. _Requirements: 1.4_
  - [ ] 3.3 Memoize residuals in the store and attach ranges to `today`, `week` and `selected`.

- [ ] 4. Show it
  - [ ] 4.1 Ingredient bars: dollar range under each forecast. _Requirements: 1.1_
  - [ ] 4.2 Model breakdown: kg range, source, and night count. _Requirements: 1.2, 2.3_
  - [ ] 4.3 "Waste at risk" card: likely range for the day. _Requirements: 1.4_

- [ ] 5. Prove it
  - [ ] 5.1 `coverage()` in the benchmark, written to `benchmarks.json`. _Requirements: 3.1_
  - [ ] 5.2 Show coverage on the Model accuracy page. _Requirements: 3.2_
  - [ ] 5.3 Test that coverage is within 70–90%. _Requirements: 3.3_
