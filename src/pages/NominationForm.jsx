import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPageUrl } from '@/utils'

export default function NominationForm() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(createPageUrl('Spotlight Awards'), { replace: true })
  }, [navigate])
  return null
}
