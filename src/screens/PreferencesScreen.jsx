import { useState } from 'react'
import ScreenLayout from '../components/ScreenLayout'
import PrimaryButton from '../components/PrimaryButton'
import './PreferencesScreen.css'

function PreferencesScreen({ formData, updateField, onNext, onBack, onViewHistory, ...rest }) {
  const [time, setTime] = useState(() => {
    if (!formData.maxTravelTime) return { hours: '', minutes: '', seconds: '' }

    const total = Math.round(Number(formData.maxTravelTime) * 60)
    return {
      hours: String(Math.floor(total / 3600)),
      minutes: String(Math.floor((total % 3600) / 60)),
      seconds: String(total % 60),
    }
  })

  const changeTime = (part, value) => {
    const limit = part === 'hours' ? 999 : 59
    const clean = value === '' ? '' : String(Math.min(limit, Math.max(0, Math.floor(Number(value) || 0))))
    const next = { ...time, [part]: clean }
    setTime(next)

    if (next.hours === '' && next.minutes === '' && next.seconds === '') {
      updateField('maxTravelTime', '')
      return
    }

    const totalMinutes =
      Number(next.hours || 0) * 60 +
      Number(next.minutes || 0) +
      Number(next.seconds || 0) / 60

    updateField('maxTravelTime', String(totalMinutes))
  }

  return (
    <ScreenLayout title="Worker Preferences" showBack={true} onBack={onBack} {...rest}>
      <p className="prefs-description">
        Set your travel preferences before entering shift details.
      </p>

      <div className="text-input-group">
        <label className="text-input-label">Preferred Travel Method</label>
        <select
          className="text-input-field"
          value={formData.travelMethod}
          onChange={(e) => updateField('travelMethod', e.target.value)}
        >
          <option value="driving">Driving</option>
          <option value="public transport">Public Transport</option>
          <option value="rideshare">Rideshare</option>
          <option value="cycling">Cycling</option>
          <option value="walking">Walking</option>
        </select>
      </div>

      <p className="text-input-label">Maximum One-Way Travel Time</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
        {[
          ['hours', 'Hours'],
          ['minutes', 'Minutes'],
          ['seconds', 'Seconds'],
        ].map(([part, label]) => (
          <label className="text-input-group" key={part} style={{ minWidth: 0 }}>
            <span className="text-input-label">{label}</span>
            <input
              className="text-input-field"
              style={{ width: '100%', boxSizing: 'border-box' }}
              type="number"
              min="0"
              max={part === 'hours' ? undefined : '59'}
              placeholder="00"
              value={time[part]}
              onChange={(e) => changeTime(part, e.target.value)}
            />
          </label>
        ))}
      </div>

      <PrimaryButton label="Next" onClick={onNext} />
      <PrimaryButton label="View Saved Shifts" onClick={onViewHistory} />
    </ScreenLayout>
  )
}

export default PreferencesScreen