import { useState } from 'react'
import ScreenLayout from '../components/ScreenLayout'
import TextInput from '../components/TextInput'
import PrimaryButton from '../components/PrimaryButton'
import './LoginScreen.css'

function LoginScreen({ onNext }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }
    setError('')
    onNext(email, password)
  }

  return (
    <ScreenLayout title="ShiftReady — Login">
      <p className="login-subtitle">Worker Decision-Support MVP</p>

      {error && <p className="login-error">{error}</p>}

      <TextInput
        label="Email"
        value={email}
        onChange={setEmail}
        type="email"
        placeholder="demo@shiftready.com.au"
      />

      <TextInput
        label="Password"
        value={password}
        onChange={setPassword}
        type="password"
        placeholder="Enter password"
      />

      <PrimaryButton label="Log In" onClick={handleLogin} />
    </ScreenLayout>
  )
}

export default LoginScreen
