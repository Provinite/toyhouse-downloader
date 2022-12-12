"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
exports.logger = (0, winston_1.createLogger)({
    level: "debug",
    transports: [
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize({
                all: true,
            }), winston_1.format.label({
                label: "ThD",
            }), winston_1.format.timestamp({
                format: "HH:mm:ss",
            }), winston_1.format.printf((info) => ` [${info.label}][${info.timestamp}] ${space(info[Symbol.for("level")], 6)}: ${info.message}`)),
        }),
        new winston_1.transports.File({
            filename: "output.log",
            format: winston_1.format.combine(winston_1.format.label({
                label: "ThD",
            }), winston_1.format.timestamp({
                format: "HH:mm:ss",
            }), winston_1.format.printf((info) => ` [${info.label}][${info.timestamp}] ${space(info[Symbol.for("level")], 6)}: ${info.message}`)),
        }),
    ],
});
function space(str, len) {
    return `${str}${" ".repeat(Math.max(0, len - str.length))}`;
}
