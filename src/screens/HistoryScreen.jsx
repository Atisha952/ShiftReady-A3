import { useEffect, useRef, useState } from 'react'
import ScreenLayout from '../components/ScreenLayout'
import PrimaryButton from '../components/PrimaryButton'
import { supabase } from '../lib/supabaseClient'

function HistoryScreen({ onBack, backLabel, onLogout }) {
    const [shifts, setShifts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const requestRef = useRef(null)
    const mountedRef = useRef(false)

    useEffect(() => {
        mountedRef.current = true
        loadShifts()

        return () => {
            mountedRef.current = false
            requestRef.current?.abort()
        }
    }, [])

    async function loadShifts() {
        requestRef.current?.abort()

        const controller = new AbortController()
        requestRef.current = controller
        setLoading(true)
        setError('')

        let timeout

        try {
            const { data: { session }, error: sessionError } =
                await supabase.auth.getSession()

            if (sessionError || !session) {
                throw new Error('Please log in again.')
            }

            if (!mountedRef.current || requestRef.current !== controller) return

            timeout = window.setTimeout(() => controller.abort(), 90_000)

            const response = await fetch('https://shiftready-a3.onrender.com/shifts', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
                signal: controller.signal,
            })

            let result
            try {
                result = await response.json()
            } catch {
                throw new Error(
                    response.ok
                        ? 'Saved Shifts returned an invalid response. Please try again.'
                        : 'Saved Shifts is temporarily unavailable. Please try again.'
                )
            }

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error('Please sign in again.')
                }
                throw new Error(
                    result?.detail || 'Could not load saved shifts. Please try again.'
                )
            }

            const savedShifts = Array.isArray(result)
                ? result
                : Array.isArray(result?.shifts)
                    ? result.shifts
                    : []

            if (mountedRef.current && requestRef.current === controller) {
                setShifts(savedShifts)
            }
        } catch (err) {
            if (!mountedRef.current || requestRef.current !== controller) return

            setShifts([])
            setError(
                err.name === 'AbortError'
                    ? 'Saved Shifts took too long to load. Check your connection and try again.'
                    : err.message || 'Could not load saved shifts. Please try again.'
            )
        } finally {
            window.clearTimeout(timeout)
            if (mountedRef.current && requestRef.current === controller) {
                requestRef.current = null
                setLoading(false)
            }
        }
    }

    return (
        <ScreenLayout title="Saved Shifts" onLogout={onLogout}>
            {loading && <p>Loading your saved shifts...</p>}

            {!loading && error && (
                <>
                    <p>{error}</p>
                    <PrimaryButton label="Retry" onClick={loadShifts} />
                </>
            )}

            {!loading && !error && shifts.length === 0 && (
                <p>You have no saved shifts yet.</p>
            )}

            {!loading && !error && shifts.map((shift) => (
                <div key={shift.id}>
                    <h3>{shift.facility}</h3>
                    <p>{shift.shift_date}</p>
                    <p>{shift.start_time || shift.shift_start} – {shift.end_time || shift.shift_end}</p>
                    <p>Hourly pay: ${shift.hourly_rate || shift.hourly_pay}</p>
                </div>
            ))}

            <PrimaryButton label={backLabel || 'Back'} onClick={onBack} />
        </ScreenLayout>
    )
}

export default HistoryScreen