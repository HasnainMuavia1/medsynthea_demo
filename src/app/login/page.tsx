'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/views/auth/shared/AuthLayout'
import { authUi } from '@/views/auth/shared/auth-ui'
import { Button } from '@/components/shared/Button'
import { Checkbox } from '@/components/shared/Checkbox'
import { Input } from '@/components/shared/Input/Input'
import { ArrowRight, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from '@/components/ui/Landing/LandingIcons'
import { useDemoStore } from '@/demo/store'

const LoginPage = () => {
  const router = useRouter()
  const login = useDemoStore((s) => s.login)
  const authed = useDemoStore((s) => s.authed)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (authed) router.replace('/dashboard')
  }, [authed, router])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Enter your work email and password.')
      return
    }
    setPending(true)
    window.setTimeout(() => {
      if (login(email, password)) {
        router.replace('/dashboard')
      } else {
        setPending(false)
        setError('Invalid email or password.')
      }
    }, 700)
  }

  return (
    <AuthLayout
      seo={{ title: 'Sign In', description: 'Sign in to MedSynthea', path: '/login' }}
      eyebrow="Welcome to MedSynthea"
      title="Sign in to your workspace"
      description="Access your personalized workspace and let our AI agents handle the revenue cycle."
      pending={pending ? { label: 'Signing in…', description: 'Loading your workspace' } : null}
    >
      <title>Sign in | MedSynthea</title>
      <form className={authUi.form} onSubmit={handleSubmit} noValidate>
        <div className={authUi.field}>
          <label htmlFor="email" className={authUi.label}>
            Work email
          </label>
          <div className="relative">
            <MailIcon className={authUi.fieldIcon} aria-hidden />
            <Input
              className={authUi.inputWithIcon}
              id="email"
              type="email"
              placeholder="you@yourpractice.com"
              autoComplete="email"
              autoFocus
              hasError={Boolean(error)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        <div className={authUi.field}>
          <label htmlFor="password" className={authUi.label}>
            Password
          </label>
          <div className="relative">
            <LockIcon className={authUi.fieldIcon} aria-hidden />
            <Input
              className={authUi.inputWithIconAndToggle}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              hasError={Boolean(error)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={authUi.passwordToggle}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </Button>
          </div>
          {error ? (
            <div className={authUi.error} role="alert">
              {error}
            </div>
          ) : null}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap text-base text-muted-foreground">
          <Checkbox defaultChecked className="size-3.75" />
          Remember me on this device
        </label>
        <Button className={authUi.submit} type="submit" variant="primary" size="lg" disabled={pending}>
          Sign in to workspace
          <ArrowRight className="size-3.5 shrink-0" aria-hidden />
        </Button>
      </form>

    </AuthLayout>
  )
}

export default LoginPage
