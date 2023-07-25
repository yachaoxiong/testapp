import React from 'react'
import styles from './style/TabBtn.module.css'

export default function TabBtn({ tabValue, setTabValue, clearOutputPath }) {
  const buttons = [
    { value: 'tireForm', imgSrc: '../assets/tire.png', label: 'Tire' },
    {
      value: 'accessoriesForm',
      imgSrc: '../assets/gear.png',
      label: 'Accessories',
    },
    { value: 'wheelsForm', imgSrc: '../assets/wheelcon.png', label: 'Wheel' },
    { value: 'task', imgSrc: '../assets/task.png', label: 'Tasks' },
    { value: 'outputList', imgSrc: '../assets/list.png', label: 'Output List' },
  ]

  const handleTabChange = (value) => {
    setTabValue(value)
    clearOutputPath()
  }

  return (
    <div className={styles.tabButtons}>
      {buttons.map(({ value, imgSrc, label }) => (
        <button
          key={value}
          className={`${styles.tabBtn} ${
            tabValue === value ? styles.active : ''
          }`}
          onClick={() => handleTabChange(value)}
        >
          <img
            src={imgSrc}
            alt={label}
            className={styles.wheelIcon}
            width="100px"
            height="100px"
          />
          {label}
        </button>
      ))}
    </div>
  )
}
