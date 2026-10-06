CREATE OR REPLACE FUNCTION check_if_username_exists(req_username TEXT)
    RETURNS BOOLEAN AS $$
        DECLARE
            user_exists BOOLEAN;
        BEGIN
            SELECT EXISTS (
                SELECT 1 FROM "users" WHERE username = req_username
            ) INTO user_exists;

        RETURN user_exists;
    END; 
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_user_into_emailcodes(req_username TEXT, req_password TEXT, req_email TEXT, req_created_at BIGINT, req_code INT)
    RETURNS void AS $$
        INSERT INTO "emailcodes" (username, password, email, created_at, target_code)
        VALUES (req_username, req_password, req_email, req_created_at, req_code)
        ON CONFLICT (username) DO NOTHING;
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION is_user_email_code_right(req_username TEXT, req_code INT, req_current_time BIGINT)
    RETURNS BOOLEAN AS $$
        DECLARE
            res_username VARCHAR;
            res_password VARCHAR;
            res_email VARCHAR;
        BEGIN
            SELECT username, password, email 
            INTO res_username, res_password, res_email
            FROM "emailcodes"
            WHERE username = req_username AND target_code = req_code AND created_At - req_current_time < 60000 AND attempts > 0
            FOR UPDATE;

            UPDATE "emailcodes"
            SET "attempts" = attempts - 1
            WHERE username = req_username;

            DELETE FROM "emailcodes"
            WHERE attempts = 0;

            IF NOT FOUND THEN
                RETURN FALSE;
            END IF;

            INSERT INTO "users" (username, password, email)
            VALUES (res_username, res_password, res_email)
            ON CONFLICT (username) DO NOTHING;

            IF NOT FOUND THEN
                RETURN FALSE;
            END IF;

            DELETE FROM "emailcodes"
            WHERE username = req_username AND target_code = req_code;

            RETURN TRUE;
        END;
$$ LANGUAGE plpgsql;