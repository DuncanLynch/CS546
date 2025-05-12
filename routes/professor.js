import express from 'express';
import * as professorData from '../data/professors.js'
import * as classData from '../data/classes.js'
import xss from 'xss'
import { ObjectId } from 'mongodb';
import { process_id, validate, validate_string, process_unsignedint, process_numerical_rating, process_course_code, validate_number, validate_user_name, validate_prerequisites, validate_professor_name, validate_stevens_email} from "../validation.js";
const router = express.Router();
router
.route('/')
.get(async (req, res) => {
    try{
        console.log("GET Caught!");
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
    console.log("POST Caught!");
    let professor_name, course_code, email = null;
    try{
        if (!req.body || !(Object.keys(req.body).length === 3)) {
            return res.status(400).send("400: Invalid length of json");
        }
    }catch(e){
        return res.status(500).send("500: " + e)
    }
    try{
        professor_name = validate(xss(req.body.professor_name), validate_string, [validate_professor_name])
        course_code= validate(xss(req.body.course_code), validate_string, [process_course_code])
        email = validate(xss(req.body.email), validate_string, [validate_stevens_email])
    }catch(e){
        return res.status(400).send("400: " + e);
    }
    if(professor_name === null || course_code === null || email === null) return res.status(500).send("500: One or more inputs was not set in validation")
        try {
            const cls = await classData.getClassbyCourseCode(course_code);
            const newProfessor = await professorData.createProfessor(professor_name, course_code, email);
            await classData.addProfessor(course_code, newProfessor._id)
            return res.status(200).json(newProfessor);
        } catch (e) {
            // Something went wrong with the server!
            console.log(e);
            return res.status(500).send("500: " + e);
        }
})
router
.route('/:id')
.get(async (req, res) => {
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
        const foundProfessor = await professorData.getProfessorById(id)
        return res.status(200).json(foundProfessor)
    }catch (e) {
        return res.status(404).send("404: "+ e)
    }
})
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
        const deletedProfessor = await professorData.deleteProfessor(id)
        //maybe more here depending on next db push
        return res.status(200).json(deletedProfessor)
    }catch (e){
        return res.status(404).send("404: "+ e)
    }
})
export default router;