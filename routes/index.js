import classRoutes from './class.js';
import reviewsRoutes from './reviews.js';
import professorRoutes from './professor.js';
import userRoutes from './user.js';
import homeRoutes from './homepage.js'
const constructorMethod = (app) => {
  app.use('/class', classRoutes);
  app.use('/reviews', reviewsRoutes);
  app.use('/professor', professorRoutes);
  app.use('/user', userRoutes);
  app.use('/', homeRoutes)
  app.use('*', (req, res) => {
    res.status(404).render('error',{error: 'Page Not found!', status: 404});
  });
};

export default constructorMethod;