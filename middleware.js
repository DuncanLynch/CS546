
//gonna need more
export const notloggedin = (req, res, next, redirect) => {
    if (req.session.user) {
      return res.redirect(redirect);
    }
    next();
};
export const loggedin = (req, res, next, redirect) => {
    if(!req.session.user) {
        return res.redirect(redirect)
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
}
export const noaccess = (req, res, next, redirect) => {
    return res.redirect(redirect);
}