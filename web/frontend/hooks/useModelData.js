import React, { useEffect, useState } from 'react'
import { useAppQuery, useAuthenticatedFetch } from ".";

export default function useModelData(make) {
  const [modelData, setModelData] = useState([])
  const fetch = useAuthenticatedFetch()

  useEffect(() => {
    if (!make) {
      setModelData([{ label: 'Select Model', value: '' }])
      return
    }
    fetch(`/api/v2/getModels/${make}`)
      .then((res) => res.json())
      .then((data) => {
        const isEmpty = data?.data?.length > 0 ? false : true
        if (isEmpty) {
          setModelData([{ label: 'Select Model', value: '' }])
          return
        }
        const initModelOption = [{ label: 'Select Model', value: '' }]
        const models = data?.data?.map((model) => {
          return {
            label: model?.name,
            value: model?.slug,
          }
        })
        setModelData([...initModelOption, ...models])
      })
      .catch((error) => {
        setError(error)
      })
  }, [make])
  return { modelData }
}
