/**
 * Canonical marketing typography — Landing, Solutions, Explore, and Agents
 * must compose these tokens (do not invent ad-hoc clamps / accent colors).
 */
export const marketingType = {
  heroTitle: 'text-marketing-display font-semibold leading-none tracking-display text-foreground',
  heroAccent: 'not-italic text-primary',
  heroBody:
    'mx-auto mt-4 max-w-155 text-base leading-normal text-muted-foreground sm:mt-5.5 sm:text-lg',
  heroBodyStart:
    'mt-4 max-w-135 text-base leading-normal text-muted-foreground sm:mt-5.5 sm:text-lg',
  sectionTitle: 'text-marketing-section font-semibold tracking-tight text-foreground',
  sectionDescription: 'mt-3.5 max-w-3xl text-base leading-relaxed text-muted-foreground',
  sectionDescriptionCenter:
    'mx-auto mt-3.5 max-w-copy text-center text-base leading-relaxed text-muted-foreground',
  ctaTitle: 'text-marketing-cta font-semibold leading-tight tracking-tight text-foreground',
  ctaBody: 'mx-auto mt-3.5 max-w-2xl text-base leading-relaxed text-muted-foreground',
  cardTitle: 'text-md font-semibold leading-tight tracking-tight text-foreground',
  cardBody: 'mt-2 text-base leading-relaxed text-muted-foreground',
  trustBadges: 'text-sm text-muted-foreground',
} as const
