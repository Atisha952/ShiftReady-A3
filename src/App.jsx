import { useState } from 'react'
import LoginScreen from './screens/LoginScreen'
import PreferencesScreen from './screens/PreferencesScreen'
import ShiftDetailsScreen from './screens/ShiftDetailsScreen'
import TravelDetailsScreen from './screens/TravelDetailsScreen'
import ShiftValueScreen from './screens/ShiftValueScreen'
import ChecklistScreen from './screens/ChecklistScreen'
import ConfirmationScreen from './screens/ConfirmationScreen'
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
  const handleLogin = (email, password) => {
    updateField('email', email)
    updateField('password', password)
    setCurrentStep(1)
  }

  /* ---- Navigation helpers ---- */
  const goNext = () => setCurrentStep((s) => s + 1)
  const goBack = () => setCurrentStep((s) => s - 1)

  /* ---- Render the current screen ---- */
  const renderScreen = () => {
    /* Stepper props: only shown on steps 1–6 (not Login) */
    const stepperProps =
      currentStep >= 1
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
            onNext={goNext}
            onBack={goBack}
            {...stepperProps}
          />
        )

      case 6:
        return (
          <ConfirmationScreen
            formData={formData}
            onRestart={handleRestart}
            {...stepperProps}
          />
        )

      default:
        return <LoginScreen onNext={handleLogin} />
    }
  }

  return <div className="app-container">{renderScreen()}</div>
}

export default App
