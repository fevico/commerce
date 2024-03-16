// @ts-nocheck
import { Model, ObjectId, Schema, model } from "mongoose";
import { hash, compare } from "bcrypt";

// Define interface for the document
interface PasswordResetTokenDocument {
    _id: ObjectId;
    user: ObjectId;
    token: string;
    createdAt: Date;
}

// Define additional methods
interface PasswordResetTokenMethods {
    compareToken(token: string): Promise<boolean>;
}

// Define schema
const passwordResetTokenSchema = new Schema<PasswordResetTokenDocument, Model<PasswordResetTokenDocument>, PasswordResetTokenMethods>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: 3600, // Expire token after 1 hour
        default: Date.now
    }
});

// Hash the token before saving
passwordResetTokenSchema.pre<PasswordResetTokenDocument>('save', async function (next) {
    if (this.isModified("token")) {
        this.token = await hash(this.token, 10);
    }
    next();
});

// Define method to compare token
passwordResetTokenSchema.methods.compareToken = async function (token) {
    const result = await compare(token, this.token);
    return result;
};

// Create and export model
export default model("passwordRestToken", passwordResetTokenSchema) as Model<PasswordResetTokenDocument>;
