import { createLogger, transports, format } from "winston";
import { padRight } from "./util/padString";

const printf = (info: any) =>
  ` [${info.label}][${info.timestamp}] ${padRight(
    info[Symbol.for("level")],
    6
  )}: ${info.message}`;

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
        format.printf(printf)
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
        format.printf(printf)
      ),
    }),
  ],
});
