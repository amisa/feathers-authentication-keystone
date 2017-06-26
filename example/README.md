# Example application

## Run instructions
Execute in the root dicrectory of the project one of the commands below:
```bash
# Basic run
# Use NODE_TLS_REJECT_UNAUTHORIZED=0 in case of https connection and selfsigned certificates.
$ npm start

# Start with additional debug logging
$ DEBUG=feathers-authentication-keystone,feathers-authentication-keystone:verify npm start
```

## Local testing
Please pay attention that keystone auth url is hardcoded in
the example application. Feel free to change it.
```bash
# Authenticate in keystone to receive the JWT token
$ curl -X POST 127.0.0.1:3030/authentication -H 'Content-Type: application/json' --data-binary '{ "username": "admin", "password": "xxx"}'

# Use the token for further requests
$ curl -X GET -H 'Authorization: Bearer <token>' 127.0.0.1:3030/users
```

The token could be also decoded using [JWT Debugger](https://jwt.io/)
