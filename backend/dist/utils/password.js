"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 10;
async function hashPassword(plain) {
    const salt = await bcryptjs_1.default.genSalt(SALT_ROUNDS);
    return bcryptjs_1.default.hash(plain, salt);
}
async function comparePassword(plain, hash) {
    return bcryptjs_1.default.compare(plain, hash);
}
