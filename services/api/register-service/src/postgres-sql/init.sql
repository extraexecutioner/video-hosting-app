CREATE OR REPLACE FUNCTION init_users_database()
    RETURNS void AS $$
        BEGIN
            CREATE TABLE IF NOT EXISTS "users" (
                "username" VARCHAR(12) NOT NULL,
                "password" VARCHAR(255) NOT NULL,
                "email" VARCHAR(255) NOT NULL,

                CONSTRAINT "users_username_unique" UNIQUE ("username"),
                CONSTRAINT "users_username_min_length" CHECK (length("username") >= 6),
                CONSTRAINT "email_ends_with" CHECK ("email" LIKE '%@gmail.com')
            );
    END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION init_emailcodes_database()
    RETURNS void AS $$
        BEGIN
            CREATE TABLE IF NOT EXISTS "emailcodes" (
                "username" VARCHAR(12) NOT NULL,
                "email" VARCHAR(255) NOT NULL,
                "password" VARCHAR(255) NOT NULL,
                "target_code" INT NOT NULL,
                "attempts" INT DEFAULT(3) NOT NULL,
                "created_at" BIGINT,

                CONSTRAINT "emailcodes_username_unique" UNIQUE ("username"),
                CONSTRAINT "emailcodes_username_min_length" CHECK (length("username") >= 6),
                CONSTRAINT "emailcodes_email_ends_with" CHECK ("email" LIKE '%@gmail.com')
            );
    END;
$$ LANGUAGE plpgsql;