import { Realm } from '@realm/react';

// Structure of Profile object in database
export class Profile extends Realm.Object<Profile> {
  _id!: Realm.BSON.ObjectId;
  firstName!: string;
  lastName!: string;
  dateOfBirth?: Date;
  gender?: string;
  bloodTypeLetter?: string;
  bloodTypeRh?: string;

  static schema: Realm.ObjectSchema = {
    name: 'Profile',
    primaryKey: '_id',
    properties: {
      _id: 'objectId',
      firstName: 'string',
      lastName: 'string',
      dateOfBirth: 'date?', // ? marks property as optional
      gender: 'string?',
      bloodTypeLetter: 'string?',
      bloodTypeRh: 'string?',
    },
  };
}