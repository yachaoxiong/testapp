import React, { useState } from 'react'
import styles from './styles/OutputBar.module.css'

export default function OutputBar(props) {
  const { outputPath, setShowOutputBar } = props
  const [isCopied, setIsCopied] = useState(false)
  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputPath)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  return (
    <div className={styles.outputBar}>
      <h4>{outputPath}</h4>
      {isCopied && <p className={styles.copied}>Copied to clipboard!</p>}
      <div>
        <i
          className={`${styles.copy} fas fa-copy`}
          onClick={copyToClipboard}
        ></i>
      </div>
      <i
        className={`${styles.close} fas fa-times`}
        onClick={setShowOutputBar}
      ></i>
    </div>
  )
}
