import React, { useState, useEffect } from 'react'
import { useAuthenticatedFetch } from '../../hooks'
import ListItem from './ListItem'
import styles from './style/List.module.css'
import PageLoader from '../ui/PageLoader'
import AppCheckbox from '../ui/AppCheckbox'

export default function OutputList() {
  const [list, setList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState({
    all: true,
    tire: false,
    wheel: false,
    accessories: false,
  })
  const fetch = useAuthenticatedFetch()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/uploadAPI/getOutputList')
      const data = await res.json()
      if (data.success) {
        setList(data.outputList)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleFilterChange = (value) => {
    setFilters((prevFilters) => {
      if (value === 'all') {
        return { all: true, tire: false, wheel: false, accessories: false }
      }
      const newFilters = { ...prevFilters, [value]: !prevFilters[value] }
      newFilters.all = !(
        newFilters.tire ||
        newFilters.wheel ||
        newFilters.accessories
      )
      return newFilters
    })
  }

  return isLoading ? (
    <div className={styles.container}>
      <PageLoader loading={isLoading} />
    </div>
  ) : (
    <div>
      <div className={styles.filterContainer}>
        <h4>File Type</h4>
        {Object.entries(filters).map(([key, value]) => (
          <AppCheckbox
            key={key}
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            onChange={() => handleFilterChange(key)}
            checked={value}
          />
        ))}
      </div>
      <div className={styles.container}>
        {list
          .filter((item) => {
            if (filters.all) return true
            if (filters.tire && item?.name.includes('tire')) return true
            if (filters.wheel && item?.name.includes('wheel')) return true
            if (filters.accessories && item?.name.includes('accessories'))
              return true
            return false
          })
          .map((item) => (
            <ListItem key={item?.name} item={item} />
          ))}
      </div>
    </div>
  )
}
