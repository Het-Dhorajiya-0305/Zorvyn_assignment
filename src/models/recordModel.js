import mongoose from "mongoose";

const recordSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
      index: true,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "salary",
        "food",
        "rent",
        "shopping",
        "travel",
        "health",
        "other"
      ],
      index: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    currency: {
      type: String,
      default: "INR",
    },
  },
  { timestamps: true }
);


recordSchema.index({ createdBy: 1, date: -1 });
recordSchema.index({ type: 1, category: 1 });


const Record=mongoose.model("Record", recordSchema);

export default Record;