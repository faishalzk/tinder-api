import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import dotenv from 'dotenv';
import {userValidatorRefresh} from "../../services/userValidator";
import {jwtGenerator} from "../../services/jwtGenerator";
dotenv.config();

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  console.log('Start refresh token')
  const body = event.body
  if (body.grant_type != "refresh_token"){
    return formatJSONResponse({
      success: false,
      status: 404,
      data: {
        message: "False grant_type"
      }
    });
  }

  const headers = event.headers
  const authToken = headers.Authorization
  const token = authToken.replace("Bearer ", "")

  const validateResult = await userValidatorRefresh(token)
  if (!validateResult.success){
    const data = {
      success: validateResult.success,
      status: 404,
      data: validateResult.data
    }
    console.log(data)

    return formatJSONResponse(data);
  }

  let result;
  const resultData = validateResult.data
  if (resultData && resultData.id) {
    console.log("Refresh token validated")
    result = await jwtGenerator(resultData.id)
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
