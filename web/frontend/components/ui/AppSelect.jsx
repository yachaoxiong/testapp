import React, { useState } from 'react'
import './styles/AppSelect.module.css'

export default function AppSelect(props) {
  const { options, label, onChange, onClick, value, className } = props
  let optionsdata = options?.map((data, i) => (
    <option
      key={i}
      selected={data.selected}
      disabled={data.disabled}
      value={data.value}
    >
      {data.label || data.name}
    </option>
  ))
  return (
    <label
      className={`${className ? className : ''}`}
      onClick={(e) => onClick && onClick(e)}
    >
      <h6>{label}</h6>
      <select onChange={(e) => onChange(e)} value={value}>
        {optionsdata}
      </select>
    </label>
  )
}
