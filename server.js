const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON body
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Path to the database file
const dbFilePath = path.join(__dirname, 'db', 'db.json');

// Route to serve notes.html
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

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

// Route to save a new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body;

  readNotesFromFile((err, notes) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    
    // Assign a unique ID to the new note
    newNote.id = Date.now().toString();

    // Add the new note to the list of notes
    notes.push(newNote);

    // Write the updated list of notes to the database file
    writeNotesToFile(notes, (err) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.status(201).json(newNote);
    });
  });
});

// Route to delete a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  readNotesFromFile((err, notes) => {
    if (err) {
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Find the index of the note with the given ID
    const index = notes.findIndex(note => note.id === noteId);
    if (index === -1) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    // Remove the note from the list of notes
    notes.splice(index, 1);

    // Write the updated list of notes to the database file
    writeNotesToFile(notes, (err) => {
      if (err) {
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      res.status(204).send();
    });
  });
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
