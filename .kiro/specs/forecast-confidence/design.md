# Design: Forecast confidence ranges

## Overview
Add a pure module, `lib/uncertainty.ts`, that turns stored close-outs into per-ingredient residual distributions and applies them to any forecast. No model change: the point forecast stays exactly what it was. The store attaches ranges after `buildDayForecast`, so forecasting stays a pure function and the UI only reads extra fields.

## Architecture
```
daily_observations (Supabase)
        │  toLearningObs
        ▼
Observation[] ──► residuals(obs)            walk-forward: for each past night,
        │          Map<ingredientId, number[]>   learn() sees only earlier nights
        │          + pooled number[]
        ▼
buildDayForecast(...) ──► withRanges(day, R) ──► IngredientPrediction + lowKg/highKg/lowCost/highCost
                                             └─► DayPrediction + totalLow/totalHigh
```

## Components and interfaces
- `residuals(obs: Observation[]): Residuals` returns `{ byIngredient: Map<string, number[]>, pooled: number[], byDay: number[] }`. Each value is `ln(usualKg / forecastKg)`, with the forecast rebuilt from `rawKg × calibration × weekday × weather × recency` learned at that date.
- `range(forecast, own, pooled, level = 0.8): { low, high, source: "own" | "blended" | "cold-start", n }`.
  - n ≥ 10: quantiles of `own`.
  - 1 ≤ n < 10: quantiles of `own` plus `pooled` resampled to weight `own` by n/10.
  - n = 0 and pooled empty: cold start, `[0.65f, 1.45f]`.
  - Always clamp so `low ≤ f ≤ high` (quantiles of skewed residuals can sit on one side of 0).
- `withRanges(day, R)` maps ingredients and adds the totals. The day total uses `byDay` (residuals of the summed forecast vs. summed actual), so the total range isn't the naive sum of item ranges.
- `coverage(...)` in `lib/backtest.ts` replays the benchmark, building the range for each night from residuals of earlier nights only, and counts hits.

## Data model
`IngredientPrediction` gains optional `lowKg, highKg, lowCost, highCost, rangeSource, rangeN`. `DayPrediction` gains optional `totalLow, totalHigh`. Optional fields keep every existing caller and test valid.

## Correctness properties (property-based tests with fast-check)
Each property is a requirement turned into a universally-quantified statement, checked against hundreds of generated inputs.

| # | Property | Validates |
|---|---|---|
| P1 | For any ingredient, guests and weather, the prior forecast is finite and ≥ 0 | model safety |
| P2 | For any two guest counts a < b, forecast(a) ≥ forecast(b) | guests signal direction |
| P3 | Doubling daily prep doubles the forecast (linear in prep) | units / scaling |
| P4 | 0 ≤ recommended prep ≤ usual prep, and reduced waste ≤ predicted waste | plan can never tell a cook to prep a negative amount |
| P5 | For any observations, learned factors stay inside their clamps | learning stability |
| P6 | Adding observations dated on or after the target day never changes `learn()` | no leakage (Req 2.4) |
| P7 | Calibration lies between 1.0 and the sample mean ratio | shrinkage behaves as documented |
| P8 | For any forecast and residuals, 0 ≤ low ≤ forecast ≤ high | Req 1.3 |
| P9 | Accuracy is in [0, 1], and equals 1 exactly when every forecast matches | metric sanity |
| P10 | Any table of fields (commas, quotes, newlines) survives CSV write → `parseCsv` | importer robustness |
| P11 | Every date the importer accepts is a real calendar date | Req 4.1 |
| P12 | A closed day never forecasts waste, savings or a prep cut | added after the model audit |
| P13 | Sold-out (censored) nights never feed the confidence ranges | added after the model audit; keeps upper-bound nights out of the residuals |

P12 and P13 were not part of the original design. They were added after a subagent audit found that closed days were forecast with waste and that sold-out nights could skew the ranges.

## Error handling
- Non-positive forecast or actual: residual skipped (log undefined).
- Ingredient deleted: residuals for it are ignored.
- Residual computation is O(n²) in observations; at 672 rows it runs in under 200 ms, memoized on the observation array.

## Testing strategy
- Property tests (P1–P11) in `tests/properties.test.ts`, 200 runs each.
- Example tests stay in place for readable documentation of specific cases.
- A coverage test asserts benchmark coverage is in 70–90% (Req 3.3).
