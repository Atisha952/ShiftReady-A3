import { useEffect, useState } from 'react'
import ScreenLayout from '../components/ScreenLayout'
import PrimaryButton from '../components/PrimaryButton'
import { supabase } from '../lib/supabaseClient'

function HistoryScreen({ onBack }) {
    const [shifts, setShifts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadShifts()
    }, [])

    async function loadShifts() {
        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                throw new Error('Please log in again.')
            }

            const response = await fetch('http://127.0.0.1:8000/shifts', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.detail || 'Could not load saved shifts.')
            }

            setShifts(Array.isArray(result) ? result : result.shifts || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ScreenLayout title="Saved Shifts">
            {loading && <p>Loading your saved shifts...</p>}

            {error && <p>{error}</p>}

            {!loading && !error && shifts.length === 0 && (
                <p>You have no saved shifts yet.</p>
            )}

            {shifts.map((shift) => (
                <div key={shift.id}>
                    <h3>{shift.facility}</h3>
                    <p>{shift.shift_date}</p>
                    <p>{shift.start_time || shift.shift_start} – {shift.end_time || shift.shift_end}</p>
                    <p>Hourly pay: ${shift.hourly_rate || shift.hourly_pay}</p>
                </div>
            ))}

            <PrimaryButton label="Back to Confirmation" onClick={onBack} />
        </ScreenLayout>
    )
}

export default HistoryScreen