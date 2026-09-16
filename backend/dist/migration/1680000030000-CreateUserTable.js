"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserTable1680000030000 = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("../models/User");
class CreateUserTable1680000030000 {
    async up(queryRunner) {
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'user',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    generationStrategy: 'uuid',
                    default: 'uuid_generate_v4()',
                },
                { name: 'name', type: 'varchar', length: '255', isNullable: false },
                { name: 'email', type: 'varchar', length: '255', isUnique: true, isNullable: false },
                { name: 'phone', type: 'varchar', length: '255', isUnique: true, isNullable: true },
                { name: 'passwordHash', type: 'varchar', length: '255', isNullable: false },
                { name: 'role', type: 'enum', enum: Object.values(User_1.UserRole), isNullable: false },
                { name: 'isEmailVerified', type: 'boolean', default: false },
                { name: 'isPhoneVerified', type: 'boolean', default: false },
                { name: 'isActive', type: 'boolean', default: true },
                { name: 'lastLoginAt', type: 'timestamp', isNullable: true },
                { name: 'emailVerificationToken', type: 'varchar', length: '255', isNullable: true },
                { name: 'createdAt', type: 'timestamp', default: 'now()' },
                { name: 'updatedAt', type: 'timestamp', default: 'now()' },
            ],
        }), true);
    }
    async down(queryRunner) {
        await queryRunner.dropTable('user');
    }
}
exports.CreateUserTable1680000030000 = CreateUserTable1680000030000;
