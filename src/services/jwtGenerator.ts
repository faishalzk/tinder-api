import * as jwt from 'jsonwebtoken';
import pgPromise from "pg-promise";

import dotenv from 'dotenv';
dotenv.config();

const DB_CONNECTION = process.env.DB_CONNECTION
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

const generateAccessToken = (userId: string) => {
    return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

const generateRefreshToken = (userId: string) => {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '90d' });
}

interface IExtensions {
    postToken(userTokenObj: IUserToken): Promise<any>;
}

interface IUserToken {
    userId: number,
    accessToken: string,
    accessTokenExpiredAt: Date,
    refreshToken: string,
    refreshTokenExpiredAt: Date
}

const options: pgPromise.IInitOptions<IExtensions> = {
    extend(obj) {
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

export const jwtGenerator = async (userId) => {

    const accessToken = generateAccessToken(userId)
    let accessExpiryTime = new Date()
    accessExpiryTime = new Date(accessExpiryTime.getTime() + 600000)

    const refreshToken = generateRefreshToken(userId)
    let refreshExpiryTime = new Date()
    refreshExpiryTime.setDate(refreshExpiryTime.getDate() + 90);

    let userTokenObj: IUserToken = {
        userId: userId,
        accessToken: accessToken,
        accessTokenExpiredAt: accessExpiryTime,
        refreshToken: refreshToken,
        refreshTokenExpiredAt: refreshExpiryTime
    };

    const pgp = pgPromise(options);
    const db = pgp(DB_CONNECTION);
    const result = await db.postToken(userTokenObj);

    const data = {
        success: true,
        status: result.success ? 200 : 404,
        data: result.data
    }
    console.log("jwtGenerator", data)

    return data
};