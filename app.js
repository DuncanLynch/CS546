//import session from 'express-session';
import express from 'express';
import configRoutes from './routes/index.js';
import exphbs from 'express-handlebars'
import session from 'express-session';

const app = express();
app.use(
    session({
      name: 'AwesomeWebApp',
      secret: "This is a secret.. shhh don't tell anyone",
      saveUninitialized: false,
      resave: false,
      cookie: {maxAge: 60000}
    })
  );//https://github.com/stevens-cs546-cs554/CS-546/blob/master/lecture_10/express-session%20and%20private%20route%20example/app.js
  
const rewriteUnsupportedBrowserMethods = (req, res, next) => {
     // If the user posts to the server with a property called _method, rewrite the request's method
     // To be that method; so if they post _method=PUT you can now allow browsers to POST to a route that gets
     // rewritten in this middleware to a PUT route
     if (req.body && req.body._method) {
       req.method = req.body._method;
       delete req.body._method;
     }
   
     // let the next middleware run:
     next();
   };
//write middlewares here
app.use('/public', express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsupportedBrowserMethods);  
app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');  
configRoutes(app);

app.listen(3000, () => {
     console.log("We've now got a server!");  
     console.log('Your routes will be running on http://localhost:3000');
});