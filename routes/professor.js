import express from 'express';
import * as professorData from '../data/professors.js'
import * as classData from '../data/classes.js'
import xss from 'xss'
const router = express.Router();
router
.route('/')
.get(async (req, res) => {
    try {
        const professorData = await professorData.getAllClasses()
        return res.status(200).json(professorData);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(500).send("500: " + e);
    }
})
.post(async (req, res) => {
        const professor_name = xss(req.body.professor_name)
        const course_id = xss(req.body.course_id)
        const email = xss(req.body.email)
        try {
            console.log({
                professor_name,
                course_id,
                email
            })
            const newProfessor = await professorData.createProfessor(professor_name, course_id, email)
            await classData.addProfessor(course_id, newProfessor._id)
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
export default router