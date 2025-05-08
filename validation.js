import { ObjectId } from "mongodb";

// Higher-Order Validation function
export function validate(item_to_validate, type_validation_function, validation_functions) {
    item_to_validate = type_validation_function(item_to_validate);
    for (let func of validation_functions) {
        func(item_to_validate);
    }
    return item_to_validate;
}

// === Type Validators ===
export function validate_string(str) {
    if (!str) throw "Argument not provided!";
    if (typeof str !== "string") throw "Provided argument is not a string!";
    str = str.trim();
    if (str === "") throw "Provided argument is an empty string!";
    return str;
}

export function validate_number(num) {
    if (num === undefined || num === null) throw "Argument not provided!";
    if (typeof num !== "number") throw "Provided argument is not a number!";
    return num;
}

// === Utility Validators ===
export function only_letters(str) {
    if (!/^[a-zA-Z]+$/.test(str)) throw "Expected only letters!";
}

export function only_numbers(str) {
    if (!/^\d+$/.test(str)) throw "Expected only numbers!";
}

// === Processors & Custom Validators ===

// ObjectId Validator
export const process_id = (id) => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) return false;
    id = id.trim();
    if (!ObjectId.isValid(id)) return false;
    return id;
};

export const process_arrayof_ids = (array) => {
    if (!Array.isArray(array)) throw new Error("Invalid ID Array!");
    return array.map(id => {
        const processed = process_id(id);
        if (!processed) throw new Error("Invalid ID in array!");
        return processed;
    });
};

// Unsigned Integer
export const process_unsignedint = (number) => {
    if (typeof number !== 'number' || number < 0 || !Number.isInteger(number)) throw "Invalid unsigned int!";
    return number;
};

// Rating: float between 1.0 and 5.0
export const process_numerical_rating = (rating) => {
    if (typeof rating !== 'number' || rating < 1.0 || rating > 5.0) throw "Invalid rating!";
    return Number(rating.toFixed(2));
};

// Course Code: format "CS 546"
export const process_course_code = (course_code) => {
    course_code = validate_string(course_code);
    const match = course_code.match(/^([A-Z]{1,4})\s(\d{3})$/);
    if (!match) throw "Invalid course code!";
    return course_code;
};

// Name: format "First Last"
export const validate_professor_name = (name) => {
    name = validate_string(name);
    const parts = name.split(" ");
    if (parts.length !== 2 || !/^[A-Z][a-z]+$/.test(parts[0]) || !/^[A-Z][a-z]+$/.test(parts[1])) {
        throw "Professor name must be in 'First Last' format with proper casing.";
    }
};

// Email: must match pattern "account@stevens.edu"
export const validate_stevens_email = (email) => {
    email = validate_string(email);
    const stevensRegex = /^[a-zA-Z0-9._%+-]+@stevens\.edu$/;
    if (!stevensRegex.test(email)) throw "Email must be a valid stevens.edu address!";
};

// Date Format: "MM/DD/YYYY"
export const validate_mmddyyyy_date = (dateStr) => {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d\d$/;
    if (!regex.test(dateStr)) throw "Date must be in MM/DD/YYYY format!";
};

// === Field-specific Validators for USER ===
export function validate_username(username) {
    validate(username, validate_string, []);
}

export function validate_password(password) {
    validate(password, validate_string, []);
}

export function validate_user_email(email) {
    validate(email, validate_string, [validate_stevens_email]);
}

// === Field-specific Validators for REVIEW ===
export function validate_review_title(title) {
    validate(title, validate_string, []);
}

export function validate_review_content(content) {
    validate(content, validate_string, []);
}

export function validate_review_date(date) {
    validate(date, validate_string, [validate_mmddyyyy_date]);
}
