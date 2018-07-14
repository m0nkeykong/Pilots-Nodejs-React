var mongoose = require("mongoose"),
  ConsumerSchema = new mongoose.Schema(
    {
      id: mongoose.Schema.Types.ObjectId,
      user_name: String,
      password: String,
      full_name: String,
      phone: String,
      email: String,
      vip: Boolean,
      subscriptions: [
        { type: mongoose.Schema.Types.ObjectId, ref: "ProjectSchema" }
      ],
      positive_votes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "ProjectSchema" }
      ],
      negative_votes: [
        { type: mongoose.Schema.Types.ObjectId, ref: "ProjectSchema" }
      ]
    },
    { collection: "consumer_users" }
  );

module.exports = mongoose.model("ConsumerSchema", ConsumerSchema);
