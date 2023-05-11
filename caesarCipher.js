// Import the Express framework
const express = require('express');
// Create an Express app instance
const app = express();
// Import the body-parser middleware for parsing incoming request bodies
const bodyParser = require('body-parser');
// Import the fs module for file I/O operations
const fs = require('fs');
// Import the stream module for working with streams of data
const stream = require('stream');

// Function to handle form submission
async function handleFormSubmission(req, res) {
  // Extracts input values from the request body
  const { filename, shiftValue, operation, moduloValue, foreignChars } =
    req.body;
  shift = parseInt(shiftValue);
  modulo = parseInt(moduloValue);

  // Check if the input file exists
  if (!fs.existsSync(filename)) {
    const errorMessage = 'Input file not found.';
    const redirectUrl = `/?error=${encodeURIComponent(errorMessage)}`;
    return res.redirect(redirectUrl);
  }

  // Create a read stream to read from the input file
  const readStream = fs.createReadStream(filename, 'utf8');

  // Define the output filename based on the operation
  const outputFilename =
    operation === 'encrypt' ? 'ciphertext.txt' : 'plaintext.txt';

  // Create a write stream to write to the output file
  const writeStream = fs.createWriteStream(outputFilename, 'utf8');

  // Encrypt or decrypt the input using the Caesar cipher
  const cipherStream = readStream.pipe(
    operation === 'encrypt'
      ? caesarCipherStream(shift, modulo, foreignChars)
      : caesarCipherStream(modulo - shift, modulo, foreignChars)
  );

  // Pipe the encrypted/decrypted data to the write stream
  cipherStream.pipe(writeStream);

  // Wait for the write stream to finish writing to the output file
  await new Promise((resolve) => writeStream.on('finish', resolve));

  // Read file with certain limits of characters
  async function readFileWithLimit(filename, limit) {
    const readStream = fs.createReadStream(filename, {
      encoding: 'utf8',
      start: 0,
      end: limit,
    });
    let output = '';
    for await (const chunk of readStream) {
      output += chunk;
    }
    if (output.length > limit) {
      output = output.substring(0, limit) + '...';
    }
    return output;
  }
  // Read the first 100 characters from a file
  const output = await readFileWithLimit(outputFilename, 1000);
  const inputFileContent = await readFileWithLimit(filename, 1000);

  const successMessage = `The file has been ${
    operation === 'encrypt' ? 'encrypted' : 'decrypted'
  } and saved as '${outputFilename}'.`;
  
  // Add the values to the url and redirect
  const redirectUrl = `/?success=${encodeURIComponent(
    successMessage
  )}&filename=${encodeURIComponent(filename)}&shiftValue=${encodeURIComponent(
    shiftValue
  )}&operation=${encodeURIComponent(
    operation
  )}&moduloValue=${encodeURIComponent(
    moduloValue
  )}&foreignChars=${encodeURIComponent(
    foreignChars
  )}&fileContentValue=${encodeURIComponent(
    inputFileContent
  )}&outputValue=${encodeURIComponent(output)}`;

  res.redirect(redirectUrl);
}

// Define the route for the HTML form
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serve the styles.css file
app.get('/style.css', (req, res) => {
  res.sendFile(__dirname + '/style.css');
});

// To read the data using middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Define the route for handling the form submission
app.post('/submit', handleFormSubmission);

// Run the web at port 3000
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

function caesarCipherStream(shift, modulo, foreignChars) {
  // Create a regular expression that matches all characters except letters, numbers, and spaces
  const specialCharsRegExp = /[^a-z0-9\s]/g;

  // Create a string containing all the characters in the modulo
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'.substring(
    0,
    modulo
  );

  // Build a mapping of each character to its shifted counterpart
  const shiftedCharacters = {};
  for (let i = 0; i < characters.length; i++) {
    const originalIndex = i;
    const shiftedIndex = (((i + shift) % modulo) + modulo) % modulo;
    const originalChar = characters.charAt(originalIndex);
    const shiftedChar = characters.charAt(shiftedIndex);
    shiftedCharacters[originalChar] = shiftedChar;
  }

  // Create a transform stream that applies the Caesar cipher to the input data
  return new stream.Transform({
    transform(chunk, encoding, callback) {
      // Remove or ignore foreign characters from the input chunk, depending on the value of `foreignChars`
      const cleanedChunk =
        foreignChars === 'ignore'
          ? chunk.toString().toLowerCase()
          : chunk.toString().toLowerCase().replace(specialCharsRegExp, '');

      // Apply the mapping to each character in the cleaned chunk
      let output = '';
      for (let i = 0; i < cleanedChunk.length; i++) {
        const originalChar = cleanedChunk.charAt(i);
        const shiftedChar = shiftedCharacters[originalChar] || originalChar;
        output += shiftedChar;
      }
      // Push the encrypted/decrypted data to the output
      this.push(output);

      // Call the callback to indicate that processing of this chunk is complete
      callback();
    },
  });
}
