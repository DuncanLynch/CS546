import express from 'express';
import * as professorData from '../data/professors.js'
import * as classData from '../data/classes.js'
import * as userData from '../data/users.js'
import xss from 'xss'
import { ObjectId } from 'mongodb';
const router = express.Router();
router
.route('/')
.get(async (req, res) => {
    try{
        if (!(Object.keys(req.body).length === 0)) {
            return res.status(400).send("400: Route was not expecting json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try {
        const professorList = await professorData.getAllProfessors()
        return res.status(200).json(professorList);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(500).send("500: " + e);
    }
})
.post(async (req, res) => {
        const professor_name = xss(req.body.professor_name)
        const course_code= xss(req.body.course_code)
        const email = xss(req.body.email)
        try {
            const cls = await classData.getClassbyCourseCode(course_code);
            const newProfessor = await professorData.createProfessor(professor_name, course_code, email);
            await classData.addProfessor(course_code, newProfessor._id)
            return res.status(200).json(newProfessor);
        } catch (e) {
            // Something went wrong with the server!
            return res.status(500).send("500: " + e);
        }
})

router
.route('/:id')
.get(async (req, res) => {
    const id = xss(req.params.id)
    try {
        const foundProfessor = await professorData.getProfessorById(id)
        return res.status(200).json(foundProfessor)
    }catch (e) {
        return res.status(404).send("404: "+ e)
    }
})
.delete(async (req, res) => {
    const id = xss(req.params.id)
    try {
        const deletedProfessor = await professorData.deleteProfessor(id)
        //maybe more here depending on next db push
        return res.status(200).json(deletedProfessor)
    }catch (e){
        return res.status(404).send("404: "+ e)
    }
})
router.post('/:user_id/:prof_id', (async (req,res) => {
    const user_id = xss(req.params.user_id);
    const prof_id = xss(req.params.prof_id);
    try{
        const added = await userData.addWishlist(user_id, prof_id);
        return res.status(200).json({added});
    }catch(e){
        return res.status(500).json(e);
    }
}))
export default router;