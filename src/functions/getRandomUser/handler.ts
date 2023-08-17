import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import pgPromise from "pg-promise";
import {userValidator} from "../../services/userValidator";

import dotenv from 'dotenv';
dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION

interface IExtensions {
  findUser(userId: number, gender_id: number, user_tier: number): Promise<any>;
  countMatch(userId: number): Promise<any>;
  getActorProfile(userId: number): Promise<any>;
}

const options: pgPromise.IInitOptions<IExtensions> = {
  extend(obj) {
    obj.findUser = (userId, gender_id, user_tier) => {
      let query = 'SELECT u.id, u.email, ud.name, ud.age, ud.location, mg.name as gender, ud.description, ud.is_verified ' +
          'FROM "user" u ' +
          'LEFT JOIN user_details ud ON u.id = ud.user_id ' +
          'LEFT JOIN master_gender mg ON ud.gender_id = mg.id ' +
          'WHERE u.id NOT IN ( ' +
              'SELECT um.match_id FROM "user" u2 ' +
              'LEFT JOIN user_matches um ON u2.id = um.user_id ' +
              'WHERE u2.id = $1 ' +
          ') AND u.id != $2 AND ud.gender_id != $3 '

      if (user_tier == 2){
        query = query + 'AND ud.is_verified is TRUE '
      }
      query = query + 'ORDER BY RANDOM() LIMIT 1;'

      return obj.one(query, [userId, userId, gender_id]);
    }

    obj.countMatch = (userId) => {
      return obj.one('SELECT COUNT(*) AS counter FROM user_matches um ' +
          'WHERE um.user_id = $1 AND created_at > CURRENT_DATE;', [userId]);
    }

    obj.getActorProfile = (userId) => {
      return obj.one('SELECT u.id, u.user_tier, ud.gender_id AS gender FROM "user" u ' +
          'LEFT JOIN user_details ud ON u.id = ud.user_id ' +
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

  const pgp = pgPromise(options);
  const db = pgp(DB_CONNECTION);
  const user = await db.getActorProfile(validateResult.data.user_id);

  if (user.user_tier == 1){
    const count = await db.countMatch(user.id);
    if (count.counter >= 10){
      const data = {
        success: false,
        status: 404,
        data: "You have reached swiping quota, please upgrade to swipe more"
      }
      console.log(data)

      return formatJSONResponse(data);
    }
  }

  const result = await db.findUser(user.id, user.gender, user.user_tier);
  const data = {
    success: true,
    status: 200,
    data: result
  }
  console.log(data)

  return formatJSONResponse(data);
};

export const main = middyfy(handler);
