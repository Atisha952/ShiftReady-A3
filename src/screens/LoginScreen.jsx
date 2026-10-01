import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ScreenLayout from '../components/ScreenLayout'
import TextInput from '../components/TextInput'
import PrimaryButton from '../components/PrimaryButton'
import './LoginScreen.css'

function LoginScreen({ onNext }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const handleAuth = async (signUp) => {
    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.')
      return
    }

    setBusy(true)
    setMessage('')

    const { data, error } = signUp
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password })

    setBusy(false)

    if (error) {
      setMessage(error.message)
      return
    }

    if (data.session) {
      onNext(data.user.email)
    } else {
      setMessage('Check your email for a confirmation link, then log in.')
    }
  }

  return (
    <ScreenLayout title="ShiftReady — Login">
      <p className="login-subtitle">Worker Decision-Support MVP</p>
      {message && <p className="login-error">{message}</p>}

      <TextInput label="Email" value={email} onChange={setEmail} type="email" />
      <TextInput label="Password" value={password} onChange={setPassword} type="password" />

      <PrimaryButton label={busy ? 'Please wait...' : 'Log In'} onClick={() => handleAuth(false)} />
      <button type="button" disabled={busy} onClick={() => handleAuth(true)}>
        Create account
      </button>
    </ScreenLayout>
  )
}

export default LoginScreen