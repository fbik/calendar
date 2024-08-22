CREATE TABLE IF NOT EXISTS holiday (
    day INTEGER,
    month INTEGER,
    year INTEGER,
    PRIMARY KEY (day, month, year)
);

CREATE TABLE IF NOT EXISTS working_weekend (
    day INTEGER,
    month INTEGER,
    year INTEGER,
    PRIMARY KEY (day, month, year)
);

CREATE TABLE IF NOT EXISTS working_hours (
    month INTEGER,
    year INTEGER,
    hours INTEGER,
    PRIMARY KEY (month, year)
);