import pgPromise from "pg-promise";
import * as jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

interface IExtensions {
    findUserToken(userId: number, accessToken: string): Promise<any>;
}

const options: pgPromise.IInitOptions<IExtensions> = {
    extend(obj) {
        obj.findUserToken = (userId, accessToken) => {
            return obj.one('SELECT uat.user_id FROM user_access_token uat ' +
                'WHERE uat.user_id = $1 AND access_token = $2 ' +
                'ORDER BY uat.created_at DESC LIMIT 1;', [userId, accessToken]);
        }
    }
};

export const userValidator = async (token) => {
    let payload;

    try {
        payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    } catch (e) {
        const data = {
            success: false,
            data: e.message
        }
        console.log(data)
        return data
    }

    const userId = payload.userId
    const pgp = pgPromise(options);
    const db = pgp(DB_CONNECTION);
    const result = await db.findUserToken(userId, token);

    const data = {
        success: true,
        data: result
    }
    console.log(data)
    return data
}
