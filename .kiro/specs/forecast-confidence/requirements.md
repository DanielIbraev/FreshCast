# Requirements: Forecast confidence ranges

## Introduction
Today FreshCast shows a single number per ingredient ("$12 at risk"). A kitchen owner has no way to tell a confident forecast from a guess, and a technical reviewer can't tell whether the model is calibrated. This feature adds an 80% range to every forecast, learned from how wrong the model has actually been on that kitchen's own nights, and proves the range is honest by measuring how often real nights land inside it.

## Glossary
- **Forecast**: the model's predicted "prep as usual" waste for one ingredient on one day (kg).
- **Residual**: log(actual ÷ forecast) for one past close-out, where the forecast was made walk-forward (only earlier days visible).
- **80% range**: the interval [low, high] that should contain the actual value on 8 of 10 nights.
- **Coverage**: the share of past nights whose actual value fell inside the range forecast for them.

## Requirements

### Requirement 1: A range on every forecast
**User story:** As a restaurant owner, I want to see how sure the forecast is, so that I know when to trust the prep plan and when to keep extra on hand.

#### Acceptance criteria
1. WHEN the dashboard shows an ingredient forecast THE SYSTEM SHALL show an 80% range in dollars next to the point forecast.
2. WHEN the model breakdown panel is open THE SYSTEM SHALL show the range in kg and state how many past nights it was learned from.
3. THE SYSTEM SHALL always produce a range where 0 ≤ low ≤ forecast ≤ high.
4. WHEN the "Waste at risk" total is shown THE SYSTEM SHALL show a likely range for the day's total.

### Requirement 2: Learned from the kitchen's own errors
**User story:** As a skeptical owner, I want the range to come from my kitchen's history, not a generic rule, so that it gets tighter as FreshCast learns.

#### Acceptance criteria
1. WHEN an ingredient has at least 10 walk-forward residuals THE SYSTEM SHALL compute its range from the 10th and 90th percentile of its own residuals.
2. WHEN an ingredient has fewer than 10 residuals THE SYSTEM SHALL blend its residuals with the pooled residuals of all ingredients.
3. WHEN no residuals exist (a new kitchen) THE SYSTEM SHALL use a wide cold-start range of −35% / +45% and label it "cold start".
4. THE SYSTEM SHALL compute residuals walk-forward only: a residual for day D uses a forecast made without any observation from day D or later.

### Requirement 3: Proof the range is honest
**User story:** As a technical judge, I want to see the range's real coverage, so that I can trust it isn't decorative.

#### Acceptance criteria
1. WHEN the benchmark runs THE SYSTEM SHALL report the share of simulated nights whose actual waste fell inside the 80% range.
2. WHEN the Model accuracy page loads THE SYSTEM SHALL show that coverage next to the nominal 80%.
3. IF benchmark coverage falls outside 70%–90% THEN the test suite SHALL fail.

### Requirement 4: Inputs from staff stay trustworthy (found during PBT, see design)
**User story:** As an owner uploading a sales export, I want impossible dates rejected, so that a typo can't skew my guest pattern.

#### Acceptance criteria
1. WHEN a sales export contains a calendar-invalid date (e.g. 2/31) THE SYSTEM SHALL skip that row instead of rolling it into the next month.
