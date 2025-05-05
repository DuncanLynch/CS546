//Imports
import { ObjectId } from "mongodb";
import { classes } from "../mongodb/mongoCollections";
//Data Functions:
export function createClass( course_code, course_name, course_description, typically_offered, prerequisites, class_total_rating, class_total_difficulty, class_total_quality ) {
    // Do Validation Here
    //validate(course_code, [])
    const newClass = {
        course_code,
        course_description,
        course_name,
        typically_offered,
        prerequisites,
        class_total_difficulty,
        class_total_quality,
        class_total_rating
    };
    const classCollection = classes();
    let info = classCollection.insertOne(newClass);
    if (!info) throw "Inserting the class failed!";
    info._id = ObjectId.toString(info._id);
    return info;
}

export function getClassById(id) {
    // Validation
    const _id = new ObjectId(id);
    const classCollection = classes();
    let info = classCollection.findOne(_idf);
}

export function getAllClasses() {}

export function deleteClass(id) {}

export function addReview(class_id, course_code, professor_id, review_title, reviewer_id, review_date, review_contents, likes, dislikes, review_quality_rating, review_difficulty_rating, review_total_rating) {}

export function addProfessor(class_id, professor_id) {}