import express from 'express';
import * as classData from '../data/classes.js'
const router = express.Router();

router
.route('/')
.get(async (req, res) => {
    try {
        const classList = await classData.getAllClasses()
        return res.status(200).json(classList);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(500).send("500: " + e);
    }
})
.post(async (req, res) => {
    const course_code = req.body.course_code
    const course_name = req.body.course_name
    const course_description = req.body.course_description
    const typically_offered = req.body.typically_offered
    const prerequisites = req.body.prerequisites
    const class_total_rating = req.body.class_total_rating
    const class_total_difficulty = req.body.class_total_difficulty
    const class_total_quality = req.body.class_total_quality
    try {
        const newClass = await classData.createClass(course_code, course_name, course_description, typically_offered, prerequisites, class_total_rating, class_total_difficulty, class_total_quality)
        return res.status(200).json(newClass);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(500).send("500: " + e);
    }
})
router
.route('/:id')
.get(async (req, res) => {
    try {
        const foundClass = await classData.getClassById(req.params.id)
        return res.status(200).json(foundClass)
    }catch (e) {
        if(e === "Error: Class not found") return res.status(404).send("404: "+ e) //fix
        return res.status(500).send("500: " + e)
    }
})
.delete(async (req, res) => {
    try {
        const deletedClass = await classData.deleteClass(req.params.id)
        return res.status(200).json(deletedClass)
    }catch (e){
        return res.status(500).send("500: " + e)
    }
})
// router
// .route('/:course_code')
// .get(async (req, res) => {
//     try{
//         const foundClass = await classData.getClassByCourseCode(req.params.id)
//         return res.status(200).render('classpage', {class: foundClass})
//     }catch (e){
//         if(e === "Class not found") return res.status(404).send("404: "+ e)
//         return res.status(500).send("500: " + e)
//     }
    
// })
export default router
