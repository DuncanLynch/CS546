//Imports
import { ObjectId } from "mongodb";
import { profs } from "../mongodb/mongoCollections";
//Data Functions:
export async function createProfessor(professor_name, course_id, email) {
    // Validate
    const professorCollection = await profs();
    const newProfessor = {
        professor_name,
        courses: [course_id],
        email
    };
    let info = await professorCollection.insertOne(newProfessor);
    if (!info) throw new Error("Failed to insert professor!");
    return {
        ...newProfessor,
          _id: info._id.toString() 
    };
}

export async function getProfessorById(id) {
    // Validate
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
    if (!ObjectId.isValid(id)) throw new Error("Invalid ID format");
    const _id = new ObjectId(id);
    
    const professorCollection = await profs();
    const result = await professorCollection.deleteOne({ _id });
    if (result.deletedCount === 0) throw new Error("Failed to delete professor.");
    
    return true;
}

export async function addCourse(professor_id, class_id) {
    if (!ObjectId.isValid(professor_id)) throw new Error("Invalid professor ID format");

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
