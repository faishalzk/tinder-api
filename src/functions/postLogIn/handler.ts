import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import * as CryptoJS from 'crypto-js';
import schema from './schema';
import pgPromise from "pg-promise";
import { jwtGenerator } from "../../services/jwtGenerator";
import dotenv from 'dotenv';
dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION

interface IExtensions {
  getUser(username: string, password: string): Promise<any>;
}

interface ILogin {
  email: string,
  password: string
}

const hashPassword = (password: string) => {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
}

const options: pgPromise.IInitOptions<IExtensions> = {
  extend(obj) {
    obj.getUser = (email, hashedPassword) => {
      return obj.one('SELECT u.id, u.email, ud.name, ud.age, ud.location, mg.name as gender, ud.description, ud.is_verified ' +
          'FROM "user" u ' +
          'LEFT JOIN user_details ud ON ud.user_id = u.id ' +
          'LEFT JOIN master_gender mg ON ud.gender_id = mg.id ' +
          'WHERE u.email = $1 AND u.password = $2;', [email, hashedPassword]).then(data => {
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
  console.log('Start login')
  const loginObj = <ILogin> event.body
  const hashedPassword = hashPassword(loginObj.password)

  console.log('Validate user')
  const pgp = pgPromise(options);
  const db = pgp(DB_CONNECTION);
  let result = await db.getUser(loginObj.email, hashedPassword);
  console.log(result)

  if (result && result.id) {
    console.log('User validated')
    result = await jwtGenerator(result.id)
  } else {
    return formatJSONResponse({
      success: false,
      status: 404,
      data: {
        message: "User doesn't exist"
      }
    });
  }

  return formatJSONResponse({
    success: true,
    status: result.success ? 200 : 404,
    data: result.data
  });
};

export const main = middyfy(handler);
