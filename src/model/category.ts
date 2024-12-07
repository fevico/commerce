import { Model, model, ObjectId, Schema } from "mongoose";

interface Categories {
    _id: ObjectId;
    name: string;
    image: string;
}

const categorySchema = new Schema<Categories>({
    name:{
        type: String,
        required: true
    },
    image:{
        type: String,
        required: true
    },
}, {timestamps: true});

export default model("Category", categorySchema) as Model<Categories>;