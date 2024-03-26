import { compare, hash } from "bcrypt";
import { Model, model, ObjectId, Schema } from "mongoose";

interface UserDocument{
    _id: ObjectId;
    name: String;
    email: string;
    password: string;
    role: "user" | 'admin';
    token : string;
    address: string;
    phone: string;
    favourite: ObjectId[];
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
        required: true,
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        default: 'user'
    },
    token:{
        type: String
    },
    address:{
        type: String,
    },
    phone: {
        type: String
    },
    favourite: [{
        type: Schema.Types.ObjectId,
        ref: "Product"
    }]
    
}, {timestamps: true});

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

  export default model('User', userSchema) as Model<UserDocument, {}, UserMethods>;
