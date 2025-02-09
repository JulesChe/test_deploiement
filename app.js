var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const apiRouter = require('./services/routes'); 
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");




var app = express();

// Configuration Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Planification de Trajet Électrique",
      version: "1.0.0",
      description: "Documentation de l'API pour la planification de trajets avec arrêts recharge.",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Serveur local",
      },
      {
        url: "https://projet-info802.azurewebsites.net/api",
        description: "Serveur de production (Azure)",
      },

    ],
  },
  apis: ["./services/routes.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

console.log("📄 Documentation Swagger disponible à /api-docs");
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRouter);

app.use(cors());

app.use(cors({
  origin: 'https://projet-info802.azurewebsites.net',
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type,Authorization',
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
