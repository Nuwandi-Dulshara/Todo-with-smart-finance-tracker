import { Pause, Play, RotateCcw, Square } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'

const focusSeconds = 25 * 60
const breakSeconds = 5 * 60

const formatTimer = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

function TimeManage({ tasks, refreshKey, error, onUpdateTaskTime }) {
  const availableTasks = useMemo(() => tasks.filter((task) => task.status !== 'Completed'), [tasks])
  const [selectedTaskId, setSelectedTaskId] = useState(availableTasks[0]?.id || '')
  const [mode, setMode] = useState('focus')
  const [secondsLeft, setSecondsLeft] = useState(focusSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [spentSeconds, setSpentSeconds] = useState(0)
  const [summary, setSummary] = useState(null)
  const [pageError, setPageError] = useState('')

  const activeTaskId = selectedTaskId || availableTasks[0]?.id || ''
  const selectedTask = tasks.find((task) => task.id === activeTaskId)

  useEffect(() => {
    let isMounted = true
    Promise.resolve()
      .then(() => {
        if (!isMounted) return null
        setPageError('')
        return api.getTimeSummary()
      })
      .then((data) => {
        if (isMounted) setSummary(data)
      })
      .catch((requestError) => {
        if (isMounted) setPageError(requestError.message || 'Unable to connect to TaskFlow server.')
      })
    return () => {
      isMounted = false
    }
  }, [refreshKey])

  useEffect(() => {
    if (!isRunning) return undefined
    const timer = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setIsRunning(false)
          setSessions((value) => value + (mode === 'focus' ? 1 : 0))
          return 0
        }
        return current - 1
      })
      if (mode === 'focus') setSpentSeconds((current) => current + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [isRunning, mode])

  const selectMode = (nextMode) => {
    setMode(nextMode)
    setIsRunning(false)
    setSecondsLeft(nextMode === 'focus' ? focusSeconds : breakSeconds)
  }

  const stopTimer = async () => {
    const elapsedSeconds = mode === 'focus' ? focusSeconds - secondsLeft : 0
    setIsRunning(false)
    setSessions((value) => value + (mode === 'focus' && secondsLeft < focusSeconds ? 1 : 0))
    setSecondsLeft(mode === 'focus' ? focusSeconds : breakSeconds)
    if (selectedTask && elapsedSeconds > 0) {
      await onUpdateTaskTime(selectedTask.id, selectedTask.spentMinutes + Math.ceil(elapsedSeconds / 60))
    }
  }

  return (
    <div className="page-grid">
      <section className="page-hero">
        <div>
          <p className="eyebrow">Time Manage</p>
          <h1>Protect a focused block.</h1>
        </div>
      </section>
      {(error || pageError) && <div className="app-message error-message">{error || pageError}</div>}

      <section className="timer-layout">
        <div className="panel timer-panel">
          <div className="segmented">
            <button className={mode === 'focus' ? 'active' : ''} type="button" onClick={() => selectMode('focus')}>
              Focus Timer
            </button>
            <button className={mode === 'break' ? 'active' : ''} type="button" onClick={() => selectMode('break')}>
              Short Break
            </button>
          </div>
          <div className="timer-face">{formatTimer(secondsLeft)}</div>
          <div className="timer-actions">
            <button className="primary-button" type="button" onClick={() => setIsRunning(true)} disabled={isRunning}>
              <Play size={18} />
              {secondsLeft === (mode === 'focus' ? focusSeconds : breakSeconds) ? 'Start' : 'Resume'}
            </button>
            <button className="secondary-button" type="button" onClick={() => setIsRunning(false)} disabled={!isRunning}>
              <Pause size={18} />
              Pause
            </button>
            <button className="secondary-button" type="button" onClick={stopTimer}>
              <Square size={17} />
              Stop
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                setIsRunning(false)
                setSecondsLeft(mode === 'focus' ? focusSeconds : breakSeconds)
              }}
            >
              <RotateCcw size={17} />
              Reset
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="section-head">
            <div>
              <p className="eyebrow">Current Task</p>
              <h2>{selectedTask?.title || 'No task selected'}</h2>
            </div>
          </div>
          <label className="field-stack">
            Select a task
            <select value={activeTaskId} onChange={(event) => setSelectedTaskId(event.target.value)}>
              {availableTasks.map((task) => (
                <option value={task.id} key={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </label>
          <div className="focus-summary">
            <div>
              <span>Time spent today</span>
              <strong>{formatTimer((summary?.total_spent_minutes ?? 0) * 60 + spentSeconds)}</strong>
            </div>
            <div>
              <span>Focus sessions</span>
              <strong>{sessions}</strong>
            </div>
            <div>
              <span>Daily focus summary</span>
              <strong>
                {summary?.remaining_minutes
                  ? `${summary.remaining_minutes} minutes remaining`
                  : sessions > 0
                    ? 'Momentum building'
                    : 'Ready to begin'}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TimeManage
