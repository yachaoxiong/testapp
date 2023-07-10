import React, { useState, useEffect } from 'react'
import styles from './styles/AppProgressBar.module.css'

export default function AppProgressBar({
  start,
  total = 100,
  forceComplete,
  resetForceComplete,
}) {
  const [completed, setCompleted] = useState(0)

  useEffect(() => {
    if (forceComplete) {
      setCompleted(total)
      resetForceComplete()
      return
    }

    let interval = null
    if (start) {
      interval = setInterval(() => {
        setCompleted((oldCompleted) => {
          if (oldCompleted >= total) {
            clearInterval(interval)
            return total - 1
          } else {
            return oldCompleted + 1 // increase by 1 each time, adjust as necessary
          }
        })
      }, 100) // update every 100ms, adjust as necessary
    } else {
      clearInterval(interval)
      setCompleted(0)
    }
    return () => clearInterval(interval) // clear on component unmount
  }, [start, total, forceComplete])

  const calculatePercentage = () => {
    if (completed <= 0) return 0
    if (completed >= total) return 100
    return (completed / total) * 100
  }

  const percentage = calculatePercentage()

  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loader}>
        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${percentage}%` }}
          >
            <span className={styles.progressIndicator} style={{ left: '100%' }}>
              {parseInt(percentage)}%
              <i className={`fas fa-map-marker ${styles.progressBarIcon}`}></i>
            </span>
          </div>
          <p className={styles.text}>Processing...</p>
        </div>
      </div>
    </div>
  )
}
