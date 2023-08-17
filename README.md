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

- GET `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/user/show`
- GET `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/user/details`
- POST `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/signup`
- POST `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/login`
- POST `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/account/tier`
- POST `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/user/match`
- POST `https://izddyatelc.execute-api.us-east-1.amazonaws.com/dev/api/refresh-token`

### For Testing and see JSON Body and Response Data

Please see [Tinder API.postman_collection.json](postman%2FTinder%20API.postman_collection.json) to test and see the example of the json body and response data
