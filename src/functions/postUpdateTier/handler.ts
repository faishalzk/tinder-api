import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import pgPromise from "pg-promise";
import {userValidator} from "../../services/userValidator";

import dotenv from 'dotenv';
dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION

interface IExtensions {
  postUserDetails(userTier: number, userId: number): Promise<any>;
}

const options: pgPromise.IInitOptions<IExtensions> = {
  extend(obj) {
    obj.postUserDetails = (userTier, userId) => {
      return obj.one('UPDATE "user" SET user_tier=$1 WHERE id=$2 RETURNING id;', [userTier, userId]).then(data => {
        console.log(data.id); // print new user id;
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
    }
  }
};

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const headers = event.headers
  const authToken = headers.Authorization
  const token = authToken.replace("Bearer ", "")

  const validateResult = await userValidator(token)
  if (!validateResult.success){
    const data = {
      success: validateResult.success,
      status: 404,
      data: validateResult.data
    }
    console.log(data)

    return formatJSONResponse(data);
  }

  const body = event.body
  const userId = validateResult.data.id
  const userTier = body.user_tier

  const pgp = pgPromise(options);
  const db = pgp(DB_CONNECTION);
  const result = await db.postUserDetails(userTier, userId);

  return formatJSONResponse({
    success: true,
    status: result.success ? 200 : 404,
    data: result
  });
};

export const main = middyfy(handler);
