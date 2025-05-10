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

// Middleware and Static Files
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rewriteUnsupportedBrowserMethods);

// Set up Handlebars engine with layout directory
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Middleware for login and signout routes
app.use('/login', (req, res, next) => {
  if (req.method === 'GET') {
    return login(req, res, next);
  }
  next();
});

app.use('/signout', (req, res, next) => {
  if (req.method === 'GET') {
    return signout(req, res, next);
  }
  next();
});

// Session configuration
app.use(
  session({
    name: 'AwesomeWebApp',
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 60000 }
  })
);

// Import and configure routes
configRoutes(app);

// Start server
app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
