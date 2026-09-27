import { useId } from 'react'
import './TextInput.css'

function TextInput({ label, value, onChange, type = 'text', placeholder = '' }) {
  const id = useId()

  return (
    <div className="text-input-group">
      <label className="text-input-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="text-input-field"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
    </div>
  )
}

export default TextInput
