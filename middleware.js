export const login = (req, res, next) => {
    if (req.session.user) {
        return res.redirect('/homepage');
    }
    next();
};

//gonna need more

export const signout = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    next();
};