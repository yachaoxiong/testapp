import React, { useEffect, useState } from 'react'
import { useAppQuery, useAuthenticatedFetch } from ".";

export default function useYearData(make, model) {
  const [yearData, setYearData] = useState([])
  const fetch = useAuthenticatedFetch()

  useEffect(() => {
    if (!make || !model) {
      setYearData([{ label: 'Select year', value: '' }])
      return
    }
    fetch(`/api/v2/getYears/${make}/${model}`)
      .then((res) => res.json())
      .then((data) => {
        const isEmpty = data?.data?.length > 0 ? false : true
        if (isEmpty) {
          setYearData([{ label: 'Select year', value: '' }])
          return
        }
        const initYearOption = [{ label: 'Select year', value: '' }]
        const years = data?.data?.map((year) => {
          return {
            label: year?.name,
            value: year?.slug,
          }
        })
        setYearData([...initYearOption, ...years])
      })
      .catch((error) => {
        console.log(error)
      })
  }, [make, model])
  return { yearData }
}
