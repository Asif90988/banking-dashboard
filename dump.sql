--
-- PostgreSQL database dump
--

-- Dumped from database version 14.18 (Homebrew)
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: asif
--

CREATE TABLE public.activities (
    id integer NOT NULL,
    type character varying(100) NOT NULL,
    description text NOT NULL,
    svp_id integer,
    project_id integer,
    priority character varying(20) DEFAULT 'Medium'::character varying,
    status character varying(50) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.activities OWNER TO asif;

--
-- Name: activities_id_seq; Type: SEQUENCE; Schema: public; Owner: asif
--

CREATE SEQUENCE public.activities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.activities_id_seq OWNER TO asif;

--
-- Name: activities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asif
--

ALTER SEQUENCE public.activities_id_seq OWNED BY public.activities.id;


--
-- Name: budget_allocations; Type: TABLE; Schema: public; Owner: asif
--

CREATE TABLE public.budget_allocations (
    id integer NOT NULL,
    budget_source_id integer,
    svp_id integer,
    allocated_amount numeric(15,2) NOT NULL,
    spent_amount numeric(15,2) DEFAULT 0,
    allocation_date date DEFAULT CURRENT_DATE,
    notes text,
    created_by character varying(100) DEFAULT 'Alex Rodriguez'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.budget_allocations OWNER TO asif;

--
-- Name: budget_allocations_id_seq; Type: SEQUENCE; Schema: public; Owner: asif
--

CREATE SEQUENCE public.budget_allocations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.budget_allocations_id_seq OWNER TO asif;

--
-- Name: budget_allocations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asif
--

ALTER SEQUENCE public.budget_allocations_id_seq OWNED BY public.budget_allocations.id;


--
-- Name: budget_sources; Type: TABLE; Schema: public; Owner: asif
--

CREATE TABLE public.budget_sources (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    source_type character varying(50) NOT NULL,
    total_amount numeric(15,2) NOT NULL,
    allocated_amount numeric(15,2) DEFAULT 0,
    remaining_amount numeric(15,2) DEFAULT 0,
    fiscal_year integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.budget_sources OWNER TO asif;

--
-- Name: budget_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: asif
--

CREATE SEQUENCE public.budget_sources_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.budget_sources_id_seq OWNER TO asif;

--
-- Name: budget_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asif
--

ALTER SEQUENCE public.budget_sources_id_seq OWNED BY public.budget_sources.id;


--
-- Name: compliance_metrics; Type: TABLE; Schema: public; Owner: asif
--

CREATE TABLE public.compliance_metrics (
    id integer NOT NULL,
    project_id integer,
    metric_type character varying(100),
    status character varying(50),
    last_audit_date date,
    next_audit_date date,
    findings text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.compliance_metrics OWNER TO asif;

--
-- Name: compliance_metrics_id_seq; Type: SEQUENCE; Schema: public; Owner: asif
--

CREATE SEQUENCE public.compliance_metrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.compliance_metrics_id_seq OWNER TO asif;

--
-- Name: compliance_metrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asif
--

ALTER SEQUENCE public.compliance_metrics_id_seq OWNED BY public.compliance_metrics.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: asif
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    svp_id integer,
    vp_id integer,
    status character varying(50) NOT NULL,
    completion_percentage integer DEFAULT 0,
    next_milestone character varying(200),
    compliance_status character varying(50) DEFAULT 'Pending'::character varying,
    budget_allocated numeric(15,2),
    budget_spent numeric(15,2) DEFAULT 0,
    start_date date,
    end_date date,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.projects OWNER TO asif;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: asif
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO asif;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asif
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: regulatory_calendar; Type: TABLE; Schema: public; Owner: asif
--

CREATE TABLE public.regulatory_calendar (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    deadline_date date NOT NULL,
    type character varying(100),
    status character varying(50) DEFAULT 'Pending'::character varying,
    svp_id integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.regulatory_calendar OWNER TO asif;

--
-- Name: regulatory_calendar_id_seq; Type: SEQUENCE; Schema: public; Owner: asif
--

CREATE SEQUENCE public.regulatory_calendar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.regulatory_calendar_id_seq OWNER TO asif;

--
-- Name: regulatory_calendar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asif
--

ALTER SEQUENCE public.regulatory_calendar_id_seq OWNED BY public.regulatory_calendar.id;


--
-- Name: risk_issues; Type: TABLE; Schema: public; Owner: asif
--

CREATE TABLE public.risk_issues (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    risk_level character varying(20),
    impact_level character varying(20),
    probability character varying(20),
    svp_id integer,
    project_id integer,
    status character varying(50) DEFAULT 'Open'::character varying,
    owner character varying(100),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.risk_issues OWNER TO asif;

--
-- Name: risk_issues_id_seq; Type: SEQUENCE; Schema: public; Owner: asif
--

CREATE SEQUENCE public.risk_issues_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.risk_issues_id_seq OWNER TO asif;

--
-- Name: risk_issues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asif
--

ALTER SEQUENCE public.risk_issues_id_seq OWNED BY public.risk_issues.id;


--
-- Name: svps; Type: TABLE; Schema: public; Owner: asif
--

CREATE TABLE public.svps (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    department character varying(100) NOT NULL,
    email character varying(100),
    budget_allocated numeric(15,2) NOT NULL,
    budget_spent numeric(15,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.svps OWNER TO asif;

--
-- Name: svps_id_seq; Type: SEQUENCE; Schema: public; Owner: asif
--

CREATE SEQUENCE public.svps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.svps_id_seq OWNER TO asif;

--
-- Name: svps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asif
--

ALTER SEQUENCE public.svps_id_seq OWNED BY public.svps.id;


--
-- Name: vps; Type: TABLE; Schema: public; Owner: asif
--

CREATE TABLE public.vps (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    svp_id integer,
    department character varying(100),
    email character varying(100),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.vps OWNER TO asif;

--
-- Name: vps_id_seq; Type: SEQUENCE; Schema: public; Owner: asif
--

CREATE SEQUENCE public.vps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.vps_id_seq OWNER TO asif;

--
-- Name: vps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: asif
--

ALTER SEQUENCE public.vps_id_seq OWNED BY public.vps.id;


--
-- Name: activities id; Type: DEFAULT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.activities ALTER COLUMN id SET DEFAULT nextval('public.activities_id_seq'::regclass);


--
-- Name: budget_allocations id; Type: DEFAULT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.budget_allocations ALTER COLUMN id SET DEFAULT nextval('public.budget_allocations_id_seq'::regclass);


--
-- Name: budget_sources id; Type: DEFAULT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.budget_sources ALTER COLUMN id SET DEFAULT nextval('public.budget_sources_id_seq'::regclass);


--
-- Name: compliance_metrics id; Type: DEFAULT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.compliance_metrics ALTER COLUMN id SET DEFAULT nextval('public.compliance_metrics_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: regulatory_calendar id; Type: DEFAULT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.regulatory_calendar ALTER COLUMN id SET DEFAULT nextval('public.regulatory_calendar_id_seq'::regclass);


--
-- Name: risk_issues id; Type: DEFAULT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.risk_issues ALTER COLUMN id SET DEFAULT nextval('public.risk_issues_id_seq'::regclass);


--
-- Name: svps id; Type: DEFAULT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.svps ALTER COLUMN id SET DEFAULT nextval('public.svps_id_seq'::regclass);


--
-- Name: vps id; Type: DEFAULT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.vps ALTER COLUMN id SET DEFAULT nextval('public.vps_id_seq'::regclass);


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: asif
--

COPY public.activities (id, type, description, svp_id, project_id, priority, status, created_at) FROM stdin;
1	Budget Review	Q4 budget reallocation approved for regulatory compliance	1	1	high	Completed	2025-07-08 21:55:05.386463
2	Risk Assessment	New vendor risk evaluation completed	2	2	medium	Completed	2025-07-08 19:55:05.386463
3	Project Update	Monthly status report submitted	3	3	low	Completed	2025-07-08 17:55:05.386463
4	Compliance Audit	Annual compliance audit initiated	1	1	high	In Progress	2025-07-07 23:55:05.386463
5	System Deployment	AML monitoring system deployed to production	3	3	high	Completed	2025-07-06 23:55:05.386463
6	Training Session	KYC team training on new processes	4	4	medium	Completed	2025-07-05 23:55:05.386463
7	Security Review	Cybersecurity assessment completed	5	5	high	Completed	2025-07-03 23:55:05.386463
8	Framework Update	Operational risk framework updated	6	6	medium	In Progress	2025-07-01 23:55:05.386463
9	Policy Review	Regulatory policy review and updates	1	1	low	Pending	2025-07-01 23:55:05.386463
10	Data Migration	Legacy system data migration completed	2	2	high	Completed	2025-06-28 23:55:05.386463
11	Budget Review	Q4 budget reallocation approved for regulatory compliance	1	1	high	Completed	2025-07-08 22:01:47.881844
12	Risk Assessment	New vendor risk evaluation completed	2	2	medium	Completed	2025-07-08 20:01:47.881844
13	Project Update	Monthly status report submitted	3	3	low	Completed	2025-07-08 18:01:47.881844
14	Compliance Audit	Annual compliance audit initiated	1	1	high	In Progress	2025-07-08 00:01:47.881844
15	System Deployment	AML monitoring system deployed to production	3	3	high	Completed	2025-07-07 00:01:47.881844
16	Training Session	KYC team training on new processes	4	4	medium	Completed	2025-07-06 00:01:47.881844
17	Security Review	Cybersecurity assessment completed	5	5	high	Completed	2025-07-04 00:01:47.881844
18	Framework Update	Operational risk framework updated	6	6	medium	In Progress	2025-07-02 00:01:47.881844
19	Policy Review	Regulatory policy review and updates	1	1	low	Pending	2025-07-02 00:01:47.881844
20	Data Migration	Legacy system data migration completed	2	2	high	Completed	2025-06-29 00:01:47.881844
\.


--
-- Data for Name: budget_allocations; Type: TABLE DATA; Schema: public; Owner: asif
--

COPY public.budget_allocations (id, budget_source_id, svp_id, allocated_amount, spent_amount, allocation_date, notes, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: budget_sources; Type: TABLE DATA; Schema: public; Owner: asif
--

COPY public.budget_sources (id, name, description, source_type, total_amount, allocated_amount, remaining_amount, fiscal_year, created_at, updated_at) FROM stdin;
1	Corporate Risk Budget	Annual corporate risk management budget allocation	Corporate	8000000.00	6500000.00	1500000.00	2024	2025-07-08 17:54:59.824704	2025-07-08 17:54:59.824704
2	Regulatory Compliance Fund	Budget for regulatory compliance initiatives	Regulatory	5000000.00	4200000.00	800000.00	2024	2025-07-08 17:54:59.824704	2025-07-08 17:54:59.824704
3	Technology Infrastructure	IT infrastructure and security budget	Technology	6500000.00	5100000.00	1400000.00	2024	2025-07-08 17:54:59.824704	2025-07-08 17:54:59.824704
4	AML Enhancement Program	Dedicated AML system enhancement budget	AML	3500000.00	2900000.00	600000.00	2024	2025-07-08 17:54:59.824704	2025-07-08 17:54:59.824704
5	Emergency Response Fund	Emergency budget for critical compliance issues	Emergency	2000000.00	400000.00	1600000.00	2024	2025-07-08 17:54:59.824704	2025-07-08 17:54:59.824704
6	Corporate Risk Budget	Annual corporate risk management budget allocation	Corporate	8000000.00	6500000.00	1500000.00	2024	2025-07-08 23:55:05.383657	2025-07-08 23:55:05.383657
7	Regulatory Compliance Fund	Budget for regulatory compliance initiatives	Regulatory	5000000.00	4200000.00	800000.00	2024	2025-07-08 23:55:05.383657	2025-07-08 23:55:05.383657
8	Technology Infrastructure	IT infrastructure and security budget	Technology	6500000.00	5100000.00	1400000.00	2024	2025-07-08 23:55:05.383657	2025-07-08 23:55:05.383657
9	AML Enhancement Program	Dedicated AML system enhancement budget	AML	3500000.00	2900000.00	600000.00	2024	2025-07-08 23:55:05.383657	2025-07-08 23:55:05.383657
10	Emergency Response Fund	Emergency budget for critical compliance issues	Emergency	2000000.00	400000.00	1600000.00	2024	2025-07-08 23:55:05.383657	2025-07-08 23:55:05.383657
11	Corporate Risk Budget	Annual corporate risk management budget allocation	Corporate	8000000.00	6500000.00	1500000.00	2024	2025-07-09 00:01:47.879181	2025-07-09 00:01:47.879181
12	Regulatory Compliance Fund	Budget for regulatory compliance initiatives	Regulatory	5000000.00	4200000.00	800000.00	2024	2025-07-09 00:01:47.879181	2025-07-09 00:01:47.879181
13	Technology Infrastructure	IT infrastructure and security budget	Technology	6500000.00	5100000.00	1400000.00	2024	2025-07-09 00:01:47.879181	2025-07-09 00:01:47.879181
14	AML Enhancement Program	Dedicated AML system enhancement budget	AML	3500000.00	2900000.00	600000.00	2024	2025-07-09 00:01:47.879181	2025-07-09 00:01:47.879181
15	Emergency Response Fund	Emergency budget for critical compliance issues	Emergency	2000000.00	400000.00	1600000.00	2024	2025-07-09 00:01:47.879181	2025-07-09 00:01:47.879181
\.


--
-- Data for Name: compliance_metrics; Type: TABLE DATA; Schema: public; Owner: asif
--

COPY public.compliance_metrics (id, project_id, metric_type, status, last_audit_date, next_audit_date, findings, created_at) FROM stdin;
1	1	Regulatory Compliance	Compliant	2024-01-15	2024-04-15	All regulatory requirements met	2025-07-08 23:55:05.390794
2	2	Risk Management	Compliant	2024-01-20	2024-04-20	Risk controls operating effectively	2025-07-08 23:55:05.390794
3	3	AML Compliance	Compliant	2024-01-25	2024-04-25	AML procedures fully implemented	2025-07-08 23:55:05.390794
4	4	KYC Compliance	Under Review	2024-02-01	2024-05-01	Minor documentation updates required	2025-07-08 23:55:05.390794
5	5	Technology Risk	Non-Compliant	2024-02-05	2024-05-05	Security vulnerabilities identified	2025-07-08 23:55:05.390794
6	6	Operational Risk	Compliant	2024-02-10	2024-05-10	Operational controls adequate	2025-07-08 23:55:05.390794
7	1	Regulatory Compliance	Compliant	2024-01-15	2024-04-15	All regulatory requirements met	2025-07-09 00:01:47.884458
8	2	Risk Management	Compliant	2024-01-20	2024-04-20	Risk controls operating effectively	2025-07-09 00:01:47.884458
9	3	AML Compliance	Compliant	2024-01-25	2024-04-25	AML procedures fully implemented	2025-07-09 00:01:47.884458
10	4	KYC Compliance	Under Review	2024-02-01	2024-05-01	Minor documentation updates required	2025-07-09 00:01:47.884458
11	5	Technology Risk	Non-Compliant	2024-02-05	2024-05-05	Security vulnerabilities identified	2025-07-09 00:01:47.884458
12	6	Operational Risk	Compliant	2024-02-10	2024-05-10	Operational controls adequate	2025-07-09 00:01:47.884458
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: asif
--

COPY public.projects (id, name, description, svp_id, vp_id, status, completion_percentage, next_milestone, compliance_status, budget_allocated, budget_spent, start_date, end_date, created_at) FROM stdin;
1	LATAM Regulatory Framework	Implementation of unified regulatory framework across LATAM	1	1	On Track	72	Phase 3 Implementation	Compliant	950000.00	684000.00	2024-01-15	2024-12-31	2025-07-08 17:54:59.825482
2	Enterprise Risk Dashboard	Comprehensive risk monitoring and reporting system	2	3	On Track	68	User Acceptance Testing	Compliant	1200000.00	816000.00	2024-01-01	2024-12-15	2025-07-08 17:54:59.825482
3	AML Transaction Monitoring	Enhanced AML transaction monitoring system	3	5	On Track	75	Phase 2 Deployment	Compliant	1100000.00	825000.00	2024-01-01	2024-11-30	2025-07-08 17:54:59.825482
4	KYC Digital Transformation	End-to-end KYC process digitization	4	7	On Track	54	Phase 1 Testing	Compliant	890000.00	480600.00	2024-01-15	2025-01-31	2025-07-08 17:54:59.825482
5	Cybersecurity Enhancement	Advanced cybersecurity monitoring and response	5	9	At Risk	45	Security Assessment	Non-Compliant	1800000.00	810000.00	2024-01-01	2024-12-31	2025-07-08 17:54:59.825482
6	Operational Risk Framework	Comprehensive operational risk management system	6	11	On Track	61	Framework Testing	Compliant	740000.00	451400.00	2024-01-01	2024-12-15	2025-07-08 17:54:59.825482
7	LATAM Regulatory Framework	Implementation of unified regulatory framework across LATAM	1	1	On Track	72	Phase 3 Implementation	Compliant	950000.00	684000.00	2024-01-15	2024-12-31	2025-07-08 23:55:05.385202
8	Enterprise Risk Dashboard	Comprehensive risk monitoring and reporting system	2	3	On Track	68	User Acceptance Testing	Compliant	1200000.00	816000.00	2024-01-01	2024-12-15	2025-07-08 23:55:05.385202
9	AML Transaction Monitoring	Enhanced AML transaction monitoring system	3	5	On Track	75	Phase 2 Deployment	Compliant	1100000.00	825000.00	2024-01-01	2024-11-30	2025-07-08 23:55:05.385202
10	KYC Digital Transformation	End-to-end KYC process digitization	4	7	On Track	54	Phase 1 Testing	Compliant	890000.00	480600.00	2024-01-15	2025-01-31	2025-07-08 23:55:05.385202
11	Cybersecurity Enhancement	Advanced cybersecurity monitoring and response	5	9	At Risk	45	Security Assessment	Non-Compliant	1800000.00	810000.00	2024-01-01	2024-12-31	2025-07-08 23:55:05.385202
12	Operational Risk Framework	Comprehensive operational risk management system	6	11	On Track	61	Framework Testing	Compliant	740000.00	451400.00	2024-01-01	2024-12-15	2025-07-08 23:55:05.385202
13	LATAM Regulatory Framework	Implementation of unified regulatory framework across LATAM	1	1	On Track	72	Phase 3 Implementation	Compliant	950000.00	684000.00	2024-01-15	2024-12-31	2025-07-09 00:01:47.879766
14	Enterprise Risk Dashboard	Comprehensive risk monitoring and reporting system	2	3	On Track	68	User Acceptance Testing	Compliant	1200000.00	816000.00	2024-01-01	2024-12-15	2025-07-09 00:01:47.879766
15	AML Transaction Monitoring	Enhanced AML transaction monitoring system	3	5	On Track	75	Phase 2 Deployment	Compliant	1100000.00	825000.00	2024-01-01	2024-11-30	2025-07-09 00:01:47.879766
16	KYC Digital Transformation	End-to-end KYC process digitization	4	7	On Track	54	Phase 1 Testing	Compliant	890000.00	480600.00	2024-01-15	2025-01-31	2025-07-09 00:01:47.879766
17	Cybersecurity Enhancement	Advanced cybersecurity monitoring and response	5	9	At Risk	45	Security Assessment	Non-Compliant	1800000.00	810000.00	2024-01-01	2024-12-31	2025-07-09 00:01:47.879766
18	Operational Risk Framework	Comprehensive operational risk management system	6	11	On Track	61	Framework Testing	Compliant	740000.00	451400.00	2024-01-01	2024-12-15	2025-07-09 00:01:47.879766
\.


--
-- Data for Name: regulatory_calendar; Type: TABLE DATA; Schema: public; Owner: asif
--

COPY public.regulatory_calendar (id, title, description, deadline_date, type, status, svp_id, created_at) FROM stdin;
\.


--
-- Data for Name: risk_issues; Type: TABLE DATA; Schema: public; Owner: asif
--

COPY public.risk_issues (id, title, description, risk_level, impact_level, probability, svp_id, project_id, status, owner, created_at) FROM stdin;
1	Cybersecurity	Potential data breach vulnerabilities in legacy systems	High	High	Medium	5	5	Open	Priya Singh	2025-07-08 23:55:05.392291
2	Regulatory Compliance	New regulatory requirements may impact current processes	Medium	High	Low	1	1	Open	Vinod Kumar	2025-07-08 23:55:05.392291
3	Data Governance	Inconsistent data quality across reporting systems	Medium	Medium	Medium	2	2	Open	Sandeep Sharma	2025-07-08 23:55:05.392291
4	Operational	Manual processes creating operational inefficiencies	Low	Medium	High	6	6	Open	Amit Gupta	2025-07-08 23:55:05.392291
5	Financial	Budget overruns in technology infrastructure projects	Medium	High	Medium	5	5	Open	Priya Singh	2025-07-08 23:55:05.392291
6	Cybersecurity	Potential data breach vulnerabilities in legacy systems	High	High	Medium	5	5	Open	Priya Singh	2025-07-09 00:01:47.885424
7	Regulatory Compliance	New regulatory requirements may impact current processes	Medium	High	Low	1	1	Open	Vinod Kumar	2025-07-09 00:01:47.885424
8	Data Governance	Inconsistent data quality across reporting systems	Medium	Medium	Medium	2	2	Open	Sandeep Sharma	2025-07-09 00:01:47.885424
9	Operational	Manual processes creating operational inefficiencies	Low	Medium	High	6	6	Open	Amit Gupta	2025-07-09 00:01:47.885424
10	Financial	Budget overruns in technology infrastructure projects	Medium	High	Medium	5	5	Open	Priya Singh	2025-07-09 00:01:47.885424
\.


--
-- Data for Name: svps; Type: TABLE DATA; Schema: public; Owner: asif
--

COPY public.svps (id, name, department, email, budget_allocated, budget_spent, created_at, updated_at) FROM stdin;
1	Vinod Kumar	Regulatory Compliance	vinod.kumar@citi.com	3200000.00	2240000.00	2025-07-08 17:54:59.800334	2025-07-08 17:54:59.800334
2	Sandeep Sharma	Risk Management	sandeep.sharma@citi.com	3800000.00	2660000.00	2025-07-08 17:54:59.800334	2025-07-08 17:54:59.800334
3	Manju Patel	AML Operations	manju.patel@citi.com	2900000.00	2030000.00	2025-07-08 17:54:59.800334	2025-07-08 17:54:59.800334
4	Raj Mehta	KYC Compliance	raj.mehta@citi.com	2600000.00	1820000.00	2025-07-08 17:54:59.800334	2025-07-08 17:54:59.800334
5	Priya Singh	Technology Risk	priya.singh@citi.com	4200000.00	2940000.00	2025-07-08 17:54:59.800334	2025-07-08 17:54:59.800334
6	Amit Gupta	Operational Risk	amit.gupta@citi.com	2800000.00	1960000.00	2025-07-08 17:54:59.800334	2025-07-08 17:54:59.800334
7	Vinod Kumar	Regulatory Compliance	vinod.kumar@citi.com	3200000.00	2240000.00	2025-07-08 23:55:05.371034	2025-07-08 23:55:05.371034
8	Sandeep Sharma	Risk Management	sandeep.sharma@citi.com	3800000.00	2660000.00	2025-07-08 23:55:05.371034	2025-07-08 23:55:05.371034
9	Manju Patel	AML Operations	manju.patel@citi.com	2900000.00	2030000.00	2025-07-08 23:55:05.371034	2025-07-08 23:55:05.371034
10	Raj Mehta	KYC Compliance	raj.mehta@citi.com	2600000.00	1820000.00	2025-07-08 23:55:05.371034	2025-07-08 23:55:05.371034
11	Priya Singh	Technology Risk	priya.singh@citi.com	4200000.00	2940000.00	2025-07-08 23:55:05.371034	2025-07-08 23:55:05.371034
12	Amit Gupta	Operational Risk	amit.gupta@citi.com	2800000.00	1960000.00	2025-07-08 23:55:05.371034	2025-07-08 23:55:05.371034
13	Vinod Kumar	Regulatory Compliance	vinod.kumar@citi.com	3200000.00	2240000.00	2025-07-09 00:01:47.867237	2025-07-09 00:01:47.867237
14	Sandeep Sharma	Risk Management	sandeep.sharma@citi.com	3800000.00	2660000.00	2025-07-09 00:01:47.867237	2025-07-09 00:01:47.867237
15	Manju Patel	AML Operations	manju.patel@citi.com	2900000.00	2030000.00	2025-07-09 00:01:47.867237	2025-07-09 00:01:47.867237
16	Raj Mehta	KYC Compliance	raj.mehta@citi.com	2600000.00	1820000.00	2025-07-09 00:01:47.867237	2025-07-09 00:01:47.867237
17	Priya Singh	Technology Risk	priya.singh@citi.com	4200000.00	2940000.00	2025-07-09 00:01:47.867237	2025-07-09 00:01:47.867237
18	Amit Gupta	Operational Risk	amit.gupta@citi.com	2800000.00	1960000.00	2025-07-09 00:01:47.867237	2025-07-09 00:01:47.867237
\.


--
-- Data for Name: vps; Type: TABLE DATA; Schema: public; Owner: asif
--

COPY public.vps (id, name, svp_id, department, email, created_at) FROM stdin;
1	Ravi Joshi	1	Regulatory Compliance	ravi.joshi@citi.com	2025-07-08 17:54:59.818727
2	Neha Agarwal	1	Regulatory Compliance	neha.agarwal@citi.com	2025-07-08 17:54:59.818727
3	Suresh Reddy	2	Risk Management	suresh.reddy@citi.com	2025-07-08 17:54:59.818727
4	Kavita Nair	2	Risk Management	kavita.nair@citi.com	2025-07-08 17:54:59.818727
5	Deepak Jain	3	AML Operations	deepak.jain@citi.com	2025-07-08 17:54:59.818727
6	Sneha Kapoor	3	AML Operations	sneha.kapoor@citi.com	2025-07-08 17:54:59.818727
7	Vikram Rao	4	KYC Compliance	vikram.rao@citi.com	2025-07-08 17:54:59.818727
8	Pooja Verma	4	KYC Compliance	pooja.verma@citi.com	2025-07-08 17:54:59.818727
9	Arjun Malhotra	5	Technology Risk	arjun.malhotra@citi.com	2025-07-08 17:54:59.818727
10	Divya Iyer	5	Technology Risk	divya.iyer@citi.com	2025-07-08 17:54:59.818727
11	Rohit Bansal	6	Operational Risk	rohit.bansal@citi.com	2025-07-08 17:54:59.818727
12	Anjali Saxena	6	Operational Risk	anjali.saxena@citi.com	2025-07-08 17:54:59.818727
13	Ravi Joshi	1	Regulatory Compliance	ravi.joshi@citi.com	2025-07-08 23:55:05.379359
14	Neha Agarwal	1	Regulatory Compliance	neha.agarwal@citi.com	2025-07-08 23:55:05.379359
15	Suresh Reddy	2	Risk Management	suresh.reddy@citi.com	2025-07-08 23:55:05.379359
16	Kavita Nair	2	Risk Management	kavita.nair@citi.com	2025-07-08 23:55:05.379359
17	Deepak Jain	3	AML Operations	deepak.jain@citi.com	2025-07-08 23:55:05.379359
18	Sneha Kapoor	3	AML Operations	sneha.kapoor@citi.com	2025-07-08 23:55:05.379359
19	Vikram Rao	4	KYC Compliance	vikram.rao@citi.com	2025-07-08 23:55:05.379359
20	Pooja Verma	4	KYC Compliance	pooja.verma@citi.com	2025-07-08 23:55:05.379359
21	Arjun Malhotra	5	Technology Risk	arjun.malhotra@citi.com	2025-07-08 23:55:05.379359
22	Divya Iyer	5	Technology Risk	divya.iyer@citi.com	2025-07-08 23:55:05.379359
23	Rohit Bansal	6	Operational Risk	rohit.bansal@citi.com	2025-07-08 23:55:05.379359
24	Anjali Saxena	6	Operational Risk	anjali.saxena@citi.com	2025-07-08 23:55:05.379359
25	Ravi Joshi	1	Regulatory Compliance	ravi.joshi@citi.com	2025-07-09 00:01:47.876681
26	Neha Agarwal	1	Regulatory Compliance	neha.agarwal@citi.com	2025-07-09 00:01:47.876681
27	Suresh Reddy	2	Risk Management	suresh.reddy@citi.com	2025-07-09 00:01:47.876681
28	Kavita Nair	2	Risk Management	kavita.nair@citi.com	2025-07-09 00:01:47.876681
29	Deepak Jain	3	AML Operations	deepak.jain@citi.com	2025-07-09 00:01:47.876681
30	Sneha Kapoor	3	AML Operations	sneha.kapoor@citi.com	2025-07-09 00:01:47.876681
31	Vikram Rao	4	KYC Compliance	vikram.rao@citi.com	2025-07-09 00:01:47.876681
32	Pooja Verma	4	KYC Compliance	pooja.verma@citi.com	2025-07-09 00:01:47.876681
33	Arjun Malhotra	5	Technology Risk	arjun.malhotra@citi.com	2025-07-09 00:01:47.876681
34	Divya Iyer	5	Technology Risk	divya.iyer@citi.com	2025-07-09 00:01:47.876681
35	Rohit Bansal	6	Operational Risk	rohit.bansal@citi.com	2025-07-09 00:01:47.876681
36	Anjali Saxena	6	Operational Risk	anjali.saxena@citi.com	2025-07-09 00:01:47.876681
\.


--
-- Name: activities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asif
--

SELECT pg_catalog.setval('public.activities_id_seq', 20, true);


--
-- Name: budget_allocations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asif
--

SELECT pg_catalog.setval('public.budget_allocations_id_seq', 1, false);


--
-- Name: budget_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asif
--

SELECT pg_catalog.setval('public.budget_sources_id_seq', 15, true);


--
-- Name: compliance_metrics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asif
--

SELECT pg_catalog.setval('public.compliance_metrics_id_seq', 12, true);


--
-- Name: projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asif
--

SELECT pg_catalog.setval('public.projects_id_seq', 18, true);


--
-- Name: regulatory_calendar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asif
--

SELECT pg_catalog.setval('public.regulatory_calendar_id_seq', 1, false);


--
-- Name: risk_issues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asif
--

SELECT pg_catalog.setval('public.risk_issues_id_seq', 10, true);


--
-- Name: svps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asif
--

SELECT pg_catalog.setval('public.svps_id_seq', 18, true);


--
-- Name: vps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: asif
--

SELECT pg_catalog.setval('public.vps_id_seq', 36, true);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: budget_allocations budget_allocations_pkey; Type: CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.budget_allocations
    ADD CONSTRAINT budget_allocations_pkey PRIMARY KEY (id);


--
-- Name: budget_sources budget_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.budget_sources
    ADD CONSTRAINT budget_sources_pkey PRIMARY KEY (id);


--
-- Name: compliance_metrics compliance_metrics_pkey; Type: CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.compliance_metrics
    ADD CONSTRAINT compliance_metrics_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: regulatory_calendar regulatory_calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.regulatory_calendar
    ADD CONSTRAINT regulatory_calendar_pkey PRIMARY KEY (id);


--
-- Name: risk_issues risk_issues_pkey; Type: CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.risk_issues
    ADD CONSTRAINT risk_issues_pkey PRIMARY KEY (id);


--
-- Name: svps svps_pkey; Type: CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.svps
    ADD CONSTRAINT svps_pkey PRIMARY KEY (id);


--
-- Name: vps vps_pkey; Type: CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.vps
    ADD CONSTRAINT vps_pkey PRIMARY KEY (id);


--
-- Name: idx_activities_created; Type: INDEX; Schema: public; Owner: asif
--

CREATE INDEX idx_activities_created ON public.activities USING btree (created_at);


--
-- Name: idx_activities_svp; Type: INDEX; Schema: public; Owner: asif
--

CREATE INDEX idx_activities_svp ON public.activities USING btree (svp_id);


--
-- Name: idx_budget_allocations_svp; Type: INDEX; Schema: public; Owner: asif
--

CREATE INDEX idx_budget_allocations_svp ON public.budget_allocations USING btree (svp_id);


--
-- Name: idx_projects_status; Type: INDEX; Schema: public; Owner: asif
--

CREATE INDEX idx_projects_status ON public.projects USING btree (status);


--
-- Name: idx_projects_svp; Type: INDEX; Schema: public; Owner: asif
--

CREATE INDEX idx_projects_svp ON public.projects USING btree (svp_id);


--
-- Name: activities activities_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: activities activities_svp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_svp_id_fkey FOREIGN KEY (svp_id) REFERENCES public.svps(id);


--
-- Name: budget_allocations budget_allocations_budget_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.budget_allocations
    ADD CONSTRAINT budget_allocations_budget_source_id_fkey FOREIGN KEY (budget_source_id) REFERENCES public.budget_sources(id);


--
-- Name: budget_allocations budget_allocations_svp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.budget_allocations
    ADD CONSTRAINT budget_allocations_svp_id_fkey FOREIGN KEY (svp_id) REFERENCES public.svps(id);


--
-- Name: compliance_metrics compliance_metrics_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.compliance_metrics
    ADD CONSTRAINT compliance_metrics_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: projects projects_svp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_svp_id_fkey FOREIGN KEY (svp_id) REFERENCES public.svps(id);


--
-- Name: projects projects_vp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_vp_id_fkey FOREIGN KEY (vp_id) REFERENCES public.vps(id);


--
-- Name: regulatory_calendar regulatory_calendar_svp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.regulatory_calendar
    ADD CONSTRAINT regulatory_calendar_svp_id_fkey FOREIGN KEY (svp_id) REFERENCES public.svps(id);


--
-- Name: risk_issues risk_issues_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.risk_issues
    ADD CONSTRAINT risk_issues_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: risk_issues risk_issues_svp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.risk_issues
    ADD CONSTRAINT risk_issues_svp_id_fkey FOREIGN KEY (svp_id) REFERENCES public.svps(id);


--
-- Name: vps vps_svp_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: asif
--

ALTER TABLE ONLY public.vps
    ADD CONSTRAINT vps_svp_id_fkey FOREIGN KEY (svp_id) REFERENCES public.svps(id);


--
-- PostgreSQL database dump complete
--

