module.exports=(app)=>{
    const notes=require('../controllers/note.controller.js');
    const upload=require("../../server");
    console.log(upload);

//app.post('/notes',upload.single('productImage'),notes.create);

app.get('/notes',notes.findAll);

// Retrieve a single Note with noteId
app.get('/notes/:noteId', notes.findOne);

// Update a Note with noteId
app.put('/notes/:noteId', notes.update);

// Delete a Note with noteId
app.delete('/notes/:noteId', notes.delete);
}