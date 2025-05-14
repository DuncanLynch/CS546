import * as classData from "./data/classes.js";
import * as userData from './data/users.js';
import * as profData from './data/professors.js';
import { ObjectId } from "mongodb";
import {closeConnection, dbConnection} from './mongodb/mongoConnection.js';

    try{
        var seed101 = await classData.createClass("SEED 101", "Introduction to Seeding Databases", "Students in this course will learn about creating data in a seed file for their CS546 final project.", "Fall Semester", "Freshmen")
        console.log("101")
        var seed105 = await classData.createClass("SEED 105", "Introduction to Seeding Gardens", "Students in this course will learn about seeding plants in a garden, with a final project of maintaining a garden throughout the semester", "Spring Semester", "Freshmen")
        console.log("105")
        var seed221 = await classData.createClass("SEED 221", "Specific Seeding Techniques", "Students in this course will learn specific techniques to seed their database for their CS546 final project.", "Fall Semester", "SEED 101")
        console.log("221")
        var seed222 = await classData.createClass("SEED 222", "Statistics for Seeding", "Students will learn about how to ensure there are no biases in their seeded data, and research methods used in statistics to ensure fair data.", "Spring Semester", "SEED 101")
        console.log("222")
        var seed396 = await classData.createClass("SEED 365", "Garden Seeding Year-Round", "Students will be leaarn specific techniques, and strategies to seed in all 4 seasons of the year. As well as when many common plants should be seeded", "Fall Semester Spring Semester", "SEED 105")
        console.log("365")
    }catch(e){
        console.error("Class Seeding failed: "+ e);
    }
    try{
        var dunc = await userData.createUser("hypadeficit", "thegoat", "dlynch3@stevens.edu")
        var lewis = await userData.createUser("100usd", "r0utesguy", "lgoldenb@stevens.edu")
        var alan = await userData.createUser("circ4", "2f@clutch", "amanjarr@stevens.edu")
        var gabe = await userData.createUser("gab05", "gabeisgame", "gcastill@stevens.edu")
    }catch(e){
        console.error("User Seeding failed: "+ e)
    }
    try{
        var acraine_prof = await profData.createProfessor("Alexandra Craine", "SEED 101", "acraine@stevens.edu")
        await classData.addProfessor("SEED 101", acraine_prof._id)
        var ldecandi_prof = await profData.createProfessor("Lance Decandia", "SEED 221", "ldecandi@stevens.edu")
        await classData.addProfessor("SEED 221", ldecandi_prof._id)
        var dkim_prof = await profData.createProfessor("David Kim", "SEED 221", "dkim29@stevens.edu")
        await classData.addProfessor("SEED 221", dkim_prof._id)
        var newacraine_prof = await profData.createProfessor("Alexandra Craine", "SEED 222", "acraine@stevens.edu")
        await classData.addProfessor("SEED 222", acraine_prof._id)
        var tbuss = await profData.createProfessor("Tyler Buss", "SEED 105", "tbuss@stevens.edu")
        await classData.addProfessor("SEED 105", tbuss._id)
        var sroy = await profData.createProfessor("Shreya Roy", "SEED 365", "sroy3@stevens.edu")
        await classData.addProfessor("SEED 105", sroy._id)
        var newsroy = await profData.createProfessor("Shreya Roy", "SEED 105", "sroy3@stevens.edu")
        await classData.addProfessor("SEED 365", sroy._id)
    }catch(e){
        console.error("Professor Seeding failed: " + e)
    }
    try{
        /*
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
        
        */
        const review_one = await classData.addReview({course_code: "SEED 101", professor_id: acraine_prof._id.toString(), review_title: "Very Smart", reviewer_id: lewis._id.toString(), review_date:"2025-05-12", review_contents: "Professor Craine is very smart and knowledgable on how to seed information for a database", review_difficulty_rating: 4, review_quality_rating: 4, review_total_rating: 5, user_name: lewis.user_name, _rid: (new ObjectId).toString()})
        await userData.addReview(lewis.user_name, review_one)
        console.log("R1")
        const comonetxt = "How did you even type that review with your long awesome hair? This totally isn't Lewis pretending to be Duncan for a seed file..."
        const comoneid = new ObjectId().toString()
        const comone = await classData.addComment(dunc.user_name, review_one._rid, seed101._id, comonetxt, comoneid)
        console.log(comone)
        console.log("C0.5")
        //t(user_name, reviewId, commentText, commentId, reviewer) 
        await userData.addComment(dunc.user_name, review_one._rid, comonetxt, comoneid, review_one.reviewer_name)
        console.log("C1")
        const comtwo = await classData.addComment(lewis.user_name, review_one._rid, seed101._id, "I'm just him, what can I say?", new ObjectId().toString())
        await userData.addComment(lewis.user_name, review_one._rid, comtwo.text, comtwo._id, review_one.reviewer_name)
        const review_two = await classData.addReview({course_code: "SEED 365", professor_id: sroy._id.toString(), review_title: "Shes Great", reviewer_id: dunc._id.toString(), review_date:"2025-05-13", review_contents: "Shreya is the best", review_difficulty_rating: 1, review_quality_rating: 5, review_total_rating: 5, user_name: dunc.user_name, _rid: (new ObjectId).toString()})
        await userData.addReview(dunc.user_name, review_two)
        const review_three = await classData.addReview({course_code: "SEED 105", professor_id: tbuss._id.toString(), review_title: "The most exciting lectures ever", reviewer_id: alan._id.toString(), review_date:"2025-05-09", review_contents: "Professor Tyler is extremely funny, and his lectures are very entertaining.", review_difficulty_rating: 3, review_quality_rating: 5, review_total_rating: 5, user_name: alan.user_name, _rid: (new ObjectId).toString()})        
        await userData.addReview(alan.user_name, review_three)
        const comthree = await classData.addComment(dunc.user_name, review_three._rid, seed105._id, "Yeah, I laugh every time I go to class", new ObjectId().toString())
        await userData.addComment(dunc.user_name, review_three._rid, comthree.text, comthree._id, review_three.reviewer_name)
        const review_four = await classData.addReview({course_code: "SEED 221", professor_id: ldecandi_prof._id.toString(), review_title: "Should be called Hockey Techniques", reviewer_id: gabe._id.toString(), review_date:"2025-05-06", review_contents: "His lectures are more about ice hockey than seeding", review_difficulty_rating: 3, review_quality_rating: 2, review_total_rating: 4, user_name: gabe.user_name, _rid: (new ObjectId).toString()})
        await userData.addReview(gabe.user_name, review_four)
        const comfour = await classData.addComment(lewis.user_name, review_four._rid, seed221._id, "Yeah, I lived with this guy for a whole year, and he cares about hockey almost as much as I care about league...", new ObjectId().toString())
        await userData.addComment(lewis.user_name, review_four._rid, comfour.text, comfour._id, review_four.reviewer_name)
        const review_six = await classData.addReview({course_code: "SEED 365", professor_id: sroy._id.toString(), review_title: "Shreya The Goat", reviewer_id: gabe._id.toString(), review_date:"2025-05-03", review_contents: "Shreya's classes are always easy and very informational, must take.", review_difficulty_rating: 2, review_quality_rating: 4, review_total_rating: 5, user_name: gabe.user_name, _rid: (new ObjectId).toString()})
        await userData.addReview(gabe.user_name, review_six)
        const review_seven = await classData.addReview({course_code: "SEED 221", professor_id: dkim_prof._id.toString(), review_title: "Never shows up to lecture", reviewer_id: alan._id.toString(), review_date:"2025-05-09", review_contents: "Never shows up to class, class wonders if he's even real. Very easy A though.", review_difficulty_rating: 1, review_quality_rating: 1, review_total_rating: 3, user_name: alan.user_name, _rid: (new ObjectId).toString()})
        await userData.addReview(alan.user_name, review_seven)
        const review_eight = await classData.addReview({course_code: "SEED 105", professor_id: sroy._id.toString(), review_title: "The best intro course ever", reviewer_id: gabe._id.toString(), review_date:"2025-05-01", review_contents: "Made me want to learn more about gardening", review_difficulty_rating: 2, review_quality_rating: 4, review_total_rating: 5, user_name: gabe.user_name, _rid: (new ObjectId).toString()})
        await userData.addReview(gabe.user_name, review_eight)
        const review_nine = await classData.addReview({course_code: "SEED 221", professor_id: dkim_prof._id.toString(), review_title: "HAPPY BIRTHDAY DAVID", reviewer_id: lewis._id.toString(), review_date:"2025-05-14", review_contents: "ITS MY BOYS BIRTHDAY TODAY HAPPY BIG 20 DAVID!", review_difficulty_rating: 5, review_quality_rating: 5, review_total_rating: 5, user_name: lewis.user_name, _rid: (new ObjectId).toString()})
        await userData.addReview(lewis.user_name, review_nine)

        await classData.updateReview(review_one.course_code, review_one._rid, {likes: 2, dislikes: 0, 
            likers:{[dunc._id]: 1,
                    [alan._id]: 1} } )
        await classData.updateReview(review_two.course_code, review_two._rid, {likes: 3, dislikes: 0, 
            likers:{[dunc._id]: 1,
                    [alan._id]: 1,
                    [gabe._id]: 1} } )
        await classData.updateReview(review_three.course_code, review_three._rid, {likes: 2, dislikes: 0,
            likers:{[lewis._id]: 0,
                    [alan._id]: 1,
                    [gabe._id]: 1} } )
        await classData.updateReview(review_four.course_code, review_four._rid, {likes: 1, dislikes: 0,
            likers:{[lewis._id]: 1 }} )
        await classData.updateReview(review_nine.course_code, review_nine._rid, {likes: 4, dislikes: 0,
            likers:{[lewis._id]: 1,
                    [alan._id]: 1,
                    [gabe._id]: 1,
                    [dunc._id]: 1} } )
        
    }catch(e){
        console.error("Reviews Seeding failed: " + e)
    }
    try{
        const duncid = dunc._id.toString()
        const lewisid = lewis._id.toString()
        const alanid = alan._id.toString()
        const gabeid = gabe._id.toString()
        const acraineid = acraine_prof._id.toString()
        const sroyid = sroy._id.toString()
        const ldecandiid = ldecandi_prof._id.toString()
        const dkimid = dkim_prof._id.toString() 
        const tbussid = tbuss._id.toString()
        await userData.addWishlist(duncid, acraineid)
        await userData.addWishlist(duncid, sroyid)
        await userData.addWishlist(lewisid, ldecandiid)
        await userData.addWishlist(gabeid, tbussid)
        await userData.addWishlist(alanid, ldecandiid)
        await userData.addWishlist(lewisid, dkimid)
        await userData.addWishlist(lewisid, ldecandiid)
        console.log("Seeing Complete")
    }catch(e){
        console.error("Wishlist Seeding failed: " + e)
    }
    await closeConnection();