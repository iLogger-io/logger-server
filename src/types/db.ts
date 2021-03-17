import { Model, Optional, Association } from "sequelize";

export interface NotificationAttributes {
  id: number;
  email: string | null;
  messages: string | null;
  user_id: number;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, "id"> {}
export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes {
  public id!: number;
  public email!: string | null;
  public messages!: string | null;
  public user_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;

  public static associations: {
    user: Association<User>;
  };
}

export interface ClientAttributes {
  id: number;
  email: string | null;
  clientid: string;
  name: string;
  settings: string | null;
  user_id: number;
}

interface ClientCreationAttributes extends Optional<ClientAttributes, "id"> {}
export class Client
  extends Model<ClientAttributes, ClientCreationAttributes>
  implements ClientAttributes {
  public id!: number;
  public email!: string | null;
  public clientid!: string;
  public name!: string;
  public settings!: string | null;
  public user_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;

  public static associations: {
    user: Association<User>;
  };
}

interface UserAttributes {
  id: number;
  displayName: string | null;
  givenName: string | null;
  familyName: string | null;
  email: string;
  emailVerified: boolean | null;
  emailVerifiedId: string | null;
  informations: string | null;
  password: string | null;
  salt: string | null;
}

interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
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

  public readonly clients?: Client[];
  public readonly notification?: Notification[];

  public static associations: {
    projects: Association<Notification, Client>;
  };
}
