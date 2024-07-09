class ApiResponse {
    constructor(
        statusCode,
        message = "Succeeded.",
        data,
    ){
        this.statusCode = statusCode,
        this.data = data,
        this.message = message,
        this.success = statusCode < 400
    }
}

export {ApiResponse}