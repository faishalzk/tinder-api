import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import * as CryptoJS from 'crypto-js';

import schema from './schema';
import pgPromise from "pg-promise";

import dotenv from 'dotenv';
dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION

interface IExtensions {
  postUser(userObj: IUser, hashedPassword: string): Promise<any>;
}

interface IUser {
  email: string,
  password: string,
  name: string,
  gender: number,
  location?: string,
  age?: number,
  description?: string
}

function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
}

const options: pgPromise.IInitOptions<IExtensions> = {
  extend(obj) {
    obj.postUser = (userObj, hashedPassword) => {
      return obj.one('INSERT INTO "user" (email, password, user_tier) VALUES($1, $2, $3) RETURNING id;', [userObj.email, hashedPassword, 1]).then(data => {
        const userId = data.id
        return obj.one('INSERT INTO user_details (name, gender_id, age, "location", interest, description, user_id, is_verified) ' +
            'VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id;', [
                userObj.name,
                userObj.gender,
                userObj.age,
                userObj.location,
                userObj.gender == 1 ? 2 : 1,
                userObj.description,
                userId,
                false]).then(data => {
          return {
            success: true,
            id: data.id
          }
        })
        .catch(error => {
          console.log('ERROR:', error); // print error;
          return {
            success: false
          }
        });
      })
      .catch(error => {
        console.log('ERROR:', error); // print error;
        return {
          success: false
        }
      });
    }
  }
};

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const userObj = <IUser> event.body
  const hashedPassword = hashPassword(userObj.password)

  const pgp = pgPromise(options);
  const db = pgp(DB_CONNECTION);
  const result = await db.postUser(userObj, hashedPassword);

  return formatJSONResponse({
    success: true,
    status: result.success ? 200 : 404,
    data: result
  });
};

export const main = middyfy(handler);
