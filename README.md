# Caesar Cipher

Caesar Cipher is a web application that allows you to encrypt and decrypt files using the Caesar cipher algorithm. The application is built with Node.js and Express.

## Features

- Encrypt or decrypt files using the Caesar cipher
- Specify the shift key and modulo value for encryption/decryption
- Remove or ignore foreign characters during the cipher operation
- View file text content and output in the web interface

## Prerequisites

- Node.js
- npm

## Installation

1. Clone the repository
2. Install the dependencies:
- node caesarCipher
3. Open your web browser and go to http://localhost:3000.
4. Fill in the form with the following details:
- Operation: Select either "Encrypt" or "Decrypt".
- Shift Key: Enter an integer between -36 and 36 (excluding 0).
- Modulo: Enter an integer between -36 and 36 (excluding 0).
- File Name: Enter the name of the input file (include the file extension).
- Foreign Chars: Select either "Remove" or "Ignore" to handle foreign characters.
- Click the "Submit" button to perform the encryption/decryption operation.
- The application will display the file text content and the output in the web interface.
5. Additional Details:
- Encrypted output will be saved as "ciphertext.txt" in the current directory.
- Decrypted output will be saved as "plaintext.txt" in the current directory.