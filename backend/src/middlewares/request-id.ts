import { randomUUID } from "crypto";

import { Request , Response , NextFunction } from "express";

export const requestId = (req : Request , res : Response , next : NextFunction) =>{
    const id = randomUUID();

    req.headers['x-request-id'] = id;
    res.setHeader('x-request-id' , id);

    next()
}

