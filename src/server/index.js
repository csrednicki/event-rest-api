let express = require('express');
let router = express.Router();
let app = express();
let bodyParser = require('body-parser');
let serverPort = 3600;
let eventsRoute = require('./routes/events');
let searchRoute = require('./routes/search');
let locationsRoute = require('./routes/locations');
let ownersRoute = require('./routes/owners');

// json parser
app.use(bodyParser.json());

// main routes
app.use([eventsRoute, searchRoute, locationsRoute, ownersRoute]);

// parse url encoded forms data
app.use(bodyParser.urlencoded({ extended: true }));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error(`Not Found`);
    err.status = 404;
    next(err);
});

// setting up error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.detail || err.status || 500);
    res.send(`Houston, we have a problem! Error ${err.status || err.detail}`);
});

app.use(express.static('dist'));
app.listen(serverPort, () => console.log(`Listening on port ${serverPort}!`));

module.exports = app;