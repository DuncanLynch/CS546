// Imports
import { ObjectId } from "mongodb";
import { classes } from "../mongodb/mongoCollections";

// Data Functions:

export async function createClass(course_code, course_name, course_description, typically_offered, prerequisites, class_total_rating, class_total_difficulty, class_total_quality) {
    // TODO: Add validation here

    const newClass = {
        course_code,
        course_name,
        course_description,
        typically_offered,
        prerequisites,
        class_total_rating,
        class_total_difficulty,
        class_total_quality
    };

    const classCollection = await classes();
    const result = await classCollection.insertOne(newClass);
    if (!result.acknowledged || !result.insertedId) {
        throw new Error("Inserting the class failed!");
    }

    return {
        ...newClass,
        _id: result.insertedId.toString()
    };
}

export async function getClassById(id) {
    if (!ObjectId.isValid(id)) throw new Error("Invalid ID format");
    const _id = new ObjectId(id);

    const classCollection = await classes();
    const classDoc = await classCollection.findOne({ _id });
    if (!classDoc) throw new Error("Class not found");

    classDoc._id = classDoc._id.toString();
    return classDoc;
}

export async function getAllClasses() {
    const classCollection = await classes();
    const classList = await classCollection.find({}).toArray();
    return classList.map((cls) => {
        cls._id = cls._id.toString();
        return cls;
    });
}

export async function deleteClass(id) {
    if (!ObjectId.isValid(id)) throw new Error("Invalid ID format");
    const _id = new ObjectId(id);

    const classCollection = await classes();
    const result = await classCollection.deleteOne({ _id });
    if (result.deletedCount === 0) throw new Error("Failed to delete class");

    return true;
}

export async function addReview(class_id, course_code, professor_id, review_title, reviewer_id, review_date, review_contents, likes, dislikes, review_quality_rating, review_difficulty_rating, review_total_rating) {
    if (!ObjectId.isValid(class_id)) throw new Error("Invalid class ID format");
    const _id = new ObjectId(class_id);

    const classCollection = await classes();
    const updateResult = await classCollection.updateOne(
        { _id },
        {
            $push: {
                reviews: {
                    course_code,
                    professor_id,
                    review_title,
                    reviewer_id,
                    review_date,
                    review_contents,
                    likes,
                    dislikes,
                    review_quality_rating,
                    review_difficulty_rating,
                    review_total_rating
                }
            }
        }
    );

    if (updateResult.modifiedCount === 0) throw new Error("Failed to add review");

    return true;
}

export async function addProfessor(class_id, professor_id) {
    if (!ObjectId.isValid(class_id)) throw new Error("Invalid class ID format");
    const _id = new ObjectId(class_id);

    const classCollection = await classes();
    const updateResult = await classCollection.updateOne(
        { _id },
        { $addToSet: { professors: professor_id } }
    );

    if (updateResult.modifiedCount === 0) throw new Error("Failed to add professor");

    return true;
}
