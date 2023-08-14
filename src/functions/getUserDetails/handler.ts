import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import pgPromise from "pg-promise";

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
          'WHERE u.id = 2;', [userId]);
    }
  }
};

const handler = async (event) => {
  const params = event.queryStringParameters
  const userId = params.id

  const pgp = pgPromise(options);
  const db = pgp('postgres://faishalnaufal:w7IryVUQTt1k@ep-patient-scene-98638697.us-west-2.aws.neon.tech/neondb?options=project%3Dep-patient-scene-98638697&sslmode=require');
  const user = await db.findUser(userId);

  return formatJSONResponse({
    id: user.id,
    name: user.name,
    age: user.age,
    location: user.location,
    gender: user.gender,
    description: user.description,
    is_verified: user.is_verified
  });
};

export const main = middyfy(handler);
