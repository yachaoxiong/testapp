import { Box } from '@shopify/polaris'
import { useCallback, useState } from 'react'
import useMakeData from '../../hooks/useMakeData'
import useModelData from '../../hooks/useModelData'
import useYearData from '../../hooks/useYearData'
import useTireData from '../../hooks/useTireData'
import useModificationData from '../../hooks/useModificationData'
import styles from './styles/Hero.module.css'
import AppSelect from '../ui/AppSelect'

export default function Hero() {
  const { makeData } = useMakeData()
  const [selectedMake, setSelectedMake] = useState('')
  const { modelData } = useModelData(selectedMake)
  const [selectedModel, setSelectedModel] = useState('')
  const { yearData } = useYearData(selectedMake, selectedModel)
  const [selectedYear, setSelectedYear] = useState('')
  const { modificationData } = useModificationData(
    selectedMake,
    selectedModel,
    selectedYear
  )

  const [selectedModification, setSelectedModification] = useState('')
  const { tireData } = useTireData(
    selectedMake,
    selectedModel,
    selectedYear,
    selectedModification
  )

  const handleSelectChange = useCallback(
    (e) => setSelectedMake(e.target.value),
    []
  )

  const handleModelChange = useCallback(
    (e) => setSelectedModel(e.target.value),
    [modelData]
  )

  const handleYearChange = useCallback(
    (e) => setSelectedYear(e.target.value),
    [yearData]
  )

  const handleModificationChange = useCallback(
    (e) => setSelectedModification(e.target.value),
    [modificationData]
  )

  return (
    <Box>
      <Box className={styles.hero}>
        <h1 className={styles.tagline}>Just Wheels - Drive with Confidence</h1>
        <Box className={styles.searchContainer}>
          <AppSelect
            options={makeData}
            onChange={handleSelectChange}
            value={selectedMake}
          />
          <AppSelect
            options={modelData}
            value={selectedModel}
            onChange={handleModelChange}
          />
          <AppSelect
            options={yearData}
            value={selectedYear}
            onChange={handleYearChange}
          />
          <AppSelect
            options={modificationData}
            value={selectedModification}
            onChange={handleModificationChange}
          />
        </Box>
      </Box>
      {tireData[0]?.data && (
        <Box className={styles.selectedModificationContainer}>
          <Box className={styles.selectedModification}>
            <div className={styles.selectedModificationCard}>
              <h4>Selected Modification:</h4>
              <h3>{tireData[0]?.data?.name}</h3>
              <p>{tireData[0]?.data?.trim_levels.join(', ')}</p>
              <p className={styles.tagLeft}>
                {tireData[0]?.data?.engine?.type}
              </p>
              <p className={styles.tagRight}>
                {tireData[0]?.data?.engine?.power.hp}
              </p>
            </div>
          </Box>
        </Box>
      )}
    </Box>
  )
}
