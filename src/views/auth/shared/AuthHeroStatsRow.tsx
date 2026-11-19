import { AUTH_HERO_STATS, AUTH_HERO_TRUST_NOTE } from './authHeroData'

export const AuthHeroStatsRow = () => {
  return (
    <div className="grid grid-cols-2 gap-x-3.5 gap-y-2 rounded-2xl border border-brand-panel-foreground/10 bg-brand-panel/55 p-3.5 backdrop-blur-md sm:grid-cols-4">
      {AUTH_HERO_STATS.map(({ id, value, label }) => (
        <div key={id}>
          <div className="font-mono text-auth-stat font-medium tracking-tight text-brand-panel-foreground">
            {value}
          </div>
          <div className="mt-0.5 text-2xs text-brand-panel-foreground/70">{label}</div>
        </div>
      ))}
      <div className="col-span-2 flex flex-col justify-center sm:col-span-1">
        <p className="text-2xs leading-snug text-brand-panel-foreground/90">
          {AUTH_HERO_TRUST_NOTE[0]}
          <br />
          {AUTH_HERO_TRUST_NOTE[1]}
        </p>
      </div>
    </div>
  )
}
