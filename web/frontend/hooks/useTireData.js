import React, { useEffect, useState } from 'react'
import { useAuthenticatedFetch } from ".";

export default function useTireData(make, model, year, modification) {
  const [tireData, setTireData] = useState([])
  const fetch = useAuthenticatedFetch()

  useEffect(() => {
    if (!make || !model || !year || !modification) {
      setTireData([])
      return
    }
    fetch(`/api/v2/searchWheels/${make}/${model}/${year}/${modification}`)
      .then((res) => res.json())
      .then((data) => {
        const isEmpty = data?.data?.length > 0 ? false : true
        if (isEmpty) {
          setTireData([])
          return
        }

        const tires = data?.data?.map((tire) => {
          return {
            label: `${tire?.name}`,
            value: tire?.slug,
            data: tire
          }
        })
        setTireData(tires)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [make, model, year, modification])
  return { tireData }
}
