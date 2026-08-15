# Zodiac Symbolic Context — Research + POC Contract

**Declared Source:** Current human instruction (2026-08-15) + cited public research/history sources below  
**Declared By:** @RobynAwesome  
**Declaration Date:** 2026-08-15  
**Validation State:** Pending  
**Implementation State:** POC candidate

## Research question

Can Project Jennifer use a person's self-declared star sign as a useful symbolic and cultural context signal without promoting astrology into deterministic personality truth?

## Cultural finding

The user's memory of a major astrology resurgence in the mid/late 2010s is directionally supported, with the strongest public evidence concentrated in the late 2010s and continuing into the 2020 pandemic period.

- Pew Research Center reported in 2018 that 29% of U.S. adults said they believed in astrology. Pew also found women were more likely than men to endorse each of the four surveyed New Age beliefs; across the four beliefs combined, 70% of women endorsed at least one compared with 55% of men. This supports a gender skew in the broader belief cluster, but does **not** justify the stronger claim that most women believed in astrology specifically.
- A 2018 Guardian report documented rapidly growing millennial horoscope traffic and described astrology vocabulary becoming common among people in their late teens and twenties. It reported that a typical horoscope post at *The Cut* received 150% more hits in the preceding year than in 2016.
- Wired described the internet/social-media transition in 2019 as moving astrology from a specialist subculture into mainstream meme, account and conversation culture.
- By 2021, TIME reported large adoption of astrology apps including Co–Star, The Pattern and Sanctuary, showing that the late-2010s resurgence continued into the pandemic-era app ecosystem.

The research therefore supports **"late-2010s digital astrology resurgence, with notable female participation and continued growth into 2020/21"** more strongly than a precise claim that the boom began in 2014.

## Scientific boundary

Cultural usefulness and predictive validity are different claims.

- Carlson's 1985 *Nature* double-blind study tested whether natal charts could accurately describe personality traits. It remains a major example of controlled testing of astrological personality claims.
- Forer's 1949 personal-validation experiment demonstrated that people can experience generalized personality descriptions as highly personally accurate, a phenomenon now commonly called the Forer/Barnum effect.

Project Jennifer therefore MUST NOT treat a zodiac sign as a validated causal or psychometric personality predictor merely because the archetype feels resonant.

## Jennifer interpretation law

```text
STAR SIGN
!=
PERSONALITY FACT

STAR SIGN
+
CURRENT HUMAN SELF-DESCRIPTION
+
OBSERVED BEHAVIOR
=
OPTIONAL SYMBOLIC CONTEXT
```

Authority order:

```text
current explicit human preference / correction
        >
observed interaction evidence
        >
self-declared zodiac sign
        >
consented conventional date-derived sign
        >
generic zodiac stereotype
```

A zodiac signal is **LOW_SYMBOLIC_CONTEXT**. It may colour reflection, companion flavour, narrative roleplay and conversational framing. It may not determine diagnosis, eligibility, risk, compatibility, relationship outcomes, moral character or factual claims about the user.

## Privacy boundary

Project Jennifer should prefer a self-declared sign over collecting birth data.

If a conventional sun sign is derived from month/day:

1. explicit consent is required;
2. the raw birth-date input is not retained by the zodiac context receipt;
3. the result is marked `birth-date-derived`;
4. the resolver states that it is a popular Western tropical date-range convention, not an astronomical natal-chart calculation.

## POC implementation

Current branch implementation introduces:

- `packages/shared/src/zodiac.ts`
  - 12 Western tropical sun-sign archetypes;
  - element + modality;
  - conventional date ranges;
  - symbolic themes, relational themes and tension themes;
  - explicit epistemic status;
  - conventional month/day resolver.
- `packages/runtime/src/zodiac-context-engine.ts`
  - self-declared sign precedence;
  - birth-date consent gate;
  - no raw birth-date retention in receipts;
  - allowed/prohibited use contract;
  - explicit priority rule that observed behaviour and user preferences outrank zodiac.
- `packages/runtime/src/zodiac-context-engine.test.ts`
  - date-boundary tests;
  - Cancer `home` / `continuity` archetype fixture;
  - consent tests;
  - source-precedence tests;
  - epistemic-boundary assertions.

## POC criteria

The concept earns POC only when repository CI demonstrates:

- shared + runtime TypeScript compilation passes;
- zodiac runtime tests pass;
- self-declared sign overrides conflicting date-derived classification;
- date-derived classification is withheld without consent;
- receipts do not retain raw birth-date input;
- no API in this POC emits deterministic personality, compatibility, diagnosis or risk claims.

## FOC criteria

Treat the implementation as FOC or block promotion if any of the following occur:

- a zodiac stereotype overrides a current human correction or observed behaviour;
- birth-date data is silently collected or persisted through this feature;
- a sign becomes a hidden compatibility/eligibility/risk score;
- the runtime presents zodiac traits as scientifically established personality facts;
- the feature is described as validated before passing tests + governance review.

## Future research lane

Do not jump directly from sun signs to a large natal-chart engine. If the POC survives, evaluate separately:

- user-reported usefulness/resonance of symbolic archetypes;
- whether zodiac vocabulary improves companion conversation without increasing stereotyping;
- moon/rising/chart concepts as explicit opt-in symbolic layers;
- cultural variants of zodiac systems rather than silently universalising Western tropical astrology;
- A/B evaluation against a no-zodiac baseline.

## Sources

1. Pew Research Center (2018), “'New Age' beliefs common among both religious and nonreligious Americans”: https://www.pewresearch.org/short-reads/2018/10/01/new-age-beliefs-common-among-both-religious-and-nonreligious-americans/
2. The Guardian (2018), “Star gazing: why millennials are turning to astrology”: https://www.theguardian.com/global/2018/mar/11/star-gazing-why-millennials-are-turning-to-astrology
3. Wired (2019), “The Internet Changed Astrology. Then Came the Memes”: https://www.wired.com/story/astrology-and-the-internet/
4. TIME (2021), “High-Tech Astrology Apps Claim to Be More Personalized Than Ever”: https://time.com/6083293/astrology-apps-personalized/
5. Carlson, S. (1985), “A double-blind test of astrology,” *Nature* 318, 419–425: https://doi.org/10.1038/318419a0
6. Forer, B. R. (1949), “The fallacy of personal validation; a classroom demonstration of gullibility,” *Journal of Abnormal and Social Psychology* 44(1), 118–123: https://doi.org/10.1037/h0059240
