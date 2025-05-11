// Imports
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { users } from "../mongodb/mongoCollections.js";
import { validate, validate_string, validate_password, validate_stevens_email, process_id, validate_mmddyyyy_date, validate_user_name } from "../validation.js";

// Constants
const SALT_ROUNDS = 10;

// Data Functions:
export async function createUser(user_name, password, email) {
    validate(user_name, validate_string, [validate_user_name]);
    validate(password, validate_string, [validate_password]);
    validate(email, validate_string, [validate_stevens_email]);

    const userCollection = await users();

    const existingUser = await userCollection.findOne({ user_name });
    if (existingUser) throw new Error("Username already exists.");

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
        user_name,
        hashed_password: hashedPassword,
        email,
        reviews: [] // optional field to hold reviews
    };

    const insertResult = await userCollection.insertOne(newUser);
    if (!insertResult.acknowledged) throw new Error("Failed to create user.");

    return { _id: insertResult.insertedId, user_name, email };
}

export async function getUserByName(user_name) {
    validate(user_name, validate_string, [validate_user_name]);
    const userCollection = await users();
    const user = await userCollection.findOne({ user_name });
    if (!user) throw new Error("User not found.");
    return user;
}

export async function getAllUsers() {
    const userCollection = await users();
    return await userCollection.find({}).toArray();
}

export async function deleteUser(user_name) {
    validate(user_name, validate_string, [validate_user_name]);
    const userCollection = await users();
    const result = await userCollection.deleteOne({ user_name });
    if (result.deletedCount === 0) throw new Error("User not found or not deleted.");
    return true;
}

export async function addReview(user_name, review_object) {
    validate(user_name, validate_string, [validate_username]);

    const userCollection = await users();
    const result = await userCollection.updateOne(
        { user_name },
        { $push: { reviews: review_object } }
    );
    if (result.modifiedCount === 0) throw new Error("Failed to add review.");
    return true;
}

export async function validateUser(user_name, password) {
    validate(user_name, validate_string, [validate_user_name]);
    validate(password, validate_string, [validate_password]);
    const userCollection = await users();
    const user = await userCollection.findOne({ user_name });
    if (!user) throw new Error("Invalid username or password.");

    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) throw new Error("Invalid username or password.");

    return { _id: user._id, user_name: user.user_name, email: user.email, reviews: user.reviews };
}


export async function updateReview(class_id, review_id, updatedFields) {
    validate(class_id, validate_string, [process_id]);
    validate(review_id, validate_string, [process_id]);
    const _id = new ObjectId(class_id);
    const _rid = new ObjectId(review_id);

    const userCollection = await users();

    const updateResult = await userCollection.updateOne(
        {
            _id,
            "reviews._id": _rid,
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

    const updatedClass = await userCollection.findOne({ _id });
    updatedClass._id = updatedClass._id.toString();
    return updatedClass;
}

export async function deleteReview(class_id, reviewer_id, review_date) {
    validate(class_id, validate_string, [process_id]);
    validate(reviewer_id, validate_string, [process_id]);
    validate(review_date, validate_string, [validate_mmddyyyy_date]);
    const _id = new ObjectId(class_id);

    const userCollection = await users();
    const updateResult = await userCollection.updateOne(
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

    const updatedClass = await userCollection.findOne({ _id });
    updatedClass._id = updatedClass._id.toString();
    return updatedClass;
}
