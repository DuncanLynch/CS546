import express from 'express';
import * as userData from '../data/users.js'
import xss from 'xss';
import crypto from 'crypto';
const router = express.Router();
const pendingUsers = new Map();

router
.route('/')
.get(async (req, res) => {
    try {
        const userList = await userData.getAllClasses()
        return res.status(200).json(userList);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(500).send("500: " + e);
    }
})
router
.route('/:user_name')
.get(async (req, res) => {
    const user_name = xss(req.params.user_name)
    try {
        const foundUser = await userData.getUserByName(user_name)
        return res.status(200).json(foundUser)
    }catch (e) {
        return res.status(404).send("404: "+ e)
    }    
})
.delete(async (req, res) => {
    const user_name = xss(req.params.user_name)
    try {
        const deletedUser = await userData.deleteUser(user_name)
        return res.status(200).json(deletedUser)
    }catch (e){
        return res.status(404).send("404: "+ e)
    }
})
router
.route('/login')
.get(async (req, res) => {
    try{
        return res.status(200).render('login') //change to login handlebars
    }catch(e){
        return res.status(500).render("500: " + e)
    }
})
.post(async (req, res) => {
    try{
        user_name = xss(req.body.user_name)
        password = xss(req.body.password)
        const loginUser = await userData.validateUser(user_name, password) //assuming return value of validate user is the user object
        req.session.user = {
            user_name: loginUser.user_name, 
            password: loginUser.encrypted_password, 
            email: loginUser.email, 
            reviews: loginUser.reviews}


        //2fa here later

        //return res.status(200).redirect('/profile') uncomment me once a profile handlebars exists
        return res.status(200).send(loginUser)
    }catch(e){
        return res.status(500).render("500: " + e) //update error
    }

})


router.route('/register')
  .get((req, res) => res.status(200).render('register'))
  .post(async (req, res) => {
    const user_name = xss(req.body.user_name);
    const password = xss(req.body.password);
    const email = xss(req.body.email);

    try {
      const verificationCode = crypto.randomInt(100000, 999999).toString();
      
      // store temporarily
      pendingUsers.set(email, {
        user_name,
        password,
        code: verificationCode,
        timestamp: Date.now()
      });

      // send email
      await transporter.sendMail({
        from: '"Trivia Game" <hypaplayz@gmail.com>',
        to: email,
        subject: 'Your verification code',
        text: `Hi ${user_name}, your verification code is: ${verificationCode}`
      });

      return res.status(200).render('verify', { email }); // Render form to input the code
    } catch (e) {
      return res.status(500).send("500: " + e);
    }
});
router.route('/verify')
  .post(async (req, res) => {
    const email = xss(req.body.email);
    const codeEntered = xss(req.body.code);

    const pending = pendingUsers.get(email);
    if (!pending) return res.status(400).send('No pending registration for this email.');

    if (pending.code !== codeEntered) {
      return res.status(400).send('Invalid verification code.');
    }

    try {
      const created = await userData.createUser(pending.user_name, pending.password, email);
      pendingUsers.delete(email); // clean up

      return res.status(200).send('Registration complete! You can now log in.');
    } catch (e) {
      return res.status(500).send("500: " + e);
    }
});

router
.route('/profile')
.get(async (req, res) => {
    try{
        return res.status(200).render('profile', {user:req.session.user}) //change to profile handlebars
    }catch(e){
        return res.status(500).send("500: " + e)
    }
})
router
.route('/signout')
.get(async (req, res) => {
    try{
        req.session.destroy();
        res.render('signout');
      }catch(e){
        res.status(400).json({ error: 'Internal Server Error' });
      }
});

export default router