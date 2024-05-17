const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON body
app.use(express.json());

// Path to the database file
const dbFilePath = path.join(__dirname, 'db', 'db.json');

// Function to read notes from the database file
const readNotesFromFile = (callback) => {
  fs.readFile(dbFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      callback(err, null);
      return;
    }
    callback(null, JSON.parse(data));
  });
};

// Function to write notes to the database file
const writeNotesToFile = (notes, callback) => {
  fs.writeFile(dbFilePath, JSON.stringify(notes, null, 2), (err) => {
    if (err) {
      console.error(err);
      callback(err);
      return;
    }
    callback(null);
  });
};

// Route to get all notes
app.get('/api/notes', (req, res) => {
  readNotesFromFile((err, notes) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(notes);
  });
});