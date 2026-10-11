import { useId, useState } from 'react'
import './TextInput.css'

function TextInput({ label, value, onChange, type = 'text', placeholder = '' }) {
  const id = useId()
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="text-input-group">
      <label className="text-input-label" htmlFor={id}>
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        <input
          id={id}
          className="text-input-field"
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            ...(isPassword ? { paddingRight: '52px' } : {}),
          }}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
            aria-controls={id}
            aria-pressed={showPassword}
            title={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              padding: 0,
              background: 'transparent',
              border: 'none',
              color: '#287779',
              cursor: 'pointer',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
              {showPassword && <path d="M3 3 21 21" />}
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default TextInput