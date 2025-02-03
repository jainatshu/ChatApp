import mongoose from "mongoose";

async function connect(){
    await mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
}
export default connect;  //export the function to use it in other files