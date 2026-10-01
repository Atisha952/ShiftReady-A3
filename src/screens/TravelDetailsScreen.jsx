import { useState } from 'react'
import ScreenLayout from '../components/ScreenLayout'
import TextInput from '../components/TextInput'
import PrimaryButton from '../components/PrimaryButton'
import './TravelDetailsScreen.css'

function TravelDetailsScreen({ formData, updateField, onNext, onBack, ...rest }) {
  const [error, setError] = useState('')

  const totalSeconds = Math.round(Number(formData.returnTravelTime || 0) * 3600)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const updateTime = (part, value) => {
    const number = Math.max(0, Math.floor(Number(value) || 0))
    const newHours = part === 'hours' ? number : hours
    const newMinutes = part === 'minutes' ? Math.min(number, 59) : minutes
    const newSeconds = part === 'seconds' ? Math.min(number, 59) : seconds

    const newTotalSeconds = newHours * 3600 + newMinutes * 60 + newSeconds
    updateField('returnTravelTime', String(newTotalSeconds / 3600))
  }

  const handleNext = () => {
    if (!formData.returnTravelTime || !formData.returnTravelCost) {
      setError('Please enter both return travel time and cost.')
      return
    }
    if (Number(formData.returnTravelTime) < 0 || Number(formData.returnTravelCost) < 0) {
      setError('Values cannot be negative.')
      return
    }
    setError('')
    onNext()
  }

  return (
    <ScreenLayout title="Travel Details" showBack={true} onBack={onBack} {...rest}>
      <p className="travel-desc">
        Enter the total travel time to the shift and back home.
      </p>

      {error && <p className="travel-error">{error}</p>}

      <TextInput
        label="Travel hours"
        value={hours || ''}
        onChange={(value) => updateTime('hours', value)}
        type="number"
      />
      <TextInput
        label="Travel minutes"
        value={minutes || ''}
        onChange={(value) => updateTime('minutes', value)}
        type="number"
      />
      <TextInput
        label="Travel seconds"
        value={seconds || ''}
        onChange={(value) => updateTime('seconds', value)}
        type="number"
      />

      <TextInput
        label="Return Travel Cost ($)"
        value={formData.returnTravelCost}
        onChange={(value) => updateField('returnTravelCost', value)}
        type="number"
        placeholder="e.g. 12.00"
      />

      <PrimaryButton label="Calculate Shift Value" onClick={handleNext} />
    </ScreenLayout>
  )
}

export default TravelDetailsScreen