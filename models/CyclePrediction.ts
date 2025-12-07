import Realm, { BSON } from 'realm';

export class CyclePrediction extends Realm.Object {
  _id!: BSON.ObjectId;
  nextPredictedDate!: Date;
  notificationIds!: string[];

  static schema: Realm.ObjectSchema = {
    name: 'CyclePrediction',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: () => new BSON.ObjectId() },
      nextPredictedDate: 'date',
      notificationIds: 'string[]',
    },
  };
}