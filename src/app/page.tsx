'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader } from '@/components/shared/Loader/Loader'
import { useDemoStore } from '@/demo/store'

const Home = () => {
  const router = useRouter()
  const authed = useDemoStore((s) => s.authed)

  useEffect(() => {
    router.replace(authed ? '/dashboard' : '/login')
  }, [authed, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader variant="centered" size="md" label="Loading MedSynthea" />
    </div>
  )
}

export default Home
