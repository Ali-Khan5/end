const mongoose = require('mongoose');

const NoteSchema=mongoose.Schema({
    title:String,
    content:String,
    img:String
},
{
    timestamps:true
}
);

module.exports =mongoose.model('Note',NoteSchema);
