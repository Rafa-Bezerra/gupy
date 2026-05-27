import { Suspense } from 'react'
import LideresPage from './LideresPage'

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
      <LideresPage />
    </Suspense>
  )
}
