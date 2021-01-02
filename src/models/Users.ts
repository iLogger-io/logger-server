import crypto from "crypto";
import { Sequelize, DataTypes } from "sequelize";

export = (sequelize: Sequelize) => {
  var User = sequelize.define("users", {
    username: {
      type: DataTypes.STRING(36),
    },
    email: {
      type: DataTypes.STRING(254),
      primaryKey: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    emailVerifiedId: {
      type: DataTypes.STRING(64),
      unique: true,
    },
    informations: {
      type: DataTypes.STRING(10000),
    },
    password: {
      type: DataTypes.STRING(1500),
      set(value: crypto.BinaryLike) {
        const hash = crypto
          .pbkdf2Sync(value, (this as any).salt, 10000, 512, "sha512")
          .toString("hex");
        this.setDataValue("password", hash);
      },
    },
    salt: {
      type: DataTypes.STRING(32),
      defaultValue: crypto.randomBytes(16).toString("hex"),
    },
  });
  User.sync({ alter: true });
  return User;
};
