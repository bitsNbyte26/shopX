const mongoose = require("mongoose");
const path= require("path");
const schema = mongoose.Schema;

const productSchema = new schema({
  name:{
    type: String,
    require: true,
    unique:true
  },
  category:{
    type: String,
    enum :{
      values: ["Soap", "Other"],
      message: "Please select Soap or Other",
    },
    require: true
  },
  quantity:{
    type: Number,
    require: true
  },
  description:{
    type: String
  },
  price:{
    type: Number,
    require:true
  },
  imageUrl:[{
    type: String,
    default: path.join('images','noprofile.png')
  }],
  eachrating:[{
    user:{ 
      type: schema.Types.ObjectId,
      ref:'user'
    },
    name:{
      type: String,
    },
    date:{
      type: Date
    },
    rate:{
    type: Number,
    require: false,
    min:1,
    max:5,
    },
    userreview:{
      type: String,
      require: false,
    },
  }],
  avgrating:{ 
      type: Number,
      default:0
  }
}
)

module.exports = mongoose.model("product",productSchema);