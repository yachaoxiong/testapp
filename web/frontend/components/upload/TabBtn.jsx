import React from 'react'
import styles from './style/TabBtn.module.css'

export default function TabBtn(props) {
  const { tabValue, setTabValue } = props
  return (
    <div className={styles.tabButtons}>
      <button
        className={`${styles.tabBtn} ${
          tabValue === 'tireForm' ? styles.active : ''
        }`}
        onClick={() => setTabValue('tireForm')}
      >
        <img
          src="../assets/tire.png"
          alt="wheel"
          className="wheel-icon"
          width="100px"
          height="100px"
        />
        Tire
      </button>
      <button
        className={`${styles.tabBtn} ${
          tabValue === 'accessoriesForm' ? styles.active : ''
        }`}
        onClick={() => setTabValue('accessoriesForm')}
      >
        <img
          src="../assets/gear.png"
          alt="wheel"
          className="wheel-icon"
          width="100px"
          height="100px"
        />
        Accessories
      </button>
      <button
        className={`${styles.tabBtn} ${
          tabValue === 'wheelsForm' ? styles.active : ''
        }`}
        onClick={() => setTabValue('wheelsForm')}
      >
        <img
          src="../assets/wheelcon.png"
          alt="wheel"
          className={styles.wheelIcon}
          width="100px"
          height="100px"
        />
        Wheel
      </button>
      <button
        className={`${styles.tabBtn} ${
          tabValue === 'task' ? styles.active : ''
        }`}
        onClick={() => setTabValue('task')}
      >
        <img
          src="../assets/task.png"
          alt="wheel"
          className={styles.wheelIcon}
          width="100px"
          height="100px"
        />
        Tasks
      </button>
    </div>
  )
}
