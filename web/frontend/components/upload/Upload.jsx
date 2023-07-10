import React, { useState } from 'react'
import styles from './style/Upload.module.css'
import TabBtn from './TabBtn'
import { useAuthenticatedFetch } from '../../hooks'
import AppProgressBar from '../ui/AppProgressBar'

export default function Upload() {
  const [isLoading, setIsLoading] = useState(false)
  const [forceComplete, setForceComplete] = useState(false)
  const [message, setMessage] = useState('')
  const [warning, setWarning] = useState('')
  const [techDataFile, setTechDataFile] = useState(null)
  const [techDataFileName, setTechDataFileName] = useState('')
  const [invDataFile, setInvDataFile] = useState(null)
  const [invDataFileName, setInvDataFileName] = useState('')
  const [tabValue, setTabValue] = useState('tireForm')
  const fetch = useAuthenticatedFetch()

  const formInfo = {
    tireForm: {
      action: '/api/uploadAPI/upload',
      techData: {
        text: 'Drop you tire tech file',
      },
      InvData: {
        text: 'Drop your inventory tire file',
      },
    },
    accessoriesForm: {
      action: '/api/uploadAPI/uploadAccessories',
      techData: {
        text: 'Drop you accessories tech file',
      },
      InvData: {
        text: 'Drop your inventory accessories file',
      },
    },
    wheelsForm: {
      action: '/api/uploadAPI/uploadWheels',
      techData: {
        text: 'Drop you wheels tech file',
      },
      InvData: {
        text: 'Drop your inventory wheels file',
      },
    },
  }
  const handleFiles = (e, setFile, setFileName) => {
    e.preventDefault()
    e.stopPropagation()

    let files

    if (e.type === 'drop') {
      files = e.dataTransfer.files
      e.target.classList.remove(styles.dragover)
    } else {
      files = e.target.files
    }

    if (files.length > 0) {
      // Add the file type validation here
      if (!['application/json', 'text/csv'].includes(files[0].type)) {
        setWarning('Uploaded file must be a JSON or CSV file')
        setTimeout(() => setWarning(''), 3000) // Clear the message after 3 seconds
        return
      }
      setFile(files[0])
      setFileName(files[0].name)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!e.target.classList.contains(styles.dragover)) {
      e.target.classList.add(styles.dragover)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    // Create an instance of FormData
    const formData = new FormData()

    // Validate file types
    if (
      techDataFile &&
      !['application/json', 'text/csv'].includes(techDataFile.type)
    ) {
      setWarning('Tech data file must be a JSON or CSV file')
      return
    }

    if (
      invDataFile &&
      !['application/json', 'text/csv'].includes(invDataFile.type)
    ) {
      setWarning('Inventory data file must be a JSON or CSV file')
      return
    }

    // Append the files to the formData object
    if (techDataFile) {
      formData.append('techData', techDataFile)
    }

    if (invDataFile) {
      formData.append('InvData', invDataFile)
    }
    try {
      // Post the form data to the server
      const response = await fetch(formInfo[tabValue].action, {
        method: 'POST',
        body: formData,
      })

      // If successful, set the success message
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setMessage('File uploaded successfully')
        } else {
          setWarning('File upload failed: ' + data.message)
        }
      } else {
        setWarning('File upload failed')
      }
    } catch (error) {
      console.error('There was an error uploading the file', error)
      setWarning('File upload failed')
    } finally {
      // Clear the file inputs
      setTechDataFile(null)
      setTechDataFileName('')
      setInvDataFile(null)
      setInvDataFileName('')
      setIsLoading(false)

      setForceComplete(true)

      setTimeout(() => {
        setIsLoading(false)
      }, 500)

      setTimeout(() => {
        setMessage('')
        setWarning('')
      }, 3000)
    }
  }

  const processFiles = (url) => {
    setIsLoading(true)

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setMessage(data.message)
        } else {
          setWarning('An error occurred while processing the files')
        }
        setForceComplete(true)

        setTimeout(() => {
          setIsLoading(false)
        }, 500)
        setTimeout(() => {
          setMessage('')
          setWarning('')
        }, 3000)
      })
      .catch((error) => {
        console.error(error)
        setWarning('An error occurred while processing the files')
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
        setTimeout(() => {
          setWarning('')
        }, 3000)
      })
  }
  return (
    <div>
      <h1 className={styles.tagLine}>Just Wheels - Upload Your Files</h1>
      <div className={styles.mainContainer}>
        <div
          className={`${styles.mainContent} animate__animated animate__pulse`}
        >
          <div className={styles.tabContainer}>
            <TabBtn tabValue={tabValue} setTabValue={setTabValue} />
            {message && <div className={styles.successInfo}>{message}</div>}

            {tabValue === 'task' ? (
              <div className={styles.tabContent}>
                <div className={styles.taskButtonsGroup}>
                  <button
                    id="processTireFiles"
                    className={styles.processBtn}
                    onClick={() => processFiles('/api/uploadAPI/process')}
                  >
                    <i className="fas fa-tire"></i> Process Tire
                  </button>
                  <button
                    id="processAccessoriesFiles"
                    className={styles.processBtn}
                    onClick={() =>
                      processFiles('/api/uploadAPI/processAccessories')
                    }
                  >
                    <i className="fas fa-cogs"></i> Process Accessories
                  </button>
                  <button
                    id="processWheelFiles"
                    className={styles.processBtn}
                    onClick={() => processFiles('/api/uploadAPI/processWheels')}
                  >
                    <i className="fal fa-tire"></i> Process Wheel
                  </button>
                </div>
                <h4 className={styles.taskButtonText}>
                  <i className="fas fa-info-circle"></i>Click Button to Start
                  the task
                </h4>
              </div>
            ) : (
              <div className={styles.tabContent}>
                <form
                  className={styles.uploadForm}
                  onSubmit={handleSubmit}
                  encType="multipart/form-data"
                >
                  <div className={styles.uploadContainer}>
                    <label
                      htmlFor="techData"
                      className={styles.uploadLabel}
                      onDrop={(e) =>
                        handleFiles(e, setTechDataFile, setTechDataFileName)
                      }
                      onDragOver={handleDragOver}
                      onDragLeave={(e) =>
                        e.target.classList.remove(styles.dragover)
                      }
                    >
                      <input
                        type="file"
                        name="techData"
                        id="techData"
                        accept=".csv, application/JSON"
                      />
                      <i
                        className={`${styles.uploadIcon} fas fa-file-upload`}
                      ></i>
                      <p className={styles.uploadText}>
                        {techDataFileName || formInfo[tabValue].techData.text}
                      </p>
                    </label>
                    <label
                      htmlFor="InvData"
                      className={styles.uploadLabel}
                      onDrop={(e) =>
                        handleFiles(e, setInvDataFile, setInvDataFileName)
                      }
                      onDragOver={handleDragOver}
                      onDragLeave={(e) =>
                        e.target.classList.remove(styles.dragover)
                      }
                    >
                      <input
                        type="file"
                        name="InvData"
                        id="InvData"
                        accept=".csv,.json"
                        onChange={(e) =>
                          handleFiles(e, setInvDataFile, setInvDataFileName)
                        }
                      />
                      <i
                        className={`${styles.uploadIcon} fas fa-file-upload`}
                      ></i>
                      <p className={styles.uploadText}>
                        {invDataFileName || formInfo[tabValue].InvData.text}
                      </p>
                    </label>
                  </div>
                  {warning && (
                    <div className={styles.warningInfo}>{warning}</div>
                  )}
                  <div className="upload-btn-container">
                    <button type="submit" id="submit-button">
                      <i className="fas fa-upload"></i> Upload
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      {isLoading && (
        <AppProgressBar
          start={isLoading}
          total={100}
          forceComplete={forceComplete}
          resetForceComplete={() => setForceComplete(false)}
        />
      )}

      <p className={styles.footerText}>
        Designed by
        <a href="https://ecommercecanada.com/">ecommercecanada Eric</a>
      </p>
    </div>
  )
}
