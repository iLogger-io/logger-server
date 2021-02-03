import mongoose from "mongoose";
import { Level } from "../types/enum";

const LogsSchema: any = new mongoose.Schema(
  {
    client_id: {
      type: String,
      required: true,
    },
    log: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: Object.values(Level),
      default: Level.NORMAL,
      required: true,
    },
  },
  { timestamps: true },
);

export const Log = mongoose.model("logs", LogsSchema);
