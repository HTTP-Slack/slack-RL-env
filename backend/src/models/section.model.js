import { Schema, model } from "mongoose";

const sectionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    organisation: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true,
    },
    channels: [
      {
        type: Schema.Types.ObjectId,
        ref: "Channel",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Section = model("Section", sectionSchema);
