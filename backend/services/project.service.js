import projectModel from '../models/project.model.js'
import mongoose from 'mongoose'


export const createProject = async({
    name, userId
}) => {
    if(!name){
        throw new Error('Name is required')
    }
    if(!userId){
        throw new Error('User is required')
    }

    const project = await projectModel.create({
        name,
        users: [userId]
    })
    return project;
}

export const getAllProjectByUserId = async({userId})=>{
    if(!userId){
        throw new ('User Id is required')
    }
    const allUserProjects = await projectModel.find({
        users: userId
    })
    return allUserProjects
}


export const addUsersToProject = async({projectId, users, userId})=>{
    if(!projectId||!users){
        throw new Error("projectId and users both are required")
    }
    if(!userId){
        throw new Error("userId is required")
    }
    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid project Id")
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }
    if(!Array.isArray(users)||users.some(userId=>!mongoose.Types.ObjectId.isValid(userId))){
        throw new Error("Invalid userId(s) in users array")
    }
    const project = await projectModel.findOne({
        _id: projectId,
        users: userId
    })

    console.log("\n project before operation",project)
    if(!project){
        throw new Error("User not belong to this project")

    }
    const updateProject = await projectModel.findOneAndUpdate({
        _id:projectId
    },{
        $addToSet: {
            users:{
                $each:users
            }
        }
    },{
        new:true
    })
    console.log("\n updated project",updateProject)
    return updateProject

}

export const getProjectById = async({projectId})=>{
    if(!projectId){
        throw new Error("projectId is required")

    }
    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("ProjectId is not valid")
    }
    const project = await projectModel.findOne({
        _id: projectId
    }).populate('users')
    return project
}

export const updateFileTree = async ({ projectId, fileTree }) => {
    if (!projectId) {
        throw new Error("projectId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new Error("Invalid projectId")
    }

    if (!fileTree) {
        throw new Error("fileTree is required")
    }

    const project = await projectModel.findOneAndUpdate({
        _id: projectId
    }, {
        fileTree
    }, {
        new: true
    })

    return project;
}

