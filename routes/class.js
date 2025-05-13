
import express from 'express';
import * as classData from '../data/classes.js'
const router = express.Router();
import xss from 'xss'
import { process_id, validate, validate_string, process_unsignedint, process_numerical_rating, process_course_code, validate_number, validate_user_name, validate_prerequisites} from "../validation.js";
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
        const classList = await classData.getAllClasses()
        return res.status(200).json(classList);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(500).send("500: " + e);
    }
})
.post(async (req, res) => {
    let course_code, course_name, course_description, typically_offered, prerequisites = null
    try{
        if (!req.body || !(Object.keys(req.body).length === 5)) {
            return res.status(400).send("400: Invalid length of json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        course_code = validate(xss(req.body.course_code), validate_string, [process_course_code])
        course_name = validate(xss(req.body.course_name), validate_string, []) //find specific validation function
        course_description = validate(xss(req.body.course_description), validate_string, []) //find specific validation function
        typically_offered = validate(xss(req.body.typically_offered), validate_string, []) //find specific validation function
        prerequisites = validate(xss(req.body.prerequisites), validate_string, [])
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    if(course_code === null || course_name === null || course_description === null || typically_offered === null || prerequisites === null) return res.status(500).send("500: One or more inputs was not set in validation")
    try {
        const newClass = await classData.createClass(course_code, course_name, course_description, typically_offered, prerequisites)
        return res.status(200).json(newClass);
    } catch (e) {
        // Something went wrong with the server!
        return res.status(500).send("500: " + e);
    }
})
router
.route('/:id')
.delete(async (req, res) => {
    let id = null;
    try{
        if (!(Object.keys(req.body).length === 0)) {
            return res.status(400).send("400: Route was not expecting json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        id = validate(xss(req.params.id), validate_string, [process_id])
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    if(id === null) return res.status(500).send("500: One or more inputs was not set in validation")
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
    let course_code = null;
    try{
        if (!(Object.keys(req.body).length === 0)) {
            return res.status(400).send("400: Route was not expecting json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        course_code = validate(xss(req.params.course_code), validate_string, [process_course_code])
    }catch(e){
        return res.status(400).send("400: " + e)
    }
    if(course_code === null) return res.status(500).send("500: One or more inputs was not set in validation")
    try{
        const foundClass = await classData.getClassbyCourseCode(course_code);
        //CHANGE THE VALUES OF THIS OBJECT BELOW HOW YOU LIKE, IF YOU NEED MORE DATA PASSED INTO YOUR COURSE PAGE JUST ASK ME, FOR NOW I AM JUST PASSING A COURSE OBJECT
        //THIS TEST OBJECT DOES NOT HAVE A _id PARAMETER, IN THE REAL DEAL IT WILL HAVE ONE, FOR NOW JUST PRETEND LIKE IT HAS ONE
        //CHANGE CLASSPAGE TO THE NAME OF THE CLASS PAGE HANDLEBARS FILE
        return res.status(200).render('classpage', {
            class: foundClass, 
            userJson: JSON.stringify(req.session.user)})
    }catch (e){
        return res.status(404).send("404: "+ e)
    }
    
})
export default router
