import React from 'react'
import styles from './styles/PageLoader.module.css'

export default function PageLoader({ loading }) {
  return loading ? (
    <div className={styles.loadingContainer}>
      <div className={styles.pageLoader}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  ) : (
    <></>
  )
}
