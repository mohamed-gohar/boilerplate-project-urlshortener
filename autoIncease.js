const mongoose = require("mongoose");
const { Schema } = mongoose;

const Counter = mongoose.model(
  "Counter",
  new Schema({
    name: String,
    increament: Number,
  })
);
module.exports = function autoInc(id) {
  return Counter.findOneAndUpdate(
    { name: id },
    { $inc: { increament: 1 } },
    { upsert: true, new: true }
  );
};
