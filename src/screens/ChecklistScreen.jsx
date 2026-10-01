import { useState } from 'react'
import ScreenLayout from '../components/ScreenLayout'
import PrimaryButton from '../components/PrimaryButton'
import './ChecklistScreen.css'

const CHECKLIST_ITEMS = [
  { key: 'docsReady', label: 'Worker documents ready (ID, certifications, right-to-work)' },
  { key: 'uniformReady', label: 'Uniform and closed-toe shoes packed' },
  { key: 'routePlanned', label: 'Travel route and departure time planned' },
  { key: 'arriveEarly', label: 'Plan to arrive 10 minutes early' },
]

function ChecklistScreen({ formData, updateField, onNext, onBack, ...rest }) {
  const [isSaving, setIsSaving] = useState(false)
  const allChecked = CHECKLIST_ITEMS.every((item) => formData[item.key])

  const handleConfirm = async () => {
    if (isSaving || !allChecked) return

    setIsSaving(true)
    try {
      await onNext()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ScreenLayout
      title="Pre-Shift Checklist"
      showBack={!isSaving}
      onBack={onBack}
      {...rest}
    >
      <p className="cl-desc">
        Tick each item to confirm you are prepared for the shift.
      </p>

      <div className="cl-list">
        {CHECKLIST_ITEMS.map((item) => (
          <label key={item.key} className="cl-item">
            <input
              type="checkbox"
              checked={formData[item.key]}
              onChange={(e) => updateField(item.key, e.target.checked)}
              disabled={isSaving}
              className="cl-checkbox"
            />
            <span className="cl-label">{item.label}</span>
          </label>
        ))}
      </div>

      {!allChecked && (
        <p className="cl-hint">All items must be ticked to confirm.</p>
      )}

      <PrimaryButton
        label={isSaving ? 'Saving…' : 'Confirm Shift Plan'}
        onClick={handleConfirm}
        disabled={!allChecked || isSaving}
      />
    </ScreenLayout>
  )
}

export default ChecklistScreen