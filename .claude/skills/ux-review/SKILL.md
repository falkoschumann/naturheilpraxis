---
name: ux-review
description:
  Reviews UI code or screens for usability against the dialogue principles of
  ISO 9241-110 (heuristic evaluation). Use for reviews of components, forms, and
  flows, or when the user asks for a UX review.
---

# UX Review per ISO 9241-110

Goal: Find usability problems in UI code before users run into them, and propose
concrete, actionable improvements. The yardstick is the dialogue principles of
ISO 9241-110 and the context of use of the application, not personal taste.

## Procedure

1. **Clarify the context of use:** Who uses the feature, what task are they
   trying to accomplish, and in what environment? If unknown, ask briefly before
   evaluating.
2. **Read the affected components/screens.**
3. **Check each principle:**
   - Suitability for the task: Does the UI support the task without unnecessary
     steps?
   - Self-descriptiveness: Is it clear at all times where the user is and what
     is possible?
   - Conformity with user expectations: Consistent with conventions and with the
     rest of the app?
   - Learnability: Is learning supported (hints, examples, sensible defaults)?
   - Controllability: Can the user control pace, order, and cancellation?
   - Use error robustness: Are errors prevented, detected, and easy to correct?
   - User engagement: Is the interaction appealing and motivating?
4. **First-time user walkthrough (optional, for new or rarely used flows):**
   Walk through the flow once more from the perspective of a first-time user
   without prior knowledge. Where do they get stuck, which terms do they not
   understand, which next step is unclear?
5. **Record the findings.**

## Output format

For each finding:

- Location (file/line or screen)
- Affected principle
- Problem
- Severity: critical / serious / minor
- Concrete suggestion for improvement

Sorted by severity. At the end: what is already done well.

## Limits

The result is an expert judgment, not a user test. Mark assumptions about user
behavior as such, and recommend testing with representative users when findings
are uncertain.
