import './PrimaryButton.css'

function PrimaryButton({ label, onClick, disabled = false }) {
  return (
    <button
      className="primary-button"
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  )
}

export default PrimaryButton
