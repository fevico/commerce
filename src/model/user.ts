import { compare, hash } from "bcrypt";
import { Document, Model, model, Schema, Types } from "mongoose";

interface UserDocument extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    role: "user" | 'admin';
    token: string;
    address: string;
    phone: string;
    favourite: Types.ObjectId[];
}

interface UserMethods {
    comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument, Model<UserDocument>, UserMethods>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    },
    token: {
        type: String
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
        unique: true
    },
    favourite: [{
        type: Schema.Types.ObjectId,
        ref: "Product"
    }],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    // Hash the password
    if (this.isModified("password")) {
        this.password = await hash(this.password, 10);
    }
    next();
});

userSchema.methods.comparePassword = async function (password) {
    const result = await compare(password, this.password);
    return result;
};

export default model<UserDocument, Model<UserDocument>>('User', userSchema);
