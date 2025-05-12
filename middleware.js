import express from 'express';
import * as classData from './data/classes.js'
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
export const loggedin_no_owner = async (req, res, next, redirect) => {
    if(!req.session.user) {
        return res.redirect(redirect)
    }
    const reviews = await classData.getClassById(req.params.classId).reviews
    for(let i = 0; i<reviews.length; i++){
        if(reviews[i].reviewer_id == req.session.user._id) return res.redirect(redirect)
    }
    next();
}
export const loggedin_owner = async (req, res, next, redirect) => {
    if(!req.session.user) {
        return res.redirect(redirect)
    }
    let tog = 0
    for(let i = 0; i <req.session.user.reviews.reviews.length; i++){
        if(req.session.user.reviews[0].reviews[i]._rid == req.params.id) tog = 1
    }
    if(tog !== 1) return res.redirect(redirect)
    next()
}