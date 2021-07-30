module.exports = function autoInc(id, mongoose) {
  const Counter = mongoose.model(
    "Counter",
    new mongoose.Schema({
      name: String,
      increament: Number,
    })
  );

  return Counter.findOneAndUpdate(
    { name: id },
    { $inc: { increament: 1 } },
    { upsert: true, new: true }
  );
};
