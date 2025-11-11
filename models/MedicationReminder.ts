import Realm, { BSON } from 'realm';

export class MedicationReminder extends Realm.Object {
  _id!: BSON.ObjectId;
  name!: string;
  hour!: number;
  minute!: number;
  weekdays!: number[];
  notificationIds!: string[]; // key
  createdAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'MedicationReminder',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      name: 'string',
      hour: 'int',
      minute: 'int',
      weekdays: 'int[]',
      notificationIds: 'string[]', // IDs from the notification hook
      createdAt: { type: 'date', default: () => new Date() },
    },
  };
}