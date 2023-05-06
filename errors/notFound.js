const  { createCustomError } =  require("./customAPIError");

const notFound = (req, res, next) => {
    const notFoundError = createCustomError(`Cannot find ${req.originalUrl} at this server`, 404);
    return res.status(notFoundError.code).json(notFoundError)
};

module.exports = notFound;
