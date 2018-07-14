var mongoose = require("mongoose"),
  ProjectSchema = new mongoose.Schema(
    {
      id: mongoose.Schema.Types.ObjectId,
      category: String,
      owner: { type: mongoose.Schema.Types.ObjectId, ref: "ProducerSchema" },
      title: String,
      goal: Number,
      positive_voters: [
        { type: mongoose.Schema.Types.ObjectId, ref: "ConsumerSchema" }
      ],
      negative_voters: [
        { type: mongoose.Schema.Types.ObjectId, ref: "ConsumerSchema" }
      ],
      goal_status: Number,
      open_timestamp: String,
      description: String,
      deadline: String,
      cover_image: String,
      subscribers: [
        { type: mongoose.Schema.Types.ObjectId, ref: "ConsumerSchema" }
      ]
    },
    { collection: "projects" }
  );

module.exports = mongoose.model("ProjectSchema", ProjectSchema);
