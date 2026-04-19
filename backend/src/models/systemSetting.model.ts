import { Schema, model } from "mongoose";

export interface ISystemSetting {
  key: string;
  valueNumber: number;
  createdAt: Date;
  updatedAt: Date;
}

const systemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    valueNumber: { type: Number, required: true }
  },
  { timestamps: true }
);

export const SystemSettingModel = model<ISystemSetting>("SystemSetting", systemSettingSchema);
