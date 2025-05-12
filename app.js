import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import { login, signout } from './middleware.js';
import session from 'express-session';

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};

const hbs = exphbs.create({
  helpers: {
    json: function (context) {
      return JSON.stringify(context);
    }
  }
});
// Middleware and Static Files
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

// Set up Handlebars engine with layout directory
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(
  session({
    name: 'AwesomeWebApp',
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 60000 * 30 } // longer session for testing
  })
);
// Middleware to reload the buttons in the if else in the layout handlebar
app.use((req, res, next) => {
  res.locals.user_logged = req.session.user || null;
  next();
});


// Middleware for login and signout routes
app.use('/user/login', (req, res, next) => {
  if (req.method === 'GET') {
    return login(req, res, next);
  }
  next();
});

app.use('/user/signout', (req, res, next) => {
  if (req.method === 'GET') {
    return signout(req, res, next);
  }
  next();
});

// Session configuration


// Import and configure routes
configRoutes(app);

// Start server
app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
