import express from 'express'
import uploadController from '../controller/uploadController.js'
const router = express.Router()

router.get('/process', uploadController.processFiles)
router.get('/processAccessories', uploadController.processAccessoriesFiles)
router.get('/processWheels', uploadController.processWheelFiles)

router.post('/upload', uploadController.uploadTireFile)

router.post('/uploadAccessories', uploadController.uploadAccessoriesFile)

router.post('/uploadWheels', uploadController.uploadWheelsFile)
router.get('/getOutputList', uploadController.getAllOutputFilesName)

export default router
