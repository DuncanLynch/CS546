
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
    }
    next();
}
export const noaccess = (req, res, next, redirect) => {
    return res.redirect(redirect);
}