
import express from 'express';
import * as classData from './data/classes.js'
import xss from 'xss'

const reviewAttempts = {}

const REVIEW_LIMIT = 5;
const WINDOW_MS = 60 * 1000;

function rateLimitReviews(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({error: "User not logged in to review."});
  }
  const user_name = req.session.user.user_name;
  const now = Date.now();
  if (!reviewAttempts[user_name]) {
    reviewAttempts[user_name] = [];
  }
  reviewAttempts[user_name] = reviewAttempts[user_name].filter(timestamp => now - timestamp < WINDOW_MS);

  if (reviewAttempts[user_name].length >= REVIEW_LIMIT) {
    return res.status(402).json({ error: 'Too many review attempts. Please try again later.' });
  }
  reviewAttempts[user_name].push(now);

  next();
}

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

export const noaccess = (req, res, next, redirect) => {
    return res.redirect(redirect);

}
/*
export const loggedin_no_owner = async (req, res, next, redirect) => {
    if(!req.session.user) {
        return res.redirect(redirect)
    }
    const cl = await classData.getClassById(req.params.classId)
    const reviews = cl.reviews
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
    for(let i = 0; i <req.session.user.reviews.length; i++){
        for(let j = 0; j < req.session.user.reviews[i].reviews.length; j++){
            if(req.session.user.reviews[i].reviews[j]._rid == req.params.id) tog = 1
        }
    }
    if(tog !== 1) return res.redirect(redirect)
    next()
}
export const loggedin_no_owner_profs = async (req, res, next, redirect) => {
    if(!req.session.user) {
        return res.redirect(redirect)
    }
    let tog = 1
    for(let i = 0; i <req.session.user.reviews.length; i++){
        for(let j = 0; j < req.session.user.reviews[i].reviews.length; j++){
            if(req.session.user.reviews[i].reviews[j].course_code == xss(req.body.course_code)) tog = 0
            console.log(req.session.user.reviews[i].reviews[j].course_code)
            console.log(req.body.course_code)
        }
    }
    if(tog !== 1) {
        console.log("dink")
        return res.redirect(redirect)}
    next()
}*/