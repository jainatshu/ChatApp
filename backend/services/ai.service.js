import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development You never miss the edge cases and always write code that is scalable and maintainable, In your code you always handle the errors and exceptions.
    
    Examples: 

    <example>
 
    response: {

    "text": "this is you fileTree structure of the express server",
    "fileTree": {
        "app.js": {
            file: {
                contents: "
                const express = require('express');

                const app = express();


                app.get('/', (req, res) => {
                    res.send('Hello World!');
                });


                app.listen(3000, () => {
                    console.log('Server is running on port 3000');
                })
                "
            
        },
    },

        "package.json": {
            file: {
                contents: "

                {
                    "name": "temp-server",
                    "version": "1.0.0",
                    "main": "index.js",
                    "scripts": {
                        "test": "echo \"Error: no test specified\" && exit 1"
                    },
                    "keywords": [],
                    "author": "",
                    "license": "ISC",
                    "description": "",
                    "dependencies": {
                        "express": "^4.21.2"
                    }
}

                
                "
                
                

            },

        },

    },
    routes:{
        file:{
            contents: {
            "const express = require('express');
            const router = express.Router();
            
            // Example route
            router.get('/', (req, res) => {
            res.json({ message: 'Users route' });
            });
            
            // Example route with error handling
            router.get('/error', (req, res, next) => {
            const error = new Error('Something went wrong');
            next(error); // Pass the error to the global error handler
            });
            
            module.exports = router;
            "
        }
            
        }
    }
    "buildCommand": {
        mainItem: "npm",
            commands: [ "install" ]
    },

    "startCommand": {
        mainItem: "node",
            commands: [ "app.js" ]
    }
}

    user:Create an express application 
   
    </example>


    
       <example>

       user:Hello 
       response:{
       "text":"Hello, How can I help you today?"
       }
       
       </example>
    
 IMPORTANT : don't use file name like routes/index.js please send the data in proper JSON format
 IMPORTANT : please send the data in proper JSON format
 
       
       
    `


});

// export const generateResult = async (prompt) => {
//     try {
//         const result = await model.generateContent(prompt);

//         // Ensure result.response.text() is awaited if it's asynchronous
//         const messageContent = (await result.response.text()).trim();

//         // Remove triple backticks and "json" if present
//         try {
//             let cleanedContent = messageContent;
        
//             // Ensure text doesn't contain backticks before parsing
//             cleanedContent = cleanedContent.replace(/`/g, '"');
        
//             // Extract JSON
//             const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
//             if (!jsonMatch) {
//                 console.error("No valid JSON found in message content");
//                 return null;
//             }
        
//             const formattedJSON = JSON.parse(jsonMatch[0]);
//             return formattedJSON;
        
//         } catch (error) {
//             console.error("JSON Parsing Error:", error.message);
//             return null;
//         }
//     } catch (error) {
//         console.error("Error generating result:", error.message);
//         return null; // Handle top-level errors
//     }
// };


export const generateResult = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);

        // Ensure result.response.text() is awaited if it's asynchronous
        const messageContent = (await result.response.text()).trim();

        // Remove triple backticks and "json" if present
        let cleanedContent = messageContent;
        if (cleanedContent.startsWith("```json")) {
            cleanedContent = cleanedContent.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanedContent.startsWith("```")) {
            cleanedContent = cleanedContent.replace(/^```/, '').replace(/```$/, '').trim();
        }
        
        // console.log(cleanedContent,'\n');
        // console.log(jsoncontent,'\n');

        // Extract JSON part
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("No valid JSON found in message content");
            return null;  // Return null if JSON extraction fails
        }

        try {
            const parsedMessage = JSON.parse(jsonMatch[0]); // Parse extracted JSON
            console.log(parsedMessage);
            return parsedMessage;  // Return parsed JSON
        } catch (error) {
            console.error("JSON Parsing Error:", error.message);
            console.error("Extracted JSON:", jsonMatch[0]);
            return null; // Return null if parsing fails
        }
    } catch (error) {
        console.error("Error generating result:", error.message);
        return null; // Handle top-level errors
    }
};

