export const login = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/');
    }
    next();
};

//gonna need more

export const signout = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/user/login');
    }
    next();
};