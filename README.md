# Tinder API

### Using NPM

- Run `npm i` to install the project dependencies
- Run `npx sls deploy` to deploy this stack to AWS

### Using Yarn

- Run `yarn` to install the project dependencies
- Run `yarn sls deploy` to deploy this stack to AWS

### Locally

In order to test the hello function locally, run the following command:

- `serverless offline`

### Deployed Endpoints

#### GET `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/user/show`
Show random user for pass or likes only need `access_token` as Authorization `Bearer`
##### Example Response Data
```
{
    "success": true,
    "status": 200,
    "data": {
        "id": 5,
        "email": "monica@gmail.com",
        "name": "Monica E.",
        "age": 27,
        "location": "Manhattan",
        "gender": "Female",
        "description": "Comedy with the plates will not be well-received",
        "is_verified": true
    }
}
```
<br>

#### GET `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/user/details`
Show user for pass or like. Need to pass `access_token` as Authorization `Bearer`
##### URL Parameters (ex: `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/user/details?id=1`)
|          Name | Required |  Type   | Description        |
|--------------:|:--------:|:-------:|--------------------|
|          `id` | required | integer | The id of the user |
##### Example Response Data
```
{
    "success": true,
    "status": 200,
    "data": {
        "id": 8,
        "name": "Angelina Jane",
        "age": 22,
        "location": "Bandung",
        "gender": "Female",
        "description": "Hi",
        "is_verified": false
    }
}
```
<br>

#### POST `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/signup`
Endpoints for signup and create new user
##### Request Body
|          Name | Required |  Type  | Description                                     |
|--------------:|:--------:|:------:|-------------------------------------------------|
|       `email` | required | string | The email of the user                           |
|    `password` | required | string | The user's password                             |
|        `name` | required | string | The user's name                                 |
|      `gender` | required | integer | The user's gender. `1` for male. `2` for female |
|    `location` | optional | string | The user's location                             |
|         `age` | optional | integer | The user's age                                  |
| `description` | optional | string | The user's description                          |

##### Example Response Data
```
{
    "success": true,
    "status": 200,
    "data": {
        "success": true,
        "id": "13"
    }
}
```
<br>

#### POST `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/login`
Endpoints for login
##### Request Body
|          Name | Required |  Type  | Description                                     |
|--------------:|:--------:|:------:|-------------------------------------------------|
|       `email` | required | string | The email of the user                           |
|    `password` | required | string | The user's password                             |

##### Example Response Data
```
{
    "success": true,
    "status": 200,
    "data": {
        "id": "12",
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0LCJpYXQiOjE2OTIyMTgxNDMsImV4cCI6MTY5MjIxOTA0M30.EG1-1gXYiPosOKC1L6WTUGImzJXZdw0kv1BTSnFsDNw",
        "access_token_expired_at": "2023-08-16T20:45:43.457Z",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0LCJpYXQiOjE2OTIyMTgxNDMsImV4cCI6MTY5OTk5NDE0M30.QkxB20xb1sQUVl2RMv9UDMqnrN7wb-N4mikamupZ-XI",
        "refresh_token_expired_at": "2023-11-14T20:35:43.458Z"
    }
}
```
<br>

#### POST `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/account/tier`
Endpoints for upgrade user tier to free or premium
##### Request Body
|             Name | Required |  Type   | Description                   |
|-----------------:|:--------:|:-------:|-------------------------------|
|      `user_tier` | required | integer | `1` for free. `2` for premium |

##### Example Response Data
```
{
    "success": true,
    "status": 200,
    "data": {
        "success": true,
        "id": 14
    }
}
```
<br>

#### POST `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/user/match`
Endpoints for user's matching
##### Request Body
|       Name | Required |  Type   | Description                                             |
|-----------:|:--------:|:-------:|---------------------------------------------------------|
| `match_id` | required | integer | `1` for free. `2` for premium                           |
|  `is_like` | optional | boolean | `true` for like. `false` for pass. If null then `false` |

##### Example Response Data
```
{
    "success": true,
    "status": 200,
    "data": {
        "success": true,
        "id": 14
    }
}
```
<br>

#### POST `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/refresh-token`
Endpoints for user's refresh token. Need to pass `refresh_token` as Authorization `Bearer`
##### Request Body
|        Name | Required |  Type  | Description                |
|------------:|:--------:|:------:|----------------------------|
|`grant_type` | required | string | Should be `refresh_token`  |

##### Example Response Data
```
{
    "success": true,
    "status": 200,
    "data": {
        "id": "10",
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5IiwiaWF0IjoxNjkyMjExODc2LCJleHAiOjE2OTIyMTI3NzZ9.t4-JR30TE33RtfWFSByt3cJ_bcQvLQwvxgHlKwKS0-E",
        "access_token_expired_at": "2023-08-16T19:01:16.376Z",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5IiwiaWF0IjoxNjkyMjExODc2LCJleHAiOjE2OTk5ODc4NzZ9.hcqRkkRERxzBBangx6GwVM1KkIci5TTChOQV-vSGzUI",
        "refresh_token_expired_at": "2023-11-14T18:51:16.378Z"
    }
}
```
<br>

### For Testing and see JSON Body and Response Data

Please see [Tinder API.postman_collection.json](postman%2FTinder%20API.postman_collection.json) to test and see the example of the json body and response data
