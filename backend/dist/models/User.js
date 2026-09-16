"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserRole = void 0;
const mongoose_1 = require("mongoose");
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "CUSTOMER";
    UserRole["TAILOR"] = "TAILOR";
    UserRole["DELIVERY_AGENT"] = "DELIVERY_AGENT";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: Object.values(UserRole),
        default: UserRole.CUSTOMER,
    },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    emailVerificationToken: { type: String },
    lastLoginAt: { type: Date },
}, { timestamps: true });
exports.User = (0, mongoose_1.model)('User', UserSchema);
