import React, { useState, useEffect } from 'react'
import { useAuthenticatedFetch } from '.'

export default function useUpload(url) {
  const [uploadData, setUploadData] = useState(null)
  const fetch = useAuthenticatedFetch()

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setUploadData(data)
        } else {
          setUploadData(null)
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }, [url])

  return uploadData
}
