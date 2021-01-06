import mongoose from "mongoose";

let LogsSchema: any = new mongoose.Schema(
  {
    deviceid: {
      type: String,
      required: true,
    },
    log: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Log = mongoose.model("logs", LogsSchema);
