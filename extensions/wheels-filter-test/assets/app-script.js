const appUrl = 'https://wheels-filter-test.herokuapp.com'

document.addEventListener('DOMContentLoaded', async function () {
  const data = await fetch(
    `${appUrl}/api/v2/makes`
  )
  const makes = await data.json()
  const makeOptionsDiv = document.getElementById('makeOptions')

  makes?.data?.forEach((make) => {
    const optionDiv = document.createElement('div')
    optionDiv.className = 'option'
    optionDiv.onclick = () => selectOption('makeSelect', make.slug, make.logo)
    optionDiv.innerHTML = `
     <img src="${make.logo}" alt="logo" width="20px" />
     ${make.name}
   `
    makeOptionsDiv.appendChild(optionDiv)
  })
})

function toggleDropdown(selectId) {
  const allCustomSelects = document.querySelectorAll('.custom-select')
  allCustomSelects.forEach((customSelect) => {
    if (customSelect.id !== selectId) {
      customSelect.querySelector('.options').style.display = 'none'
    }
  })

  const selectedCustomSelect = document.getElementById(selectId)
  const options = selectedCustomSelect.querySelector('.options')
  options.style.display = options.style.display === 'block' ? 'none' : 'block'
}

function selectOption(selectId, name, logo, slug) {
  const customSelect = document.getElementById(selectId)
  const selectedOption = customSelect.querySelector('.selected-option')

  if (logo) {
    selectedOption.innerHTML = `<img src="${logo}" alt="logo" width="20px"/> ${name}`
  } else {
    selectedOption.textContent = name
  }

  selectedOption.dataset.slug = slug || ''

  toggleDropdown(selectId)

  if (selectId === 'makeSelect') {
    fetchModelData(name)
    resetSelectOption('modelSelect', 'Select Model')
    resetSelectOption('yearSelect', 'Select Year')
    resetSelectOption('modificationSelect', 'Select Modification')
    resetTires()
  } else if (selectId === 'modelSelect') {
    const makeSelect = document.getElementById('makeSelect')
    const makeName = makeSelect
      .querySelector('.selected-option')
      .textContent.trim()
    fetchYearData(makeName, name)
    resetSelectOption('yearSelect', 'Select Year')
    resetSelectOption('modificationSelect', 'Select Modification')
    resetTires()
  } else if (selectId === 'yearSelect') {
    const makeSelect = document.getElementById('makeSelect')
    const makeName = makeSelect

      .querySelector('.selected-option')
      .textContent.trim()

    const modelSelect = document.getElementById('modelSelect')
    const modelName = modelSelect
      .querySelector('.selected-option')
      .textContent.trim()

    fetchModificationData(makeName, modelName, name)
    resetSelectOption('modificationSelect', 'Select Modification')
    resetTires()
  } else if (selectId === 'modificationSelect') {
    const makeSelect = document.getElementById('makeSelect')
    const makeName = makeSelect
      .querySelector('.selected-option')
      .textContent.trim()

    const yearSelect = document.getElementById('yearSelect')
    const yearName = yearSelect
      .querySelector('.selected-option')
      .textContent.trim()

    const modelSelect = document.getElementById('modelSelect')
    const modelName = modelSelect
      .querySelector('.selected-option')
      .textContent.trim()

    fetchTireData(makeName, modelName, yearName, slug)
    resetTires()
  }
}

function resetSelectOption(selectId, defaultText) {
  const customSelect = document.getElementById(selectId)
  const selectedOption = customSelect.querySelector('.selected-option')
  selectedOption.textContent = defaultText
  customSelect.querySelector('.options').innerHTML = ''
}
function resetTires() {
  const cardContainer = document.getElementById('cardContainer')
  const selectedModificationOption = document.getElementById(
    'selectedModification'
  )
  // Clear existing cards
  cardContainer.innerHTML = ''
  // Reset the selected modification
  selectedModificationOption.textContent = ''

  const tireDetailsContainer = document.getElementById('tireDetailsContainer')
  tireDetailsContainer.innerHTML = ''
}

async function fetchYearData(make, model) {
  try {
    const response = await fetch(
      `${appUrl}/api/v2/getYears/${make}/${model}`
    )
    const yearData = await response.json()

    // Reset the year selection
    const yearSelect = document.getElementById('yearSelect')
    const selectedYearOption = yearSelect.querySelector('.selected-option')
    selectedYearOption.textContent = 'Select Year'

    // Clear existing year options
    const yearOptions = yearSelect.querySelector('.options')
    yearOptions.innerHTML = ''

    // Populate new year options
    yearData?.data?.forEach((year) => {
      const yearOption = document.createElement('div')
      yearOption.className = 'option'
      yearOption.textContent = year?.name
      yearOption.onclick = () => selectOption('yearSelect', year?.name)
      yearOptions.appendChild(yearOption)
    })
  } catch (error) {
    console.error('Error fetching year data:', error)
  }
}

async function fetchModelData(make) {
  try {
    const response = await fetch(
      `${appUrl}/api/v2/getModels/${make}`
    )
    const modelData = await response.json()

    // Reset the model selection
    const modelSelect = document.getElementById('modelSelect')
    const selectedModelOption = modelSelect.querySelector('.selected-option')
    selectedModelOption.textContent = 'Select Model'

    // Clear existing model options
    const modelOptions = modelSelect.querySelector('.options')
    modelOptions.innerHTML = ''

    // Populate new model options
    modelData?.data?.forEach((model) => {
      const modelOption = document.createElement('div')
      modelOption.className = 'option'
      modelOption.textContent = model?.name
      modelOption.onclick = () => selectOption('modelSelect', model?.name)
      modelOptions.appendChild(modelOption)
    })
  } catch (error) {
    console.error('Error fetching model data:', error)
  }
}

async function fetchModificationData(make, model, year) {
  try {
    const response = await fetch(
      `${appUrl}/api/v2/getModifications/${make}/${model}/${year}`
    )
    const modificationData = await response.json()

    // Reset the modification selection
    const modificationSelect = document.getElementById('modificationSelect')
    const selectedModificationOption =
      modificationSelect.querySelector('.selected-option')
    selectedModificationOption.textContent = 'Select Modification'

    // Clear existing modification options
    const modificationOptions = modificationSelect.querySelector('.options')
    modificationOptions.innerHTML = ''

    // Populate new modification options
    modificationData?.data?.forEach((modification) => {
      const modificationOption = document.createElement('div')
      modificationOption.className = 'option'

      // Format the modification option text
      const modificationText = `${modification?.name}
<span style="font-size: 0.8em;font-weight:600; color:gray;">Engine: ${modification?.engine.type
        }, ${modification?.power?.hp ? modification?.power?.hp + 'HP' : ''} 
Trim level: ${modification?.trim_levels.join(', ')}</span>`
      modificationOption.innerHTML = modificationText.replace(/\n/g, '<br>')

      modificationOption.onclick = () => {
        const selectedText = `${modification?.generation?.name} - Engine: ${modification?.engine.type}`
        selectOption(
          'modificationSelect',
          selectedText,
          null,
          modification?.slug
        )
      }
      modificationOptions.appendChild(modificationOption)
    })
  } catch (error) {
    console.error('Error fetching modification data:', error)
  }
}

async function fetchTireData(make, model, year, modification) {
  try {
    const response = await fetch(
      `${appUrl}/api/v2/searchByModels/${make}/${year}/${model}/${modification}`
    )
    const tireData = await response.json()
    const selectedModificationOption = document.getElementById(
      'selectedModification'
    )
    //create a card for the selected modification

    const selectedModificationCardContent = `
    <div class="selected-modification-card">
     <h4>Selected Modification:</h4>
     <h3>${tireData?.data[0].name}</h3>
     <p>${tireData?.data[0].trim_levels.join(', ')}</p>
      <p class="tagLeft">${tireData?.data[0]?.engine?.type}</p>
      <p class="tagRight">${tireData?.data[0]?.engine?.power.hp}HP</p>
      </div>
`

    selectedModificationOption.innerHTML = selectedModificationCardContent

    const selectedModificationCard = document.createElement('div')
    selectedModificationCard.className = 'selected-modification-card'

    // Get the card container
    const cardContainer = document.getElementById('cardContainer')
    const title = document.createElement('h1')
    title.textContent = 'Tires'

    // Clear existing cards
    cardContainer.innerHTML = ''
    cardContainer.appendChild(title)
    // Populate new tire cards
    tireData?.data[0]?.wheels?.forEach((tire, index) => {
      const tireCardWrapper = document.createElement('div')
      tireCardWrapper.className = 'tire-card-wrapper'
      const tireCard = document.createElement('div')
      tireCard.className = 'tire-card'
      if (tire?.is_stock) {
        tireCard.classList.add('factory-card')
      }
      const cardTitle = tire?.is_stock ? 'FACTORY SIZE' : 'OPTIONAL SIZE'
      // Format the tire card content
      const tireCardContent = `
        <span class="cardTag">ALL ROUND</span>
        <h5>${cardTitle}</h5>
        <h1>${tire.front.rim_diameter}" <span>${tire.front.tire}</span>  </h1>
      `
      tireCard.innerHTML = tireCardContent
      tireCardWrapper.appendChild(tireCard)
      cardContainer.appendChild(tireCardWrapper)
    })
  } catch (error) {
    console.error('Error fetching tire data:', error)
  }
}
