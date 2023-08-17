import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import pgPromise from "pg-promise";
import { userValidator } from "../../services/userValidator";

import dotenv from 'dotenv';
dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION

interface IExtensions {
  findUser(userId: number): Promise<any>;
}

const options: pgPromise.IInitOptions<IExtensions> = {
  extend(obj) {
    obj.findUser = userId => {
      return obj.one('SELECT u.id, u.email, ud.name, ud.age, ud.location, mg.name as gender, ud.description, ud.is_verified ' +
          'FROM "user" u ' +
          'LEFT JOIN user_details ud ON ud.user_id = u.id ' +
          'LEFT JOIN master_gender mg ON ud.gender_id = mg.id ' +
          'WHERE u.id = $1;', [userId]);
    }
  }
};

const handler = async (event) => {
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

  const params = event.queryStringParameters
  const userId = params.id

  const pgp = pgPromise(options);
  const db = pgp(DB_CONNECTION);
  const user = await db.findUser(userId);

  const data = {
    success: true,
    status: 200,
    data: {
      id: user.id,
      name: user.name,
      age: user.age,
      location: user.location,
      gender: user.gender,
      description: user.description,
      is_verified: user.is_verified
    }
  }
  console.log(data)

  return formatJSONResponse(data);
};

export const main = middyfy(handler);
