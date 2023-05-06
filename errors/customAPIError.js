const createCustomError = (data, statusCode = 500) => {
    const message  = "failed";
    return {
        message,
        error : true,
        code : statusCode,
        data
    };   
};

module.exports = { createCustomError };
