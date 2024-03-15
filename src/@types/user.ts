import { Request } from "express";

declare global{
    namespace Express {
        interface Request{
            user:{
                id: any,
                name: string,
                email: string,
                role: string,
            };
            token: string;
        }
    }
}