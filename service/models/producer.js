var mongoose = require("mongoose"),
  ProducerSchema = new mongoose.Schema(
    {
      id: mongoose.Schema.Types.ObjectId,
      user_name: String,
      password: String,
      full_name: String,
      phone: String,
      email: String,
      projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "ProjectSchema" }]
    },
    { collection: "producer_users" }
  );

module.exports = mongoose.model("ProducerSchema", ProducerSchema);
