// Imports
import { ObjectId } from "mongodb";
import { classes } from "../mongodb/mongoCollections.js";
import { process_id, validate, validate_string, validate_user_name, process_numerical_rating, process_course_code, validate_yyyymmdd_date, validate_number } from "../validation.js";

// Data Functions:

export async function createClass(course_code, course_name, course_description, typically_offered, prerequisites) {
    validate(course_code, validate_string, [process_course_code]);
    validate(course_name, validate_string, []);
    validate(course_description, validate_string, []);

    const newClass = {
        course_code,
        course_name,
        course_description,
        typically_offered,
        prerequisites,
        class_difficulty_rating: 0,
        class_quality_rating: 0,
        class_total_rating: 0,
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
    validate(id, validate_string, [process_id]);
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
    validate(id, validate_string, [process_id]);
    const _id = new ObjectId(id);

    const classCollection = await classes();
    const result = await classCollection.findOneAndDelete({ _id });
    if (!result) throw new Error("Failed to delete class");

    return result;
}

export async function addReview({course_code, professor_id, review_title, reviewer_id, review_date, review_contents, review_quality_rating, review_difficulty_rating, review_total_rating, user_name, _rid}) {
    validate(reviewer_id, validate_string, [process_id]);
    validate(professor_id, validate_string, [process_id]);
    validate(user_name, validate_string, [validate_user_name])
    validate(course_code, validate_string, [process_course_code]);
    validate(review_title, validate_string, []);
    validate(review_date, validate_string, [validate_yyyymmdd_date]);
    validate(review_contents, validate_string, []);
    validate(review_quality_rating, validate_number, [process_numerical_rating]);
    validate(review_difficulty_rating, validate_number, [process_numerical_rating]);
    validate(review_total_rating, validate_number, [process_numerical_rating]);



    const classCollection = await classes();
    const currentClass = await classCollection.findOne({ course_code });
    const tr = (review_total_rating + currentClass.class_total_rating * currentClass.reviews.length) / (currentClass.reviews.length + 1)
    const dr = (review_difficulty_rating + currentClass.class_difficulty_rating * currentClass.reviews.length) / (currentClass.reviews.length + 1)
    const qr = (review_quality_rating + currentClass.class_quality_rating * currentClass.reviews.length) / (currentClass.reviews.length + 1)
    const updateResult = await classCollection.findOneAndUpdate(
        { course_code },
        {
            $push: {
                reviews: {
                    _rid,
                    course_code,
                    professor_id,
                    review_title,
                    reviewer_id,
                    reviewer_name: user_name,
                    review_date,
                    review_contents,
                    likes: 0,
                    dislikes: 0,
                    likers: [],
                    review_quality_rating,
                    review_difficulty_rating,
                    review_total_rating,
                    comments: []
                }
            },
            $set: {
                class_total_rating: tr, 
                class_difficulty_rating: dr, 
                class_quality_rating: qr
            }
        },
        { returnDocument: "after" } // returns the updated document
    );

    if (!updateResult) throw new Error("Failed to add review");

    updateResult._id = updateResult._id.toString();
    return {
                    _rid,
                    course_code,
                    professor_id,
                    review_title,
                    reviewer_id,
                    reviewer_name: user_name,
                    review_date,
                    review_contents,
                    likes: 0,
                    dislikes: 0,
                    likers: [],
                    review_quality_rating,
                    review_difficulty_rating,
                    review_total_rating,
                    comments: []
                };
}

export async function addProfessor(course_code, professor_id) {
    validate(course_code, validate_string, [process_course_code]);
    validate(professor_id, validate_string, [process_id]);

    const classCollection = await classes();
    const updateResult = await classCollection.updateOne(
        { course_code },
        { $addToSet: { professors: professor_id } }
    );
    if (updateResult.matchedCount === 0) throw new Error("Failed to add professor");

    return true;
}

export async function updateReview(course_code, rid, updatedFields) {
    validate(course_code, validate_string, [process_course_code]);
    validate(rid, validate_string, [process_id]);
    const classCollection = await classes();
    const updateResult = await classCollection.updateOne(
        {
            course_code,
            "reviews._rid": new ObjectId(rid),
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

    const updatedClass = await classCollection.findOne({ course_code });
    updatedClass._id = updatedClass._id.toString();
    return updatedClass;
}

export async function deleteReview(class_id, review_id) {
    validate(class_id, validate_string, [process_id]);
    validate(review_id, validate_string, [process_id]);
    const _id = new ObjectId(class_id);

    const classCollection = await classes();
    const updateResult = await classCollection.updateOne(
        { _id },
        {
            $pull: {
                reviews: {
                    _rid: new ObjectId(review_id),
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

export async function addComment(user_name, reviewId, classId, commentText, commentId) {
    classId = validate(classId, validate_string);
    reviewId = validate(reviewId, validate_string);
    user_name = validate(user_name, validate_string, [validate_user_name]);
    commentText = validate(commentText, validate_string);

    if (!ObjectId.isValid(classId)) throw new Error("Invalid class ID.");
    if (!ObjectId.isValid(reviewId)) throw new Error("Invalid review ID.");

    const comment = {
        _id: commentId,
        user_name,
        text: commentText.trim(),
        date: new Date().toISOString().substring(0,10)
    };

    const classCollection = await classes();
    const updateInfo = await classCollection.updateOne(
        {
            _id: new ObjectId(classId),
            "reviews._rid": reviewId
        },
        {
            $push: { "reviews.$.comments": comment }
        }
    );

    if (updateInfo.modifiedCount === 0) {
        throw new Error("Failed to add comment. Class or review may not exist.");
    }

    return comment;
}
