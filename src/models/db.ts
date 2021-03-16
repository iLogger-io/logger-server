import { Sequelize } from "sequelize";
import mongoose from "mongoose";
import UserModel from "./User";
import ClientModel from "./Client";
import NotificationModel from "./Notification";

mongoose.connect(
  `mongodb://${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.MONGODB_NAME}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);

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

/* Export models Postgres */
export const User = UserModel(sequelize);
export const Client = ClientModel(sequelize);
export const Notification = NotificationModel(sequelize);

/* Export models MongoDB */
export { Log } from "./Log";

User.hasMany(Client, {
  as: "clients",
  foreignKey: {
    name: "id",
    allowNull: false,
  },
  onDelete: "cascade",
  hooks: true,
});

Client.belongsTo(User, { as: "user", foreignKey: "id" });

User.hasMany(Notification, {
  as: "notifications",
  foreignKey: {
    name: "id",
    allowNull: false,
  },
  onDelete: "cascade",
  hooks: true,
});

Notification.belongsTo(User, { as: "user", foreignKey: "id" });

sequelize.sync({ alter: true });
