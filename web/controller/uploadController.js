import asyncHandler from 'express-async-handler'
import SFTPClient from 'ssh2-sftp-client'
import { Readable } from 'stream'
import multer from 'multer'
import path from 'path'
import csvtojson from 'csvtojson'
import { Parser } from '@json2csv/plainjs'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 9000000 }, // Limit file size to 9 MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb)
  },
}).fields([
  { name: 'techData', maxCount: 1 },
  { name: 'InvData', maxCount: 1 },
])

// Check if the file is a CSV or JSON
function checkFileType(file, cb) {
  const filetypes = /csv|json/
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = filetypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb('Error: Please upload a CSV or JSON file.')
  }
}
// Convert CSV to JSON
async function csvToJson(csvContent) {
  const jsonArray = await csvtojson().fromString(csvContent)
  return jsonArray
}
const processFiles = asyncHandler(async (req, res) => {
  const config = {
    host: process.env.AMAZON_HOST,
    port: '22',
    username: process.env.AMAZON_USERNAME,
    password: process.env.AMAZON_PASSWORD,
  }

  const dataString = new Date().toISOString().replace(/:/g, '-')
  const sftp = new SFTPClient()
  const remotePath1 =
    '/home/sftpuser/wheel-pros/CommonFeed/CAD/TIRE/tireInvPriceData.json'
  const remotePath2 =
    '/home/sftpuser/wheel-pros/TechFeed/TIRE/Tire_TechGuide.json'
  const outputPath = `/home/sftpuser/uploads/tires-${dataString}.csv`

  try {
    await sftp.connect(config)
    const [file1Content, file2Content] = await Promise.all([
      sftp.get(remotePath1),
      sftp.get(remotePath2),
    ])
    const file1Data = JSON.parse(file1Content)
    const file2Data = JSON.parse(file2Content)

    const generateNewData = (invPriceData, techData) => {
      const techDataMap = techData.reduce((obj, item) => {
        obj[item.sku] = item
        return obj
      }, {})

      const newData = invPriceData.map((invPriceItem) => {
        const techItem = techDataMap[invPriceItem.PartNumber]

        return {
          Title: `${invPriceItem?.Brand}-${techItem?.display_model_no}-${techItem?.tire_size}`,
          'Body HTML': techItem?.tire_description
            ? techItem?.tire_description
            : '',
          Vendor: invPriceItem?.Brand ? invPriceItem?.Brand : '',
          Tags: `${invPriceItem?.Brand ? invPriceItem?.Brand + ',' : ''} ${
            techItem?.tire_diameter ? techItem?.tire_diameter + ',' : ''
          } ${techItem?.tire_size ? techItem?.tire_size + ',' : ''} Tire, ${
            invPriceItem?.MSRP_CAD ? invPriceItem?.MSRP_CAD : ''
          } `,
          'Tag Command': 'MERGE',
          Type: 'Tires',
          Category:
            'Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts > Motor Vehicle Wheel Systems > Motor Vehicle Tires',
          // handle: techItem?.display_model_no,
          'Image Src': techItem?.image_url ? techItem?.image_url : '',
          'Variant Barcode': techItem?.upc ? techItem?.upc : '',
          'Variant SKU': techItem?.sku ? techItem?.sku : '',
          'Varian Weight': techItem?.weight ? techItem?.weight : '',
          'Varian Weight Unit': 'kg',
          'Varian Country Of Origin': techItem?.source_country
            ? techItem?.source_country
            : '',
          'Variant Price': invPriceItem?.MSRP_CAD ? invPriceItem?.MSRP_CAD : '',
          'Metafield: custom.load_index [single_line_text_field]':
            techItem?.load_index ? techItem?.load_index : '',
          'Metafield: custom.speed_rating [single_line_text_field]':
            techItem?.speed_rating ? techItem?.speed_rating : '',
          'Metafield: custom.treadwear [single_line_text_field]':
            techItem?.treadwear ? techItem?.treadwear : '',
          'Metafield: custom.traction [single_line_text_field]':
            techItem?.traction ? techItem?.traction : '',
          'Metafield: custom.temperature [single_line_text_field]':
            techItem?.temperature ? techItem?.temperature : '',
          'Metafield: custom.section_width [single_line_text_field]':
            techItem?.section_width ? techItem?.section_width : '',
          'Metafield: custom.series [single_line_text_field]': techItem?.series
            ? techItem?.series
            : '',
          'Metafield: custom.rim_diameter [single_line_text_field]':
            techItem?.rim_diameter ? techItem?.rim_diameter : '',
          'Metafield: custom.tire_diameter_actual [single_line_text_field]':
            techItem?.tire_diameter_actual
              ? techItem?.tire_diameter_actual
              : '',
          'Metafield: custom.min_width_in [single_line_text_field]':
            techItem?.min_width_in ? techItem?.min_width_in : '',
          'Metafield: custom.max_width_in [single_line_text_field]':
            techItem?.max_width_in ? techItem?.max_width_in : '',
          'Metafield: custom.max_load [single_line_text_field]':
            techItem?.max_load ? techItem?.max_load : '',
          'Metafield: custom.division [single_line_text_field]':
            techItem?.division ? techItem?.division : '',
          'Metafield: custom.display_model_no [single_line_text_field]':
            techItem?.display_model_no ? techItem?.display_model_no : '',
          'Metafield: custom.tread_depth [single_line_text_field]':
            techItem?.tread_depth ? techItem?.tread_depth : '',
          'Metafield: custom.max_pressure [single_line_text_field]':
            techItem?.max_pressure ? techItem?.max_pressure : '',
          // VariantImage: techItem?.image_url,
          // Option1Value: techItem?.tire_size,
          // VariantBarcode: techItem?.upc,
          // VariantGrams: techItem?.weight,
          // VariantInventoryTracker: 'TBD',
          // VariantInventoryPolicy: 'TBD',
          // VariantFulfillmentService: 'TBD',
        }
      })
      return newData
    }

    const newData = generateNewData(file1Data, file2Data)
    //convert it to json format to check the data length
    // const newDataJson = JSON.stringify(newData)
    const parser = new Parser()
    const csv = parser.parse(newData)
    const newDataBuffer = Buffer.from(csv)
    const newDataStream = new Readable()
    newDataStream.push(newDataBuffer)
    newDataStream.push(null)
    await sftp.put(newDataStream, outputPath)

    res.status(200).json({
      success: true,
      message: 'Files processed and combined successfully',
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing the files',
    })
  } finally {
    sftp.end()
  }
})

const processAccessoriesFiles = asyncHandler(async (req, res) => {
  const config = {
    host: process.env.AMAZON_HOST,
    port: '22',
    username: process.env.AMAZON_USERNAME,
    password: process.env.AMAZON_PASSWORD,
  }

  const dataString = new Date().toISOString().replace(/:/g, '-')
  const sftp = new SFTPClient()
  const remotePath1 =
    '/home/sftpuser/wheel-pros/CommonFeed/CAD/ACCESSORIES/accessoriesInvPriceData.json'
  const remotePath2 =
    '/home/sftpuser/wheel-pros/TechFeed/ACCESSORIES/Accessory_TechGuide.json'
  const outputPath = `/home/sftpuser/uploads/accessories-${dataString}.csv`

  try {
    await sftp.connect(config)

    const [file1Content, file2Content] = await Promise.all([
      sftp.get(remotePath1),
      sftp.get(remotePath2),
    ])

    const file1Data = JSON.parse(file1Content)
    const file2Data = JSON.parse(file2Content)

    const generateNewData = (invPriceData, techData) => {
      const techDataMap = techData.reduce((obj, item) => {
        obj[item.PartNumber] = item
        return obj
      }, {})

      const newData = invPriceData.map((invPriceItem) => {
        const techItem = techDataMap[invPriceItem.sku]

        return {
          Body: techItem.product_desc,
          ImageSrc: techItem.image_url,
          VariantImage: techItem.image_url,
          Type: techItem.product_sub_type,
          VariantBarcode: techItem.upc,
          VariantPrice: invPriceItem.MSRP_CAD,
          VariantSKU: techItem.sku,
          Vendor: invPriceItem.Brand,
          VariantInventoryTracker: '',
          VariantInventoryPolicy: '',
          VariantFulfillmentService: '',
        }
      })

      return newData
    }

    const newData = generateNewData(file1Data, file2Data)
    // const newDataJson = JSON.stringify(newData)

    const parser = new Parser()
    const csv = parser.parse(newData)

    const newDataBuffer = Buffer.from(csv)
    const newDataStream = new Readable()
    newDataStream.push(newDataBuffer)
    newDataStream.push(null)

    await sftp.put(newDataStream, outputPath)

    res.json({
      success: true,
      message: 'Files processed and combined successfully',
    })
  } catch (err) {
    console.error(err)
    res.json({
      success: false,
      message: 'An error occurred while processing the files',
    })
  } finally {
    sftp.end()
  }
})

const processWheelFiles = asyncHandler(async (req, res) => {
  const config = {
    host: process.env.AMAZON_HOST,
    port: '22',
    username: process.env.AMAZON_USERNAME,
    password: process.env.AMAZON_PASSWORD,
  }

  const dataString = new Date().toISOString().replace(/:/g, '-')
  const sftp = new SFTPClient()
  const remotePath1 =
    '/home/sftpuser/wheel-pros/CommonFeed/CAD/WHEEL/wheelInvPriceData.json'
  const remotePath2 =
    '/home/sftpuser/wheel-pros/TechFeed/WHEEL/Wheel_TechGuide.json'
  const outputPath = `/home/sftpuser/uploads/wheels-${dataString}.csv`

  try {
    await sftp.connect(config)

    const [file1Content, file2Content] = await Promise.all([
      sftp.get(remotePath1),
      sftp.get(remotePath2),
    ])

    const file1Data = JSON.parse(file1Content)
    const file2Data = JSON.parse(file2Content)

    const generateNewData = (invPriceData, techData) => {
      // Create an object with the PartNumber as key and the tech item as value
      const techDataMap = techData.reduce((obj, item) => {
        obj[item.PartNumber] = item
        return obj
      }, {})

      // Map the invPriceData array to the newData array
      const newData = invPriceData.map((invPriceItem) => {
        const techItem = techDataMap[invPriceItem.sku]
        return {
          Title: `${invPriceItem?.Brand ? invPriceItem?.Brand : ''} ${
            invPriceItem?.BoltPattern ? invPriceItem?.BoltPattern : ''
          } ${invPriceItem?.Finish ? invPriceItem?.Finish : ''} `,
          'Body HTML': techItem?.PartDescription,
          Vendor: invPriceItem.Brand,
          Tags: ``,
          'Tag Command': '',
          Type: 'Wheels',
          Category:
            'Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts > Motor Vehicle Wheel Systems > Motor Vehicle Rims & Wheels',
          'Image Src': `${techItem?.image_url}${
            techItem?.image_url1 ? ';' + techItem?.image_url1 : ''
          }${techItem?.image_url2 ? ';' + techItem?.image_url2 : ''}${
            techItem?.image_url3 ? ';' + techItem?.image_url3 : ''
          }${techItem?.image_url4 ? ';' + techItem?.image_url4 : ''}`,
          'Variant Barcode': techItem.upc,
          'Variant Image': techItem.image_url,
          'Option1 Name': 'Size',
          'Option1 Value': invPriceItem?.Size,
          'Option2 Name': 'Offset',
          'Option2 Value': invPriceItem?.Offset,
          'Option3 Name': 'finish',
          'Option3 Value': invPriceItem?.Finish,
          'Variant Generate From Options': '',
          'Variant Position': '',
          'Variant SKU': techItem.sku,
          'Variant Weight': invPriceItem?.ShippingWeight,
          'Variant Weight Unit': 'kg',
          'Variant Country Of Origin': techData?.source_country,
          'Variant Price': invPriceItem?.MSRP_CAD,
          'Variant Metafield: custom.division [single_line_text_field]':
            techItem?.division,
          'Variant Metafield: custom.diameter [single_line_text_field]':
            techItem?.diameter,
          'Variant Metafield: custom.width [single_line_text_field]':
            techItem?.width,
          'Variant Metafield: custom.lug_count [single_line_text_field]':
            techItem?.lug_count,
          'Variant Metafield: custom.bolt_pattern_metric [single_line_text_field]':
            techItem?.bolt_pattern_metric,
          'Variant Metafield: custom.bolt_pattern_standard [single_line_text_field]':
            techItem?.bolt_pattern_standard,
          'Variant Metafield: custom.backspacing [single_line_text_field]':
            techItem?.backspacing,
          'Variant Metafield: custom.centerbore [single_line_text_field]':
            techItem?.centerbore,
          'Variant Metafield: custom.load_rating_standard [single_line_text_field]':
            techItem?.load_rating_standard,
          'Variant Metafield: custom.rear_only [single_line_text_field]':
            techItem?.rear_only,
          'Variant Metafield: custom.barrel_config [single_line_text_field]':
            techItem?.barrel_config,
          'Variant Metafield: custom.cap_part_no [single_line_text_field]':
            techItem?.cap_part_no,
          'Variant Metafield: custom.tpms_compatible [single_line_text_field]':
            techItem?.tpms_compatible,
          'Variant Metafield: custom.wheel_weight [single_line_text_field]':
            techItem?.wheel_weight,
          'Variant Metafield: custom.style [single_line_text_field]':
            invPriceItem?.Style,
          'Variant Metafield: custom.finish_warranty [single_line_text_field]':
            techItem?.finish_warranty,
          'Variant Metafield: custom.structural_warranty [single_line_text_field]':
            techItem?.structural_warranty,
          'Variant Metafield: custom.construction_type [single_line_text_field]':
            techItem?.construction_type,
          'Variant Metafield: custom.bolt_pattern_mm1 [single_line_text_field]':
            techItem?.bolt_pattern_mm1,
          'Variant Metafield: custom.prop65_chemical1 [single_line_text_field]':
            techItem?.prop65_chemical1,
          'Variant Metafield: custom.prop65_chemical2 [single_line_text_field]':
            techItem?.prop65_chemical2,
          'Variant Metafield: custom.prop65_chemical3 [single_line_text_field]':
            techItem?.prop65_chemical3,

          // 'Variant Metafield: custom.load_index [single_line_text_field]':
          //   techItem?.load_index,
          // 'Variant Metafield: custom.speed_rating [single_line_text_field]':
          //   techItem?.speed_rating,
          // 'Variant Metafield: custom.treadwear [single_line_text_field]':
          //   techItem?.treadwear,
          // 'Variant Metafield: custom.traction [single_line_text_field]':
          //   techItem?.traction,
          // 'Variant Variant Metafield: custom.temperature [single_line_text_field]':
          //   techItem?.temperature,
          // 'Variant Metafield: custom.section_width [single_line_text_field]':
          //   techItem?.section_width,
          // 'Variant Metafield: custom.series [single_line_text_field]':
          //   techItem?.series,
          // 'Variant Metafield: custom.rim_diameter [single_line_text_field]':
          //   techItem?.rim_diameter,
          // 'Variant Metafield: custom.tire_diameter_actual [single_line_text_field]':
          //   techItem?.tire_diameter_actual,
          // 'Variant Metafield: custom.min_width_in [single_line_text_field]':
          //   techItem?.min_width_in,
          // 'Variant Metafield: custom.max_width_in [single_line_text_field]':
          //   techItem?.max_width_in,
          // 'Variant Metafield: custom.max_load [single_line_text_field]':
          //   techItem?.max_load,
          // 'Variant Metafield: custom.display_model_no [single_line_text_field]':
          //   techItem?.display_model_no,
          // 'Variant Metafield: custom.tread_depth [single_line_text_field]':
          //   techItem?.tread_depth,
          // 'Variant Metafield: custom.max_pressure [single_line_text_field]':
          //   techItem?.max_pressure,
          // 'Variant Metafield: custom.load_rating_metric [single_line_text_field]':
          //   techItem?.load_rating_metric,
        }
      })

      return newData
    }

    const newData = generateNewData(file1Data, file2Data)
    // const newDataJson = JSON.stringify(newData)

    const parser = new Parser()
    const csv = parser.parse(newData)

    const newDataBuffer = Buffer.from(csv)
    const newDataStream = new Readable()
    newDataStream.push(newDataBuffer)
    newDataStream.push(null)

    await sftp.put(newDataStream, outputPath)

    res.json({
      success: true,
      message: 'Files processed and combined successfully',
    })
  } catch (err) {
    console.error(err)
    console.log('processWheelFiles==>', err)
    res.json({
      success: false,
      message: 'An error occurred while processing the files',
    })
  } finally {
    sftp.end()
  }
})

const uploadTireFile = asyncHandler(async (req, res) => {
  const config = {
    host: process.env.AMAZON_HOST,
    port: '22',
    username: process.env.AMAZON_USERNAME,
    password: process.env.AMAZON_PASSWORD,
  }

  const dataString = new Date().toISOString().replace(/:/g, '-')
  const sftp = new SFTPClient()
  const outputPath = `/home/sftpuser/uploads/tires-${dataString}.csv`

  upload(req, res, async (err) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing the files',
      })
    } else {
      const file1 = req.files.InvData ? req.files.InvData[0] : undefined
      const file2 = req.files.techData ? req.files.techData[0] : undefined

      if (file1 === undefined || file2 === undefined) {
        res.status(500).json({
          success: false,
          message: 'Error: No file selected!',
        })
      } else {
        let file1Data = file1.buffer.toString()
        let file2Data = file2.buffer.toString()

        if (path.extname(file1.originalname).toLowerCase() === '.csv') {
          file1Data = await csvToJson(file1Data)
        } else {
          file1Data = JSON.parse(file1Data)
        }

        if (path.extname(file2.originalname).toLowerCase() === '.csv') {
          file2Data = await csvToJson(file2Data)
        } else {
          file2Data = JSON.parse(file2Data)
        }
        try {
          await sftp.connect(config)

          const generateNewData = (invPriceData, techData) => {
            const techDataMap = techData.reduce((obj, item) => {
              obj[item.sku] = item
              return obj
            }, {})

            const newData = invPriceData.map((invPriceItem) => {
              const techItem = techDataMap[invPriceItem.PartNumber]

              return {
                Title: `${invPriceItem?.Brand}-${techItem?.display_model_no}-${techItem?.tire_size}`,
                'Body HTML': techItem?.tire_description
                  ? techItem?.tire_description
                  : '',
                Vendor: invPriceItem?.Brand ? invPriceItem?.Brand : '',
                Tags: `${
                  invPriceItem?.Brand ? invPriceItem?.Brand + ',' : ''
                } ${
                  techItem?.tire_diameter ? techItem?.tire_diameter + ',' : ''
                } ${
                  techItem?.tire_size ? techItem?.tire_size + ',' : ''
                } Tire, ${
                  invPriceItem?.MSRP_CAD ? invPriceItem?.MSRP_CAD : ''
                } `,
                'Tag Command': 'MERGE',
                Type: 'Tires',
                Category:
                  'Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts > Motor Vehicle Wheel Systems > Motor Vehicle Tires',
                // handle: techItem?.display_model_no,
                'Image Src': techItem?.image_url ? techItem?.image_url : '',
                'Variant Barcode': techItem?.upc ? techItem?.upc : '',
                'Variant SKU': techItem?.sku ? techItem?.sku : '',
                'Varian Weight': techItem?.weight ? techItem?.weight : '',
                'Varian Weight Unit': 'kg',
                'Varian Country Of Origin': techItem?.source_country
                  ? techItem?.source_country
                  : '',
                'Variant Price': invPriceItem?.MSRP_CAD
                  ? invPriceItem?.MSRP_CAD
                  : '',
                'Metafield: custom.load_index [single_line_text_field]':
                  techItem?.load_index ? techItem?.load_index : '',
                'Metafield: custom.speed_rating [single_line_text_field]':
                  techItem?.speed_rating ? techItem?.speed_rating : '',
                'Metafield: custom.treadwear [single_line_text_field]':
                  techItem?.treadwear ? techItem?.treadwear : '',
                'Metafield: custom.traction [single_line_text_field]':
                  techItem?.traction ? techItem?.traction : '',
                'Metafield: custom.temperature [single_line_text_field]':
                  techItem?.temperature ? techItem?.temperature : '',
                'Metafield: custom.section_width [single_line_text_field]':
                  techItem?.section_width ? techItem?.section_width : '',
                'Metafield: custom.series [single_line_text_field]':
                  techItem?.series ? techItem?.series : '',
                'Metafield: custom.rim_diameter [single_line_text_field]':
                  techItem?.rim_diameter ? techItem?.rim_diameter : '',
                'Metafield: custom.tire_diameter_actual [single_line_text_field]':
                  techItem?.tire_diameter_actual
                    ? techItem?.tire_diameter_actual
                    : '',
                'Metafield: custom.min_width_in [single_line_text_field]':
                  techItem?.min_width_in ? techItem?.min_width_in : '',
                'Metafield: custom.max_width_in [single_line_text_field]':
                  techItem?.max_width_in ? techItem?.max_width_in : '',
                'Metafield: custom.max_load [single_line_text_field]':
                  techItem?.max_load ? techItem?.max_load : '',
                'Metafield: custom.division [single_line_text_field]':
                  techItem?.division ? techItem?.division : '',
                'Metafield: custom.display_model_no [single_line_text_field]':
                  techItem?.display_model_no ? techItem?.display_model_no : '',
                'Metafield: custom.tread_depth [single_line_text_field]':
                  techItem?.tread_depth ? techItem?.tread_depth : '',
                'Metafield: custom.max_pressure [single_line_text_field]':
                  techItem?.max_pressure ? techItem?.max_pressure : '',
                // VariantImage: techItem?.image_url,
                // Option1Value: techItem?.tire_size,
                // VariantBarcode: techItem?.upc,
                // VariantGrams: techItem?.weight,
                // VariantInventoryTracker: 'TBD',
                // VariantInventoryPolicy: 'TBD',
                // VariantFulfillmentService: 'TBD',
              }
            })
            return newData
          }

          const newData = generateNewData(file1Data, file2Data)
          // const newDataJson = JSON.stringify(newData)
          const parser = new Parser()
          const csv = parser.parse(newData)

          const newDataBuffer = Buffer.from(csv)
          const newDataStream = new Readable()
          newDataStream.push(newDataBuffer)
          newDataStream.push(null)

          await sftp.put(newDataStream, outputPath)

          res.status(200).json({
            success: true,
            message: 'Files processed and combined successfully',
          })
        } catch (err) {
          console.error(err)
          res.status(500).json({
            success: false,
            message: 'An error occurred while processing the files',
          })
        } finally {
          sftp.end()
        }
      }
    }
  })
})

const uploadAccessoriesFile = asyncHandler(async (req, res) => {
  const config = {
    host: process.env.AMAZON_HOST,
    port: '22',
    username: process.env.AMAZON_USERNAME,
    password: process.env.AMAZON_PASSWORD,
  }

  const dataString = new Date().toISOString().replace(/:/g, '-')
  const sftp = new SFTPClient()
  const outputPath = `/home/sftpuser/uploads/accessories-${dataString}.csv`

  upload(req, res, async (err) => {
    if (err) {
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing the files',
      })
    } else {
      const file1 = req.files.InvData ? req.files.InvData[0] : undefined
      const file2 = req.files.techData ? req.files.techData[0] : undefined

      if (file1 === undefined || file2 === undefined) {
        res.status(500).json({
          success: false,
          message: 'Error: No file selected!',
        })
      } else {
        let file1Data = file1.buffer.toString()
        let file2Data = file2.buffer.toString()

        if (path.extname(file1.originalname).toLowerCase() === '.csv') {
          file1Data = await csvToJson(file1Data)
        } else {
          file1Data = JSON.parse(file1Data)
        }

        if (path.extname(file2.originalname).toLowerCase() === '.csv') {
          file2Data = await csvToJson(file2Data)
        } else {
          file2Data = JSON.parse(file2Data)
        }
        try {
          await sftp.connect(config)

          const generateNewData = (invPriceData, techData) => {
            const techDataMap = techData.reduce((obj, item) => {
              obj[item.PartNumber] = item
              return obj
            }, {})

            const newData = invPriceData.map((invPriceItem) => {
              const techItem = techDataMap[invPriceItem.sku]

              return {
                Body: techItem.product_desc,
                ImageSrc: techItem.image_url,
                VariantImage: techItem.image_url,
                Type: techItem.product_sub_type,
                VariantBarcode: techItem.upc,
                VariantPrice: invPriceItem.MSRP_CAD,
                VariantSKU: techItem.sku,
                Vendor: invPriceItem.Brand,
                VariantInventoryTracker: '',
                VariantInventoryPolicy: '',
                VariantFulfillmentService: '',
              }
            })

            return newData
          }
          const newData = generateNewData(file1Data, file2Data)
          // const newDataJson = JSON.stringify(newData)

          const parser = new Parser()
          const csv = parser.parse(newData)

          const newDataBuffer = Buffer.from(csv)
          const newDataStream = new Readable()
          newDataStream.push(newDataBuffer)
          newDataStream.push(null)

          await sftp.put(newDataStream, outputPath)
          res.status(200).json({
            success: true,
            message: 'Files processed and combined successfully',
          })
        } catch (err) {
          console.error(err)
          res.status(500).json({
            success: false,
            message: 'An error occurred while processing the files',
          })
        } finally {
          sftp.end()
        }
      }
    }
  })
})

const uploadWheelsFile = asyncHandler(async (req, res) => {
  const config = {
    host: process.env.AMAZON_HOST,
    port: '22',
    username: process.env.AMAZON_USERNAME,
    password: process.env.AMAZON_PASSWORD,
  }

  const dataString = new Date().toISOString().replace(/:/g, '-')
  const sftp = new SFTPClient()
  const outputPath = `/home/sftpuser/uploads/wheels-${dataString}.csv`

  upload(req, res, async (err) => {
    if (err) {
      res.render('upload/index', {
        msg: err,
      })
    } else {
      const file1 = req.files.InvData ? req.files.InvData[0] : undefined
      const file2 = req.files.techData ? req.files.techData[0] : undefined

      if (file1 === undefined || file2 === undefined) {
        res.status(500).json({
          success: false,
          message: 'Error: No file selected!',
        })
      } else {
        let file1Data = file1.buffer.toString()
        let file2Data = file2.buffer.toString()

        if (path.extname(file1.originalname).toLowerCase() === '.csv') {
          file1Data = await csvToJson(file1Data)
        } else {
          file1Data = JSON.parse(file1Data)
        }

        if (path.extname(file2.originalname).toLowerCase() === '.csv') {
          file2Data = await csvToJson(file2Data)
        } else {
          file2Data = JSON.parse(file2Data)
        }
        try {
          await sftp.connect(config)

          const generateNewData = (invPriceData, techData) => {
            // Create an object with the PartNumber as key and the tech item as value
            const techDataMap = techData.reduce((obj, item) => {
              obj[item.PartNumber] = item
              return obj
            }, {})

            // Map the invPriceData array to the newData array
            const newData = invPriceData.map((invPriceItem) => {
              const techItem = techDataMap[invPriceItem.sku]
              return {
                Title: `${invPriceItem?.Brand ? invPriceItem?.Brand : ''} ${
                  invPriceItem?.BoltPattern ? invPriceItem?.BoltPattern : ''
                } ${invPriceItem?.Finish ? invPriceItem?.Finish : ''} `,
                'Body HTML': techItem?.PartDescription,
                Vendor: invPriceItem.Brand,
                Tags: ``,
                'Tag Command': '',
                Type: 'Wheels',
                Category:
                  'Vehicles & Parts > Vehicle Parts & Accessories > Motor Vehicle Parts > Motor Vehicle Wheel Systems > Motor Vehicle Rims & Wheels',
                'Image Src': `${techItem?.image_url}${
                  techItem?.image_url1 ? ';' + techItem?.image_url1 : ''
                }${techItem?.image_url2 ? ';' + techItem?.image_url2 : ''}${
                  techItem?.image_url3 ? ';' + techItem?.image_url3 : ''
                }${techItem?.image_url4 ? ';' + techItem?.image_url4 : ''}`,
                'Variant Barcode': techItem.upc,
                'Variant Image': techItem.image_url,
                'Option1 Name': 'Size',
                'Option1 Value': invPriceItem?.Size,
                'Option2 Name': 'Offset',
                'Option2 Value': invPriceItem?.Offset,
                'Option3 Name': 'finish',
                'Option3 Value': invPriceItem?.Finish,
                'Variant Generate From Options': '',
                'Variant Position': '',
                'Variant SKU': techItem.sku,
                'Variant Weight': invPriceItem?.ShippingWeight,
                'Variant Weight Unit': 'kg',
                'Variant Country Of Origin': techData?.source_country,
                'Variant Price': invPriceItem?.MSRP_CAD,
                'Variant Metafield: custom.division [single_line_text_field]':
                  techItem?.division,
                'Variant Metafield: custom.diameter [single_line_text_field]':
                  techItem?.diameter,
                'Variant Metafield: custom.width [single_line_text_field]':
                  techItem?.width,
                'Variant Metafield: custom.lug_count [single_line_text_field]':
                  techItem?.lug_count,
                'Variant Metafield: custom.bolt_pattern_metric [single_line_text_field]':
                  techItem?.bolt_pattern_metric,
                'Variant Metafield: custom.bolt_pattern_standard [single_line_text_field]':
                  techItem?.bolt_pattern_standard,
                'Variant Metafield: custom.backspacing [single_line_text_field]':
                  techItem?.backspacing,
                'Variant Metafield: custom.centerbore [single_line_text_field]':
                  techItem?.centerbore,
                'Variant Metafield: custom.load_rating_standard [single_line_text_field]':
                  techItem?.load_rating_standard,
                'Variant Metafield: custom.rear_only [single_line_text_field]':
                  techItem?.rear_only,
                'Variant Metafield: custom.barrel_config [single_line_text_field]':
                  techItem?.barrel_config,
                'Variant Metafield: custom.cap_part_no [single_line_text_field]':
                  techItem?.cap_part_no,
                'Variant Metafield: custom.tpms_compatible [single_line_text_field]':
                  techItem?.tpms_compatible,
                'Variant Metafield: custom.wheel_weight [single_line_text_field]':
                  techItem?.wheel_weight,
                'Variant Metafield: custom.style [single_line_text_field]':
                  invPriceItem?.Style,
                'Variant Metafield: custom.finish_warranty [single_line_text_field]':
                  techItem?.finish_warranty,
                'Variant Metafield: custom.structural_warranty [single_line_text_field]':
                  techItem?.structural_warranty,
                'Variant Metafield: custom.construction_type [single_line_text_field]':
                  techItem?.construction_type,
                'Variant Metafield: custom.bolt_pattern_mm1 [single_line_text_field]':
                  techItem?.bolt_pattern_mm1,
                'Variant Metafield: custom.prop65_chemical1 [single_line_text_field]':
                  techItem?.prop65_chemical1,
                'Variant Metafield: custom.prop65_chemical2 [single_line_text_field]':
                  techItem?.prop65_chemical2,
                'Variant Metafield: custom.prop65_chemical3 [single_line_text_field]':
                  techItem?.prop65_chemical3,

                // 'Variant Metafield: custom.load_index [single_line_text_field]':
                //   techItem?.load_index,
                // 'Variant Metafield: custom.speed_rating [single_line_text_field]':
                //   techItem?.speed_rating,
                // 'Variant Metafield: custom.treadwear [single_line_text_field]':
                //   techItem?.treadwear,
                // 'Variant Metafield: custom.traction [single_line_text_field]':
                //   techItem?.traction,
                // 'Variant Variant Metafield: custom.temperature [single_line_text_field]':
                //   techItem?.temperature,
                // 'Variant Metafield: custom.section_width [single_line_text_field]':
                //   techItem?.section_width,
                // 'Variant Metafield: custom.series [single_line_text_field]':
                //   techItem?.series,
                // 'Variant Metafield: custom.rim_diameter [single_line_text_field]':
                //   techItem?.rim_diameter,
                // 'Variant Metafield: custom.tire_diameter_actual [single_line_text_field]':
                //   techItem?.tire_diameter_actual,
                // 'Variant Metafield: custom.min_width_in [single_line_text_field]':
                //   techItem?.min_width_in,
                // 'Variant Metafield: custom.max_width_in [single_line_text_field]':
                //   techItem?.max_width_in,
                // 'Variant Metafield: custom.max_load [single_line_text_field]':
                //   techItem?.max_load,
                // 'Variant Metafield: custom.display_model_no [single_line_text_field]':
                //   techItem?.display_model_no,
                // 'Variant Metafield: custom.tread_depth [single_line_text_field]':
                //   techItem?.tread_depth,
                // 'Variant Metafield: custom.max_pressure [single_line_text_field]':
                //   techItem?.max_pressure,
                // 'Variant Metafield: custom.load_rating_metric [single_line_text_field]':
                //   techItem?.load_rating_metric,
              }
            })

            return newData
          }
          const newData = generateNewData(file1Data, file2Data)
          // const newDataJson = JSON.stringify(newData)

          const parser = new Parser()
          const csv = parser.parse(newData)

          const newDataBuffer = Buffer.from(csv)
          const newDataStream = new Readable()
          newDataStream.push(newDataBuffer)
          newDataStream.push(null)

          await sftp.put(newDataStream, outputPath)
          res.status(200).json({
            success: true,
            message: 'Files processed and combined successfully',
          })
        } catch (err) {
          console.error(err)
          res.status(500).json({
            success: false,
            message: 'An error occurred while processing the files',
          })
        } finally {
          sftp.end()
        }
      }
    }
  })
})
export default {
  processFiles,
  processAccessoriesFiles,
  processWheelFiles,
  uploadTireFile,
  uploadAccessoriesFile,
  uploadWheelsFile,
}
