import { useRef, useState } from 'react'
import LoginScreen from './screens/LoginScreen'
import PreferencesScreen from './screens/PreferencesScreen'
import ShiftDetailsScreen from './screens/ShiftDetailsScreen'
import TravelDetailsScreen from './screens/TravelDetailsScreen'
import ShiftValueScreen from './screens/ShiftValueScreen'
import ChecklistScreen from './screens/ChecklistScreen'
import ConfirmationScreen from './screens/ConfirmationScreen'
import HistoryScreen from './screens/HistoryScreen'
import { supabase } from './lib/supabaseClient'
import './App.css'

const INITIAL_FORM = {
  email: '',
  password: '',
  travelMethod: 'driving',
  maxTravelTime: '',
  facility: '',
  shiftDate: '',
  shiftStart: '',
  shiftEnd: '',
  hourlyPay: '',
  returnTravelTime: '',
  returnTravelCost: '',
  docsReady: false,
  uniformReady: false,
  routePlanned: false,
  arriveEarly: false,
}

/* Step labels for the stepper (currentStep 0 = Login, not shown) */
const STEP_LABELS = [
  'Preferences',
  'Shift Details',
  'Travel Details',
  'Shift Value',
  'Checklist',
  'Confirmation',
]

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const savingRef = useRef(false)

  /* Update a single field in formData */
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  /* Reset everything and go back to login */
  const handleRestart = () => {
    setFormData(INITIAL_FORM)
    setCurrentStep(0)
  }

  /* ---- Step 0: Login ---- */
  const handleLogin = (email) => {
    updateField('email', email)
    setCurrentStep(1)
  }

  /* ---- Navigation helpers ---- */
  const goNext = () => setCurrentStep((step) => step + 1)
  const goBack = () => setCurrentStep((step) => Math.max(0, step - 1))
  const handleSaveShift = async () => {
    if (savingRef.current) return
    savingRef.current = true

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        alert('Please log in again.')
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        alert('Please log in again.')
        return
      }

      const response = await fetch(
        'https://shiftready-a3.onrender.com/shifts',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            facility: formData.facility,
            shift_date: formData.shiftDate,
            shift_start: formData.shiftStart,
            shift_end: formData.shiftEnd,
            hourly_pay: Number(formData.hourlyPay),
            travel_method: formData.travelMethod,
            max_travel_time: Number(formData.maxTravelTime),
            return_travel_time: Number(formData.returnTravelTime),
            return_travel_cost: Number(formData.returnTravelCost),
            docs_ready: formData.docsReady,
            uniform_ready: formData.uniformReady,
            route_planned: formData.routePlanned,
            arrive_early: formData.arriveEarly,
          }),
        }
      )

      if (!response.ok) {
        const result = await response.json()
        alert(`Could not save shift: ${result.detail || 'Please try again.'}`)
        return
      }

      setCurrentStep(6)
    } catch {
      alert('Could not connect to the server. Please try again.')
    } finally {
      savingRef.current = false
    }
  }
  const renderScreen = () => {
    /* Stepper props: only shown on steps 1–6 (not Login) */
    const stepperProps =
      currentStep >= 1 && currentStep <= 6
        ? { steps: STEP_LABELS, currentStepIndex: currentStep - 1 }
        : {}

    switch (currentStep) {
      case 0:
        return <LoginScreen onNext={handleLogin} />

      case 1:
        return (
          <PreferencesScreen
            formData={formData}
            updateField={updateField}
            onNext={goNext}
            onBack={goBack}
            {...stepperProps}
          />
        )

      case 2:
        return (
          <ShiftDetailsScreen
            formData={formData}
            updateField={updateField}
            onNext={goNext}
            onBack={goBack}
            {...stepperProps}
          />
        )

      case 3:
        return (
          <TravelDetailsScreen
            formData={formData}
            updateField={updateField}
            onNext={goNext}
            onBack={goBack}
            {...stepperProps}
          />
        )

      case 4:
        return (
          <ShiftValueScreen
            formData={formData}
            onNext={goNext}
            onBack={goBack}
            {...stepperProps}
          />
        )

      case 5:
        return (
          <ChecklistScreen
            formData={formData}
            updateField={updateField}
            onNext={handleSaveShift}
            onBack={goBack}
            {...stepperProps}
          />
        )

      case 6:
        return (
          <ConfirmationScreen
            formData={formData}
            onRestart={handleRestart}
            onViewHistory={() => setCurrentStep(7)}
            {...stepperProps}
          />
        )

      case 7:
        return <HistoryScreen onBack={() => setCurrentStep(6)} />

      default:
        return <LoginScreen onNext={handleLogin} />
    }
  }

  return <div className="app-container">{renderScreen()}</div>
}

export default App
