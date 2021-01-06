import crypto from "crypto";
import { Sequelize, DataTypes } from "sequelize";

export = (sequelize: Sequelize) => {
  var User = sequelize.define("users", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    displayName: {
      type: DataTypes.STRING(36),
    },
    givenName: {
      type: DataTypes.STRING(36),
    },
    familyName: {
      type: DataTypes.STRING(36),
    },
    email: {
      type: DataTypes.STRING(254),
      unique: true,
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
