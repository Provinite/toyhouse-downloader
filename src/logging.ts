import { createLogger, transports, format } from "winston";
export const logger = createLogger({
  level: "debug",
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({
          all: true,
        }),
        format.label({
          label: "ThD",
        }),
        format.timestamp({
          format: "HH:mm:ss",
        }),
        format.printf(
          (info: any) =>
            ` [${info.label}][${info.timestamp}] ${space(
              info[Symbol.for("level")],
              6
            )}: ${info.message}`
        )
      ),
    }),
    new transports.File({
      filename: "output.log",
      format: format.combine(
        format.label({
          label: "ThD",
        }),
        format.timestamp({
          format: "HH:mm:ss",
        }),
        format.printf(
          (info: any) =>
            ` [${info.label}][${info.timestamp}] ${space(
              info[Symbol.for("level")],
              6
            )}: ${info.message}`
        )
      ),
    }),
  ],
});

function space(str: string, len: number) {
  return `${str}${" ".repeat(Math.max(0, len - str.length))}`;
}
