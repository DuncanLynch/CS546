// Imports
import { ObjectId } from "mongodb";
import { classes } from "../mongodb/mongoCollections.js";
import { process_id, validate, validate_string } from "../validation.js";

// Data Functions:

export async function createClass(course_code, course_name, course_description, typically_offered, prerequisites) {
    // TODO: Add validation here

    const newClass = {
        course_code,
        course_name,
        course_description,
        typically_offered,
        prerequisites,
        reviews: [],
        professors: []
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

export async function getClassbyCourseCode(cc) {
    validate(cc, validate_string);
    const classCollection = await classes();

    const classDoc = await classCollection.findOne({ course_code: cc });
    if (!classDoc) throw new Error("Class not found with the given course code");

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
    const updateResult = await classCollection.findOneAndUpdate(
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
        },
        { returnDocument: "after" } // returns the updated document
    );

    if (!updateResult.value) throw new Error("Failed to add review");

    updateResult.value._id = updateResult.value._id.toString();
    return updateResult.value;
}

export async function addProfessor(class_id, professor_id) {
    validate(class_id, validate_string, [process_id]);
    validate(professor_id, validate_string, [process_id]);
    const _id = new ObjectId(class_id);

    const classCollection = await classes();
    const updateResult = await classCollection.updateOne(
        { _id },
        { $addToSet: { professors: professor_id } }
    );

    if (updateResult.modifiedCount === 0) throw new Error("Failed to add professor");

    return true;
}

export async function updateReview(class_id, reviewer_id, review_date, updatedFields) {
    if (!ObjectId.isValid(class_id)) throw new Error("Invalid class ID format");
    const _id = new ObjectId(class_id);

    const classCollection = await classes();

    const updateResult = await classCollection.updateOne(
        {
            _id,
            "reviews.reviewer_id": reviewer_id,
            "reviews.review_date": review_date
        },
        {
            $set: Object.fromEntries(
                Object.entries(updatedFields).map(([key, value]) => [`reviews.$.${key}`, value])
            )
        }
    );

    if (updateResult.modifiedCount === 0) {
        throw new Error("Failed to update review: review not found or no changes made.");
    }

    const updatedClass = await classCollection.findOne({ _id });
    updatedClass._id = updatedClass._id.toString();
    return updatedClass;
}

export async function deleteReview(class_id, reviewer_id, review_date) {
    if (!ObjectId.isValid(class_id)) throw new Error("Invalid class ID format");
    const _id = new ObjectId(class_id);

    const classCollection = await classes();
    const updateResult = await classCollection.updateOne(
        { _id },
        {
            $pull: {
                reviews: {
                    reviewer_id: reviewer_id,
                    review_date: review_date
                }
            }
        }
    );

    if (updateResult.modifiedCount === 0) {
        throw new Error("Failed to delete review: review not found.");
    }

    const updatedClass = await classCollection.findOne({ _id });
    updatedClass._id = updatedClass._id.toString();
    return updatedClass;
}
