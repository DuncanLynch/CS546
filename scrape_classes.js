import axios from 'axios';
import * as cheerio from 'cheerio';
import { createClass } from './data/classes.js';

async function parseCourse(link, code) {
    try {
        const response = await axios.get(link);
        const $ = cheerio.load(response.data);
        
        const h1 = $('#main h1');
        const course_code = h1.find('span').text().trim();
        const course_name = h1.clone().children().remove().end().text().trim(); // removes span, keeps the rest

        const description = $('#main .desc p').text().trim();

        let typically_offered = '';
        const offeredText = $('.sc-extrafield h3:contains("Typically Offered Periods")').next().text();
        if (offeredText.includes("Fall")) typically_offered += "Fall Semester ";
        if (offeredText.includes("Spring")) typically_offered += "Spring Semester";

        const prereq = $('.sc_prereqs').text().replace("Prerequisite", "").trim();
        
        await createClass(
            course_code,
            course_name,
            description,
            typically_offered.trim(),
            prereq
        );

        console.log(`Added: ${course_code} - ${course_name}`);
    } catch (err) {
        console.error(`Failed to parse ${link}:`, err.message);
    }
}


async function main() {
    const linkstem = "https://stevens.smartcatalogiq.com";
    const catalogUrl = "https://stevens.smartcatalogiq.com/Institutions/Stevens-Institution-of-Technology/json/2024-2025/Academic-Catalog.json";
    try {
        const response = await axios.get(catalogUrl);
        const data = response.data;
        const coursedict = data.Children[24];

        for (const sec of coursedict.Children) {
            for (const courseLevel of sec.Children) {
                for (const course of courseLevel.Children) {
                    const link = linkstem + course.Path.toLowerCase();
                    const code = course.Name;
                    await parseCourse(link, code);
                }
            }
        }

        console.log("Finished scraping the Stevens Academic Catalogue.");
    } catch (error) {
        console.error("Failed to fetch catalog JSON:", error.message);
    }
}

main();