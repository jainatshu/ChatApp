import 'dotenv/config'
import http from "http"
import { app } from "./app.js"
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import projectModel from './models/project.model.js'
import { generateResult } from './services/ai.service.js'


const port = process.env.PORT || 3000

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173/'
    }
});

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid ProjectId'))
        }
        if (!token) {
            return next(new Error("Authentication error"));
        }
        socket.project = await projectModel.findById(
            projectId
        ).lean();
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return next(new Error("Authentication error"));
        }
        socket.user = decoded
        next()
    } catch (error) {
        next(error)
    }
})


io.on('connection', socket => {
    console.log('a user connected')
    socket.roomId = socket.project._id.toString()
    socket.join(socket.roomId)


    socket.on('project-message', async (data) => {
        const message = data.message;
        const aiIsPresentInMessage = message.includes('@ai');

        if (aiIsPresentInMessage) {
            const prompt = message.replace('@ai', '').trim();
            const result = await generateResult(prompt);

            // Handle null response gracefully
            const aiResponse = result ? result : { error: "Sorry, I couldn't process that request." };

            io.to(socket.roomId).emit('project-message', {
                message: aiResponse,
                sender: {
                    _id: 'ai',
                    email: 'AI'
                }
            });
            return;
        }

        socket.broadcast.to(socket.roomId).emit('project-message', data);
    });

    socket.on('event', data => { /* … */ });
    socket.on('disconnect', () => {
        console.log('user disconnected');
        socket.leave(socket.roomId);
    });

});


server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})


