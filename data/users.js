// Imports
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { users } from "../mongodb/mongoCollections";

// Constants
const SALT_ROUNDS = 10;

// Data Functions:
export async function createUser(user_name, password, email) {
    //Validate

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
    //Validate
    const userCollection = await users();
    const user = await userCollection.findOne({ user_name });
    if (!user) throw new Error("User not found.");
    return user;
}

export async function getAllUsers() {
    const userCollection = await users();
    return await userCollection.find({}).toArray();
}

export async function deleteUser(id) {
    //Validate
    const userCollection = await users();
    const result = await userCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) throw new Error("User not found or not deleted.");
    return true;
}

export async function addReview(user_id, review_object) {
    //Validate
    const userCollection = await users();
    const result = await userCollection.updateOne(
        { _id: new ObjectId(user_id) },
        { $push: { reviews: review_object } }
    );
    if (result.modifiedCount === 0) throw new Error("Failed to add review.");
    return true;
}

export async function validateUser(user_name, password) {
    // Validate
    const userCollection = await users();
    const user = await userCollection.findOne({ user_name });
    if (!user) throw new Error("Invalid username or password.");

    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) throw new Error("Invalid username or password.");

    return { _id: user._id, user_name: user.user_name, email: user.email };
}
