import { useEffect, useRef, useState } from 'react'
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
  travelMethod: 'public transport',
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

const DRAFT_STORAGE_KEY = 'shiftready.shift-draft.v1'
const DRAFT_VERSION = 1
const RESUMABLE_STEPS = new Set([1, 2, 3, 4, 5])
const TRAVEL_METHODS = new Set([
  'driving',
  'public transport',
  'rideshare',
  'cycling',
  'walking',
])
const SAFE_STRING_FIELDS = [
  'facility',
  'shiftDate',
  'shiftStart',
  'shiftEnd',
]
const SAFE_NUMBER_FIELDS = [
  'maxTravelTime',
  'hourlyPay',
  'returnTravelTime',
  'returnTravelCost',
]
const SAFE_BOOLEAN_FIELDS = [
  'docsReady',
  'uniformReady',
  'routePlanned',
  'arriveEarly',
]

const clearStoredDraft = () => {
  try {
    window.sessionStorage.removeItem(DRAFT_STORAGE_KEY)
  } catch {
    // Storage can be unavailable or disabled; recovery is optional.
  }
}

const readStoredDraft = () => {
  try {
    const storedDraft = window.sessionStorage.getItem(DRAFT_STORAGE_KEY)
    return storedDraft ? JSON.parse(storedDraft) : null
  } catch {
    clearStoredDraft()
    return null
  }
}

const isSafeString = (value) => typeof value === 'string' && value.length <= 500
const isSafeNumberString = (value) =>
  isSafeString(value) && (value === '' || (Number.isFinite(Number(value)) && Number(value) >= 0))

const validateStoredDraft = (draft, userId) => {
  if (!draft || typeof draft !== 'object' || Array.isArray(draft)) return null
  if (draft.version !== DRAFT_VERSION || draft.userId !== userId) return null
  if (!draft.formData || typeof draft.formData !== 'object' || Array.isArray(draft.formData)) {
    return null
  }

  const isHistoryRecovery =
    draft.currentStep === 7 && [1, 5].includes(draft.historyReturnStep)
  if (!RESUMABLE_STEPS.has(draft.currentStep) && !isHistoryRecovery) return null
  if (!TRAVEL_METHODS.has(draft.formData.travelMethod)) return null
  if (!SAFE_STRING_FIELDS.every((field) => isSafeString(draft.formData[field]))) return null
  if (!SAFE_NUMBER_FIELDS.every((field) => isSafeNumberString(draft.formData[field]))) return null
  if (!SAFE_BOOLEAN_FIELDS.every((field) => typeof draft.formData[field] === 'boolean')) {
    return null
  }

  return {
    currentStep: draft.currentStep,
    historyReturnStep: isHistoryRecovery ? draft.historyReturnStep : 6,
    formData: {
      ...INITIAL_FORM,
      travelMethod: draft.formData.travelMethod,
      ...Object.fromEntries(SAFE_STRING_FIELDS.map((field) => [field, draft.formData[field]])),
      ...Object.fromEntries(SAFE_NUMBER_FIELDS.map((field) => [field, draft.formData[field]])),
      ...Object.fromEntries(SAFE_BOOLEAN_FIELDS.map((field) => [field, draft.formData[field]])),
    },
  }
}

function App() {
  const [currentStep, setCurrentStep] = useState(0)
  const [historyReturnStep, setHistoryReturnStep] = useState(6)
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [authenticatedUser, setAuthenticatedUser] = useState(null)
  const [isRecovering, setIsRecovering] = useState(true)
  const savingRef = useRef(false)

  const restoreDraftForUser = (user) => {
    const draft = validateStoredDraft(readStoredDraft(), user.id)

    if (!draft) {
      clearStoredDraft()
      setFormData({ ...INITIAL_FORM, email: user.email || '' })
      setHistoryReturnStep(6)
      setCurrentStep(1)
      return
    }

    setFormData({ ...draft.formData, email: user.email || '' })
    setHistoryReturnStep(draft.historyReturnStep)
    setCurrentStep(draft.currentStep)
  }

  useEffect(() => {
    let active = true

    const restoreAuthenticatedSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        clearStoredDraft()
        if (active) setIsRecovering(false)
        return
      }

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        clearStoredDraft()
        if (active) setIsRecovering(false)
        return
      }

      if (active) {
        setAuthenticatedUser(user)
        restoreDraftForUser(user)
        setIsRecovering(false)
      }
    }

    restoreAuthenticatedSession().catch(() => {
      clearStoredDraft()
      if (active) setIsRecovering(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        clearStoredDraft()
        savingRef.current = false
        setAuthenticatedUser(null)
        setFormData(INITIAL_FORM)
        setHistoryReturnStep(6)
        setCurrentStep(0)
        setIsRecovering(false)
      }
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (isRecovering || !authenticatedUser) return

    const canResumeHistory = currentStep === 7 && [1, 5].includes(historyReturnStep)
    if (!RESUMABLE_STEPS.has(currentStep) && !canResumeHistory) {
      clearStoredDraft()
      return
    }

    const safeFormData = {
      travelMethod: formData.travelMethod,
      ...Object.fromEntries(SAFE_STRING_FIELDS.map((field) => [field, formData[field]])),
      ...Object.fromEntries(SAFE_NUMBER_FIELDS.map((field) => [field, formData[field]])),
      ...Object.fromEntries(SAFE_BOOLEAN_FIELDS.map((field) => [field, formData[field]])),
    }

    try {
      window.sessionStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          version: DRAFT_VERSION,
          userId: authenticatedUser.id,
          currentStep,
          historyReturnStep: canResumeHistory ? historyReturnStep : 6,
          formData: safeFormData,
        })
      )
    } catch {
      // Storage can be unavailable or full; saving a shift must still work.
    }
  }, [authenticatedUser, currentStep, formData, historyReturnStep, isRecovering])

  /* Update a single field in formData */
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  /* Reset everything and go back to login */
  const handleRestart = () => {
    clearStoredDraft()
    setFormData(INITIAL_FORM)
    setHistoryReturnStep(6)
    setCurrentStep(0)
  }

  /* ---- Step 0: Login ---- */
  const handleLogin = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      alert('Please log in again.')
      return
    }

    setAuthenticatedUser(user)
    restoreDraftForUser(user)
  }

  const handleLogout = async () => {
    clearStoredDraft()
    savingRef.current = false
    setAuthenticatedUser(null)
    setFormData(INITIAL_FORM)
    setHistoryReturnStep(6)
    setCurrentStep(0)

    const { error } = await supabase.auth.signOut()
    if (error) alert('Could not log out. Please try again.')
  }

  /* ---- Navigation helpers ---- */
  const goNext = () => setCurrentStep((step) => step + 1)
  const goBack = () => setCurrentStep((step) => Math.max(0, step - 1))
  const handleSaveShift = async () => {
    if (savingRef.current) return
    savingRef.current = true
    let saveTimeout

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

      const controller = new AbortController()
      saveTimeout = window.setTimeout(() => controller.abort(), 90_000)
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
          signal: controller.signal,
        }
      )

      if (!response.ok) {
        let message = 'Please try again.'

        try {
          const result = await response.json()
          message = result.detail || message
        } catch {
          // Some platform errors, such as a Render 503 page, are not JSON.
        }

        alert(`Could not save shift: ${message}`)
        return
      }

      clearStoredDraft()
      setCurrentStep(6)
    } catch (error) {
      if (error.name === 'AbortError') {
        alert(
          'Saving took longer than expected. Please check Saved Shifts before retrying, as your shift may have been saved.'
        )
        setHistoryReturnStep(5)
        setCurrentStep(7)
        return
      }

      alert('Could not connect to the server. Please try again.')
    } finally {
      window.clearTimeout(saveTimeout)
      savingRef.current = false
    }
  }
  const renderScreen = () => {
    /* Stepper props: only shown on steps 1–6 (not Login) */
    const stepperProps =
      currentStep >= 1 && currentStep <= 6
        ? {
          steps: STEP_LABELS,
          currentStepIndex: currentStep - 1,
          onLogout: handleLogout,
        }
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
            onViewHistory={() => {
              setHistoryReturnStep(1)
              setCurrentStep(7)
            }}
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
            onViewHistory={() => {
              setHistoryReturnStep(6)
              setCurrentStep(7)
            }}
            {...stepperProps}
          />
        )

      case 7:
        return (
          <HistoryScreen
            onBack={() => setCurrentStep(historyReturnStep)}
            backLabel={
              historyReturnStep === 1
                ? 'Back to Preferences'
                : historyReturnStep === 5
                  ? 'Back to Checklist'
                  : 'Back to Confirmation'
            }
            onLogout={handleLogout}
          />
        )

      default:
        return <LoginScreen onNext={handleLogin} />
    }
  }

  if (isRecovering) {
    return <div className="app-container">Restoring your session…</div>
  }

  return <div className="app-container">{renderScreen()}</div>
}

export default App
