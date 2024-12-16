const app = require('express')()
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')
const os = require('os')
const { exec, execSync } = require('child_process')
require('dotenv').config()

// const homeDirectory = os.homedir()
const directoryPath = path.join(process.env.CP_HOME, process.env.CP_FOLDER);
// const directoryPath = ".";

const port = 10043

app.use(bodyParser.json())

app.post('/', (req, res) => {
  const data = req.body

  console.log(`Problem name: ${data.name}`)
  console.log(`Problem group: ${data.group}`)
  console.log('Full body:')
  console.log(data)

  // Read all files in the directory
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err)
      return
    }

    // Filter files starting with "outcp" or "incp" and ending with ".txt"
    const filesToDelete = files.filter(
      (file) =>
        (file.startsWith('expcp') || file.startsWith('incp')) &&
        file.endsWith('.txt'),
    )

    // Delete each matching file
    filesToDelete.forEach((file) => {
      const filePath = path.join(directoryPath, file)
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting file ${file}:`, err)
        } else {
          console.log(`Deleted file: ${file}`)
        }
      })
    })
  })

  fs.mkdir(directoryPath, { recursive: true }, (err) => {
    if (err) {
      return console.error('Error creating directory', err)
    }

    data.tests.forEach((test, index) => {
      fs.writeFile(directoryPath + `/incp${index}.txt`, test.input, (err) => {
        if (err) {
          return console.error('Error writing to file', err)
        }
        console.log(
          'File written successfully to',
          directoryPath + `/incp${index}.txt`,
        )
      })

      fs.writeFile(directoryPath + `/expcp${index}.txt`, test.output, (err) => {
        if (err) {
          return console.error('Error writing to file', err)
        }
        console.log(
          'File written successfully to',
          directoryPath + `/expcp${index}.txt`,
        )
      })
    })
  })

  res.sendStatus(200)
})

app.post('/run-tests', (req, res) => {
  const { filePath } = req.body

  if (!filePath) {
    return res
      .status(400)
      .json({ error: 'Please provide the full path of the C++ file.' })
  }

  const fileName = path.basename(filePath)
  const fileBaseName = path.parse(filePath).name // Extract base name without extension
  const directory = path.dirname(filePath) // Extract directory path

  const cppFilePath = path.join(directory, `${fileBaseName}.cpp`)
  const outputFilePath = path.join(directory, fileBaseName) // Compiled binary output
  const cmpErrorPath = path.join(directoryPath, `cmperrcp.txt`)

  try {
    // Compile the C++ file in the provided directory
    execSync(
      `g++ ${cppFilePath} -Wall -DONPC -o ${outputFilePath} 2> ${cmpErrorPath}`,
      {
        stdio: 'inherit',
      },
    )
    console.log('Compilation successful.')

    let cnt = 0
    let responseText = ''

    // Loop through all input files in the directory and run tests
    fs.readdirSync(directoryPath).forEach((file) => {
      if (file.startsWith('incp') && file.endsWith('.txt')) {
        const errorPath = path.join(directoryPath, `errcp${cnt}.txt`)
        const inputPath = path.join(directoryPath, file)
        const outputPath = path.join(directoryPath, `outcp${cnt}.txt`)
        const expectedPath = path.join(directoryPath, `expcp${cnt}.txt`)

        try {
          // Run the compiled file with the input file synchronously
          execSync(
            `${outputFilePath} < ${inputPath} > ${outputPath} 2> ${errorPath}`,
          )

          responseText += `${fs.readFileSync(errorPath, 'utf8')}`

          // Compare the output with the expected output
          const output = fs.readFileSync(outputPath, 'utf8')
          const expected = fs.existsSync(expectedPath)
            ? fs.readFileSync(expectedPath, 'utf8')
            : ''

          if (output !== expected) {
            responseText += `\nError found in test ${cnt + 1}!\n`
            responseText += `\x1b[4mInput\x1b[0m:\n${fs.readFileSync(inputPath, 'utf8')}\n`
            responseText += `\x1b[4mWrong Output\x1b[0m:\n${output}\n`
            responseText += `\x1b[4mCorrect Output\x1b[0m:\n${expected}\n`
          } else {
            responseText += `Test ${cnt + 1} passed.\n`
          }
        } catch (error) {
          responseText += `Execution error on test ${cnt + 1}: ${error.message}\n`
        }

        cnt++
      }
    })

    // Send the result as a response
    res.send(responseText || 'All tests passed successfully.')
  } catch (err) {
    const cmpErrorPath = path.join(directoryPath, `cmperrcp.txt`)
    const errText = `${fs.readFileSync(cmpErrorPath, 'utf8')}\n`
    console.error(`Compilation error: ${errText}`)
    res.status(500).send(`Compilation error: ${errText}`)
  }
})

app.listen(port, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.log(`Listening on port ${port}`)
})
