# encrypted-timeseries-assessment


## Development
The following dependencies would need to be installed on your machine before downloading and running the application.

 - [NodeJS](https://nodejs.org/en/download/)
 - [MongoDB](https://www.mongodb.com/try/download)

### Getting started
Go to command line and install the dependencies using command `npm install`. This will install all required dependencies.
```sh
npm install
```
### Emitter service
Run `npm run emitter` for starting an emitter (default port 3000). This service will start creating encrypted messages using dataset available in `dataset/data.json`. This encrypted messages will be sent to listener service via socket.
```sh
npm run emitter
```
### Listener service
Run `npm run listener` for starting a listener (default port 3001). This service will start checking the data integrity of the received encrypted messages and push it to MongoDB. The result of the data integrity check will be sent to client via socket again.
```sh
npm run listener
```
### User Interface
Navigate to `http://<ip-address>:<listener-port>` in browser to view the user interface. The received data will be updated in the user interface.
### Database
Run `mongo` for viewing the database. Default database name is `syook`. And, there will be two collections. One `messages` which will have all decrypted messages and the other `result` which will have the result of each data integrity checks.

### Source folder structure

```
📦src
┃
┣📜emitter.ts      # Emitter service start point
┣📜listener.ts      # Listener service start point
┣📂api             # Express route controllers for all the endpoints and middlewares of the app
┣📂config          # Environment variables and configuration related stuff
┣📂helpers         # All the utilities used throughout the application
┣📂interfaces      # Interface used throughout the application]
┣📂loaders         # Split the startup process into modules
┣📂models          # Database models
┣📂services        # All the business logic is here
┣📂templates       # UI Templates for the app
┣📂dataset         # Dataset used by the app
```

### Note
Refer .env-example file to create .env file
