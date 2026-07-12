import { AppError } from "./AppError";

export class BadRequestError extends AppError {
    constructor(message = "BadRequest"){
        super(message , 400)
    }
}