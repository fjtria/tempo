import Realm, { BSON } from 'realm';

export class HydrationReminder extends Realm.Object {
  _id!: BSON.ObjectId;
  name!: string;
  hour!: number;
  minute!: number;
  notificationIds!: string[];
  createdAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'HydrationReminder',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      hour: 'int',
      minute: 'int',
      notificationIds: 'string[]',
      createdAt: { type: 'date', default: () => new Date() },
    },
  };
}