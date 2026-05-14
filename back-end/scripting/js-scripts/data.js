/**
 * ITMP Data Service — data.js
 * All data is embedded inline (no fetch/server required — works on file://).
 * Edit JOBS_DATA or ACCOUNTS_DATA below to add/change listings or users.
 */

// ─────────────────────────────────────────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────────────────────────────────────────
const JOBS_DATA = { "jobs": [
  {
    "id": "job_001", "title": "Senior Frontend Developer", "company": "TechSolutions Inc.",
    "company_initials": "TS", "company_about": "TechSolutions Inc. is a leading software company specialising in enterprise-grade web platforms. With over 200 engineers across 5 countries, we build tools that power businesses at scale.",
    "company_size": "200-500 employees", "industry": "Software / SaaS", "match_score": 92,
    "location": "Sydney, NSW", "work_mode": "Hybrid", "salary_min": 120000, "salary_max": 140000,
    "salary_display": "$120k - $140k", "job_type": "Full-time",
    "posted_date": "2026-05-08", "expires_date": "2026-06-08", "applications_count": 45,
    "description": "Looking for an experienced React developer to lead our user interface team and build scalable platforms.",
    "full_description": "We are seeking a talented and experienced Senior Frontend Developer to join our growing engineering team. In this role, you will architect and implement complex user interfaces, collaborate closely with product designers, and mentor junior developers.",
    "responsibilities": ["Lead the design and implementation of reusable React component libraries","Collaborate with UX/UI designers to translate wireframes into pixel-perfect interfaces","Conduct code reviews and mentor junior frontend engineers","Drive performance optimisation initiatives across the web platform","Partner with backend engineers to define and integrate REST/GraphQL APIs","Write unit and integration tests using Jest and React Testing Library"],
    "requirements": ["5+ years of professional frontend development experience","Deep expertise in React and the modern JavaScript ecosystem","Strong proficiency in TypeScript","Experience with state management (Redux, Zustand, or similar)","Solid understanding of web performance and accessibility (WCAG 2.1)","Experience with CI/CD pipelines (GitHub Actions, CircleCI)"],
    "nice_to_have": ["Experience with micro-frontend architecture","Familiarity with design systems (Storybook)","GraphQL client experience (Apollo or urql)"],
    "benefits": ["Flexible hybrid work - 2 days in our Sydney CBD office","Annual learning & development budget of $3,000","Equity options after 12-month cliff","Comprehensive private health insurance","Monthly wellness stipend ($150/month)","15 days additional leave on top of statutory entitlements"],
    "skills": [{"name":"JavaScript","required":true},{"name":"React","required":true},{"name":"TypeScript","required":true},{"name":"CSS / Sass","required":false},{"name":"REST APIs","required":false},{"name":"Jest","required":false}]
  },
  {
    "id": "job_002", "title": "Full Stack Engineer", "company": "Innovate Data",
    "company_initials": "ID", "company_about": "Innovate Data is a fast-growing data intelligence company helping enterprises unlock insights from their data pipelines. We are Series B funded with 80 engineers globally.",
    "company_size": "80-200 employees", "industry": "Data & Analytics", "match_score": 85,
    "location": "Remote", "work_mode": "Remote", "salary_min": 110000, "salary_max": 130000,
    "salary_display": "$110k - $130k", "job_type": "Full-time",
    "posted_date": "2026-05-10", "expires_date": "2026-06-10", "applications_count": 72,
    "description": "Join our agile team to build scalable full-stack applications using Python and Node.js for global clients.",
    "full_description": "As a Full Stack Engineer at Innovate Data, you will own features end-to-end from database schema design to polished frontend components. You'll work directly with product managers and data scientists to ship features that process millions of data points daily.",
    "responsibilities": ["Build and maintain scalable backend services in Python (FastAPI / Django)","Develop responsive frontend features using React and TypeScript","Design and optimise PostgreSQL and Redshift data models","Participate in on-call rotations and incident response","Contribute to internal tooling and developer experience improvements","Write technical documentation and RFC proposals for major changes"],
    "requirements": ["3+ years of full-stack engineering experience","Proficiency in Python and at least one JavaScript framework","Strong SQL skills and experience with relational databases","Experience deploying applications on AWS (EC2, RDS, Lambda)","Familiarity with agile/scrum development methodologies"],
    "nice_to_have": ["Experience with data pipeline tools (dbt, Airflow)","Knowledge of containerisation (Docker, Kubernetes)","Open source contributions"],
    "benefits": ["Fully remote - work from anywhere in Australia","Competitive equity package","Home office setup allowance ($2,000 one-time)","$2,500 annual learning budget","Paid parental leave (16 weeks primary, 8 weeks secondary)","Quarterly team offsites in rotating Australian cities"],
    "skills": [{"name":"Python","required":true},{"name":"SQL","required":true},{"name":"React","required":false},{"name":"AWS","required":true},{"name":"Docker","required":false},{"name":"PostgreSQL","required":false}]
  },
  {
    "id": "job_003", "title": "Backend Engineer - Platform", "company": "CloudBase Systems",
    "company_initials": "CB", "company_about": "CloudBase Systems builds developer infrastructure for cloud-native applications. Our platform powers over 10,000 startups and enterprises, processing 50 billion API calls per month.",
    "company_size": "500-1000 employees", "industry": "Cloud Infrastructure", "match_score": 78,
    "location": "Melbourne, VIC", "work_mode": "On-site", "salary_min": 130000, "salary_max": 160000,
    "salary_display": "$130k - $160k", "job_type": "Full-time",
    "posted_date": "2026-05-05", "expires_date": "2026-06-05", "applications_count": 29,
    "description": "Work on high-scale distributed systems that serve millions of developers worldwide.",
    "full_description": "CloudBase Systems is looking for a Backend Engineer to join our Platform team in Melbourne. You will design, build, and scale the core infrastructure services that underpin our entire product.",
    "responsibilities": ["Design and implement high-throughput microservices in Golang","Build and maintain distributed caching and messaging layers (Redis, Kafka)","Improve system observability with structured logging, tracing, and alerting","Work on capacity planning and cost optimisation for our cloud infrastructure","Collaborate with security teams to harden services against vulnerabilities","Mentor mid-level engineers and review technical designs"],
    "requirements": ["4+ years of backend engineering experience","Strong Golang or Java/Kotlin skills","Deep understanding of distributed systems concepts","Experience with Kubernetes and container orchestration","Solid grasp of networking fundamentals (TCP/IP, HTTP/2, gRPC)"],
    "nice_to_have": ["Experience contributing to open source infrastructure projects","Knowledge of eBPF or low-level Linux systems","Prior experience at a high-growth SaaS company"],
    "benefits": ["Generous base salary plus bi-annual bonus","Fully stocked kitchen and catered lunches in Melbourne office","$5,000 annual conference and training budget","Private health and dental for you and your family","20 days additional leave","Relocation assistance available"],
    "skills": [{"name":"Golang","required":true},{"name":"Kubernetes","required":true},{"name":"Distributed Systems","required":true},{"name":"Redis","required":false},{"name":"Kafka","required":false},{"name":"gRPC","required":false}]
  },
  {
    "id": "job_004", "title": "Data Engineer", "company": "FinStream Analytics",
    "company_initials": "FA", "company_about": "FinStream Analytics is a fintech data company providing real-time market intelligence to hedge funds, banks, and retail investors across the Asia-Pacific region.",
    "company_size": "50-80 employees", "industry": "Fintech / Data", "match_score": 70,
    "location": "Sydney, NSW", "work_mode": "Hybrid", "salary_min": 115000, "salary_max": 135000,
    "salary_display": "$115k - $135k", "job_type": "Full-time",
    "posted_date": "2026-05-12", "expires_date": "2026-06-12", "applications_count": 18,
    "description": "Build robust data pipelines and warehousing solutions that power financial analytics at scale.",
    "full_description": "FinStream Analytics is hiring a Data Engineer to help us scale our real-time data infrastructure. You will design and maintain ETL pipelines, work closely with quants and analysts, and ensure data quality across our entire platform.",
    "responsibilities": ["Design, build, and maintain scalable ETL/ELT data pipelines","Manage and optimise our data warehouse (Snowflake / BigQuery)","Collaborate with data scientists to productionise ML models","Implement data quality monitoring and alerting frameworks","Document data lineage and maintain a centralised data catalogue","Support analysts with ad-hoc data requests and dashboard tooling"],
    "requirements": ["3+ years of data engineering experience","Strong SQL and Python skills","Experience with dbt and a modern data stack","Hands-on experience with Airflow or Prefect for orchestration","Familiarity with cloud data warehouses (Snowflake, BigQuery, or Redshift)"],
    "nice_to_have": ["Experience in a financial services context","Knowledge of streaming technologies (Kafka, Flink)","Familiarity with Spark for large-scale batch processing"],
    "benefits": ["Hybrid work from our Sydney CBD office","Annual performance bonus","Learning budget ($2,000/year)","Superannuation above statutory rate (12.5%)","Flexible start times","EAP and mental health support"],
    "skills": [{"name":"Python","required":true},{"name":"SQL","required":true},{"name":"dbt","required":true},{"name":"Airflow","required":false},{"name":"Snowflake","required":false},{"name":"Kafka","required":false}]
  },
  {
    "id": "job_005", "title": "DevOps / Platform Engineer", "company": "Nexus Digital",
    "company_initials": "ND", "company_about": "Nexus Digital is a full-service digital agency delivering web applications and mobile products for Australia's top retail and media brands.",
    "company_size": "100-200 employees", "industry": "Digital Agency", "match_score": 65,
    "location": "Brisbane, QLD", "work_mode": "Hybrid", "salary_min": 105000, "salary_max": 125000,
    "salary_display": "$105k - $125k", "job_type": "Full-time",
    "posted_date": "2026-05-01", "expires_date": "2026-06-01", "applications_count": 34,
    "description": "Own and evolve our CI/CD infrastructure and cloud environments across a diverse portfolio of client projects.",
    "full_description": "Nexus Digital is seeking a DevOps / Platform Engineer to join our infrastructure team. You'll be responsible for building and maintaining CI/CD pipelines, managing multi-cloud environments, and uplifting deployment practices across the agency's client delivery teams.",
    "responsibilities": ["Maintain and improve CI/CD pipelines across GitHub Actions and GitLab CI","Manage AWS and GCP environments using Terraform","Implement and own container orchestration using Kubernetes (EKS/GKE)","Respond to and resolve infrastructure incidents","Uplift deployment practices and coach development teams","Drive IaC adoption and infrastructure-as-code standards"],
    "requirements": ["3+ years of DevOps or Site Reliability Engineering experience","Strong knowledge of AWS or GCP","Hands-on Terraform and Infrastructure-as-Code experience","Experience with Kubernetes in production environments","Scripting skills in Bash and Python"],
    "nice_to_have": ["AWS Certified DevOps Engineer or equivalent certification","Experience with observability stacks (Datadog, Grafana, Prometheus)","Knowledge of GitOps workflows (ArgoCD, Flux)"],
    "benefits": ["Flexible hybrid arrangement","Certification reimbursement (unlimited)","Generous leave package (25 days)","Regular team events and socials","Career progression pathways into leadership"],
    "skills": [{"name":"AWS","required":true},{"name":"Terraform","required":true},{"name":"Kubernetes","required":true},{"name":"Docker","required":false},{"name":"Python","required":false},{"name":"CI/CD","required":false}]
  }
]};

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNTS  (id 1 = logged-in demo user; ids 3-8 = searchable candidates)
// ─────────────────────────────────────────────────────────────────────────────
const ACCOUNTS_DATA = { "users": [
  {
    "id": 1, "password": "hashed_abc123", "full_name": "Jane Doe",
    "avatar_initials": "JD", "avatar_color": "#1a56db",
    "dob": "1995-03-15", "headline": "Software Engineer",
    "bio": "Passionate software engineer with 4 years of experience building high-quality web applications. I thrive in collaborative environments and love tackling complex UI challenges with clean, maintainable code.",
    "contact": { "phone": "+61 400 123 456", "email": "jane.doe@email.com", "linkedin": "linkedin.com/in/janedoe", "github": "github.com/janedoe", "website": "" },
    "location": "Sydney, NSW", "work_mode_preference": "Hybrid",
    "education": [{ "institution": "University of New South Wales", "degree": "Bachelor of Engineering (Software)", "major": "Software Engineering", "start_year": 2013, "end_year": 2017, "gpa": "Distinction Average" }],
    "experience": [
      { "title": "Software Engineer", "company": "BuildSmart Technologies", "location": "Sydney, NSW", "start_date": "2022-01", "end_date": null, "current": true, "description": "Lead frontend development for a suite of project management SaaS tools. Reduced page load times by 40% through code splitting and lazy loading." },
      { "title": "Junior Frontend Developer", "company": "CreativeWeb Agency", "location": "Sydney, NSW", "start_date": "2019-06", "end_date": "2021-12", "current": false, "description": "Developed responsive web interfaces for 15+ client projects. Introduced a React component library adopted across the agency." }
    ],
    "skills": ["JavaScript", "Python", "React", "SQL", "TypeScript", "Node.js", "Git", "REST APIs"],
    "yoe": 4, "is_candidate": true, "is_premium": true,
    "applied_jobs": ["job_001"], "saved_jobs": ["job_002"],
    "profile_views": 34, "resume_filename": "", "resume_upload_date": "",
    "availability": "2 weeks", "joined_date": "2026-01-15",
    "open_to_work": true
  },
  {
    "id": 2, "password": "hashed_xyz789", "full_name": "Marcus Pham",
    "avatar_initials": "MP", "avatar_color": "#0e9f6e",
    "dob": "1990-07-22", "headline": "Senior Data Engineer",
    "bio": "Data engineer with 8 years of experience designing large-scale data pipelines and warehousing solutions. Passionate about the intersection of data quality and analytics engineering.",
    "contact": { "phone": "+61 412 987 654", "email": "m.pham@email.com", "linkedin": "linkedin.com/in/marcuspham", "github": "github.com/marcuspham", "website": "marcuspham.dev" },
    "location": "Melbourne, VIC", "work_mode_preference": "Remote",
    "education": [{ "institution": "Monash University", "degree": "Bachelor of Computer Science", "major": "Data Science", "start_year": 2009, "end_year": 2013, "gpa": "Credit Average" }],
    "experience": [{ "title": "Senior Data Engineer", "company": "DataPeak Solutions", "location": "Melbourne, VIC", "start_date": "2020-03", "end_date": null, "current": true, "description": "Architected and maintained a Snowflake-based data warehouse processing 5TB+ daily. Led migration from legacy ETL to a modern dbt-based stack." }],
    "skills": ["Python", "SQL", "dbt", "Snowflake", "Airflow", "Spark", "Kafka", "AWS"],
    "yoe": 8, "is_candidate": true, "is_premium": false,
    "applied_jobs": ["job_004"], "saved_jobs": ["job_002","job_003"],
    "profile_views": 89, "resume_filename": "marcus_pham_resume.pdf", "resume_upload_date": "2026-04-10",
    "availability": "1 month", "joined_date": "2025-11-02",
    "open_to_work": true
  },
  {
    "id": 3, "password": "", "full_name": "Alex Chen",
    "avatar_initials": "AC", "avatar_color": "#7e3af2",
    "dob": "1992-11-05", "headline": "Backend Engineer",
    "bio": "Backend specialist focused on building resilient microservices and distributed systems. I have a strong Golang background and enjoy solving hard infrastructure problems at scale.",
    "contact": { "phone": "+61 433 210 987", "email": "alex.chen@email.com", "linkedin": "linkedin.com/in/alexchen", "github": "github.com/alexchen", "website": "" },
    "location": "Melbourne, VIC", "work_mode_preference": "Hybrid",
    "education": [{ "institution": "University of Melbourne", "degree": "Bachelor of Science (Computer Science)", "major": "Computer Science", "start_year": 2011, "end_year": 2014, "gpa": "High Distinction Average" }],
    "experience": [
      { "title": "Senior Backend Engineer", "company": "NovaSystems", "location": "Melbourne, VIC", "start_date": "2021-04", "end_date": null, "current": true, "description": "Designed and scaled a gRPC-based microservices architecture serving 15M daily requests. Led adoption of Kubernetes across all production services." },
      { "title": "Software Engineer", "company": "StartupCore", "location": "Melbourne, VIC", "start_date": "2017-01", "end_date": "2021-03", "current": false, "description": "Built core REST APIs in Go and Java, managing 3M+ user accounts and handling payment processing integrations." }
    ],
    "skills": ["Golang", "Kubernetes", "gRPC", "Redis", "Kafka", "Docker", "PostgreSQL", "AWS"],
    "yoe": 6, "is_candidate": true, "is_premium": false,
    "applied_jobs": [], "saved_jobs": [],
    "profile_views": 121, "resume_filename": "alex_chen_cv.pdf", "resume_upload_date": "2026-03-22",
    "availability": "Immediate", "joined_date": "2026-02-01",
    "open_to_work": true
  },
  {
    "id": 4, "password": "", "full_name": "Sarah Williams",
    "avatar_initials": "SW", "avatar_color": "#e3a008",
    "dob": "1998-06-19", "headline": "Data Scientist",
    "bio": "Data scientist with a passion for turning messy real-world data into actionable insights. Experienced in NLP, computer vision, and deploying ML models to production.",
    "contact": { "phone": "+61 421 654 321", "email": "s.williams@email.com", "linkedin": "linkedin.com/in/sarahwilliams", "github": "github.com/swilliams-ds", "website": "" },
    "location": "Sydney, NSW", "work_mode_preference": "Remote",
    "education": [{ "institution": "University of Sydney", "degree": "Master of Data Science", "major": "Data Science", "start_year": 2020, "end_year": 2022, "gpa": "High Distinction" }],
    "experience": [
      { "title": "Data Scientist", "company": "InsightIQ", "location": "Sydney, NSW", "start_date": "2022-09", "end_date": null, "current": true, "description": "Built and deployed NLP pipelines for sentiment analysis across 50M+ customer reviews. Improved model accuracy by 18% through feature engineering and hyperparameter tuning." }
    ],
    "skills": ["Python", "PyTorch", "scikit-learn", "SQL", "Spark", "NLP", "TensorFlow", "Tableau"],
    "yoe": 3, "is_candidate": true, "is_premium": true,
    "applied_jobs": [], "saved_jobs": [],
    "profile_views": 67, "resume_filename": "sarah_williams_resume.pdf", "resume_upload_date": "2026-04-30",
    "availability": "2 weeks", "joined_date": "2026-01-20",
    "open_to_work": true
  },
  {
    "id": 5, "password": "", "full_name": "Liam O'Brien",
    "avatar_initials": "LO", "avatar_color": "#c81e1e",
    "dob": "1993-02-28", "headline": "DevOps / Site Reliability Engineer",
    "bio": "SRE with 5 years of experience building and maintaining large-scale cloud infrastructure. I believe in infrastructure-as-code and love improving developer experience.",
    "contact": { "phone": "+61 405 789 012", "email": "liam.obrien@email.com", "linkedin": "linkedin.com/in/liamobrien", "github": "github.com/liamo", "website": "" },
    "location": "Brisbane, QLD", "work_mode_preference": "Remote",
    "education": [{ "institution": "Queensland University of Technology", "degree": "Bachelor of Information Technology", "major": "Network & Systems Administration", "start_year": 2012, "end_year": 2015, "gpa": "Credit Average" }],
    "experience": [
      { "title": "Senior SRE", "company": "CloudOps Australia", "location": "Remote", "start_date": "2021-01", "end_date": null, "current": true, "description": "Maintained 99.99% uptime SLA for a multi-cloud platform serving 500+ enterprise clients. Reduced deployment times by 70% through GitOps adoption with ArgoCD." },
      { "title": "DevOps Engineer", "company": "MediaStack", "location": "Brisbane, QLD", "start_date": "2018-06", "end_date": "2020-12", "current": false, "description": "Migrated legacy infrastructure to AWS EKS. Implemented full observability stack using Prometheus, Grafana and Loki." }
    ],
    "skills": ["AWS", "Terraform", "Kubernetes", "Docker", "Python", "Prometheus", "ArgoCD", "CI/CD"],
    "yoe": 5, "is_candidate": true, "is_premium": false,
    "applied_jobs": [], "saved_jobs": [],
    "profile_views": 93, "resume_filename": "", "resume_upload_date": "",
    "availability": "1 month", "joined_date": "2025-12-05",
    "open_to_work": true
  },
  {
    "id": 6, "password": "", "full_name": "Priya Sharma",
    "avatar_initials": "PS", "avatar_color": "#0891b2",
    "dob": "1996-09-14", "headline": "UI/UX & Frontend Developer",
    "bio": "Designer-developer hybrid with 4 years building beautiful, accessible interfaces. I bridge the gap between design and engineering, comfortable in Figma as I am in React.",
    "contact": { "phone": "+61 448 321 654", "email": "priya.sharma@email.com", "linkedin": "linkedin.com/in/priyasharma", "github": "github.com/priyabuilds", "website": "priyasharma.design" },
    "location": "Brisbane, QLD", "work_mode_preference": "Hybrid",
    "education": [{ "institution": "RMIT University", "degree": "Bachelor of Design (Digital Media)", "major": "Interaction Design", "start_year": 2015, "end_year": 2018, "gpa": "Distinction Average" }],
    "experience": [
      { "title": "Frontend Developer", "company": "DesignForge", "location": "Brisbane, QLD", "start_date": "2021-03", "end_date": null, "current": true, "description": "Led development of a white-label design system used by 12 enterprise clients. Improved accessibility scores (WCAG AA) across the entire product suite." }
    ],
    "skills": ["React", "TypeScript", "Figma", "CSS / Sass", "JavaScript", "Storybook", "Accessibility", "Vue.js"],
    "yoe": 4, "is_candidate": true, "is_premium": false,
    "applied_jobs": [], "saved_jobs": [],
    "profile_views": 55, "resume_filename": "priya_sharma_resume.pdf", "resume_upload_date": "2026-05-01",
    "availability": "2 weeks", "joined_date": "2026-02-14",
    "open_to_work": true
  },
  {
    "id": 7, "password": "", "full_name": "Tom Nguyen",
    "avatar_initials": "TN", "avatar_color": "#1a56db",
    "dob": "2000-04-03", "headline": "Mobile Developer (React Native / Flutter)",
    "bio": "Junior mobile developer with 2 years building cross-platform apps. Fast learner, strong in React Native and excited to grow into a senior role at a product company.",
    "contact": { "phone": "+61 411 098 765", "email": "tom.nguyen@email.com", "linkedin": "linkedin.com/in/tom-nguyen-dev", "github": "github.com/tomnguyen", "website": "" },
    "location": "Perth, WA", "work_mode_preference": "Remote",
    "education": [{ "institution": "Curtin University", "degree": "Bachelor of Computer Science", "major": "Software Engineering", "start_year": 2019, "end_year": 2022, "gpa": "Credit Average" }],
    "experience": [
      { "title": "Mobile Developer", "company": "AppCraft Studios", "location": "Perth, WA", "start_date": "2023-02", "end_date": null, "current": true, "description": "Developed and shipped 3 React Native apps to the App Store and Google Play, with 50k+ combined downloads. Integrated push notifications, in-app purchases, and analytics." }
    ],
    "skills": ["React Native", "Flutter", "JavaScript", "TypeScript", "Firebase", "REST APIs", "Git", "Xcode"],
    "yoe": 2, "is_candidate": true, "is_premium": false,
    "applied_jobs": [], "saved_jobs": [],
    "profile_views": 29, "resume_filename": "", "resume_upload_date": "",
    "availability": "Immediate", "joined_date": "2026-03-10",
    "open_to_work": true
  },
  {
    "id": 8, "password": "", "full_name": "Emma Rodriguez",
    "avatar_initials": "ER", "avatar_color": "#0e9f6e",
    "dob": "1989-12-22", "headline": "Machine Learning Engineer",
    "bio": "ML Engineer with 7 years delivering end-to-end machine learning solutions in finance and healthcare. Experienced taking models from Jupyter notebooks to production-grade inference services.",
    "contact": { "phone": "+61 417 543 210", "email": "emma.r@email.com", "linkedin": "linkedin.com/in/emmarodriguez-ml", "github": "github.com/emmar-ml", "website": "" },
    "location": "Sydney, NSW", "work_mode_preference": "Hybrid",
    "education": [
      { "institution": "University of Sydney", "degree": "PhD in Computer Science (Machine Learning)", "major": "Machine Learning", "start_year": 2013, "end_year": 2017, "gpa": "High Distinction" }
    ],
    "experience": [
      { "title": "Senior ML Engineer", "company": "Quant Analytics", "location": "Sydney, NSW", "start_date": "2020-07", "end_date": null, "current": true, "description": "Built real-time fraud detection model processing 2M transactions/day with 99.3% accuracy. Led a team of 3 ML engineers to deploy MLflow-based model registry and serving infrastructure." },
      { "title": "ML Engineer", "company": "HealthAI", "location": "Sydney, NSW", "start_date": "2017-09", "end_date": "2020-06", "current": false, "description": "Developed diagnostic imaging models (CNN-based) for radiology workflows, reducing radiologist review time by 30%." }
    ],
    "skills": ["Python", "PyTorch", "TensorFlow", "MLflow", "Spark", "SQL", "AWS SageMaker", "scikit-learn"],
    "yoe": 7, "is_candidate": true, "is_premium": true,
    "applied_jobs": [], "saved_jobs": [],
    "profile_views": 148, "resume_filename": "emma_rodriguez_cv.pdf", "resume_upload_date": "2026-04-15",
    "availability": "1 month", "joined_date": "2025-10-30",
    "open_to_work": false
  }
]};


// ─────────────────────────────────────────────────────────────────────────────
// DATA SERVICE MODULE
// ─────────────────────────────────────────────────────────────────────────────
const DataService = (() => {
    let _jobs = null, _users = null, _ready = false;
    const _listeners = [];

    // localStorage keys
    const SESSION_KEY = 'itmp_session_user_id';
    const APPLIED_KEY = uid => `itmp_applied_${uid}`;
    const SAVED_KEY   = uid => `itmp_saved_${uid}`;
    const PREFS_KEY   = uid => `itmp_prefs_${uid}`;
    const RESUME_KEY  = uid => `itmp_resume_${uid}`;
    const AVATAR_KEY  = uid => `itmp_avatar_${uid}`;

    function _ls(key)        { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : null; } catch { return null; } }
    function _lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

    function _getSessionUserId() {
        const r = localStorage.getItem(SESSION_KEY);
        return r ? parseInt(r, 10) : 1;
    }

    // ── Init ──────────────────────────────────────────────────────────
    function init() {
        _jobs  = JSON.parse(JSON.stringify(JOBS_DATA.jobs));
        _users = JSON.parse(JSON.stringify(ACCOUNTS_DATA.users));

        _users.forEach(user => {
            const pa  = _ls(APPLIED_KEY(user.id));
            const ps  = _ls(SAVED_KEY(user.id));
            const pr  = _ls(PREFS_KEY(user.id));
            const res = _ls(RESUME_KEY(user.id));
            const av  = _ls(AVATAR_KEY(user.id));
            if (pa  !== null) user.applied_jobs      = pa;
            if (ps  !== null) user.saved_jobs        = ps;
            if (pr  !== null) Object.assign(user, pr);
            if (res !== null) { user.resume_filename = res.filename; user.resume_upload_date = res.date; }
            if (av  !== null) user.avatar_color      = av;
        });

        _ready = true;
        _listeners.forEach(fn => fn());
        _listeners.length = 0;
    }

    function onReady(cb) { if (_ready) cb(); else _listeners.push(cb); }

    // ── Users ─────────────────────────────────────────────────────────
    function getCurrentUser()     { return _users?.find(u => u.id === _getSessionUserId()) ?? null; }
    function getUserById(id)      { return _users?.find(u => u.id === id) ?? null; }

    // ── Jobs ──────────────────────────────────────────────────────────
    function getAllJobs()          { return _jobs ? [..._jobs] : []; }
    function getJobById(id)       { return _jobs?.find(j => j.id === id) ?? null; }

    function getJobsForCurrentUser(query = '') {
        const user = getCurrentUser();
        const applied = user?.applied_jobs ?? [], saved = user?.saved_jobs ?? [];
        let jobs = getAllJobs().map(j => ({ ...j, isApplied: applied.includes(j.id), isSaved: saved.includes(j.id) }));
        if (query.trim()) {
            const q = query.toLowerCase();
            jobs = jobs.filter(j =>
                j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) ||
                j.location.toLowerCase().includes(q) || j.skills.some(s => s.name.toLowerCase().includes(q))
            );
        }
        return jobs;
    }

    /**
     * Search + filter jobs.
     * filters: { query, workMode:[], jobType:[], salaryMin, salaryMax, industry, location, matchMin }
     */
    function searchJobs(filters = {}) {
        let jobs = getJobsForCurrentUser(filters.query || '');
        if (filters.workMode?.length)    jobs = jobs.filter(j => filters.workMode.includes(j.work_mode));
        if (filters.jobType?.length)     jobs = jobs.filter(j => filters.jobType.includes(j.job_type));
        if (filters.industry)            jobs = jobs.filter(j => j.industry.toLowerCase().includes(filters.industry.toLowerCase()));
        if (filters.location)            jobs = jobs.filter(j => j.location.toLowerCase().includes(filters.location.toLowerCase()));
        if (filters.salaryMin != null)   jobs = jobs.filter(j => j.salary_max >= filters.salaryMin);
        if (filters.salaryMax != null)   jobs = jobs.filter(j => j.salary_min <= filters.salaryMax);
        if (filters.matchMin  != null)   jobs = jobs.filter(j => j.match_score >= filters.matchMin);
        return jobs;
    }

    /**
     * Search + filter candidates (excludes current user).
     * filters: { query, workMode:[], yoeMin, yoeMax, location, availability, openToWork, skills:[] }
     */
    function searchCandidates(filters = {}) {
        const currentId = _getSessionUserId();
        let candidates = (_users ?? []).filter(u => u.is_candidate && u.id !== currentId);

        if (filters.query?.trim()) {
            const q = filters.query.toLowerCase();
            candidates = candidates.filter(u =>
                u.full_name.toLowerCase().includes(q)      ||
                u.headline.toLowerCase().includes(q)       ||
                u.location.toLowerCase().includes(q)       ||
                u.skills.some(s => s.toLowerCase().includes(q))
            );
        }
        if (filters.workMode?.length)    candidates = candidates.filter(u => filters.workMode.includes(u.work_mode_preference));
        if (filters.location)            candidates = candidates.filter(u => u.location.toLowerCase().includes(filters.location.toLowerCase()));
        if (filters.yoeMin != null)      candidates = candidates.filter(u => u.yoe >= filters.yoeMin);
        if (filters.yoeMax != null)      candidates = candidates.filter(u => u.yoe <= filters.yoeMax);
        if (filters.availability)        candidates = candidates.filter(u => u.availability === filters.availability);
        if (filters.openToWork)          candidates = candidates.filter(u => u.open_to_work);
        if (filters.skills?.length)      candidates = candidates.filter(u =>
            filters.skills.every(fs => u.skills.some(us => us.toLowerCase().includes(fs.toLowerCase())))
        );
        return candidates;
    }

    function getRecommendedJobs() { return getJobsForCurrentUser().filter(j => !j.isApplied); }
    function getAppliedJobs()     { return getJobsForCurrentUser().filter(j =>  j.isApplied); }
    function getSavedJobs()       { return getJobsForCurrentUser().filter(j =>  j.isSaved && !j.isApplied); }

    // ── Mutations ─────────────────────────────────────────────────────
    function applyForJob(jobId) {
        const user = getCurrentUser();
        if (!user || user.applied_jobs.includes(jobId)) return false;
        user.applied_jobs.push(jobId);
        user.saved_jobs = user.saved_jobs.filter(id => id !== jobId);
        _lsSet(APPLIED_KEY(user.id), user.applied_jobs);
        _lsSet(SAVED_KEY(user.id), user.saved_jobs);
        return true;
    }

    function toggleSaveJob(jobId) {
        const user = getCurrentUser();
        if (!user || user.applied_jobs.includes(jobId)) return false;
        const idx = user.saved_jobs.indexOf(jobId);
        if (idx === -1) user.saved_jobs.push(jobId);
        else            user.saved_jobs.splice(idx, 1);
        _lsSet(SAVED_KEY(user.id), user.saved_jobs);
        return true;
    }

    function updateProfile(fields) {
        const user = getCurrentUser();
        if (!user) return false;
        Object.assign(user, fields);
        const prefs = { full_name:user.full_name, headline:user.headline, bio:user.bio,
            location:user.location, work_mode_preference:user.work_mode_preference,
            skills:user.skills, avatar_initials:user.avatar_initials,
            contact:user.contact, open_to_work:user.open_to_work, availability:user.availability };
        _lsSet(PREFS_KEY(user.id), prefs);
        return true;
    }

    function updateAvatar(color) {
        const user = getCurrentUser();
        if (!user) return false;
        user.avatar_color = color;
        _lsSet(AVATAR_KEY(user.id), color);
        return true;
    }

    function updateResume(filename, date) {
        const user = getCurrentUser();
        if (!user) return false;
        user.resume_filename = filename;
        user.resume_upload_date = date;
        _lsSet(RESUME_KEY(user.id), { filename, date });
        return true;
    }

    function deleteResume() {
        const user = getCurrentUser();
        if (!user) return false;
        user.resume_filename = '';
        user.resume_upload_date = '';
        _lsSet(RESUME_KEY(user.id), { filename: '', date: '' });
        return true;
    }

    // ── Utilities ─────────────────────────────────────────────────────
    function getSkillsWithMatchStatus(job) {
        const userSkills = (getCurrentUser()?.skills ?? []).map(s => s.toLowerCase());
        return job.skills.map(skill => ({ ...skill, isMatch: userSkills.includes(skill.name.toLowerCase()) }));
    }

    function timeAgo(isoDate) {
        if (!isoDate) return '';
        const diff = Math.floor((new Date() - new Date(isoDate)) / 86400000);
        if (diff === 0) return 'Today';
        if (diff === 1) return '1 day ago';
        if (diff < 7)  return `${diff} days ago`;
        if (diff < 14) return '1 week ago';
        return `${Math.floor(diff / 7)} weeks ago`;
    }

    function goToJobPage(id)    { window.location.href = `job.html?id=${id}`; }
    function goToProfilePage()  { window.location.href = 'profile.html'; }

    return {
        init, onReady,
        getCurrentUser, getUserById,
        getAllJobs, getJobById, getJobsForCurrentUser,
        searchJobs, searchCandidates,
        getRecommendedJobs, getAppliedJobs, getSavedJobs,
        applyForJob, toggleSaveJob,
        updateProfile, updateAvatar, updateResume, deleteResume,
        getSkillsWithMatchStatus, timeAgo,
        goToJobPage, goToProfilePage
    };
})();

document.addEventListener('DOMContentLoaded', () => DataService.init());