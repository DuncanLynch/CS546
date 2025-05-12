import * as classData from "../data/classes.js";
import * as userData from '../data/users.js';
import * as profData from '../data/professors.js';
import { ObjectId } from "mongodb";
async function runTests() {
    try {
        /*// users
        const user = await userData.createUser("testuser", "Password123!", "testuser@stevens.edu");
        console.log("User created:", user);

        const validatedUser = await userData.validateUser("testuser", "Password123!");
        console.log("User validated:", validatedUser);

        const fetchedUser = await userData.getUserByName("testuser");
        console.log("User fetched:", fetchedUser);

        const allUsers = await userData.getAllUsers();
        console.log("All users:", allUsers);



        */// professors
        //const prof = await profData.createProfessor("Patrick Hill", "CS 546", "testprof@stevens.edu");
        //console.log("Professor created:", prof);
        const review = await classData.addReview(
            "681fd1060ba19622910cc560",
            "CS 546",
            "6820266da051231ecf998327",
            "Great class!",
            "681fb7bb47cc36c16d4b3db9",
            "05/11/2025",
            "Learned a lot!",
            10,
            0,
            5,
            4,
            4.5,
            new ObjectId().toString(),
            "hypadef"
        );
        console.log(review);
        /* const fetchedProf = await profData.getProfessorById(prof._id);
        console.log("Professor fetched:", fetchedProf);

        const allProfs = await profData.getAllProfessors();
        console.log("All professors:", allProfs);

        await profData.addCourse(prof._id, "dummycourseid0000000000000001");
        console.log("Added course to professor");
        

        // classes
        const cls = await classData.createClass("CS 101", "Intro to CS", "Basics of CS", "Fall", "Math 101");
        console.log("Class created:", cls);

        const clsById = await classData.getClassById(cls._id);
        console.log("Class by ID:", clsById);

        const clsByCode = await classData.getClassbyCourseCode("CS 101");
        console.log("Class by course code:", clsByCode);

        const allClasses = await classData.getAllClasses();
        console.log("All classes:", allClasses);

        await classData.addProfessor(cls._id, prof._id);
        console.log("Professor added to class");

        console.log(prof._id);
        console.log(user._id)

        const review = await classData.addReview(
            cls._id,
            cls.course_code,
            prof._id,
            "Great class",
            user._id.toString(),
            "05/09/2025",
            "Learned a lot!",
            10,
            0,
            5,
            4,
            4.5,
            new ObjectId().toString(),
            user.user_name
        );
        console.log("Review added:", review);

        const comment = await classData.addComment(cls._id, review.reviews[0]._rid.toString(), user._id.toString(), "Great review!");
        console.log("Comment added:", comment);

        const updatedReview = await classData.updateReview(
            cls._id,
            user._id.toString(),
            "05/09/2025",
            { review_title: "Updated Title" }
        );
        console.log("Review updated:", updatedReview);

        const deletedReview = await classData.deleteReview(cls._id, user._id.toString(), "05/09/2025");
        console.log("Review deleted:", deletedReview);

        const deletedProf = await profData.deleteProfessor(prof._id);
        console.log("Professor deleted:", deletedProf);

        const deletedUser = await userData.deleteUser("testuser");
        console.log("User deleted:", deletedUser);

        const deletedClass = await classData.deleteClass(cls._id);
        console.log("Class deleted:", deletedClass);*/
    } catch (error) {
        console.error("Test failed:", error);
    }
}

runTests();