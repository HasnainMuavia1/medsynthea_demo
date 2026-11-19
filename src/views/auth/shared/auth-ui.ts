export const authUi = {
  form: 'flex w-full flex-col gap-3 short:gap-2.5',
  field: 'flex flex-col gap-1.5',
  label: 'text-sm font-medium text-foreground/80',
  fieldIcon:
    'pointer-events-none absolute top-1/2 left-3 size-3.75 -translate-y-1/2 text-muted-foreground',
  input: 'h-10 short:h-9 bg-card text-sm focus:border-primary focus:ring-primary/20',
  inputWithIcon:
    'h-10 short:h-9 bg-card pl-10 pr-3 text-sm focus:border-primary focus:ring-primary/20',
  inputWithIconAndToggle:
    'h-10 short:h-9 bg-card pl-10 pr-10 text-sm focus:border-primary focus:ring-primary/20',
  passwordToggle:
    'absolute top-1/2 right-1.5 size-8 -translate-y-1/2 transition-[background,color] active:-translate-y-1/2',
  submit: 'h-10 short:h-9 w-full text-base font-medium',
  hint: 'text-xs text-muted-foreground',
  error: 'mt-0.5 text-xs text-destructive',
  link: 'font-medium text-primary hover:underline',
  footerText: 'text-center text-sm text-muted-foreground',
} as const
