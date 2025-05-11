
import express from 'express';
import * as classData from '../data/classes.js'
const router = express.Router();
import xss from 'xss'
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
    const course_code = xss(req.body.course_code)
    const course_name = xss(req.body.course_name)
    const course_description = xss(req.body.course_description)
    const typically_offered = xss(req.body.typically_offered)
    const prerequisites = xss(req.body.prerequisites)
    const class_total_rating = xss(req.body.class_total_rating)
    const class_total_difficulty = xss(req.body.class_total_difficulty)
    const class_total_quality = xss(req.body.class_total_quality)
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
    const id = xss(req.params.id)
    try {
        const foundClass = await classData.getClassById(id)
        return res.status(200).json(foundClass)
    }catch (e) {
        return res.status(404).send("404: "+ e)
    }
})
.delete(async (req, res) => {
    const id = xss(req.params.id)
    try {
        const deletedClass = await classData.deleteClass(id)
        return res.status(200).json(deletedClass)
    }catch (e){
        return res.status(404).send("404: "+ e)
    }
})
router
.route('/:course_code')
.get(async (req, res) => {
    try{
        const course_code = xss(req.params.id)
        //const foundClass = await classData.getClassByCourseCode(course_code) commented until getclassbycoursecode is made

        //CHANGE THE VALUES OF THIS OBJECT BELOW HOW YOU LIKE, IF YOU NEED MORE DATA PASSED INTO YOUR COURSE PAGE JUST ASK ME, FOR NOW I AM JUST PASSING A COURSE OBJECT
        //THIS TEST OBJECT DOES NOT HAVE A _id PARAMETER, IN THE REAL DEAL IT WILL HAVE ONE, FOR NOW JUST PRETEND LIKE IT HAS ONE
        const foundClass = {
            course_code: "CS 546",
            course_name: "Web Programming",
            course_description: "This course will provide students with a first strong approach of internet programming. It will give the basic knowledge on how the Internet works and how to create advanced web sites by the use of script languages, after learning the basics of HTML. The course will teach the students how to create a complex global site through the creation of individual working modules, giving them the skills required in any business such as proper team work and coordination between groups.",
            typically_offered: "Fall Semester Spring Semester",
            prerequisites: "CS 182 or CS 385 or CS 590 (Completed or In-Process)",
            class_total_rating: 1,
            class_total_difficulty: 1 ,
            class_total_quality: 1,
            professors: [],
            reviews: []
        }
        //CHANGE CLASSPAGE TO THE NAME OF THE CLASS PAGE HANDLEBARS FILE
        return res.status(200).render('classpage', {class: foundClass})
    }catch (e){
        return res.status(404).send("404: "+ e)
    }
    
})
export default router
