import React from 'react'
import styles from './style/List.module.css'
import moment from 'moment'
export default function ListItem(props) {
  const { item } = props
  const [isCopied, setIsCopied] = React.useState(false)
  const remotePath = '/home/sftpuser/uploads/'
  // check modifyTime is less than 5 minutes ago
  const isRecent = new Date() - new Date(item?.modifyTime) < 5 * 60 * 1000
  const copyToClipboard = () => {
    navigator.clipboard.writeText(remotePath + item?.name)
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 1000)
  }

  return (
    <div className={styles.itemContainer}>
      <h4>
        {item?.name} <span>{moment(item?.modifyTime).fromNow()}</span>
      </h4>
      {isRecent && <span className={styles.recent}>new</span>}
      {isCopied && <span className={styles.copied}>Copied!</span>}
      <i className="fas fa-copy" onClick={copyToClipboard}></i>
    </div>
  )
}
