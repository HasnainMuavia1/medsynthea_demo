import { AUTH_HERO_FEATURES } from './authHeroData'

export const AuthHeroFeatureList = () => {
  return (
    <ul className="flex flex-col gap-5 short:gap-3">
      {AUTH_HERO_FEATURES.map(({ id, title, description, Icon }) => (
        <li key={id} className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-panel-foreground/10 text-brand-panel-accent">
            <Icon className="size-4.5" aria-hidden />
          </span>
          <div>
            <div className="text-auth-feature font-medium text-brand-panel-foreground">{title}</div>
            <div className="mt-0.5 text-auth-feature-body leading-snug text-brand-panel-foreground/75">
              {description}
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}
