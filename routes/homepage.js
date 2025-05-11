import express from 'express';
const router = express.Router();
router
.route('/')
.get(async (req, res) => {
    console.log("working");
    const user = req.session.user;
    try{
        return res.status(200).render('homepage', {user: user || null}); //change to homepage handlebars
    }catch(e){
        return res.status(500).send("500: " + e)
    }
})
export default router