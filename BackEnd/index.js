require('dotenv/config')

//express use settings
const express = require("express");
const app = express();
const cors = require('cors');
const https = require('https');
const fs = require('fs');
//express settings
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//Swagger doc
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express')
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "MementoMori API",
      description: "MementoMori API information. API tokens should be inputed like: 'Bearer: [token]'",
      contact: {
        name: "Román Pastshenko Slautskiy"
      },
      servers: ["http://localhost:1234"]
    }
  },
  apis: ["index.js"]
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))


//routes
const chartRoutes = require('./routes/chart')
const authRoutes = require('./routes/auth')
const calendarRoutes = require('./routes/calendar')
const adminRoutes = require('./routes/admin')
const userRoutes = require('./routes/user')
app.use('/chart', chartRoutes)
app.use('/auth', authRoutes)
app.use('/calendar', calendarRoutes)
app.use('/admin', adminRoutes)
app.use('/user', userRoutes)

/* Uncomment for https deployment (prod)
//Certificate

const privateKey = fs.readFileSync('/etc/letsencrypt/live/api.mementomori.io/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/api.mementomori.io/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/api.mementomori.io/chain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

const httpsServer = https.createServer(credentials, app);

*/


//Express port

/*Replace app with httpsServer for prod deployment , deployment port == 1111*/

app.listen(1234, () => {
  console.log("Server is listening on port: 1234");
});
