import express from 'express';
import * as professorData from '../data/professors.js'
import * as classData from '../data/classes.js'
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
        const professor_name = req.body.professor_name
        const course_id = req.body.course_id
        const email = req.body.email
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
    try {
        const foundProfessor = await professorData.getProfessorById(req.params.id)
        return res.status(200).json(foundProfessor)
    }catch (e) {
        if(e === "Error: Class not found") return res.status(404).send("404: "+ e) //fix
        return res.status(500).send("500: " + e)
    }
})
.delete(async (req, res) => {
    try {
        const deletedProfessor = await professorData.deleteProfessor(req.params.id)
        
        return res.status(200).json(deletedProfessor)
    }catch (e){
        return res.status(500).send("500: " + e)
    }
})
export default router