//Imports
import { ObjectId } from "mongodb";
import { profs } from "../mongodb/mongoCollections.js";
import { validate, validate_professor_name, validate_string, process_id, validate_stevens_email, process_course_code } from "../validation.js";
import { addProfessor } from "./classes.js";
//Data Functions:
export async function createProfessor(professor_name, course_code, email) {
    validate(professor_name, validate_string, [validate_professor_name]);
    validate(course_code, validate_string, [process_course_code]);
    validate(email, validate_string, [validate_stevens_email]);

    const professorCollection = await profs();

    const dup = await professorCollection.findOne({ email });

    if (dup) {
        if (!dup.courses.includes(course_code)) {
            await professorCollection.updateOne(
                { email },
                { $push: { courses: course_code } }
            );
            dup.courses.push(course_code); // reflect the update in the returned object
        }
        return {
            ...dup,
            _id: dup._id.toString()
        };
    }

    const newProfessor = {
        professor_name,
        courses: [course_code],
        email
    };

    const info = await professorCollection.insertOne(newProfessor);
    if (!info.insertedId) throw new Error("Failed to insert professor!");
    await addProfessor(course_code, info.insertedId.toString());
    return {
        ...newProfessor,
        _id: info.insertedId.toString()
    };
}


export async function getProfessorById(id) {
    validate(id, validate_string, [process_id]);
    const professorCollection = await profs();
    const _id = new ObjectId(id);
    let info = await professorCollection.findOne(_id);
    info._id = id;
    return info;
}

export async function getAllProfessors() {
    const professorCollection = await profs();
    const profList = await professorCollection.find({}).toArray();
    return profList.map((prf) => {
            prf._id = prf._id.toString();
            return prf;
    });
}

export async function deleteProfessor(id) {
    validate(id, validate_string, [process_id]);
    const _id = new ObjectId(id);
    
    const professorCollection = await profs();
    let result = await professorCollection.findOneAndDelete({ _id });
    if (!result) throw new Error("Failed to delete professor.");
    result._id = result._id.toString();
    return result;
}

export async function addCourse(professor_id, class_id) {
    validate(professor_id, validate_string, [process_id]);
    validate(class_id, validate_string, [process_id]);

    const _id = new ObjectId(professor_id);
    const professorCollection = await profs();

    const updateResult = await professorCollection.updateOne(
        { _id },
        { $addToSet: { courses: class_id } }
    );

    if (updateResult.modifiedCount === 0) {
        throw new Error("Failed to add course to professor");
    }

    return true;
}
