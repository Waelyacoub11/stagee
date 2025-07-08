--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.2

-- Started on 2025-05-21 15:57:11

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
-- TOC entry 25 (class 2615 OID 16766)
-- Name: airbyte_internal; Type: SCHEMA; Schema: -; Owner: replica_user
--

CREATE SCHEMA airbyte_internal;


ALTER SCHEMA airbyte_internal OWNER TO replica_user;

--
-- TOC entry 522 (class 1255 OID 16726)
-- Name: insert_into_information(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_into_information() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    statut_result TEXT;
BEGIN
    IF NEW.printer_status = 'Ready' THEN
        statut_result := 'actif';
    ELSIF NEW.printer_status = 'Paused' AND NEW.status_message LIKE 'Error%' THEN
        statut_result := 'erreur';
    ELSE
        statut_result := 'avertissement';
    END IF;

    INSERT INTO information (statut, description)
    VALUES (statut_result, NEW.status_message);

    RETURN NEW;
END;
$$;


ALTER FUNCTION public.insert_into_information() OWNER TO postgres;

--
-- TOC entry 521 (class 1255 OID 16456)
-- Name: limit_notifications(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.limit_notifications() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Delete old notifications if we have more than 100 for a specific user
  -- Keep the most recent 100
  DELETE FROM notifications 
  WHERE id IN (
    SELECT id FROM notifications 
    WHERE recipient_id = NEW.recipient_id OR (NEW.recipient_id IS NULL AND recipient_id IS NULL)
    ORDER BY created_at DESC 
    OFFSET 100
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.limit_notifications() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 506 (class 1259 OID 16781)
-- Name: _airbyte_destination_state; Type: TABLE; Schema: airbyte_internal; Owner: replica_user
--

CREATE TABLE airbyte_internal._airbyte_destination_state (
    name character varying,
    namespace character varying,
    destination_state character varying,
    updated_at timestamp with time zone
);


ALTER TABLE airbyte_internal._airbyte_destination_state OWNER TO replica_user;

--
-- TOC entry 509 (class 1259 OID 18569)
-- Name: public_raw__stream_action; Type: TABLE; Schema: airbyte_internal; Owner: replica_user
--

CREATE TABLE airbyte_internal.public_raw__stream_action (
    _airbyte_raw_id character varying NOT NULL,
    _airbyte_data jsonb,
    _airbyte_extracted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    _airbyte_loaded_at timestamp with time zone,
    _airbyte_meta jsonb,
    _airbyte_generation_id bigint
);


ALTER TABLE airbyte_internal.public_raw__stream_action OWNER TO replica_user;

--
-- TOC entry 511 (class 1259 OID 18612)
-- Name: public_raw__stream_equipement; Type: TABLE; Schema: airbyte_internal; Owner: replica_user
--

CREATE TABLE airbyte_internal.public_raw__stream_equipement (
    _airbyte_raw_id character varying NOT NULL,
    _airbyte_data jsonb,
    _airbyte_extracted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    _airbyte_loaded_at timestamp with time zone,
    _airbyte_meta jsonb,
    _airbyte_generation_id bigint
);


ALTER TABLE airbyte_internal.public_raw__stream_equipement OWNER TO replica_user;

--
-- TOC entry 510 (class 1259 OID 18598)
-- Name: public_raw__stream_imprimante; Type: TABLE; Schema: airbyte_internal; Owner: replica_user
--

CREATE TABLE airbyte_internal.public_raw__stream_imprimante (
    _airbyte_raw_id character varying NOT NULL,
    _airbyte_data jsonb,
    _airbyte_extracted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    _airbyte_loaded_at timestamp with time zone,
    _airbyte_meta jsonb,
    _airbyte_generation_id bigint
);


ALTER TABLE airbyte_internal.public_raw__stream_imprimante OWNER TO replica_user;

--
-- TOC entry 512 (class 1259 OID 18626)
-- Name: public_raw__stream_pda; Type: TABLE; Schema: airbyte_internal; Owner: replica_user
--

CREATE TABLE airbyte_internal.public_raw__stream_pda (
    _airbyte_raw_id character varying NOT NULL,
    _airbyte_data jsonb,
    _airbyte_extracted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    _airbyte_loaded_at timestamp with time zone,
    _airbyte_meta jsonb,
    _airbyte_generation_id bigint
);


ALTER TABLE airbyte_internal.public_raw__stream_pda OWNER TO replica_user;

--
-- TOC entry 517 (class 1259 OID 19318)
-- Name: public_raw__stream_ticket; Type: TABLE; Schema: airbyte_internal; Owner: replica_user
--

CREATE TABLE airbyte_internal.public_raw__stream_ticket (
    _airbyte_raw_id character varying NOT NULL,
    _airbyte_data jsonb,
    _airbyte_extracted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    _airbyte_loaded_at timestamp with time zone,
    _airbyte_meta jsonb,
    _airbyte_generation_id bigint
);


ALTER TABLE airbyte_internal.public_raw__stream_ticket OWNER TO replica_user;

--
-- TOC entry 519 (class 1259 OID 19343)
-- Name: public_raw__stream_users; Type: TABLE; Schema: airbyte_internal; Owner: replica_user
--

CREATE TABLE airbyte_internal.public_raw__stream_users (
    _airbyte_raw_id character varying NOT NULL,
    _airbyte_data jsonb,
    _airbyte_extracted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    _airbyte_loaded_at timestamp with time zone,
    _airbyte_meta jsonb,
    _airbyte_generation_id bigint
);


ALTER TABLE airbyte_internal.public_raw__stream_users OWNER TO replica_user;

--
-- TOC entry 513 (class 1259 OID 18672)
-- Name: action; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.action (
    idaction bigint,
    new_value character varying,
    old_value character varying,
    _ab_cdc_lsn numeric(38,9),
    executed_at timestamp with time zone,
    executed_by character varying,
    command_type character varying,
    idequipement bigint,
    command_details character varying,
    _ab_cdc_deleted_at character varying,
    _ab_cdc_updated_at character varying,
    _airbyte_raw_id character varying(36) NOT NULL,
    _airbyte_extracted_at timestamp with time zone NOT NULL,
    _airbyte_generation_id bigint,
    _airbyte_meta jsonb NOT NULL
);


ALTER TABLE public.action OWNER TO replica_user;

--
-- TOC entry 482 (class 1259 OID 16464)
-- Name: application; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.application (
    idapp integer NOT NULL,
    nomapp character varying(100),
    versionapp character varying(50),
    packagename character varying(150)
);


ALTER TABLE public.application OWNER TO replica_user;

--
-- TOC entry 483 (class 1259 OID 16467)
-- Name: application_idapp_seq; Type: SEQUENCE; Schema: public; Owner: replica_user
--

CREATE SEQUENCE public.application_idapp_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_idapp_seq OWNER TO replica_user;

--
-- TOC entry 4826 (class 0 OID 0)
-- Dependencies: 483
-- Name: application_idapp_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: replica_user
--

ALTER SEQUENCE public.application_idapp_seq OWNED BY public.application.idapp;


--
-- TOC entry 484 (class 1259 OID 16468)
-- Name: commande; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.commande (
    idcommande integer NOT NULL,
    nomcommande text NOT NULL,
    commande text NOT NULL,
    idmarque integer NOT NULL
);


ALTER TABLE public.commande OWNER TO replica_user;

--
-- TOC entry 485 (class 1259 OID 16473)
-- Name: commande_idcommande_seq; Type: SEQUENCE; Schema: public; Owner: replica_user
--

CREATE SEQUENCE public.commande_idcommande_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.commande_idcommande_seq OWNER TO replica_user;

--
-- TOC entry 4827 (class 0 OID 0)
-- Dependencies: 485
-- Name: commande_idcommande_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: replica_user
--

ALTER SEQUENCE public.commande_idcommande_seq OWNED BY public.commande.idcommande;


--
-- TOC entry 486 (class 1259 OID 16474)
-- Name: departement; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.departement (
    iddep integer NOT NULL,
    nomdep text NOT NULL,
    nbrparc integer DEFAULT 0,
    nbrutilisateur integer DEFAULT 0
);


ALTER TABLE public.departement OWNER TO replica_user;

--
-- TOC entry 487 (class 1259 OID 16481)
-- Name: departement_iddep_seq; Type: SEQUENCE; Schema: public; Owner: replica_user
--

CREATE SEQUENCE public.departement_iddep_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departement_iddep_seq OWNER TO replica_user;

--
-- TOC entry 4828 (class 0 OID 0)
-- Dependencies: 487
-- Name: departement_iddep_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: replica_user
--

ALTER SEQUENCE public.departement_iddep_seq OWNED BY public.departement.iddep;


--
-- TOC entry 514 (class 1259 OID 18677)
-- Name: equipement; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.equipement (
    idparc bigint,
    modele character varying,
    ipadresse character varying,
    _ab_cdc_lsn numeric(38,9),
    idequipement bigint,
    disponibilite boolean,
    _ab_cdc_deleted_at character varying,
    _ab_cdc_updated_at character varying,
    _airbyte_raw_id character varying(36) NOT NULL,
    _airbyte_extracted_at timestamp with time zone NOT NULL,
    _airbyte_generation_id bigint,
    _airbyte_meta jsonb NOT NULL
);


ALTER TABLE public.equipement OWNER TO replica_user;

--
-- TOC entry 508 (class 1259 OID 17018)
-- Name: equipement_ab_soft_reset; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.equipement_ab_soft_reset (
    idparc bigint,
    modele character varying,
    ipadresse character varying,
    _ab_cdc_lsn numeric(38,9),
    idequipement bigint,
    disponibilite boolean,
    _ab_cdc_deleted_at character varying,
    _ab_cdc_updated_at character varying,
    _airbyte_raw_id character varying(36) NOT NULL,
    _airbyte_extracted_at timestamp with time zone NOT NULL,
    _airbyte_generation_id bigint,
    _airbyte_meta jsonb NOT NULL
);


ALTER TABLE public.equipement_ab_soft_reset OWNER TO replica_user;

--
-- TOC entry 488 (class 1259 OID 16489)
-- Name: etat_batterie; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.etat_batterie (
    idbatterie integer NOT NULL,
    typecharge character varying,
    niveaucharge integer
);


ALTER TABLE public.etat_batterie OWNER TO replica_user;

--
-- TOC entry 489 (class 1259 OID 16494)
-- Name: etat_batterie_idbatterie_seq; Type: SEQUENCE; Schema: public; Owner: replica_user
--

CREATE SEQUENCE public.etat_batterie_idbatterie_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.etat_batterie_idbatterie_seq OWNER TO replica_user;

--
-- TOC entry 4829 (class 0 OID 0)
-- Dependencies: 489
-- Name: etat_batterie_idbatterie_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: replica_user
--

ALTER SEQUENCE public.etat_batterie_idbatterie_seq OWNED BY public.etat_batterie.idbatterie;


--
-- TOC entry 490 (class 1259 OID 16495)
-- Name: etat_stockage; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.etat_stockage (
    idstockage integer NOT NULL,
    stockagetotale text,
    stockagelibre text
);


ALTER TABLE public.etat_stockage OWNER TO replica_user;

--
-- TOC entry 491 (class 1259 OID 16500)
-- Name: etat_stockage_idstockage_seq; Type: SEQUENCE; Schema: public; Owner: replica_user
--

CREATE SEQUENCE public.etat_stockage_idstockage_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.etat_stockage_idstockage_seq OWNER TO replica_user;

--
-- TOC entry 4830 (class 0 OID 0)
-- Dependencies: 491
-- Name: etat_stockage_idstockage_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: replica_user
--

ALTER SEQUENCE public.etat_stockage_idstockage_seq OWNED BY public.etat_stockage.idstockage;


--
-- TOC entry 516 (class 1259 OID 18700)
-- Name: imprimante; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.imprimante (
    latch character varying,
    vitesse numeric(38,9),
    contrast character varying,
    idmarque bigint,
    coveropen boolean,
    resolution character varying,
    _ab_cdc_lsn numeric(38,9),
    idequipement bigint,
    idimprimante bigint,
    nbretiquette bigint,
    serialnumber character varying,
    printer_status character varying,
    status_message character varying,
    typeimpression character varying,
    softwareversion character varying,
    _ab_cdc_deleted_at character varying,
    _ab_cdc_updated_at character varying,
    _airbyte_raw_id character varying(36) NOT NULL,
    _airbyte_extracted_at timestamp with time zone NOT NULL,
    _airbyte_generation_id bigint,
    _airbyte_meta jsonb NOT NULL
);


ALTER TABLE public.imprimante OWNER TO replica_user;

--
-- TOC entry 504 (class 1259 OID 16712)
-- Name: information_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.information_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.information_id_seq OWNER TO postgres;

--
-- TOC entry 505 (class 1259 OID 16713)
-- Name: information; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.information (
    id integer DEFAULT nextval('public.information_id_seq'::regclass) NOT NULL,
    idequipement integer NOT NULL,
    date timestamp without time zone NOT NULL,
    statut character varying(255),
    description text
);


ALTER TABLE public.information OWNER TO replica_user;

--
-- TOC entry 492 (class 1259 OID 16509)
-- Name: marque; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.marque (
    idmarque integer NOT NULL,
    nommarque text NOT NULL
);


ALTER TABLE public.marque OWNER TO replica_user;

--
-- TOC entry 493 (class 1259 OID 16514)
-- Name: marque_idmarque_seq; Type: SEQUENCE; Schema: public; Owner: replica_user
--

CREATE SEQUENCE public.marque_idmarque_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marque_idmarque_seq OWNER TO replica_user;

--
-- TOC entry 4832 (class 0 OID 0)
-- Dependencies: 493
-- Name: marque_idmarque_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: replica_user
--

ALTER SEQUENCE public.marque_idmarque_seq OWNED BY public.marque.idmarque;


--
-- TOC entry 494 (class 1259 OID 16515)
-- Name: notifications; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    type character varying(50) NOT NULL,
    category character varying(50) NOT NULL,
    message text NOT NULL,
    related_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false,
    recipient_id integer
);


ALTER TABLE public.notifications OWNER TO replica_user;

--
-- TOC entry 495 (class 1259 OID 16522)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: replica_user
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO replica_user;

--
-- TOC entry 4833 (class 0 OID 0)
-- Dependencies: 495
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: replica_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 496 (class 1259 OID 16523)
-- Name: parc; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.parc (
    idparc integer NOT NULL,
    nomparc text NOT NULL,
    nbrchaines integer DEFAULT 0,
    iddep integer NOT NULL
);


ALTER TABLE public.parc OWNER TO replica_user;

--
-- TOC entry 497 (class 1259 OID 16530)
-- Name: parc_idparc_seq; Type: SEQUENCE; Schema: public; Owner: replica_user
--

CREATE SEQUENCE public.parc_idparc_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.parc_idparc_seq OWNER TO replica_user;

--
-- TOC entry 4834 (class 0 OID 0)
-- Dependencies: 497
-- Name: parc_idparc_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: replica_user
--

ALTER SEQUENCE public.parc_idparc_seq OWNED BY public.parc.idparc;


--
-- TOC entry 515 (class 1259 OID 18687)
-- Name: pda; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.pda (
    id bigint,
    modele character varying,
    idbatterie bigint,
    idstockage bigint,
    _ab_cdc_lsn numeric(38,9),
    serialnumber character varying,
    versionandroid character varying,
    _ab_cdc_deleted_at character varying,
    _ab_cdc_updated_at character varying,
    _airbyte_raw_id character varying(36) NOT NULL,
    _airbyte_extracted_at timestamp with time zone NOT NULL,
    _airbyte_generation_id bigint,
    _airbyte_meta jsonb NOT NULL
);


ALTER TABLE public.pda OWNER TO replica_user;

--
-- TOC entry 507 (class 1259 OID 17008)
-- Name: pda_ab_soft_reset; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.pda_ab_soft_reset (
    id bigint,
    modele character varying,
    idbatterie bigint,
    idstockage bigint,
    _ab_cdc_lsn numeric(38,9),
    serialnumber character varying,
    versionandroid character varying,
    _ab_cdc_deleted_at character varying,
    _ab_cdc_updated_at character varying,
    _airbyte_raw_id character varying(36) NOT NULL,
    _airbyte_extracted_at timestamp with time zone NOT NULL,
    _airbyte_generation_id bigint,
    _airbyte_meta jsonb NOT NULL
);


ALTER TABLE public.pda_ab_soft_reset OWNER TO replica_user;

--
-- TOC entry 498 (class 1259 OID 16536)
-- Name: pda_application; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.pda_application (
    id integer NOT NULL,
    idpda integer,
    idapp integer,
    installdate timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pda_application OWNER TO replica_user;

--
-- TOC entry 499 (class 1259 OID 16540)
-- Name: pda_application_id_seq; Type: SEQUENCE; Schema: public; Owner: replica_user
--

CREATE SEQUENCE public.pda_application_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pda_application_id_seq OWNER TO replica_user;

--
-- TOC entry 4835 (class 0 OID 0)
-- Dependencies: 499
-- Name: pda_application_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: replica_user
--

ALTER SEQUENCE public.pda_application_id_seq OWNED BY public.pda_application.id;


--
-- TOC entry 500 (class 1259 OID 16541)
-- Name: pda_location; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.pda_location (
    id integer NOT NULL,
    pda_id integer,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pda_location OWNER TO replica_user;

--
-- TOC entry 501 (class 1259 OID 16545)
-- Name: pda_location_id_seq; Type: SEQUENCE; Schema: public; Owner: replica_user
--

CREATE SEQUENCE public.pda_location_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pda_location_id_seq OWNER TO replica_user;

--
-- TOC entry 4836 (class 0 OID 0)
-- Dependencies: 501
-- Name: pda_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: replica_user
--

ALTER SEQUENCE public.pda_location_id_seq OWNED BY public.pda_location.id;


--
-- TOC entry 502 (class 1259 OID 16546)
-- Name: sync_queue; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.sync_queue (
    id integer NOT NULL,
    operation_type character varying(50) NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_id integer,
    data jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    retries integer DEFAULT 0,
    last_retry timestamp without time zone,
    status character varying(20) DEFAULT 'pending'::character varying,
    error_message text
);


ALTER TABLE public.sync_queue OWNER TO replica_user;

--
-- TOC entry 503 (class 1259 OID 16554)
-- Name: sync_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: replica_user
--

CREATE SEQUENCE public.sync_queue_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sync_queue_id_seq OWNER TO replica_user;

--
-- TOC entry 4837 (class 0 OID 0)
-- Dependencies: 503
-- Name: sync_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: replica_user
--

ALTER SEQUENCE public.sync_queue_id_seq OWNED BY public.sync_queue.id;


--
-- TOC entry 518 (class 1259 OID 19330)
-- Name: ticket; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.ticket (
    agent bigint,
    notes character varying,
    sujet character varying,
    statut character varying,
    idticket bigint,
    priority character varying,
    requester bigint,
    created_at timestamp without time zone,
    _ab_cdc_lsn numeric(38,9),
    description character varying,
    serialnumber character varying,
    piecesaremplacer character varying,
    _ab_cdc_deleted_at character varying,
    _ab_cdc_updated_at character varying,
    _airbyte_raw_id character varying(36) NOT NULL,
    _airbyte_extracted_at timestamp with time zone NOT NULL,
    _airbyte_generation_id bigint,
    _airbyte_meta jsonb NOT NULL
);


ALTER TABLE public.ticket OWNER TO replica_user;

--
-- TOC entry 520 (class 1259 OID 19355)
-- Name: users; Type: TABLE; Schema: public; Owner: replica_user
--

CREATE TABLE public.users (
    id bigint,
    nom character varying,
    email character varying,
    prenom character varying,
    statut character varying,
    roleuser character varying,
    created_at timestamp with time zone,
    last_login timestamp with time zone,
    motdepasse character varying,
    _ab_cdc_lsn numeric(38,9),
    departement character varying,
    _ab_cdc_deleted_at character varying,
    _ab_cdc_updated_at character varying,
    _airbyte_raw_id character varying(36) NOT NULL,
    _airbyte_extracted_at timestamp with time zone NOT NULL,
    _airbyte_generation_id bigint,
    _airbyte_meta jsonb NOT NULL
);


ALTER TABLE public.users OWNER TO replica_user;

--
-- TOC entry 4531 (class 2604 OID 16573)
-- Name: application idapp; Type: DEFAULT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.application ALTER COLUMN idapp SET DEFAULT nextval('public.application_idapp_seq'::regclass);


--
-- TOC entry 4532 (class 2604 OID 16574)
-- Name: commande idcommande; Type: DEFAULT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.commande ALTER COLUMN idcommande SET DEFAULT nextval('public.commande_idcommande_seq'::regclass);


--
-- TOC entry 4533 (class 2604 OID 16575)
-- Name: departement iddep; Type: DEFAULT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.departement ALTER COLUMN iddep SET DEFAULT nextval('public.departement_iddep_seq'::regclass);


--
-- TOC entry 4536 (class 2604 OID 16577)
-- Name: etat_batterie idbatterie; Type: DEFAULT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.etat_batterie ALTER COLUMN idbatterie SET DEFAULT nextval('public.etat_batterie_idbatterie_seq'::regclass);


--
-- TOC entry 4537 (class 2604 OID 16578)
-- Name: etat_stockage idstockage; Type: DEFAULT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.etat_stockage ALTER COLUMN idstockage SET DEFAULT nextval('public.etat_stockage_idstockage_seq'::regclass);


--
-- TOC entry 4538 (class 2604 OID 16580)
-- Name: marque idmarque; Type: DEFAULT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.marque ALTER COLUMN idmarque SET DEFAULT nextval('public.marque_idmarque_seq'::regclass);


--
-- TOC entry 4539 (class 2604 OID 16581)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4542 (class 2604 OID 16582)
-- Name: parc idparc; Type: DEFAULT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.parc ALTER COLUMN idparc SET DEFAULT nextval('public.parc_idparc_seq'::regclass);


--
-- TOC entry 4544 (class 2604 OID 16583)
-- Name: pda_application id; Type: DEFAULT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.pda_application ALTER COLUMN id SET DEFAULT nextval('public.pda_application_id_seq'::regclass);


--
-- TOC entry 4546 (class 2604 OID 16584)
-- Name: pda_location id; Type: DEFAULT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.pda_location ALTER COLUMN id SET DEFAULT nextval('public.pda_location_id_seq'::regclass);


--
-- TOC entry 4548 (class 2604 OID 16585)
-- Name: sync_queue id; Type: DEFAULT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.sync_queue ALTER COLUMN id SET DEFAULT nextval('public.sync_queue_id_seq'::regclass);


--
-- TOC entry 4805 (class 0 OID 16781)
-- Dependencies: 506
-- Data for Name: _airbyte_destination_state; Type: TABLE DATA; Schema: airbyte_internal; Owner: replica_user
--

COPY airbyte_internal._airbyte_destination_state (name, namespace, destination_state, updated_at) FROM stdin;
ticket	public	{"needsSoftReset":false,"airbyteMetaPresentInRaw":true,"airbyteGenerationIdPresent":true}	2025-05-21 14:47:48.928925+00
users	public	{"needsSoftReset":false,"airbyteMetaPresentInRaw":true,"airbyteGenerationIdPresent":true}	2025-05-21 14:50:04.229327+00
action	public	{"needsSoftReset":false,"airbyteMetaPresentInRaw":true,"airbyteGenerationIdPresent":true}	2025-05-21 12:04:57.949273+00
imprimante	public	{"needsSoftReset":false,"airbyteMetaPresentInRaw":true,"airbyteGenerationIdPresent":true}	2025-05-21 12:04:57.949517+00
equipement	public	{"needsSoftReset":false,"airbyteMetaPresentInRaw":true,"airbyteGenerationIdPresent":true}	2025-05-21 12:04:57.949591+00
pda	public	{"needsSoftReset":false,"airbyteMetaPresentInRaw":true,"airbyteGenerationIdPresent":true}	2025-05-21 12:04:57.949667+00
\.


--
-- TOC entry 4808 (class 0 OID 18569)
-- Dependencies: 509
-- Data for Name: public_raw__stream_action; Type: TABLE DATA; Schema: airbyte_internal; Owner: replica_user
--

COPY airbyte_internal.public_raw__stream_action (_airbyte_raw_id, _airbyte_data, _airbyte_extracted_at, _airbyte_loaded_at, _airbyte_meta, _airbyte_generation_id) FROM stdin;
8b702af2-2a48-4bd4-be17-0f0dc8232155	{"idaction": 32, "new_value": "12.0", "old_value": "10.0", "executed_at": "2025-05-06T08:00:05.213000Z", "executed_by": "Unknown User (unknown_user)", "command_type": "CONTRAST_CHANGE", "idequipement": 168, "command_details": "Changed printer contrast from 10.0 to 12.4"}	2025-05-21 12:04:29.325+00	2025-05-21 12:05:05.241236+00	{"changes": [], "sync_id": 20}	8
1538fa68-19c4-4de6-b6be-34928c6b6760	{"idaction": 33, "new_value": "N/A", "old_value": "N/A", "executed_at": "2025-05-06T08:00:48.022000Z", "executed_by": "Unknown User (unknown_user)", "command_type": "CUSTOM_COMMAND", "idequipement": 168, "command_details": "Sent custom command: ~HD"}	2025-05-21 12:04:29.325+00	2025-05-21 12:05:05.241236+00	{"changes": [], "sync_id": 20}	8
\.


--
-- TOC entry 4810 (class 0 OID 18612)
-- Dependencies: 511
-- Data for Name: public_raw__stream_equipement; Type: TABLE DATA; Schema: airbyte_internal; Owner: replica_user
--

COPY airbyte_internal.public_raw__stream_equipement (_airbyte_raw_id, _airbyte_data, _airbyte_extracted_at, _airbyte_loaded_at, _airbyte_meta, _airbyte_generation_id) FROM stdin;
da14fe24-982e-4f8e-b626-e83f0519dc77	{"idparc": 1, "modele": "MC2200", "ipadresse": "10.0.0.214", "idequipement": 179, "disponibilite": true}	2025-05-21 12:04:29.369+00	2025-05-21 12:05:05.395111+00	{"changes": [], "sync_id": 20}	8
a03454c6-baa0-410f-9252-ea235ef42dad	{"idparc": 1, "modele": "MC2200", "ipadresse": "10.0.0.213", "idequipement": 154, "disponibilite": false}	2025-05-21 12:04:29.369+00	2025-05-21 12:05:05.395111+00	{"changes": [], "sync_id": 20}	8
b19990de-c64a-420f-a5e4-02b75da09baa	{"idparc": 1, "modele": "ZD420-203dpi", "ipadresse": "10.0.0.205", "idequipement": 168, "disponibilite": false}	2025-05-21 12:04:29.369+00	2025-05-21 12:05:05.395111+00	{"changes": [], "sync_id": 20}	8
\.


--
-- TOC entry 4809 (class 0 OID 18598)
-- Dependencies: 510
-- Data for Name: public_raw__stream_imprimante; Type: TABLE DATA; Schema: airbyte_internal; Owner: replica_user
--

COPY airbyte_internal.public_raw__stream_imprimante (_airbyte_raw_id, _airbyte_data, _airbyte_extracted_at, _airbyte_loaded_at, _airbyte_meta, _airbyte_generation_id) FROM stdin;
a97ec389-4962-46e7-8109-990273aafa1c	{"latch": "Oui", "vitesse": 4.1, "contrast": "12.4", "idmarque": 1, "coveropen": false, "resolution": "203 dpi", "idequipement": 168, "idimprimante": 96, "nbretiquette": 0, "serialnumber": "D0J190106053", "printer_status": "OFFLINE", "status_message": "", "typeimpression": "THERMAL-TRANS.", "softwareversion": "V84.20.23Z <-"}	2025-05-21 12:04:29.358+00	2025-05-21 12:05:05.308508+00	{"changes": [], "sync_id": 20}	8
\.


--
-- TOC entry 4811 (class 0 OID 18626)
-- Dependencies: 512
-- Data for Name: public_raw__stream_pda; Type: TABLE DATA; Schema: airbyte_internal; Owner: replica_user
--

COPY airbyte_internal.public_raw__stream_pda (_airbyte_raw_id, _airbyte_data, _airbyte_extracted_at, _airbyte_loaded_at, _airbyte_meta, _airbyte_generation_id) FROM stdin;
92b082e4-1dc1-4a87-9b7f-4d7366bb8e3e	{"id": 154, "modele": "MC2200", "idbatterie": 21, "idstockage": 21, "serialnumber": "23234523021833", "versionandroid": "11"}	2025-05-21 12:04:29.379+00	2025-05-21 12:05:05.349043+00	{"changes": [], "sync_id": 20}	8
503977b8-a563-4778-8c3c-9ccf59c6c0f4	{"id": 179, "modele": "MC2200", "idbatterie": 31, "idstockage": 31, "serialnumber": "23234523021352", "versionandroid": "11"}	2025-05-21 12:04:29.379+00	2025-05-21 12:05:05.349043+00	{"changes": [], "sync_id": 20}	8
\.


--
-- TOC entry 4816 (class 0 OID 19318)
-- Dependencies: 517
-- Data for Name: public_raw__stream_ticket; Type: TABLE DATA; Schema: airbyte_internal; Owner: replica_user
--

COPY airbyte_internal.public_raw__stream_ticket (_airbyte_raw_id, _airbyte_data, _airbyte_extracted_at, _airbyte_loaded_at, _airbyte_meta, _airbyte_generation_id) FROM stdin;
e34f248e-4503-4ba7-b911-3cf79f3891cd	{"agent": 53, "notes": null, "sujet": "test local 2", "statut": "Resolu", "idticket": 47, "priority": "Low", "requester": 52, "created_at": "2025-05-05T19:13:03.094692", "description": "test", "serialnumber": "23234523021833", "piecesaremplacer": "test tes"}	2025-05-21 14:47:37.72+00	2025-05-21 14:47:51.787253+00	{"changes": [], "sync_id": 35}	15
1d5e6b13-8a1a-4ec7-aa17-d252f72da5df	{"agent": 53, "notes": null, "sujet": "test5", "statut": "Resolu", "idticket": 37, "priority": "Low", "requester": 52, "created_at": "2025-05-05T10:41:55.763718", "description": "test", "serialnumber": "23234523021833", "piecesaremplacer": "test"}	2025-05-21 14:47:37.72+00	2025-05-21 14:47:51.787253+00	{"changes": [], "sync_id": 35}	15
7f53f3e7-2d4d-4667-a7c7-0e7bc28fa8bd	{"agent": 53, "notes": null, "sujet": "ticket tuesday", "statut": "Resolu", "idticket": 49, "priority": "Low", "requester": 52, "created_at": "2025-05-06T08:58:45.033335", "description": "test", "serialnumber": "D0J190106053", "piecesaremplacer": "test"}	2025-05-21 14:47:37.72+00	2025-05-21 14:47:51.787253+00	{"changes": [], "sync_id": 35}	15
f128aae0-4dd7-4262-96ee-09166356ea68	{"agent": 53, "notes": null, "sujet": "test syn", "statut": "Resolu", "idticket": 50, "priority": "Medium", "requester": 52, "created_at": "2025-05-09T15:05:27.916220", "description": "test syn", "serialnumber": "23234523021352", "piecesaremplacer": "aa"}	2025-05-21 14:47:37.72+00	2025-05-21 14:47:51.787253+00	{"changes": [], "sync_id": 35}	15
9ab1d126-7abe-4da8-9ec2-d0f97e570ec7	{"agent": 67, "notes": null, "sujet": "test1syn", "statut": "Resolu", "idticket": 51, "priority": "High", "requester": 52, "created_at": "2025-05-09T15:06:02.808780", "description": "test1", "serialnumber": "23234523021352", "piecesaremplacer": "aacc"}	2025-05-21 14:47:37.72+00	2025-05-21 14:47:51.787253+00	{"changes": [], "sync_id": 35}	15
e2745a84-6297-4e37-bcbb-cc772559bbca	{"agent": 53, "notes": null, "sujet": "testy", "statut": "Resolu", "idticket": 53, "priority": "Low", "requester": 52, "created_at": "2025-05-21T11:57:55.187415", "description": "tt", "serialnumber": "23234523021833", "piecesaremplacer": "tt"}	2025-05-21 14:47:37.72+00	2025-05-21 14:47:51.787253+00	{"changes": [], "sync_id": 35}	15
cbd8b8be-aeed-4a65-837d-831255fb4c47	{"agent": 53, "notes": null, "sujet": "azerty", "statut": "Resolu", "idticket": 52, "priority": "Medium", "requester": 52, "created_at": "2025-05-21T10:55:56.968616", "description": "aa", "serialnumber": "23234523021833", "piecesaremplacer": "aa"}	2025-05-21 14:47:37.72+00	2025-05-21 14:47:51.787253+00	{"changes": [], "sync_id": 35}	15
4187036e-0210-4e20-8d04-ea37a819ca33	{"agent": 53, "notes": null, "sujet": "cloud222", "statut": "Resolu", "idticket": 56, "priority": "Medium", "requester": 52, "created_at": "2025-05-21T14:34:39.152505", "description": "aa", "serialnumber": "D0J190106053", "piecesaremplacer": "zz"}	2025-05-21 14:47:37.72+00	2025-05-21 14:47:51.787253+00	{"changes": [], "sync_id": 35}	15
bb315467-5b18-4ecd-b133-5166d465ed3b	{"agent": 53, "notes": null, "sujet": "testpfe", "statut": "Ouvert", "idticket": 57, "priority": "High", "requester": 52, "created_at": "2025-05-21T15:46:53.375488", "description": "test", "serialnumber": "23234523021833", "piecesaremplacer": "test"}	2025-05-21 14:47:37.72+00	2025-05-21 14:47:51.787253+00	{"changes": [], "sync_id": 35}	15
\.


--
-- TOC entry 4818 (class 0 OID 19343)
-- Dependencies: 519
-- Data for Name: public_raw__stream_users; Type: TABLE DATA; Schema: airbyte_internal; Owner: replica_user
--

COPY airbyte_internal.public_raw__stream_users (_airbyte_raw_id, _airbyte_data, _airbyte_extracted_at, _airbyte_loaded_at, _airbyte_meta, _airbyte_generation_id) FROM stdin;
fe8a8996-f66e-48b7-9991-8dc3ef06dc98	{"id": 54, "nom": "Test", "email": "test@mail.com", "prenom": "Tester", "statut": "inactive", "roleuser": "technicien", "created_at": "2025-04-19T10:42:03.340365Z", "last_login": "2025-04-19T10:40:40.921029Z", "motdepasse": "$2b$10$oNeXCCfuJMS7qagVPgrr7.lm9aS44LYr9b5NNBA51TR4SzWZlT4CO", "departement": "Test"}	2025-05-21 14:49:54.74+00	2025-05-21 14:50:06.677559+00	{"changes": [], "sync_id": 36}	8
6f94c2a5-3a07-4a26-ac2a-ab12189196f0	{"id": 53, "nom": "Wael", "email": "wael@mail.com", "prenom": "Wael", "statut": "active", "roleuser": "superadmin", "created_at": "2025-04-19T10:42:03.340365Z", "last_login": "2025-05-05T18:16:12.425707Z", "motdepasse": "$2b$10$Dt59em914dyTGRAOffQBxu73yoqOwC/..gV034Y64qVYExBlhTREa", "departement": "TechnoCode"}	2025-05-21 14:49:54.74+00	2025-05-21 14:50:06.677559+00	{"changes": [], "sync_id": 36}	8
4e4427fc-846a-458c-b6eb-8b0f04e63642	{"id": 57, "nom": "test4", "email": "test4@mail.com", "prenom": "test4", "statut": "inactive", "roleuser": "technicien", "created_at": "2025-04-19T10:42:03.340365Z", "last_login": "2025-05-06T10:33:40.401133Z", "motdepasse": "$2b$10$KJUIYdvycfMv.Iyd35dA9uH8eDrWXBkv1tQfBE1kqZRvyxHRaXrDC", "departement": "Leoni"}	2025-05-21 14:49:54.74+00	2025-05-21 14:50:06.677559+00	{"changes": [], "sync_id": 36}	8
af0acbe0-3036-47c5-9787-ae41c948c72e	{"id": 67, "nom": "testsyn", "email": "wael@gmail.com", "prenom": "azerty", "statut": "active", "roleuser": "admin", "created_at": "2025-05-06T12:57:34.972460Z", "last_login": "2025-05-06T12:57:34.972460Z", "motdepasse": "$2b$10$VE.ij05cxVJtW5h.K9Q/vONQ413D9PgQEe9B/BahjH89xZxrkdvNe", "departement": "Technocode"}	2025-05-21 14:49:54.74+00	2025-05-21 14:50:06.677559+00	{"changes": [], "sync_id": 36}	8
0912ac81-bacc-4a79-b17d-cc5705f58a7f	{"id": 52, "nom": "Regaieg", "email": "regaiegharoun@gmail.com", "prenom": "Haroun", "statut": "active", "roleuser": "superadmin", "created_at": "2025-04-19T10:42:03.340365Z", "last_login": "2025-05-21T10:57:31.376307Z", "motdepasse": "$2b$10$9MFMRjrJB/cyz1.mIoobXevDaay2QRdoUFEIO3x58/cWTKo.nCnJG", "departement": "TechnoCode"}	2025-05-21 14:49:54.74+00	2025-05-21 14:50:06.677559+00	{"changes": [], "sync_id": 36}	8
4df2bedc-7d2a-4552-bc66-f162268b6920	{"id": 68, "nom": "sary", "email": "sary@gmail.com", "prenom": "boukadida", "statut": "active", "roleuser": "admin", "created_at": "2025-05-21T14:49:10.729751Z", "last_login": "2025-05-21T14:49:10.729751Z", "motdepasse": "$2b$10$MnBu.49ODZDLYnlt3d9Qa.2E0Va.IQsNjcjbxgOnomOmig.vCXpg6", "departement": "Technocode"}	2025-05-21 14:49:54.74+00	2025-05-21 14:50:06.677559+00	{"changes": [], "sync_id": 36}	8
\.


--
-- TOC entry 4812 (class 0 OID 18672)
-- Dependencies: 513
-- Data for Name: action; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.action (idaction, new_value, old_value, _ab_cdc_lsn, executed_at, executed_by, command_type, idequipement, command_details, _ab_cdc_deleted_at, _ab_cdc_updated_at, _airbyte_raw_id, _airbyte_extracted_at, _airbyte_generation_id, _airbyte_meta) FROM stdin;
32	12.0	10.0	\N	2025-05-06 08:00:05.213+00	Unknown User (unknown_user)	CONTRAST_CHANGE	168	Changed printer contrast from 10.0 to 12.4	\N	\N	8b702af2-2a48-4bd4-be17-0f0dc8232155	2025-05-21 12:04:29.325+00	8	{"changes": [], "sync_id": 20}
33	N/A	N/A	\N	2025-05-06 08:00:48.022+00	Unknown User (unknown_user)	CUSTOM_COMMAND	168	Sent custom command: ~HD	\N	\N	1538fa68-19c4-4de6-b6be-34928c6b6760	2025-05-21 12:04:29.325+00	8	{"changes": [], "sync_id": 20}
\.


--
-- TOC entry 4781 (class 0 OID 16464)
-- Dependencies: 482
-- Data for Name: application; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.application (idapp, nomapp, versionapp, packagename) FROM stdin;
\.


--
-- TOC entry 4783 (class 0 OID 16468)
-- Dependencies: 484
-- Data for Name: commande; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.commande (idcommande, nomcommande, commande, idmarque) FROM stdin;
\.


--
-- TOC entry 4785 (class 0 OID 16474)
-- Dependencies: 486
-- Data for Name: departement; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.departement (iddep, nomdep, nbrparc, nbrutilisateur) FROM stdin;
1	Technocode	0	1
\.


--
-- TOC entry 4813 (class 0 OID 18677)
-- Dependencies: 514
-- Data for Name: equipement; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.equipement (idparc, modele, ipadresse, _ab_cdc_lsn, idequipement, disponibilite, _ab_cdc_deleted_at, _ab_cdc_updated_at, _airbyte_raw_id, _airbyte_extracted_at, _airbyte_generation_id, _airbyte_meta) FROM stdin;
1	MC2200	10.0.0.213	\N	154	f	\N	\N	a03454c6-baa0-410f-9252-ea235ef42dad	2025-05-21 12:04:29.369+00	8	{"changes": [], "sync_id": 20}
1	ZD420-203dpi	10.0.0.205	\N	168	f	\N	\N	b19990de-c64a-420f-a5e4-02b75da09baa	2025-05-21 12:04:29.369+00	8	{"changes": [], "sync_id": 20}
1	MC2200	10.0.0.214	\N	179	f	\N	\N	da14fe24-982e-4f8e-b626-e83f0519dc77	2025-05-21 12:04:29.369+00	8	{"changes": [], "sync_id": 20}
\.


--
-- TOC entry 4807 (class 0 OID 17018)
-- Dependencies: 508
-- Data for Name: equipement_ab_soft_reset; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.equipement_ab_soft_reset (idparc, modele, ipadresse, _ab_cdc_lsn, idequipement, disponibilite, _ab_cdc_deleted_at, _ab_cdc_updated_at, _airbyte_raw_id, _airbyte_extracted_at, _airbyte_generation_id, _airbyte_meta) FROM stdin;
\.


--
-- TOC entry 4787 (class 0 OID 16489)
-- Dependencies: 488
-- Data for Name: etat_batterie; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.etat_batterie (idbatterie, typecharge, niveaucharge) FROM stdin;
\.


--
-- TOC entry 4789 (class 0 OID 16495)
-- Dependencies: 490
-- Data for Name: etat_stockage; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.etat_stockage (idstockage, stockagetotale, stockagelibre) FROM stdin;
\.


--
-- TOC entry 4815 (class 0 OID 18700)
-- Dependencies: 516
-- Data for Name: imprimante; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.imprimante (latch, vitesse, contrast, idmarque, coveropen, resolution, _ab_cdc_lsn, idequipement, idimprimante, nbretiquette, serialnumber, printer_status, status_message, typeimpression, softwareversion, _ab_cdc_deleted_at, _ab_cdc_updated_at, _airbyte_raw_id, _airbyte_extracted_at, _airbyte_generation_id, _airbyte_meta) FROM stdin;
Oui	4.100000000	12.4	1	f	203 dpi	\N	168	96	0	D0J190106053	OFFLINE		THERMAL-TRANS.	V84.20.23Z <-	\N	\N	a97ec389-4962-46e7-8109-990273aafa1c	2025-05-21 12:04:29.358+00	8	{"changes": [], "sync_id": 20}
\.


--
-- TOC entry 4804 (class 0 OID 16713)
-- Dependencies: 505
-- Data for Name: information; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.information (id, idequipement, date, statut, description) FROM stdin;
\.


--
-- TOC entry 4791 (class 0 OID 16509)
-- Dependencies: 492
-- Data for Name: marque; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.marque (idmarque, nommarque) FROM stdin;
\.


--
-- TOC entry 4793 (class 0 OID 16515)
-- Dependencies: 494
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.notifications (id, type, category, message, related_id, created_at, is_read, recipient_id) FROM stdin;
\.


--
-- TOC entry 4795 (class 0 OID 16523)
-- Dependencies: 496
-- Data for Name: parc; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.parc (idparc, nomparc, nbrchaines, iddep) FROM stdin;
\.


--
-- TOC entry 4814 (class 0 OID 18687)
-- Dependencies: 515
-- Data for Name: pda; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.pda (id, modele, idbatterie, idstockage, _ab_cdc_lsn, serialnumber, versionandroid, _ab_cdc_deleted_at, _ab_cdc_updated_at, _airbyte_raw_id, _airbyte_extracted_at, _airbyte_generation_id, _airbyte_meta) FROM stdin;
154	MC2200	21	21	\N	23234523021833	11	\N	\N	92b082e4-1dc1-4a87-9b7f-4d7366bb8e3e	2025-05-21 12:04:29.379+00	8	{"changes": [], "sync_id": 20}
179	MC2200	31	31	\N	23234523021352	11	\N	\N	503977b8-a563-4778-8c3c-9ccf59c6c0f4	2025-05-21 12:04:29.379+00	8	{"changes": [], "sync_id": 20}
\.


--
-- TOC entry 4806 (class 0 OID 17008)
-- Dependencies: 507
-- Data for Name: pda_ab_soft_reset; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.pda_ab_soft_reset (id, modele, idbatterie, idstockage, _ab_cdc_lsn, serialnumber, versionandroid, _ab_cdc_deleted_at, _ab_cdc_updated_at, _airbyte_raw_id, _airbyte_extracted_at, _airbyte_generation_id, _airbyte_meta) FROM stdin;
\.


--
-- TOC entry 4797 (class 0 OID 16536)
-- Dependencies: 498
-- Data for Name: pda_application; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.pda_application (id, idpda, idapp, installdate) FROM stdin;
\.


--
-- TOC entry 4799 (class 0 OID 16541)
-- Dependencies: 500
-- Data for Name: pda_location; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.pda_location (id, pda_id, latitude, longitude, "timestamp") FROM stdin;
\.


--
-- TOC entry 4801 (class 0 OID 16546)
-- Dependencies: 502
-- Data for Name: sync_queue; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.sync_queue (id, operation_type, entity_type, entity_id, data, created_at, retries, last_retry, status, error_message) FROM stdin;
\.


--
-- TOC entry 4817 (class 0 OID 19330)
-- Dependencies: 518
-- Data for Name: ticket; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.ticket (agent, notes, sujet, statut, idticket, priority, requester, created_at, _ab_cdc_lsn, description, serialnumber, piecesaremplacer, _ab_cdc_deleted_at, _ab_cdc_updated_at, _airbyte_raw_id, _airbyte_extracted_at, _airbyte_generation_id, _airbyte_meta) FROM stdin;
53	\N	test local 2	Resolu	47	Low	52	2025-05-05 19:13:03.094692	\N	test	23234523021833	test tes	\N	\N	e34f248e-4503-4ba7-b911-3cf79f3891cd	2025-05-21 14:47:37.72+00	15	{"changes": [], "sync_id": 35}
53	\N	test5	Resolu	37	Low	52	2025-05-05 10:41:55.763718	\N	test	23234523021833	test	\N	\N	1d5e6b13-8a1a-4ec7-aa17-d252f72da5df	2025-05-21 14:47:37.72+00	15	{"changes": [], "sync_id": 35}
53	\N	ticket tuesday	Resolu	49	Low	52	2025-05-06 08:58:45.033335	\N	test	D0J190106053	test	\N	\N	7f53f3e7-2d4d-4667-a7c7-0e7bc28fa8bd	2025-05-21 14:47:37.72+00	15	{"changes": [], "sync_id": 35}
53	\N	test syn	Resolu	50	Medium	52	2025-05-09 15:05:27.91622	\N	test syn	23234523021352	aa	\N	\N	f128aae0-4dd7-4262-96ee-09166356ea68	2025-05-21 14:47:37.72+00	15	{"changes": [], "sync_id": 35}
67	\N	test1syn	Resolu	51	High	52	2025-05-09 15:06:02.80878	\N	test1	23234523021352	aacc	\N	\N	9ab1d126-7abe-4da8-9ec2-d0f97e570ec7	2025-05-21 14:47:37.72+00	15	{"changes": [], "sync_id": 35}
53	\N	testy	Resolu	53	Low	52	2025-05-21 11:57:55.187415	\N	tt	23234523021833	tt	\N	\N	e2745a84-6297-4e37-bcbb-cc772559bbca	2025-05-21 14:47:37.72+00	15	{"changes": [], "sync_id": 35}
53	\N	azerty	Resolu	52	Medium	52	2025-05-21 10:55:56.968616	\N	aa	23234523021833	aa	\N	\N	cbd8b8be-aeed-4a65-837d-831255fb4c47	2025-05-21 14:47:37.72+00	15	{"changes": [], "sync_id": 35}
53	\N	cloud222	Resolu	56	Medium	52	2025-05-21 14:34:39.152505	\N	aa	D0J190106053	zz	\N	\N	4187036e-0210-4e20-8d04-ea37a819ca33	2025-05-21 14:47:37.72+00	15	{"changes": [], "sync_id": 35}
53	\N	testpfe	Ouvert	57	High	52	2025-05-21 15:46:53.375488	\N	test	23234523021833	test	\N	\N	bb315467-5b18-4ecd-b133-5166d465ed3b	2025-05-21 14:47:37.72+00	15	{"changes": [], "sync_id": 35}
\.


--
-- TOC entry 4819 (class 0 OID 19355)
-- Dependencies: 520
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: replica_user
--

COPY public.users (id, nom, email, prenom, statut, roleuser, created_at, last_login, motdepasse, _ab_cdc_lsn, departement, _ab_cdc_deleted_at, _ab_cdc_updated_at, _airbyte_raw_id, _airbyte_extracted_at, _airbyte_generation_id, _airbyte_meta) FROM stdin;
54	Test	test@mail.com	Tester	inactive	technicien	2025-04-19 10:42:03.340365+00	2025-04-19 10:40:40.921029+00	$2b$10$oNeXCCfuJMS7qagVPgrr7.lm9aS44LYr9b5NNBA51TR4SzWZlT4CO	\N	Test	\N	\N	fe8a8996-f66e-48b7-9991-8dc3ef06dc98	2025-05-21 14:49:54.74+00	8	{"changes": [], "sync_id": 36}
53	Wael	wael@mail.com	Wael	active	superadmin	2025-04-19 10:42:03.340365+00	2025-05-05 18:16:12.425707+00	$2b$10$Dt59em914dyTGRAOffQBxu73yoqOwC/..gV034Y64qVYExBlhTREa	\N	TechnoCode	\N	\N	6f94c2a5-3a07-4a26-ac2a-ab12189196f0	2025-05-21 14:49:54.74+00	8	{"changes": [], "sync_id": 36}
57	test4	test4@mail.com	test4	inactive	technicien	2025-04-19 10:42:03.340365+00	2025-05-06 10:33:40.401133+00	$2b$10$KJUIYdvycfMv.Iyd35dA9uH8eDrWXBkv1tQfBE1kqZRvyxHRaXrDC	\N	Leoni	\N	\N	4e4427fc-846a-458c-b6eb-8b0f04e63642	2025-05-21 14:49:54.74+00	8	{"changes": [], "sync_id": 36}
67	testsyn	wael@gmail.com	azerty	active	admin	2025-05-06 12:57:34.97246+00	2025-05-06 12:57:34.97246+00	$2b$10$VE.ij05cxVJtW5h.K9Q/vONQ413D9PgQEe9B/BahjH89xZxrkdvNe	\N	Technocode	\N	\N	af0acbe0-3036-47c5-9787-ae41c948c72e	2025-05-21 14:49:54.74+00	8	{"changes": [], "sync_id": 36}
52	Regaieg	regaiegharoun@gmail.com	Haroun	active	superadmin	2025-04-19 10:42:03.340365+00	2025-05-21 10:57:31.376307+00	$2b$10$9MFMRjrJB/cyz1.mIoobXevDaay2QRdoUFEIO3x58/cWTKo.nCnJG	\N	TechnoCode	\N	\N	0912ac81-bacc-4a79-b17d-cc5705f58a7f	2025-05-21 14:49:54.74+00	8	{"changes": [], "sync_id": 36}
68	sary	sary@gmail.com	boukadida	active	admin	2025-05-21 14:49:10.729751+00	2025-05-21 14:49:10.729751+00	$2b$10$MnBu.49ODZDLYnlt3d9Qa.2E0Va.IQsNjcjbxgOnomOmig.vCXpg6	\N	Technocode	\N	\N	4df2bedc-7d2a-4552-bc66-f162268b6920	2025-05-21 14:49:54.74+00	8	{"changes": [], "sync_id": 36}
\.


--
-- TOC entry 4838 (class 0 OID 0)
-- Dependencies: 483
-- Name: application_idapp_seq; Type: SEQUENCE SET; Schema: public; Owner: replica_user
--

SELECT pg_catalog.setval('public.application_idapp_seq', 1, false);


--
-- TOC entry 4839 (class 0 OID 0)
-- Dependencies: 485
-- Name: commande_idcommande_seq; Type: SEQUENCE SET; Schema: public; Owner: replica_user
--

SELECT pg_catalog.setval('public.commande_idcommande_seq', 1, false);


--
-- TOC entry 4840 (class 0 OID 0)
-- Dependencies: 487
-- Name: departement_iddep_seq; Type: SEQUENCE SET; Schema: public; Owner: replica_user
--

SELECT pg_catalog.setval('public.departement_iddep_seq', 1, true);


--
-- TOC entry 4841 (class 0 OID 0)
-- Dependencies: 489
-- Name: etat_batterie_idbatterie_seq; Type: SEQUENCE SET; Schema: public; Owner: replica_user
--

SELECT pg_catalog.setval('public.etat_batterie_idbatterie_seq', 1, false);


--
-- TOC entry 4842 (class 0 OID 0)
-- Dependencies: 491
-- Name: etat_stockage_idstockage_seq; Type: SEQUENCE SET; Schema: public; Owner: replica_user
--

SELECT pg_catalog.setval('public.etat_stockage_idstockage_seq', 1, false);


--
-- TOC entry 4843 (class 0 OID 0)
-- Dependencies: 504
-- Name: information_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.information_id_seq', 1, false);


--
-- TOC entry 4844 (class 0 OID 0)
-- Dependencies: 493
-- Name: marque_idmarque_seq; Type: SEQUENCE SET; Schema: public; Owner: replica_user
--

SELECT pg_catalog.setval('public.marque_idmarque_seq', 1, false);


--
-- TOC entry 4845 (class 0 OID 0)
-- Dependencies: 495
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: replica_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- TOC entry 4846 (class 0 OID 0)
-- Dependencies: 497
-- Name: parc_idparc_seq; Type: SEQUENCE SET; Schema: public; Owner: replica_user
--

SELECT pg_catalog.setval('public.parc_idparc_seq', 1, false);


--
-- TOC entry 4847 (class 0 OID 0)
-- Dependencies: 499
-- Name: pda_application_id_seq; Type: SEQUENCE SET; Schema: public; Owner: replica_user
--

SELECT pg_catalog.setval('public.pda_application_id_seq', 1, false);


--
-- TOC entry 4848 (class 0 OID 0)
-- Dependencies: 501
-- Name: pda_location_id_seq; Type: SEQUENCE SET; Schema: public; Owner: replica_user
--

SELECT pg_catalog.setval('public.pda_location_id_seq', 1, false);


--
-- TOC entry 4849 (class 0 OID 0)
-- Dependencies: 503
-- Name: sync_queue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: replica_user
--

SELECT pg_catalog.setval('public.sync_queue_id_seq', 1, false);


--
-- TOC entry 4599 (class 2606 OID 18576)
-- Name: public_raw__stream_action public_raw__stream_action_airbyte_tmp_pkey; Type: CONSTRAINT; Schema: airbyte_internal; Owner: replica_user
--

ALTER TABLE ONLY airbyte_internal.public_raw__stream_action
    ADD CONSTRAINT public_raw__stream_action_airbyte_tmp_pkey PRIMARY KEY (_airbyte_raw_id);


--
-- TOC entry 4609 (class 2606 OID 18619)
-- Name: public_raw__stream_equipement public_raw__stream_equipement_airbyte_tmp_pkey; Type: CONSTRAINT; Schema: airbyte_internal; Owner: replica_user
--

ALTER TABLE ONLY airbyte_internal.public_raw__stream_equipement
    ADD CONSTRAINT public_raw__stream_equipement_airbyte_tmp_pkey PRIMARY KEY (_airbyte_raw_id);


--
-- TOC entry 4604 (class 2606 OID 18605)
-- Name: public_raw__stream_imprimante public_raw__stream_imprimante_airbyte_tmp_pkey; Type: CONSTRAINT; Schema: airbyte_internal; Owner: replica_user
--

ALTER TABLE ONLY airbyte_internal.public_raw__stream_imprimante
    ADD CONSTRAINT public_raw__stream_imprimante_airbyte_tmp_pkey PRIMARY KEY (_airbyte_raw_id);


--
-- TOC entry 4614 (class 2606 OID 18633)
-- Name: public_raw__stream_pda public_raw__stream_pda_airbyte_tmp_pkey; Type: CONSTRAINT; Schema: airbyte_internal; Owner: replica_user
--

ALTER TABLE ONLY airbyte_internal.public_raw__stream_pda
    ADD CONSTRAINT public_raw__stream_pda_airbyte_tmp_pkey PRIMARY KEY (_airbyte_raw_id);


--
-- TOC entry 4625 (class 2606 OID 19325)
-- Name: public_raw__stream_ticket public_raw__stream_ticket_airbyte_tmp_pkey1; Type: CONSTRAINT; Schema: airbyte_internal; Owner: replica_user
--

ALTER TABLE ONLY airbyte_internal.public_raw__stream_ticket
    ADD CONSTRAINT public_raw__stream_ticket_airbyte_tmp_pkey1 PRIMARY KEY (_airbyte_raw_id);


--
-- TOC entry 4629 (class 2606 OID 19350)
-- Name: public_raw__stream_users public_raw__stream_users_airbyte_tmp_pkey1; Type: CONSTRAINT; Schema: airbyte_internal; Owner: replica_user
--

ALTER TABLE ONLY airbyte_internal.public_raw__stream_users
    ADD CONSTRAINT public_raw__stream_users_airbyte_tmp_pkey1 PRIMARY KEY (_airbyte_raw_id);


--
-- TOC entry 4560 (class 2606 OID 16591)
-- Name: application application_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.application
    ADD CONSTRAINT application_pkey PRIMARY KEY (idapp);


--
-- TOC entry 4562 (class 2606 OID 16593)
-- Name: commande commande_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.commande
    ADD CONSTRAINT commande_pkey PRIMARY KEY (idcommande);


--
-- TOC entry 4564 (class 2606 OID 16595)
-- Name: departement departement_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.departement
    ADD CONSTRAINT departement_pkey PRIMARY KEY (iddep);


--
-- TOC entry 4566 (class 2606 OID 16601)
-- Name: etat_batterie etat_batterie_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.etat_batterie
    ADD CONSTRAINT etat_batterie_pkey PRIMARY KEY (idbatterie);


--
-- TOC entry 4568 (class 2606 OID 16603)
-- Name: etat_stockage etat_stockage_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.etat_stockage
    ADD CONSTRAINT etat_stockage_pkey PRIMARY KEY (idstockage);


--
-- TOC entry 4589 (class 2606 OID 16720)
-- Name: information information_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.information
    ADD CONSTRAINT information_pkey PRIMARY KEY (id);


--
-- TOC entry 4570 (class 2606 OID 16611)
-- Name: marque marque_nommarque_key; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.marque
    ADD CONSTRAINT marque_nommarque_key UNIQUE (nommarque);


--
-- TOC entry 4572 (class 2606 OID 16613)
-- Name: marque marque_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.marque
    ADD CONSTRAINT marque_pkey PRIMARY KEY (idmarque);


--
-- TOC entry 4577 (class 2606 OID 16615)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4579 (class 2606 OID 16617)
-- Name: parc parc_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.parc
    ADD CONSTRAINT parc_pkey PRIMARY KEY (idparc);


--
-- TOC entry 4581 (class 2606 OID 16619)
-- Name: pda_application pda_application_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.pda_application
    ADD CONSTRAINT pda_application_pkey PRIMARY KEY (id);


--
-- TOC entry 4583 (class 2606 OID 16621)
-- Name: pda_location pda_location_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.pda_location
    ADD CONSTRAINT pda_location_pkey PRIMARY KEY (id);


--
-- TOC entry 4587 (class 2606 OID 16625)
-- Name: sync_queue sync_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.sync_queue
    ADD CONSTRAINT sync_queue_pkey PRIMARY KEY (id);


--
-- TOC entry 4596 (class 1259 OID 18578)
-- Name: public_raw__stream_action_airbyte_tmp_extracted_at; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_action_airbyte_tmp_extracted_at ON airbyte_internal.public_raw__stream_action USING btree (_airbyte_extracted_at);


--
-- TOC entry 4597 (class 1259 OID 18580)
-- Name: public_raw__stream_action_airbyte_tmp_loaded_at; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_action_airbyte_tmp_loaded_at ON airbyte_internal.public_raw__stream_action USING btree (_airbyte_loaded_at, _airbyte_extracted_at);


--
-- TOC entry 4600 (class 1259 OID 18577)
-- Name: public_raw__stream_action_airbyte_tmp_raw_id; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_action_airbyte_tmp_raw_id ON airbyte_internal.public_raw__stream_action USING btree (_airbyte_raw_id);


--
-- TOC entry 4606 (class 1259 OID 18621)
-- Name: public_raw__stream_equipement_airbyte_tmp_extracted_at; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_equipement_airbyte_tmp_extracted_at ON airbyte_internal.public_raw__stream_equipement USING btree (_airbyte_extracted_at);


--
-- TOC entry 4607 (class 1259 OID 18622)
-- Name: public_raw__stream_equipement_airbyte_tmp_loaded_at; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_equipement_airbyte_tmp_loaded_at ON airbyte_internal.public_raw__stream_equipement USING btree (_airbyte_loaded_at, _airbyte_extracted_at);


--
-- TOC entry 4610 (class 1259 OID 18620)
-- Name: public_raw__stream_equipement_airbyte_tmp_raw_id; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_equipement_airbyte_tmp_raw_id ON airbyte_internal.public_raw__stream_equipement USING btree (_airbyte_raw_id);


--
-- TOC entry 4601 (class 1259 OID 18607)
-- Name: public_raw__stream_imprimante_airbyte_tmp_extracted_at; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_imprimante_airbyte_tmp_extracted_at ON airbyte_internal.public_raw__stream_imprimante USING btree (_airbyte_extracted_at);


--
-- TOC entry 4602 (class 1259 OID 18608)
-- Name: public_raw__stream_imprimante_airbyte_tmp_loaded_at; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_imprimante_airbyte_tmp_loaded_at ON airbyte_internal.public_raw__stream_imprimante USING btree (_airbyte_loaded_at, _airbyte_extracted_at);


--
-- TOC entry 4605 (class 1259 OID 18606)
-- Name: public_raw__stream_imprimante_airbyte_tmp_raw_id; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_imprimante_airbyte_tmp_raw_id ON airbyte_internal.public_raw__stream_imprimante USING btree (_airbyte_raw_id);


--
-- TOC entry 4611 (class 1259 OID 18635)
-- Name: public_raw__stream_pda_airbyte_tmp_extracted_at; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_pda_airbyte_tmp_extracted_at ON airbyte_internal.public_raw__stream_pda USING btree (_airbyte_extracted_at);


--
-- TOC entry 4612 (class 1259 OID 18636)
-- Name: public_raw__stream_pda_airbyte_tmp_loaded_at; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_pda_airbyte_tmp_loaded_at ON airbyte_internal.public_raw__stream_pda USING btree (_airbyte_loaded_at, _airbyte_extracted_at);


--
-- TOC entry 4615 (class 1259 OID 18634)
-- Name: public_raw__stream_pda_airbyte_tmp_raw_id; Type: INDEX; Schema: airbyte_internal; Owner: replica_user
--

CREATE INDEX public_raw__stream_pda_airbyte_tmp_raw_id ON airbyte_internal.public_raw__stream_pda USING btree (_airbyte_raw_id);


--
-- TOC entry 4616 (class 1259 OID 18692)
-- Name: action_airbyte_tmp__airbyte_extracted_at_idx1; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX action_airbyte_tmp__airbyte_extracted_at_idx1 ON public.action USING btree (_airbyte_extracted_at);


--
-- TOC entry 4617 (class 1259 OID 18696)
-- Name: action_airbyte_tmp__airbyte_raw_id_idx1; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX action_airbyte_tmp__airbyte_raw_id_idx1 ON public.action USING btree (_airbyte_raw_id);


--
-- TOC entry 4593 (class 1259 OID 17034)
-- Name: equipement_ab_soft_reset__airbyte_extracted_at_idx; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX equipement_ab_soft_reset__airbyte_extracted_at_idx ON public.equipement_ab_soft_reset USING btree (_airbyte_extracted_at);


--
-- TOC entry 4594 (class 1259 OID 17039)
-- Name: equipement_ab_soft_reset__airbyte_raw_id_idx; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX equipement_ab_soft_reset__airbyte_raw_id_idx ON public.equipement_ab_soft_reset USING btree (_airbyte_raw_id);


--
-- TOC entry 4595 (class 1259 OID 17029)
-- Name: equipement_ab_soft_reset_idequipement__ab_cdc_lsn__airbyte__idx; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX equipement_ab_soft_reset_idequipement__ab_cdc_lsn__airbyte__idx ON public.equipement_ab_soft_reset USING btree (idequipement, _ab_cdc_lsn, _airbyte_extracted_at);


--
-- TOC entry 4618 (class 1259 OID 18693)
-- Name: equipement_airbyte_tmp__airbyte_extracted_at_idx1; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX equipement_airbyte_tmp__airbyte_extracted_at_idx1 ON public.equipement USING btree (_airbyte_extracted_at);


--
-- TOC entry 4619 (class 1259 OID 18697)
-- Name: equipement_airbyte_tmp__airbyte_raw_id_idx1; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX equipement_airbyte_tmp__airbyte_raw_id_idx1 ON public.equipement USING btree (_airbyte_raw_id);


--
-- TOC entry 4573 (class 1259 OID 16632)
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (is_read);


--
-- TOC entry 4574 (class 1259 OID 16634)
-- Name: idx_notifications_recipient; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX idx_notifications_recipient ON public.notifications USING btree (recipient_id);


--
-- TOC entry 4575 (class 1259 OID 16635)
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type, category);


--
-- TOC entry 4584 (class 1259 OID 16636)
-- Name: idx_sync_queue_entity; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX idx_sync_queue_entity ON public.sync_queue USING btree (entity_type, entity_id);


--
-- TOC entry 4585 (class 1259 OID 16637)
-- Name: idx_sync_queue_status; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX idx_sync_queue_status ON public.sync_queue USING btree (status);


--
-- TOC entry 4622 (class 1259 OID 18705)
-- Name: imprimante_airbyte_tmp__airbyte_extracted_at_idx1; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX imprimante_airbyte_tmp__airbyte_extracted_at_idx1 ON public.imprimante USING btree (_airbyte_extracted_at);


--
-- TOC entry 4623 (class 1259 OID 18706)
-- Name: imprimante_airbyte_tmp__airbyte_raw_id_idx1; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX imprimante_airbyte_tmp__airbyte_raw_id_idx1 ON public.imprimante USING btree (_airbyte_raw_id);


--
-- TOC entry 4590 (class 1259 OID 17032)
-- Name: pda_ab_soft_reset__airbyte_extracted_at_idx; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX pda_ab_soft_reset__airbyte_extracted_at_idx ON public.pda_ab_soft_reset USING btree (_airbyte_extracted_at);


--
-- TOC entry 4591 (class 1259 OID 17036)
-- Name: pda_ab_soft_reset__airbyte_raw_id_idx; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX pda_ab_soft_reset__airbyte_raw_id_idx ON public.pda_ab_soft_reset USING btree (_airbyte_raw_id);


--
-- TOC entry 4592 (class 1259 OID 17028)
-- Name: pda_ab_soft_reset_id__ab_cdc_lsn__airbyte_extracted_at_idx; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX pda_ab_soft_reset_id__ab_cdc_lsn__airbyte_extracted_at_idx ON public.pda_ab_soft_reset USING btree (id, _ab_cdc_lsn, _airbyte_extracted_at);


--
-- TOC entry 4620 (class 1259 OID 18695)
-- Name: pda_airbyte_tmp__airbyte_extracted_at_idx1; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX pda_airbyte_tmp__airbyte_extracted_at_idx1 ON public.pda USING btree (_airbyte_extracted_at);


--
-- TOC entry 4621 (class 1259 OID 18699)
-- Name: pda_airbyte_tmp__airbyte_raw_id_idx1; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX pda_airbyte_tmp__airbyte_raw_id_idx1 ON public.pda USING btree (_airbyte_raw_id);


--
-- TOC entry 4626 (class 1259 OID 19335)
-- Name: ticket_airbyte_tmp__airbyte_extracted_at_idx1; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX ticket_airbyte_tmp__airbyte_extracted_at_idx1 ON public.ticket USING btree (_airbyte_extracted_at);


--
-- TOC entry 4627 (class 1259 OID 19336)
-- Name: ticket_airbyte_tmp__airbyte_raw_id_idx1; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX ticket_airbyte_tmp__airbyte_raw_id_idx1 ON public.ticket USING btree (_airbyte_raw_id);


--
-- TOC entry 4630 (class 1259 OID 19360)
-- Name: users_airbyte_tmp__airbyte_extracted_at_idx; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX users_airbyte_tmp__airbyte_extracted_at_idx ON public.users USING btree (_airbyte_extracted_at);


--
-- TOC entry 4631 (class 1259 OID 19361)
-- Name: users_airbyte_tmp__airbyte_raw_id_idx; Type: INDEX; Schema: public; Owner: replica_user
--

CREATE INDEX users_airbyte_tmp__airbyte_raw_id_idx ON public.users USING btree (_airbyte_raw_id);


--
-- TOC entry 4635 (class 2620 OID 16638)
-- Name: notifications limit_notifications_trigger; Type: TRIGGER; Schema: public; Owner: replica_user
--

CREATE TRIGGER limit_notifications_trigger AFTER INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.limit_notifications();


--
-- TOC entry 4632 (class 2606 OID 16644)
-- Name: commande commande_idmarque_fkey; Type: FK CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.commande
    ADD CONSTRAINT commande_idmarque_fkey FOREIGN KEY (idmarque) REFERENCES public.marque(idmarque) ON DELETE CASCADE;


--
-- TOC entry 4633 (class 2606 OID 16664)
-- Name: parc parc_iddep_fkey; Type: FK CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.parc
    ADD CONSTRAINT parc_iddep_fkey FOREIGN KEY (iddep) REFERENCES public.departement(iddep) ON DELETE CASCADE;


--
-- TOC entry 4634 (class 2606 OID 16669)
-- Name: pda_application pda_application_idapp_fkey; Type: FK CONSTRAINT; Schema: public; Owner: replica_user
--

ALTER TABLE ONLY public.pda_application
    ADD CONSTRAINT pda_application_idapp_fkey FOREIGN KEY (idapp) REFERENCES public.application(idapp);


--
-- TOC entry 4825 (class 0 OID 0)
-- Dependencies: 18
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO replica_user;


--
-- TOC entry 4831 (class 0 OID 0)
-- Dependencies: 504
-- Name: SEQUENCE information_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,USAGE ON SEQUENCE public.information_id_seq TO replica_user;


--
-- TOC entry 2427 (class 826 OID 16745)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,USAGE ON SEQUENCES TO replica_user;


--
-- TOC entry 2426 (class 826 OID 16729)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO replica_user;


-- Completed on 2025-05-21 15:57:31

--
-- PostgreSQL database dump complete
--

