import * as ai from '../services/ai.service.js'


export const genResult = async(req,res)=>{
    try {
        const {prompt} = req.query;
        const result = await ai.generateResult(prompt);
        
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send({message: error.message});
    }
}