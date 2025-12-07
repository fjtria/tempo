import Realm, { BSON } from 'realm';

export class CycleEntry extends Realm.Object {
  _id!: BSON.ObjectId;
  date!: Date;
  createdAt!: Date;

  static schema: Realm.ObjectSchema = {
    name: 'CycleEntry',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      date: 'date',
      createdAt: { type: 'date', default: () => new Date() },
    },
  };
}