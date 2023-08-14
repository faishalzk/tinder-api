import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';
import pgPromise from "pg-promise";

interface IExtensions {
  postMatch(userId: number, matchId: number, isLike: boolean): Promise<any>;
}

const options: pgPromise.IInitOptions<IExtensions> = {
  extend(obj) {
    obj.postMatch = (userId, matchId, isLike) => {
      return obj.one('INSERT INTO user_matches (user_id, match_id, is_like) VALUES($1, $2, $3) RETURNING id;', [userId, matchId, isLike]).then(data => {
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
      })
      ;
    }
  }
};

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const body = event.body
  const userId = body.user_id
  const matchId = body.match_id
  let isLike = false
  if (body.is_like && body.is_like === true){
    isLike = true
  }

  const pgp = pgPromise(options);
  const db = pgp('postgres://faishalnaufal:w7IryVUQTt1k@ep-patient-scene-98638697.us-west-2.aws.neon.tech/neondb?options=project%3Dep-patient-scene-98638697&sslmode=require');
  const result = await db.postMatch(userId, matchId, isLike);

  return formatJSONResponse({
    success: true,
    status: result.status ? 200 : 404,
    data: result
  });
};

export const main = middyfy(handler);
