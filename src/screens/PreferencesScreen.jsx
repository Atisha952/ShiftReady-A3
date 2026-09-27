import ScreenLayout from '../components/ScreenLayout'
import TextInput from '../components/TextInput'
import PrimaryButton from '../components/PrimaryButton'
import './PreferencesScreen.css'

function PreferencesScreen({ formData, updateField, onNext, onBack, ...rest }) {
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

      <TextInput
        label="Maximum One-Way Travel Time (minutes)"
        value={formData.maxTravelTime}
        onChange={(val) => updateField('maxTravelTime', val)}
        type="number"
        placeholder="e.g. 45"
      />

      <PrimaryButton label="Next" onClick={onNext} />
    </ScreenLayout>
  )
}

export default PreferencesScreen
