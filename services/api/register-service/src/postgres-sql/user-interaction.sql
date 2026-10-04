
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

CREATE OR REPLACE FUNCTION insert_user_into_emailcodes(req_username TEXT, req_email TEXT, req_code INT)
    RETURNS BOOLEAN AS $$
        BEGIN
            INSERT INTO "emailcodes" (username, email, targetCode)
            VALUES (req_username, req_email, req_code);
            
            RETURN TRUE;
        EXCEPTION
            WHEN unique_violation THEN
                RETURN FALSE;

            WHEN check_violation THEN
                RETURN FALSE;

            WHEN string_data_right_truncation THEN
                RETURN FALSE;

    END; 
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_user_into_users(req_username TEXT, req_password TEXT, req_email TEXT)
    RETURNS BOOLEAN AS $$
        BEGIN
            INSERT INTO "users" (username, password, email, attempts)
            VALUES (req_username, req_password, req_email, 3);
            
            RETURN TRUE;
        EXCEPTION
            WHEN unique_violation THEN
                RETURN FALSE;

            WHEN check_violation THEN
                RETURN FALSE;

            WHEN string_data_right_truncation THEN
                RETURN FALSE;

    END; 
$$ LANGUAGE plpgsql;