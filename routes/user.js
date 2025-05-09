import express from 'express';
import * as userData from '../data/users.js'
import xss from 'xss';
const router = express.Router();


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
        req.session.user = {user_name: loginUser.user_name, password: loginUser.encrypted_password, email: loginUser.email, reviews: loginUser.reviews}


        //2fa here later

        //return res.status(200).redirect('/profile') uncomment me once a profile handlebars exists
        return res.status(200).send(loginUser)
    }catch(e){
        return res.status(500).render("500: " + e) //update error
    }

})
router
.route('/register')
.get(async (req, res) => {
    try{
        return res.status(200).render('register') //change if register handlebars is diff 
    }catch(e){
        return res.status(500).render("500: " + e)
    }
})
.post(async (req, res) => {
    const user_name = xss(req.body.user_name)
    const password = xss(req.body.password)
    const email = xss(req.body.email)
    try{
        const newUser = await userData.createUser(user_name, password, email)
        //return res.status(200).redirect('/login') //uncomment me once a login page exists!

        //maybe think about email here
        return res.status(200).send(newUser)
    }catch (e){
        return res.status(500).send("500: "+ e)
    }

})
router
.route('/profile')
.get(async (req, res) => {
    try{
        return res.status(200).render('profile', {user:req.session.user}) //change to profile handlebars
    }catch(e){
        return res.status(500).send("500: " + e)
    }
})
export default router