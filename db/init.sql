--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg120+1)
-- Dumped by pg_dump version 17.2 (Debian 17.2-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: create_qr_code_result; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.create_qr_code_result AS (
	short_code text,
	qr_uid uuid
);


ALTER TYPE public.create_qr_code_result OWNER TO admin;

--
-- Name: create_new_user(); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.create_new_user() RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    ANON_ID uuid;
BEGIN
    ANON_ID := uuid_generate_v4();
    INSERT INTO temp_users (anon_id, amount_scanned) VALUES(ANON_ID, 0);

    RETURN ANON_ID;

EXCEPTION
    WHEN OTHERS THEN
        -- Log the error details
        RAISE NOTICE 'Error in create_qr_code: %', SQLERRM;
        RAISE;
end;
$$;


ALTER FUNCTION public.create_new_user() OWNER TO admin;

--
-- Name: create_new_user(uuid); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.create_new_user(qr_uid uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    ANON_ID uuid;
BEGIN
    ANON_ID := uuid_generate_v4();
    INSERT INTO temp_users (anon_id, amount_scanned) VALUES(ANON_ID, 0);

    RETURN ANON_ID;

EXCEPTION
    WHEN OTHERS THEN
        -- Log the error details
        RAISE NOTICE 'Error in create_qr_code: %', SQLERRM;
        RAISE;
end;
$$;


ALTER FUNCTION public.create_new_user(qr_uid uuid) OWNER TO admin;

--
-- Name: create_qr_code(text, text); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.create_qr_code(p_uid text, url text) RETURNS public.create_qr_code_result
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_qr_uid uuid;
    v_qr_uid_text text;
    v_filepath text;
    v_short_code text;
    v_result public.create_qr_code_result;
    v_retry_count integer := 0;
    v_max_retries constant integer := 5;
BEGIN
    -- Generate UUID for the QR code
    v_qr_uid := uuid_generate_v4();
    v_qr_uid_text := v_qr_uid::text;

    -- Generate the filepath in the format /XX/XX/UUID.png
    v_filepath := '/qrcodes/' || substring(v_qr_uid_text from 1 for 2) || '/' ||
                  substring(v_qr_uid_text from 3 for 2) || '/' || v_qr_uid_text || '.png';

    -- Loop until we get a unique short code or max retries is reached
    LOOP
        BEGIN
            v_short_code := generate_short_code();

            -- Insert the QR code details into the qr_codes table
            INSERT INTO qr_codes(qr_uid, created_by, embedded_link, short_url, filepath, short_code)
            VALUES (
                       v_qr_uid,
                       P_UID,
                       URL,
                       'http://localhost:3000/findqr/' || v_short_code,
                       v_filepath,
                       v_short_code
                   );

            -- If we get here, the insert succeeded
            EXIT;

        EXCEPTION
            WHEN unique_violation THEN
                -- Check if it was the short_code that caused the violation
                IF v_retry_count >= v_max_retries THEN
                    RAISE EXCEPTION 'Failed to generate unique short code after % attempts', v_max_retries;
                END IF;

                v_retry_count := v_retry_count + 1;
                -- Continue to next iteration of loop to try a new short code
                CONTINUE;
        END;
    END LOOP;

    -- Insert scan aggregates record
    INSERT INTO qr_scan_aggregates(qr_uid, total_scans, last_scanned_at)
    VALUES(v_qr_uid, 0, NULL);

    -- Prepare the result
    v_result.short_code := v_short_code;
    v_result.qr_uid := v_qr_uid;

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        -- Log the error details
        RAISE NOTICE 'Error in create_qr_code: %', SQLERRM;
        RAISE;
END;
$$;


ALTER FUNCTION public.create_qr_code(p_uid text, url text) OWNER TO admin;

--
-- Name: create_qr_code(text, text, text); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.create_qr_code(p_uid text, url text, route text) RETURNS public.create_qr_code_result
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_qr_uid uuid;
    v_qr_uid_text text;
    v_filepath text;
    v_short_code text;
    v_result public.create_qr_code_result;
    v_retry_count integer := 0;
    v_max_retries constant integer := 5;
BEGIN
    -- Generate UUID for the QR code
    v_qr_uid := uuid_generate_v4();
    v_qr_uid_text := v_qr_uid::text;

    -- Generate the filepath in the format /XX/XX/UUID.png
    v_filepath := '/qrcodes/' || substring(v_qr_uid_text from 1 for 2) || '/' ||
                  substring(v_qr_uid_text from 3 for 2) || '/' || v_qr_uid_text || '.png';

    -- Loop until we get a unique short code or max retries is reached
    LOOP
        BEGIN
            v_short_code := generate_short_code();

            -- Insert the QR code details into the qr_codes table
            INSERT INTO qr_codes(qr_uid, created_by, embedded_link, short_url, filepath, short_code, canview)
            VALUES (
                       v_qr_uid,
                       P_UID,
                       URL,
                       ROUTE || v_short_code,
                       v_filepath,
                       v_short_code,
                true
                   );

            -- If we get here, the insert succeeded
            EXIT;

        EXCEPTION
            WHEN unique_violation THEN
                -- Check if it was the short_code that caused the violation
                IF v_retry_count >= v_max_retries THEN
                    RAISE EXCEPTION 'Failed to generate unique short code after % attempts', v_max_retries;
                END IF;

                v_retry_count := v_retry_count + 1;
                -- Continue to next iteration of loop to try a new short code
                CONTINUE;
        END;
    END LOOP;

    -- Insert scan aggregates record
    INSERT INTO qr_scan_aggregates(qr_uid, total_scans, last_scanned_at, total_unique_scans)
    VALUES(v_qr_uid, 0, NULL, 0);

    -- Prepare the result
    v_result.short_code := v_short_code;
    v_result.qr_uid := v_qr_uid;

    RETURN v_result;

EXCEPTION
    WHEN OTHERS THEN
        -- Log the error details
        RAISE NOTICE 'Error in create_qr_code: %', SQLERRM;
        RAISE;
END;
$$;


ALTER FUNCTION public.create_qr_code(p_uid text, url text, route text) OWNER TO admin;

--
-- Name: generate_short_code(); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.generate_short_code() RETURNS text
    LANGUAGE sql
    AS $$
SELECT substring(md5(random()::text), 1, 6); -- Generates a 6-character hash
$$;


ALTER FUNCTION public.generate_short_code() OWNER TO admin;

--
-- Name: scan_qr_code(uuid, uuid, inet, text, text); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.scan_qr_code(anon_id_x uuid, qr_uid_x uuid, ip_addr_x inet, user_agent_x text, referrer_x text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    NEW_ANON_ID uuid;
    CURRENT_TIMESTAMP_X timestamp := NOW();
    IS_NEW_USER BOOLEAN := FALSE;
BEGIN
    -- Check if anon_id exists, create if not
    IF NOT EXISTS (SELECT 1 FROM temp_users WHERE anon_id = ANON_ID_X) THEN
        NEW_ANON_ID := uuid_generate_v4();
        INSERT INTO temp_users (anon_id, amount_scanned, last_scanned_at)
        VALUES (NEW_ANON_ID, 1, CURRENT_TIMESTAMP_X);
        IS_NEW_USER := TRUE;
    ELSE
        -- Also want to update the aggregate unique id
        IF NOT EXISTS(SELECT 1 FROM qr_scans WHERE anon_id = ANON_ID_X) THEN
            UPDATE qr_scan_aggregates SET total_unique_scans = qr_scan_aggregates.total_unique_scans + 1  WHERE qr_uid = QR_UID_X;
        end if;
        NEW_ANON_ID := ANON_ID_X;
        -- Update temp_users scan count & last scanned timestamp
        UPDATE temp_users
        SET amount_scanned = amount_scanned + 1,
            last_scanned_at = CURRENT_TIMESTAMP_X
        WHERE anon_id = NEW_ANON_ID;
    END IF;

    -- Insert new scan record into qr_scans
    INSERT INTO qr_scans (anon_id, qr_uid, scanned_at, ip_address, user_agent, referrer)
    VALUES (NEW_ANON_ID, QR_UID_X, CURRENT_TIMESTAMP_X, COALESCE(IP_ADDR_X, '0.0.0.0'::INET), USER_AGENT_X, REFERRER_X); -- ✅ Fix: Ensures valid IP

    -- Update qr_scan_aggregates (increment total_scans, update last_scanned_at)
    INSERT INTO qr_scan_aggregates (qr_uid, total_scans, last_scanned_at)
    VALUES (QR_UID_X, 1, CURRENT_TIMESTAMP_X)
    ON CONFLICT (qr_uid) DO UPDATE
        SET total_scans = qr_scan_aggregates.total_scans + 1,
            last_scanned_at = CURRENT_TIMESTAMP_X;

    IF IS_NEW_USER THEN
        RETURN NEW_ANON_ID::text;
    ELSE
        RETURN 'Scan recorded successfully';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        -- Log error message
        RAISE NOTICE 'Error in scan_qr_code: %', SQLERRM;
        RETURN 'Error occurred while scanning QR code';
END;
$$;


ALTER FUNCTION public.scan_qr_code(anon_id_x uuid, qr_uid_x uuid, ip_addr_x inet, user_agent_x text, referrer_x text) OWNER TO admin;

--
-- Name: scan_qr_code(uuid, uuid, inet, text, text, text, text, numeric, numeric); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.scan_qr_code(anon_id_x uuid, qr_uid_x uuid, ip_addr_x inet, user_agent_x text, referrer_x text, city_x text, state_x text, lat_x numeric, lon_x numeric) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    NEW_ANON_ID uuid;
    CURRENT_TIMESTAMP_X timestamp := NOW();
    IS_NEW_USER BOOLEAN := FALSE;
BEGIN
    -- Check if anon_id exists, create if not
    IF NOT EXISTS (SELECT 1 FROM temp_users WHERE anon_id = ANON_ID_X) THEN
        NEW_ANON_ID := uuid_generate_v4();
        INSERT INTO temp_users (anon_id, amount_scanned, last_scanned_at)
        VALUES (NEW_ANON_ID, 1, CURRENT_TIMESTAMP_X);
        IS_NEW_USER := TRUE;
    ELSE
        -- Also want to update the aggregate unique id
        IF NOT EXISTS(SELECT 1 FROM qr_scans WHERE anon_id = ANON_ID_X) THEN
            UPDATE qr_scan_aggregates SET total_unique_scans = qr_scan_aggregates.total_unique_scans + 1  WHERE qr_uid = QR_UID_X;
        end if;
        NEW_ANON_ID := ANON_ID_X;
        -- Update temp_users scan count & last scanned timestamp
        UPDATE temp_users
        SET amount_scanned = amount_scanned + 1,
            last_scanned_at = CURRENT_TIMESTAMP_X
        WHERE anon_id = NEW_ANON_ID;
    END IF;

    -- Insert new scan record into qr_scans
    INSERT INTO qr_scans (anon_id, qr_uid, scanned_at, ip_address, user_agent, referrer, city, state, lat, lon)
    VALUES (NEW_ANON_ID, QR_UID_X, CURRENT_TIMESTAMP_X, COALESCE(IP_ADDR_X, '0.0.0.0'::INET), USER_AGENT_X, REFERRER_X, CITY_X, STATE_X, LAT_X, LON_X);

    -- Update qr_scan_aggregates (increment total_scans, update last_scanned_at)
    INSERT INTO qr_scan_aggregates (qr_uid, total_scans, last_scanned_at)
    VALUES (QR_UID_X, 1, CURRENT_TIMESTAMP_X)
    ON CONFLICT (qr_uid) DO UPDATE
        SET total_scans = qr_scan_aggregates.total_scans + 1,
            last_scanned_at = CURRENT_TIMESTAMP_X;

    IF IS_NEW_USER THEN
        RETURN NEW_ANON_ID::text;
    ELSE
        RETURN 'Scan recorded successfully';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        -- Log error message
        RAISE NOTICE 'Error in scan_qr_code: %', SQLERRM;
        RETURN 'Error occurred while scanning QR code';
END;
$$;


ALTER FUNCTION public.scan_qr_code(anon_id_x uuid, qr_uid_x uuid, ip_addr_x inet, user_agent_x text, referrer_x text, city_x text, state_x text, lat_x numeric, lon_x numeric) OWNER TO admin;

--
-- Name: scan_qr_code(uuid, uuid, inet, text, text, text, text, numeric, numeric, text); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.scan_qr_code(anon_id_x uuid, qr_uid_x uuid, ip_addr_x inet, user_agent_x text, referrer_x text, city_x text, state_x text, lat_x numeric, lon_x numeric, os_x text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    NEW_ANON_ID uuid;
    CURRENT_TIMESTAMP_X timestamp := NOW();
    IS_NEW_USER BOOLEAN := FALSE;
BEGIN
    -- Check if anon_id exists, create if not
    IF NOT EXISTS (SELECT 1 FROM temp_users WHERE anon_id = ANON_ID_X) THEN
        NEW_ANON_ID := uuid_generate_v4();
        INSERT INTO temp_users (anon_id, amount_scanned, last_scanned_at)
        VALUES (NEW_ANON_ID, 1, CURRENT_TIMESTAMP_X);
        IS_NEW_USER := TRUE;
    ELSE
        -- Also want to update the aggregate unique id
        IF NOT EXISTS(SELECT 1 FROM qr_scans WHERE anon_id = ANON_ID_X) THEN
            UPDATE qr_scan_aggregates SET total_unique_scans = qr_scan_aggregates.total_unique_scans + 1  WHERE qr_uid = QR_UID_X;
        end if;
        NEW_ANON_ID := ANON_ID_X;
        -- Update temp_users scan count & last scanned timestamp
        UPDATE temp_users
        SET amount_scanned = amount_scanned + 1,
            last_scanned_at = CURRENT_TIMESTAMP_X
        WHERE anon_id = NEW_ANON_ID;
    END IF;

    -- Insert new scan record into qr_scans
    INSERT INTO qr_scans (anon_id, qr_uid, scanned_at, ip_address, user_agent, referrer, city, state, lat, lon, os)
    VALUES (NEW_ANON_ID, QR_UID_X, CURRENT_TIMESTAMP_X, COALESCE(IP_ADDR_X, '0.0.0.0'::INET), USER_AGENT_X, REFERRER_X, CITY_X, STATE_X, LAT_X, LON_X, OS_X);

    -- Update qr_scan_aggregates (increment total_scans, update last_scanned_at)
    INSERT INTO qr_scan_aggregates (qr_uid, total_scans, last_scanned_at)
    VALUES (QR_UID_X, 1, CURRENT_TIMESTAMP_X)
    ON CONFLICT (qr_uid) DO UPDATE
        SET total_scans = qr_scan_aggregates.total_scans + 1,
            last_scanned_at = CURRENT_TIMESTAMP_X;

    IF IS_NEW_USER THEN
        RETURN NEW_ANON_ID::text;
    ELSE
        RETURN 'Scan recorded successfully';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        -- Log error message
        RAISE NOTICE 'Error in scan_qr_code: %', SQLERRM;
        RETURN 'Error occurred while scanning QR code';
END;
$$;


ALTER FUNCTION public.scan_qr_code(anon_id_x uuid, qr_uid_x uuid, ip_addr_x inet, user_agent_x text, referrer_x text, city_x text, state_x text, lat_x numeric, lon_x numeric, os_x text) OWNER TO admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_info; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.admin_info (
    kudos integer
);


ALTER TABLE public.admin_info OWNER TO admin;

--
-- Name: qr_codes; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.qr_codes (
    qr_uid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    embedded_link text NOT NULL,
    short_url character varying(255) NOT NULL,
    filepath character varying(255),
    short_code text,
    canview boolean
);


ALTER TABLE public.qr_codes OWNER TO admin;

--
-- Name: qr_scan_aggregates; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.qr_scan_aggregates (
    qr_uid uuid NOT NULL,
    total_scans integer DEFAULT 0,
    last_scanned_at timestamp without time zone,
    total_unique_scans integer
);


ALTER TABLE public.qr_scan_aggregates OWNER TO admin;

--
-- Name: qr_scans; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.qr_scans (
    scan_id integer NOT NULL,
    qr_uid uuid,
    ip_address inet NOT NULL,
    user_agent text NOT NULL,
    referrer text,
    scanned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    anon_id uuid,
    city character varying(255),
    state character varying(255),
    lat numeric,
    lon numeric,
    os text
);


ALTER TABLE public.qr_scans OWNER TO admin;

--
-- Name: qr_scans_scan_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.qr_scans_scan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.qr_scans_scan_id_seq OWNER TO admin;

--
-- Name: qr_scans_scan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.qr_scans_scan_id_seq OWNED BY public.qr_scans.scan_id;


--
-- Name: temp_users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.temp_users (
    anon_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    amount_scanned integer DEFAULT 1,
    last_scanned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.temp_users OWNER TO admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    google_uid character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(255),
    username character varying(255),
    profile_picture character varying(255)
);


ALTER TABLE public.users OWNER TO admin;

--
-- Name: qr_scans scan_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.qr_scans ALTER COLUMN scan_id SET DEFAULT nextval('public.qr_scans_scan_id_seq'::regclass);


--
-- Name: qr_scans_scan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public.qr_scans_scan_id_seq', 21, true);


--
-- Name: qr_codes qr_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_pkey PRIMARY KEY (qr_uid);


--
-- Name: qr_codes qr_codes_short_code_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_short_code_key UNIQUE (short_code);


--
-- Name: qr_codes qr_codes_short_url_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_short_url_key UNIQUE (short_url);


--
-- Name: qr_scan_aggregates qr_scan_aggregates_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.qr_scan_aggregates
    ADD CONSTRAINT qr_scan_aggregates_pkey PRIMARY KEY (qr_uid);


--
-- Name: qr_scans qr_scans_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.qr_scans
    ADD CONSTRAINT qr_scans_pkey PRIMARY KEY (scan_id);


--
-- Name: temp_users temp_users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.temp_users
    ADD CONSTRAINT temp_users_pkey PRIMARY KEY (anon_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (google_uid);


--
-- Name: qr_codes qr_codes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(google_uid) ON DELETE CASCADE;


--
-- Name: qr_scan_aggregates qr_scan_aggregates_qr_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.qr_scan_aggregates
    ADD CONSTRAINT qr_scan_aggregates_qr_uid_fkey FOREIGN KEY (qr_uid) REFERENCES public.qr_codes(qr_uid) ON DELETE CASCADE;


--
-- Name: qr_scans qr_scans_qr_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.qr_scans
    ADD CONSTRAINT qr_scans_qr_uid_fkey FOREIGN KEY (qr_uid) REFERENCES public.qr_codes(qr_uid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

