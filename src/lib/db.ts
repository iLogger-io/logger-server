import { Sequelize } from "sequelize";
import UserModel from "../models/Users";
import DeviceModel from "../models/Devices";
import NotificationModel from "../models/Notifications";

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false,
  },
);

export const User = UserModel(sequelize);
export const Device = DeviceModel(sequelize);
export const Notification = NotificationModel(sequelize);

User.hasMany(Device, {
  foreignKey: {
    name: "email",
    allowNull: false,
  },
  onDelete: "cascade",
  hooks: true,
});

User.hasMany(Notification, {
  foreignKey: {
    name: "email",
    allowNull: false,
  },
  onDelete: "cascade",
  hooks: true,
});

sequelize.sync({ alter: true });
