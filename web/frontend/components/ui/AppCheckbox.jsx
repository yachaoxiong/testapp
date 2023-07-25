import React from 'react'
import styles from './styles/AppCheckbox.module.css'

export default function AppCheckbox(props) {
  const { label, checked, onChange } = props
  return (
    <label className={styles.container}>
      <div className={styles.checkLabel}>{label}</div>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className={styles.checkmark}></span>
    </label>
  )
}
