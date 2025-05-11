import express from 'express';
const router = express.Router();
router
.route('/')
.get(async (req, res) => {
    const user = req.session.user;
    try{
        if (!(Object.keys(req.body).length === 0)) {
            return res.status(400).send("400: Route was not expecting json");
        }
        return res.status(200).render('homepage', {user: user || null}); //change to homepage handlebars
    }catch(e){
        return res.status(500).send("500: " + e)
    }
})
export default router