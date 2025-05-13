import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import * as middleware from './middleware.js';
import session from 'express-session';
// Session configuration
app.use(
  session({
    name: 'AwesomeWebApp',
    secret: "This is a secret.. shhh don't tell anyone",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 1000 * 60 * 60 * 2 }
  })
);
const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }
  next();
};


// Middleware
app.use((req, res, next) => {
    res.locals.user_logged = !!req.session.user;
    next();
});
app.use('/class', (req, res, next) => {
  if(req.method === 'POST') return middleware.loggedin(req, res, next, '/') //unsure about redirect may need further altering
  next();
})
app.use('/class/:id', (req, res, next) => {
  if(req.method === 'DELETE') return middleware.noaccess(req, res, next, '/')
  next();
})
//
app.use('/professor', (req, res, next) => {
  if(req.method === 'POST') return middleware.loggedin(req, res, next, '/user/login')
  next();
})
app.use('/professor/:id', (req, res, next) => {
  if(req.method === 'DELETE') return middleware.noaccess(req, res, next, '/')
  next();
})
app.use('/user/:user_name', (req, res, next) => {
  if(req.method === 'DELETE') return middleware.noaccess(req, res, next, '/')
  next();
})
app.use('/user/login', (req, res, next) => {
  if(req.method === 'GET' || req.method === 'POST') return middleware.notloggedin(req, res, next, '/user/profile');
  next();
});
app.use('/user/login', (req, res, next) => {
  if(req.method === 'GET' || req.method === 'POST') return middleware.notloggedin(req, res, next, '/user/profile');
  next();
});
app.use('/user/signout', (req, res, next) => {
  if (req.method === 'GET') return middleware.loggedin(req, res, next, '/user/login');
  next();
});
app.use('/user/profile', (req, res, next) => {
  if(req.method === 'GET' || req.method === 'POST') return middleware.loggedin(req, res, next, '/user/login');
  next();
});
app.use('/reviews/:classId', (req, res, next) => {
  if(req.method === 'POST') return middleware.loggedin_no_owner(req, res, next, '/')
    next();
})
app.use('/reviews//review/:id', (req, res, next) => {
  if(req.method === 'DELETE') return middleware.loggedin_owner(req, res, next, '/')
  next();
})
app.use('/reviews/review/:reviewId/comments', (req, res, next) => {
  if(req.method === 'POST') return middleware.loggedin(req, res, next, '/user/login')
  next();
})
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


// Import and configure routes
configRoutes(app);

// Start server
app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});
