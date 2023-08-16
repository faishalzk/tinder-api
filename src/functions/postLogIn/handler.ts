import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import * as CryptoJS from 'crypto-js';
import * as jwt from 'jsonwebtoken';

import schema from './schema';
import pgPromise from "pg-promise";

interface IExtensions {
  getUser(username: string, password: string): Promise<any>;
  postToken(userTokenObj: IUserToken): Promise<any>;
}

interface ILogin {
  email: string,
  password: string
}

interface IUserToken {
  userId: number,
  accessToken: string,
  accessTokenExpiredAt: Date,
  refreshToken: string,
  refreshTokenExpiredAt: Date
}

function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
}

function generateAccessToken(userId: string): string {
  const accessTokenSecret = '195678f1514b677b923c04339103c059e0a2f015dab28788749628f1b67a42cb';
  return jwt.sign({ userId }, accessTokenSecret, { expiresIn: '15m' });
}

function generateRefreshToken(userId: string): string {
  const refreshTokenSecret = 'ea0d8e355aa5d4f3b273ac9a051ab52701ebad9f91598a10e31f09b00d36183a';
  return jwt.sign({ userId }, refreshTokenSecret, { expiresIn: '90d' });
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

    obj.postToken = (userTokenObj) => {
      return obj.one('INSERT INTO user_access_token (user_id, access_token, access_token_expired_at, refresh_token, refresh_token_expired_at) ' +
          'VALUES($1, $2, $3, $4, $5) RETURNING id, access_token, access_token_expired_at, refresh_token, refresh_token_expired_at;',
          [
              userTokenObj.userId,
              userTokenObj.accessToken,
              userTokenObj.accessTokenExpiredAt,
              userTokenObj.refreshToken,
              userTokenObj.refreshTokenExpiredAt]).then(data => {
        console.log(data.id); // print new user id;
        return {
          success: true,
          id: data.id,
          data: data
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

  const pgp = pgPromise(options);
  console.log('Validate user')
  const db = pgp('postgres://faishalnaufal:w7IryVUQTt1k@ep-patient-scene-98638697.us-west-2.aws.neon.tech/neondb?options=project%3Dep-patient-scene-98638697&sslmode=require');
  let result = await db.getUser(loginObj.email, hashedPassword);
  console.log(result)
  if (result && result.id) {
    console.log('User validated')
    const accessToken = generateAccessToken(result.id)
    let accessExpiryTime = new Date()
    accessExpiryTime = new Date(accessExpiryTime.getTime() + 600000)

    const refreshToken = generateRefreshToken(result.id)
    let refreshExpiryTime = new Date()
    refreshExpiryTime.setDate(refreshExpiryTime.getDate() + 90);

    let userTokenObj: IUserToken = {
      userId: result.id,
      accessToken: accessToken,
      accessTokenExpiredAt: accessExpiryTime,
      refreshToken: refreshToken,
      refreshTokenExpiredAt: refreshExpiryTime
    };
    result = await db.postToken(userTokenObj);
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
