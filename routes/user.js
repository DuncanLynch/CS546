import express from 'express';
import * as userData from '../data/users.js'
import xss from 'xss';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
const router = express.Router();
const pendingUsers = new Map();
import { process_id, validate, validate_password, validate_string, process_unsignedint, process_numerical_rating, process_course_code, validate_number, validate_user_name, validate_prerequisites, validate_professor_name, validate_stevens_email} from "../validation.js";
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'ratemyclassy@gmail.com',
    pass: 'zmaxaclgndsmjffm' //  App Password from gmail
  }
});
router
.route('/login')
.get(async (req, res) => {
    
  try{
    if (!(Object.keys(req.body).length === 0)) {
      return res.status(400).send("400: Route was not expecting json");
    }
      return res.status(200).render('login')
  }catch(e){
      return res.status(500).render("500: " + e)
  }
})
.post(async (req, res) => {
    let user_name, password;
    try{
      if (!req.body || !(Object.keys(req.body).length === 2)) {
        return res.status(400).send("400: Invalid length of json");
      }
    }catch(e){
      return res.status(500).render("500: " + e)
    }
    try{
      user_name = validate(xss(req.body.user_name), validate_string, [validate_user_name])
      password = validate(xss(req.body.password), validate_string, [validate_password])
    }catch(e){
      return res.status(400).send("400: " + e)
    }
    if(user_name === null || password === null) return res.status(500).send("500: One or more inputs was not set in validation")
    try {

      const user = await userData.validateUser(user_name, password);
      const verificationCode = crypto.randomInt(100000, 999999).toString();

      pendingUsers.set(user.email, {
        loggingin: true,
        user_name,
        password,
        code: verificationCode,
        timestamp: Date.now()
      });

      await transporter.sendMail({
        from: '"Course Review" <your_email@gmail.com>',
        to: user.email,
        subject: 'Your verification code',
        text: `Hi ${user_name}, your verification code is: ${verificationCode}`
      });

      return res.status(200).render('verify', { email: user.email });

    } catch (e) {
      console.log(e)
      return res.status(500).send("500: " + e);
    }
});

router.route('/register')
.get((req, res) => {
  try{
    if (!(Object.keys(req.body).length === 0)) {
      return res.status(400).send("400: Route was not expecting json");
    }
    return res.status(200).render('register')
  }catch(e){
    return res.status(500).render("500: " + e)
  }
}
)
  .post(async (req, res) => {
    let user_name, password, email = null;
    try{
      if (!req.body || !(Object.keys(req.body).length === 3)) {
        return res.status(400).send("400: Invalid length of json");
      }
    }catch(e){
      return res.status(500).render("500: " + e)
    }
    try{
      user_name = validate(xss(req.body.user_name), validate_string, [validate_user_name])
      password = validate(xss(req.body.password), validate_string, [validate_password])
      email = validate(xss(req.body.email), validate_string, [validate_stevens_email])
    }catch(e){
      return res.status(400).send("400: " + e)
    }
    if(user_name === null || password === null || email === null) return res.status(500).send("500: One or more inputs was not set in validation")
    try {
      const verificationCode = crypto.randomInt(100000, 999999).toString();

      pendingUsers.set(email, {
        loggingin: false,
        user_name,
        password,
        code: verificationCode,
        timestamp: Date.now()
      });

      await transporter.sendMail({
        from: '"Course Review" <your_email@gmail.com>',
        to: email,
        subject: 'Your verification code',
        text: `Hi ${user_name}, your verification code is: ${verificationCode}`
      });

      return res.status(200).render('verify', { email });

    } catch (e) {
      return res.status(500).send("500: " + e);
    }
});
router.route('/verify')
  .post(async (req, res) => {
    const email = xss(req.body.email);
    const codeEntered = xss(req.body.code);

    const pending = pendingUsers.get(email);
     if (!pending) {
      return res.status(400).render('verify', {
        email,
        error: 'No pending registration for this email.'
      });
    }
    if (pending.code !== codeEntered) {
      return res.status(400).render('verify', {
        email,
        error: 'Invalid verification code.'
      });
    }

    try {
      if (pending.loggingin) {
        const us = await userData.getUserByName(pending.user_name)
        pendingUsers.delete(email); // clean up
        req.session.user = {
            user_name: us.user_name, 
            _id: us._id.toString(), 
            email: us.email, 
            reviews: us.reviews,
            wishlist: us.wishlist
        }
        res.locals.user_logged = true;

        //2fa here later

        return res.status(200).render('homepage');
      } 
      else {
        const us = await userData.createUser(pending.user_name, pending.password, email);
        pendingUsers.delete(email); // clean up
        req.session.user = {
            user_name: us.user_name, 
            _id: us._id.toString(), 
            email: us.email, 
            reviews: us.reviews,
            wishlist: us.wishlist
        }
        res.locals.user_logged = true;
        return res.status(200).render('homepage');
      } 
    } catch (e) {
      console.error("Account creation failed:", e);
      return res.status(500).render('verify', {
        email,
        error: 'Server error during account creation. Please try again.'
      });
  }
});

router
.route('/profile')
.get(async (req, res) => {
    try{
        if (!(Object.keys(req.body).length === 0)) {
          return res.status(400).send("400: Route was not expecting json");
        }
        return res.status(200).render('profile', {user_name: xss(req.session.user.user_name), email: xss(req.session.user.email), reviews: req.session.user.reviews, wishlist: req.session.user.wishlist, userJson: JSON.stringify(req.session.user)})
    }catch(e){
        return res.status(500).send("500: " + e);
    }
})
router
.route('/signout')
.get(async (req, res) => {
    try{
        if (!(Object.keys(req.body).length === 0)) {
          return res.status(400).send("400: Route was not expecting json");
        }
        req.session.destroy();
        res.render('signout');
      }catch(e){
        res.status(500).json({ error: 'Internal Server Error' });
      }
});

router
.route('/:user_name')
.get(async (req, res) => {
    let user_name = null;
    try{
      if (!(Object.keys(req.body).length === 0)) {
        return res.status(400).send("400: Route was not expecting json");
      }
    }catch(e){
      return res.status(500).send("500: " + e)
    }
    try{
      user_name = validate(xss(req.params.user_name), validate_string, [validate_user_name])
    }catch(e){
      return res.status(400).send("400: " + e)
    }
    if(user_name === null) return res.status(500).send("500: One or more inputs was not set in validation")
    try {
        const foundUser = await userData.getUserByName(user_name)
        return res.status(200).json(foundUser)
    }catch (e) {
        return res.status(404).send("404: "+ e)
    }    
})
.delete(async (req, res) => {
  let user_name = null;
  try{
    if (!(Object.keys(req.body).length === 0)) {
        return res.status(400).send("400: Route was not expecting json");
    }
  }catch(e){
    return res.status(500).send("500: " + e)
  }
  try{
    user_name = validate(xss(req.params.user_name), validate_string, [validate_user_name])
  }catch(e){
    return res.status(400).send("400: " + e)
  }
  if(user_name === null) return res.status(500).send("500: One or more inputs was not set in validation")
    try {
        const deletedUser = await userData.deleteUser(user_name)
        return res.status(200).json(deletedUser)
    }catch (e){
        return res.status(404).send("404: "+ e)
    }
})

export default router