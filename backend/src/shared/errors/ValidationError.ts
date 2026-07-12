import { AppError } from "./AppError";

export class ValidateError extends AppError{
    constructor(message = "Validation Failed"){
        super(message , 422)
    }
}