import { Sequelize, DataTypes, Model } from "sequelize";

class Notification extends Model {
  public id!: number;
  public email!: string | null;
  public messages!: string | null;
  public user_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export = (sequelize: Sequelize) => {
  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(254),
      },
      messages: {
        type: DataTypes.STRING(200),
      },
      user_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: "notifications",
    },
  );
  Notification.sync({ alter: true });
  return Notification;
};
