import { Suspense } from 'react'
import GruposPage from './GruposPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Carregando configurações…</div>}>
      <GruposPage />
    </Suspense>
  )
}
