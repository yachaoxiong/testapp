import React, { useEffect, useState } from 'react'
import { useAppQuery, useAuthenticatedFetch } from '../hooks'

export default function useMakeData() {
  const [makeData, setMakeData] = useState(null)
  const fetch = useAuthenticatedFetch()

  useEffect(() => {
    fetch('/api/v2/makes')
      .then((res) => res.json())
      .then((data) => {
        const initMakeOption = [{ label: 'Select Make', value: '' }]
        const makes = data?.data?.map((make) => {
          return {
            label: make.name,
            value: make.slug,
            logo: make.logo,
          }
        })
        setMakeData([...initMakeOption, ...makes])
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])
  return { makeData }
}
