import * as yup from 'yup';
import { isValidObjectId } from 'mongoose';

export const productValidation = yup.object().shape({
    name: yup.string().required("Product name is required"),
    price:yup.number().required("Product price is required"),
    description:yup.string().required("Product description is required"),
    categoryId:yup.string().required("Product category is required"),
    image: yup.string(),
    quantity: yup.number(),
})

export const categoryValidation = yup.object().shape({
    name: yup.string().required("Category name is required"),
    image: yup.string().required("Category image is required")
})

export const userValidation = yup.object().shape({
    name: yup.string().required("User name is required"),
    email:yup.string().required("User email is required"),
    password:yup.string().required("User password is required").min(6, "password must be at least 6 characters long")
})

export const TokenAndIDValidation = yup.object().shape({
    token: yup.string().trim().required("Invalid token!"),
    userId: yup.string().transform(function(value){
        if(this.isType(value) && isValidObjectId(value)){
            return value
        }else{
            return "" 
        }
    }).required("Invalid userId!")
})

export const UpdatePasswordSchema = yup.object().shape({
    token: yup.string().trim().required("Invalid token!"),
    userId: yup.string().transform(function(value){
        if(this.isType(value) && isValidObjectId(value)){
            return value
        }else{
            return ""
        }
    }).required("Invalid userId!"),
    password: yup.string().trim().required("Password is missing").min(6, "Password is too short!")
})

export const SignInValidationSchema = yup.object().shape({
    email: yup.string().required("Email is missing!").email("Invalid email id!"),
    password: yup.string().trim().required("Password is missing!")
});

