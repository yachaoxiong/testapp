import asyncHandler from 'express-async-handler'
import superagent from 'superagent'

// @route get /api/v2/makes
// @desc get all makes
// @access Public

const getMakes = asyncHandler(async (req, res) => {
  const baseURL =
    process.env.BASE_URL +
    '/makes/?ordering=slug&user_key=' +
    process.env.USER_KEY
  const response = await superagent.get(baseURL)
  // get the data
  // throw error if no data

  if (!response.body.data) {
    // set status code to 404
    res.status(404)
    throw new Error('No data found')
  }
  const data = response.body.data

  res.status(200).json({
    success: true,
    data: data,
  })
})

// @route get /api/v2/models/:make
// @desc get all models
// @access Public

const getModels = asyncHandler(async (req, res) => {
  const make = req.params.make
  const year = req.params.year
  const baseURL =
    process.env.BASE_URL +
    `/models/?make=${make}&year=${year}&user_key=` +
    process.env.USER_KEY
  const response = await superagent.get(baseURL)
  // get the data
  // throw error if no data
  if (!response.body.data) {
    // set status code to 404
    res.status(404)
    throw new Error('No data found')
  }
  const data = response.body.data

  res.status(200).json({
    success: true,
    data: data,
  })
})

const getModelsByMake = asyncHandler(async (req, res) => {
  const make = req.params.make
  const baseURL =
    process.env.BASE_URL +
    `/models/?make=${make}&user_key=` +
    process.env.USER_KEY
  const response = await superagent.get(baseURL)
  // get the data
  // throw error if no data
  if (!response.body.data) {
    // set status code to 404
    res.status(404)
    throw new Error('No data found')
  }
  const data = response.body.data

  res.status(200).json({
    success: true,
    data: data,
  })
})
// @route get /api/v2/years/:make/:model
// @desc get all years
// @access Public
const getYearsByMakeAndModel = asyncHandler(async (req, res) => {
  const make = req.params.make
  const model = req.params.model

  const baseURL =
    process.env.BASE_URL +
    `/years/?make=${make}&model=${model}&user_key=` +
    process.env.USER_KEY

  const response = await superagent.get(baseURL)

  // get the data
  // throw error if no data
  if (!response.body.data) {
    // set status code to 404
    res.status(404)
    throw new Error('No data found')
  }
  const data = response.body.data

  res.status(200).json({
    success: true,
    data: data,
  })
})

const getGenerations = asyncHandler(async (req, res) => {
  const make = req.params.make
  const model = req.params.model
  const baseURL =
    process.env.BASE_URL +
    `/generations/?make=${make}&model=${model}&user_key=` +
    process.env.USER_KEY
  const response = await superagent.get(baseURL)
  // get the data
  // throw error if no data
  if (!response.body.data) {
    // set status code to 404
    res.status(404)
    throw new Error('No data found')
  }
  const data = response.body.data

  res.status(200).json({
    success: true,
    data: data,
  })
})

// @route get /api/v2/modifications/:make/:model/:year
// @desc get all modifications
// @access Public

const getModifications = asyncHandler(async (req, res) => {
  const make = req.params.make
  const model = req.params.model
  const year = req.params.year
  const baseURL =
    process.env.BASE_URL +
    `/modifications/?make=${make}&model=${model}&year=${year}&user_key=` +
    process.env.USER_KEY
  const response = await superagent.get(baseURL)
  // get the data
  // throw error if no data
  if (!response.body.data) {
    // set status code to 404
    res.status(404)
    throw new Error('No data found')
  }
  const data = response.body.data

  res.status(200).json({
    success: true,
    data: data,
  })
})

// @route get /api/v1/search_wheel/:make/:model/:year/:modification
// @desc get all wheels
// @access Public

const searchWheel = asyncHandler(async (req, res) => {
  const make = req.params.make
  const model = req.params.model
  const year = req.params.year
  const modification = req.params.modification
  const baseURL =
    process.env.BASE_URL +
    `/search/by_model/?make=${make}&model=${model}&year=${year}&modification=${modification}&user_key=` +
    process.env.USER_KEY
  const response = await superagent.get(baseURL)
  // get the data
  // throw error if no data
  if (!response.body.data) {
    // set status code to 404
    res.status(404)
    throw new Error('No data found')
  }
  const data = response.body.data

  res.status(200).json({
    success: true,
    data: data,
  })
})

// @route get /api/v1/search_tire/:make/:model/:year/:generation
// @desc get all tires
// @access Public

const searchByModels = asyncHandler(async (req, res) => {
  const make = req.params.make
  const model = req.params.model
  const year = req.params.year
  const modification = req.params.modification
  const baseURL =
    process.env.BASE_URL +
    `/search/by_model/?make=${make}&model=${model}&year=${year}&modification=${modification}&user_key=` +
    process.env.USER_KEY

  const response = await superagent.get(baseURL)
  // get the data
  // throw error if no data
  if (!response.body.data) {
    // set status code to 404
    res.status(404)
    throw new Error('No data found')
  }
  const data = response.body.data

  res.status(200).json({
    success: true,
    data: data,
  })
})

// @route get /api/v1/tireSearch/:generation
// @desc get all tires
// @access Public

const tireSearch = asyncHandler(async (req, res) => {
  // get the generation in the url
  const generation = req.params.generation
  const size = req.params.size

  // build the url
  const baseURL =
    process.env.BASE_URL +
    `/tires/search/advanced/?&t=${size}&user_key=` +
    process.env.USER_KEY
  const response = await superagent.get(baseURL)
  // get the data
  // throw error if no data
  if (!response.body.data) {
    // set status code to 404
    res.status(404)
    throw new Error('No data found')
  }
  const data = response.body.data

  res.status(200).json({
    success: true,
    data: data,
  })
})

// @route get /api/v2/tireSearch
// @desc get all tires
// @access Public

const tireSearchWithoutGeneration = asyncHandler(async (req, res) => {
  // build the url
  const baseURL =
    process.env.BASE_URL +
    `/tires/search/advanced/?user_key=` +
    process.env.USER_KEY
  const response = await superagent.get(baseURL)
  // get the data
  // throw error if no data
  if (!response.body.data) {
    // set status code to 404
    res.status(404)
    throw new Error('No data found')
  }
  const data = response.body.data

  res.status(200).json({
    success: true,
    data: data,
  })
})

export default {
  getMakes,
  getModels,
  getModelsByMake,
  getYearsByMakeAndModel,
  getGenerations,
  getModifications,
  searchWheel,
  searchByModels,
  tireSearch,
  tireSearchWithoutGeneration,
}
