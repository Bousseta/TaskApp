const paginate = require('express-paginate');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

const ListSchema =new mongoose.Schema({
    title:{
        type: String,
        required: true,
        minLength:1,
        trim: true
    },
    _userId:{
        type:mongoose.Types.ObjectId,
        required: true
    },
});
ListSchema.plugin(mongoosePaginate);
const List = mongoose.model('List', ListSchema);
module.exports = { List}
