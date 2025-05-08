import express from 'express';
const app = express();
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars';
import {login, signout} from './middleware.js'; //and the rest once they exist

const rewriteUnsupportedBrowserMethods = (req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method;
    delete req.body._method;
  }

  next();
};

app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Middleware stuff:
app.use('/login', (req, res, next) => {
  if (req.method === 'GET') {
    return login(req, res, next);
  }
  next();
});

//the rest...

app.use('/signout', (req, res, next) => {
  if (req.method === 'GET') {
    return signout(req, res, next);
  }
  next();
});
//end middleware

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});