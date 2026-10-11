import { useRef, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import ScreenLayout from '../components/ScreenLayout'
import TextInput from '../components/TextInput'
import PrimaryButton from '../components/PrimaryButton'
import './LoginScreen.css'

function LoginScreen({ onNext }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)

  const switchMode = () => {
    if (busyRef.current) return

    setIsSignUp((previous) => !previous)
    setPassword('')
    setConfirmPassword('')
    setMessage('')
  }

  const handleAuth = async () => {
    if (busyRef.current) return

    const cleanEmail = email.trim()

    if (!cleanEmail || !password) {
      setMessage('Please enter your email and password.')
      return
    }

    if (isSignUp && password !== confirmPassword) {
      setMessage('Your passwords do not match. Please check them.')
      return
    }

    busyRef.current = true
    setBusy(true)
    setMessage('')

    try {
      const { data, error } = isSignUp
        ? await supabase.auth.signUp({
          email: cleanEmail,
          password,
        })
        : await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        })

      if (error) {
        setMessage(error.message)
        return
      }

      if (data.session && data.user) {
        onNext(data.user.email)
        return
      }

      if (isSignUp) {
        setIsSignUp(false)
        setPassword('')
        setConfirmPassword('')
        setMessage(
          'Check your inbox and spam folder for a confirmation email. Confirm your email, then log in. If you already have an account, log in with your existing password.'
        )
      } else {
        setMessage('Login could not be completed. Please try again.')
      }
    } catch {
      setMessage(
        'Unable to connect. Please check your internet connection and try again.'
      )
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  return (
    <ScreenLayout
      title={isSignUp ? 'ShiftReady — Sign Up' : 'ShiftReady — Login'}
    >
      <p className="login-subtitle">
        {isSignUp
          ? 'Create an account to plan and save your shifts.'
          : 'Worker Decision-Support MVP'}
      </p>

      {message && (
        <p className="login-error" role="status">
          {message}
        </p>
      )}

      <form
        onSubmit={(event) => {
          event.preventDefault()
          handleAuth()
        }}
      >
        <fieldset
          disabled={busy}
          style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
        >
          <TextInput
            label="Email"
            value={email}
            onChange={setEmail}
            type="email"
          />

          <TextInput
            label={isSignUp ? 'Choose a password' : 'Password'}
            value={password}
            onChange={setPassword}
            type="password"
          />

          {isSignUp && (
            <TextInput
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              type="password"
            />
          )}

          <PrimaryButton
            label={
              busy
                ? 'Please wait...'
                : isSignUp
                  ? 'Sign Up'
                  : 'Log In'
            }
            disabled={busy}
            onClick={(event) => {
              event?.preventDefault()
              handleAuth()
            }}
          />

          <p style={{ marginTop: '16px', textAlign: 'center' }}>
            {isSignUp ? 'Already have an account? ' : 'New to ShiftReady? '}
            <button
              type="button"
              disabled={busy}
              onClick={switchMode}
              style={{
                background: 'none',
                border: 0,
                color: '#287c7e',
                textDecoration: 'underline',
                cursor: busy ? 'wait' : 'pointer',
                font: 'inherit',
                padding: '4px',
              }}
            >
              {isSignUp ? 'Log In' : 'Create account'}
            </button>
          </p>
        </fieldset>
      </form>
    </ScreenLayout>
  )
}

export default LoginScreen