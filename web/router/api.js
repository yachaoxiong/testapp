import express from "express";
import apiController from "../controller/apiController.js"
const router = express.Router();

router.get('/makes', apiController.getMakes)
router.get('/getModels/:make', apiController.getModelsByMake)
router.get('/getYears/:make/:model', apiController.getYearsByMakeAndModel)
router.get('/models/:make/:year', apiController.getModels)
router.get('/generations/:make/:model', apiController.getGenerations)
router.get('/getModifications/:make/:model/:year', apiController.getModifications)
router.get(
  '/searchWheels/:make/:model/:year/:modification',
  apiController.searchWheel
)
router.get(
  '/searchByModels/:make/:year/:model/:modification',
  apiController.searchByModels
)
router.get('/tiresSearch/:generation/:size', apiController.tireSearch)

export default router