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
-- Data for Name: budget_allocations; Type: TABLE DATA; Schema: public; Owner: asif
--

COPY public.budget_allocations (id, budget_source_id, svp_id, allocated_amount, spent_amount, allocation_date, notes, created_by, created_at, updated_at) FROM stdin;
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
-- PostgreSQL database dump complete
--

