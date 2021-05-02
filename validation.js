const Joi = require('@hapi/joi');

const validateRegistration = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().min(2).required(),
        lastName: Joi.string().min(2).required(),
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(8).required(),
        birthday: Joi.string().required().isoDate()
    });
    return schema.validate(data);
};

const validateAuthentication = (data) => {
    const schema = Joi.object({
        email: Joi.string().min(6).required().email(),
        password: Joi.string().min(8).required()
    });
    return schema.validate(data);
};

const validateResetPassword = (data) => {
    const schema = Joi.object({
        resetPasswordLink: Joi.string().min(10).required(),
        password: Joi.string().min(8).required()
    });
    return schema.validate(data);
}

module.exports.validateRegistration = validateRegistration;
module.exports.validateAuthentication = validateAuthentication;
module.exports.validateResetPassword = validateResetPassword;