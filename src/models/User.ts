import crypto from "crypto";
import { Sequelize, DataTypes, Model } from "sequelize";

class User extends Model {
  public id!: number;
  public displayName!: string | null;
  public givenName!: string | null;
  public familyName!: string | null;
  public email!: string;
  public emailVerified!: boolean | null;
  public emailVerifiedId!: string | null;
  public informations!: string | null;
  public password!: string | null;
  public salt!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export = (sequelize: Sequelize) => {
  User.init(
    {
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
        allowNull: false,
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
    },
    {
      sequelize,
      tableName: "users",
    },
  );
  User.sync({ alter: true });
  return User;
};
