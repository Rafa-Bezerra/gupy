import { Suspense } from 'react'
import GruposPage from './GruposPage'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Carregando configurações…</div>}>
      <GruposPage />
    </Suspense>
  )
}
