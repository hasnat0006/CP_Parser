const app = require('express')()
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const os = require('os')
const { exec, execSync } = require('child_process')
require('dotenv').config()

const homeDirectory = os.homedir()
const directoryPath = path.join(process.env.CP_HOME, process.env.CP_FOLDER)
const templateFilePath = process.env.CP_TEMPLATE_FOLDER

const port = 10043

app.use(bodyParser.json())

app.post('/', (req, res) => {
  const data = req.body
  console.log('Received data:', data)

  const sanitizedGroup = data.group.replace(/\s+/g, '_')
  const sanitizedName = data.name.replace(/\s+/g, '_')
  const groupFolderPath = path.join(directoryPath, sanitizedGroup)
  const ioFolderPath = path.join(groupFolderPath, 'IO')

  // Create a folder same as `group` and an IO folder inside it
  fs.mkdir(ioFolderPath, { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating group or IO folder:', err)
      return res.status(500).send('Error creating group or IO folder')
    }

    console.log(`Group folder ensured at: ${groupFolderPath}`)
    console.log(`IO folder ensured at: ${ioFolderPath}`)

    // Create a .cpp file same as `name` with the content of the template file
    const cppFilePath = path.join(groupFolderPath, `${sanitizedName}.cpp`)

    fs.readFile(templateFilePath, 'utf8', (err, templateContent) => {
      if (err) {
        console.error('Error reading template file:', err)
        return res.status(500).send('Error reading template file')
      }

      fs.writeFile(cppFilePath, templateContent, (err) => {
        if (err) {
          console.error('Error creating .cpp file:', err)
          return res.status(500).send('Error creating .cpp file')
        }

        console.log(`.cpp file created with template content at: ${cppFilePath}`)

        // Cleanup old files in IO folder
        fs.readdir(ioFolderPath, (err, files) => {
          if (err) {
            console.error('Error reading IO directory:', err)
            return
          }

          const filesToDelete = files.filter(
            (file) =>
              (file.startsWith('expcp') || file.startsWith('incp')) &&
              file.endsWith('.txt'),
          )

          filesToDelete.forEach((file) => {
            const filePath = path.join(ioFolderPath, file)
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(`Error deleting file ${file}:`, err)
              } else {
                console.log(`Deleted file: ${file}`)
              }
            })
          })
        })

        // Write test cases to IO folder
        const firstChar = sanitizedName.charAt(0)

        data.tests.forEach((test, index) => {
          const inputFileName = `${firstChar}_in${index + 1}.txt`
          const expectedFileName = `${firstChar}_exp${index + 1}.txt`

          fs.writeFile(
            path.join(ioFolderPath, inputFileName),
            test.input,
            (err) => {
              if (err) {
                console.error('Error writing input file:', err)
              } else {
                console.log(`Input file written: ${inputFileName}`)
              }
            },
          )

          fs.writeFile(
            path.join(ioFolderPath, expectedFileName),
            test.output,
            (err) => {
              if (err) {
                console.error('Error writing expected file:', err)
              } else {
                console.log(`Expected file written: ${expectedFileName}`)
              }
            },
          )
        })

        res.sendStatus(200)
      })
    })
  })
})

app.listen(port, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(`Listening on port ${port}`)
})
