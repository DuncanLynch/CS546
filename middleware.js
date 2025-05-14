import express from 'express';
import * as classData from './data/classes.js'
import xss from 'xss'
import { validate_professor_name, process_course_code, process_id, validate, validate_string } from './validation.js';

const reviewAttempts = {}
const commentAttempts = {}
const REVIEW_LIMIT = 5;
const COMMENT_LIMIT = 5;
const WINDOW_MS = 60 * 1000;

export const rateLimitReviews = (req, res, next) => {
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
export const rateLimitComments = (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({error: "User not logged in to comment."});
    }
    const user_name = req.session.user.user_name;
    const now = Date.now();
    if (!commentAttempts[user_name]) {
      commentAttempts[user_name] = [];
    }
    commentAttempts[user_name] = commentAttempts[user_name].filter(timestamp => now - timestamp < WINDOW_MS);
  
    if (commentAttempts[user_name].length >= COMMENT_LIMIT) {
      return res.status(402).json({ error: 'Too many comment attempts. Please try again later.' });
    }
    commentAttempts[user_name].push(now);
    next();
  }
export const reviews_mw = (req, res, next, redirect) => {
    if(!req.session.user) {
        return res.redirect(redirect)
    }
    let cc, prof = null;
    try{
        cc = validate(xss(req.body.course_code), validate_string, [process_course_code])
        prof = validate(xss(req.body.professor_id), validate_string, [process_id])
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    if(cc === null || prof === null) return res.status(500).send("500: One or more inputs was not set in validation")
    for(let i = 0; i < req.session.user.reviews.length; i++){
        if( (req.session.user.reviews[i].course_code == cc) && (req.session.user.reviews[i].professor_id == prof) ) {
            return res.status(403).json({ error: 'You can only submit one review per professor for each class.' });

        }
    }
    next(); 
}
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
};

export const noaccess = (req, res, next, redirect) => {
    return res.redirect(redirect);

}