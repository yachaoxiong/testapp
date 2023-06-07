import React, { useEffect, useState } from 'react'
import { useAuthenticatedFetch } from ".";

export default function useModificationData(make, model, year) {
  const [modificationData, setModificationData] = useState([])
  const fetch = useAuthenticatedFetch()

  useEffect(() => {
    if (!make || !model || !year) {
      setModificationData([{ label: 'Select modification', value: '' }])
      return
    }
    fetch(`/api/v2/getModifications/${make}/${model}/${year}`)
      .then((res) => res.json())
      .then((data) => {
        const isEmpty = data?.data?.length > 0 ? false : true
        if (isEmpty) {
          setModificationData([{ label: 'Select Modification', value: '' }])
          return
        }
        const initModificationOption = [{ label: 'Select Modification', value: '' }]


        const modifications = data?.data?.map((modification) => {
          return {
            label: `${modification?.name}`,
            value: modification?.slug,
            data: modification
          }
        })
        setModificationData([...initModificationOption, ...modifications])
      })
      .catch((error) => {
        console.log(error)
      })
  }, [make, model, year])
  return { modificationData }
}
