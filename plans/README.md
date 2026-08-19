# Animation Improvement Plans

Audit source: `improve-animations` skill, findings vetted at commit 688a546.

## Plans

| # | Title | Severity | Status |
|---|-------|----------|--------|
| 001 | Make the shelf goTo() tween interruptible | HIGH | TODO |

## Recommended execution order

1. **001** — standalone, no dependencies. Highest felt impact (flagship shelf interaction).

## Dependencies

None. 001 does not touch the ScrollTrigger/snap config, so findings 10 (mobile snap fallback) and 11 (per-frame setState) — should they ever be planned — remain independent.