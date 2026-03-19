import re
import spacy
from pdfminer.high_level import extract_text

nlp = spacy.load("en_core_web_sm")

# ── Patterns ──────────────────────────────────────────────────────────
EMAIL_RE  = re.compile(r"[\w.+-]+@[\w-]+\.[a-z]{2,}", re.I)
PHONE_RE  = re.compile(r"(\+?\d[\d\s\-().]{7,}\d)")
GITHUB_RE = re.compile(r"github\.com/[\w-]+", re.I)
LINKEDIN_RE = re.compile(r"linkedin\.com/in/[\w-]+", re.I)

SECTION_HEADERS = {
    "experience":       ["experience", "work history", "employment"],
    "education":        ["education", "qualifications", "academic"],
    "skills":           ["skills", "technologies", "competencies"],
    "projects":         ["projects", "portfolio"],
    "certifications":   ["training", "courses", "accreditation", "certifications"],
    "summary":          ["summary", "objective", "profile"],
}

# ── PDF extraction ────────────────────────────────────────────────────
def extract_text_from_pdf(path: str) -> str:
    return extract_text(path)

# ── Contact info ──────────────────────────────────────────────────────
def parse_contact(text: str) -> dict:
    return {
        "email":    EMAIL_RE.search(text).group()    if EMAIL_RE.search(text)    else None,
        "phone":    PHONE_RE.search(text).group()    if PHONE_RE.search(text)    else None,
        "github":   GITHUB_RE.search(text).group()   if GITHUB_RE.search(text)   else None,
        "linkedin": LINKEDIN_RE.search(text).group() if LINKEDIN_RE.search(text) else None,
    }

# ── Name (first PERSON entity spaCy finds) ────────────────────────────
def parse_name(text: str) -> str | None:
    doc = nlp(text[:500])   # name is almost always near the top
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            return ent.text
    return None

# ── Section splitter ──────────────────────────────────────────────────
def split_sections(text: str) -> dict[str, str]:
    lines    = text.splitlines()
    sections = {}
    current  = "header"
    buffer   = []

    for line in lines:
        lower = line.strip().lower()
        matched = None
        for section, keywords in SECTION_HEADERS.items():
            if any(lower.startswith(kw) for kw in keywords):
                matched = section
                break

        if matched:
            sections[current] = "\n".join(buffer).strip()
            current = matched
            buffer  = []
        else:
            buffer.append(line)

    sections[current] = "\n".join(buffer).strip()
    return sections

# ── Skills (match against a keyword list) ────────────────────────────
KNOWN_SKILLS = {

    # ── Engineering ───────────────────────────────────────────────────
    "autocad", "solidworks", "catia", "fusion 360", "inventor", "nx cad",
    "ansys", "abaqus", "nastran", "comsol", "hypermesh",
    "matlab", "simulink", "labview",
    "finite element analysis", "fea", "cfd", "computational fluid dynamics",
    "pid control", "plc programming", "scada", "hmi",
    "robotics", "ros", "arduino", "raspberry pi",
    "circuit design", "pcb design", "altium designer", "eagle cad", "kicad",
    "verilog", "vhdl", "fpga",
    "3d printing", "cnc machining", "gd&t", "lean manufacturing", "six sigma",
    "iso 9001", "as9100", "asme", "ieee standards",
    "structural analysis", "fatigue analysis", "thermal analysis",
    "hydraulics", "pneumatics", "mechatronics",
    "civil 3d", "revit", "staad pro", "etabs", "safe", "sap2000",
    "geotechnical engineering", "surveying", "gis", "arcgis", "qgis",

    # ── Software Engineering / IT ──────────────────────────────────────
    "python", "java", "javascript", "typescript", "c", "c++", "c#",
    "go", "rust", "swift", "kotlin", "ruby", "php", "scala", "r",
    "html", "css", "sass", "tailwind",
    "react", "vue", "angular", "svelte", "nextjs", "nuxt",
    "node", "django", "flask", "fastapi", "spring boot", "laravel", "rails",
    "sql", "postgresql", "mysql", "sqlite", "oracle",
    "mongodb", "redis", "cassandra", "dynamodb", "elasticsearch",
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "git", "github", "gitlab", "bitbucket", "ci/cd", "jenkins", "github actions",
    "linux", "bash", "powershell",
    "graphql", "rest api", "grpc", "websockets",
    "machine learning", "deep learning", "nlp", "computer vision",
    "tensorflow", "pytorch", "scikit-learn", "keras", "hugging face",
    "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
    "spark", "hadoop", "kafka", "airflow", "dbt",
    "cybersecurity", "penetration testing", "network security", "siem",
    "agile", "scrum", "kanban", "jira", "confluence",

    # ── Mathematics & Statistics ───────────────────────────────────────
    "matlab", "mathematica", "maple", "wolfram alpha",
    "r", "spss", "stata", "sas", "minitab",
    "linear algebra", "calculus", "differential equations",
    "statistics", "probability", "bayesian inference",
    "time series analysis", "regression analysis", "hypothesis testing",
    "numerical methods", "optimization", "graph theory",
    "latex", "mathematica", "octave",
    "data analysis", "data visualization", "statistical modelling",
    "monte carlo simulation", "stochastic modelling",

    # ── Art & Design ──────────────────────────────────────────────────
    "blender", "maya", "3ds max", "cinema 4d", "zbrush", "houdini",
    "adobe photoshop", "adobe illustrator", "adobe indesign",
    "adobe after effects", "adobe premiere pro", "adobe xd",
    "figma", "sketch", "invision", "framer", "webflow",
    "procreate", "clip studio paint", "krita", "gimp", "inkscape",
    "ui design", "ux design", "user research", "wireframing", "prototyping",
    "typography", "branding", "logo design", "print design",
    "motion graphics", "video editing", "colour grading", "davinci resolve",
    "photography", "lightroom", "studio lighting",
    "unity", "unreal engine", "game design", "level design",
    "augmented reality", "virtual reality", "ar/vr",
    "illustration", "concept art", "storyboarding", "animation",

    # ── Finance & Accounting ──────────────────────────────────────────
    "microsoft excel", "google sheets", "vba", "power query",
    "quickbooks", "xero", "myob", "sage", "netsuite",
    "sap", "sap fi", "sap co", "oracle financials",
    "bloomberg terminal", "refinitiv eikon",
    "financial modelling", "dcf analysis", "valuation",
    "financial reporting", "ifrs", "gaap", "us gaap",
    "budgeting", "forecasting", "variance analysis",
    "accounts payable", "accounts receivable", "bank reconciliation",
    "tax accounting", "gst", "bas", "payroll",
    "investment analysis", "portfolio management", "risk management",
    "derivatives", "equities", "fixed income", "options pricing",
    "power bi", "tableau", "qlik", "looker",
    "python for finance", "r for finance", "quantitative analysis",
    "credit analysis", "due diligence", "mergers and acquisitions",
    "auditing", "internal controls", "sox compliance",

    # ── Healthcare & Medicine ─────────────────────────────────────────
    "epic", "meditech", "cerner", "emr", "ehr",
    "icd-10", "cpt coding", "medical billing", "medicare", "medicaid",
    "patient assessment", "clinical documentation", "triage",
    "venipuncture", "iv insertion", "wound care", "medication administration",
    "bls", "acls", "pals", "first aid", "cpr",
    "radiology", "mri", "ct scan", "ultrasound", "x-ray",
    "pharmacology", "pathophysiology", "anatomy", "physiology",
    "mental health assessment", "cbT", "counselling", "psychotherapy",
    "public health", "epidemiology", "biostatistics",
    "infection control", "sterilisation", "aseptic technique",
    "surgical assistance", "operating theatre", "scrubbing",
    "spss", "nvivo", "clinical research", "clinical trials",
    "aged care", "disability support", "palliative care",

    # ── Construction & Trades ─────────────────────────────────────────
    "project management", "ms project", "primavera p6",
    "construction management", "site supervision", "site safety",
    "estimating", "quantity surveying", "cost planning", "bills of quantities",
    "reading blueprints", "technical drawings", "as-built drawings",
    "carpentry", "formwork", "concreting", "bricklaying", "plastering",
    "plumbing", "electrical wiring", "hvac", "mechanical services",
    "welding", "structural steel", "rigging", "scaffolding",
    "ncc", "bca", "whs", "ohse", "iso 45001",
    "asbestos removal", "demolition", "excavation",
    "building information modelling", "bim", "revit",
    "tender management", "contract administration", "nec", "as 4000",
    "white card", "working at heights", "confined spaces",

    # ── Education & Teaching ──────────────────────────────────────────
    "curriculum development", "lesson planning", "classroom management",
    "differentiated instruction", "inclusive education",
    "moodle", "canvas lms", "blackboard", "google classroom", "teams",
    "assessment design", "rubric development", "formative assessment",
    "stem education", "project-based learning", "inquiry-based learning",
    "special education", "iep development", "learning support",
    "early childhood education", "montessori", "reggio emilia",
    "tutoring", "mentoring", "coaching",
    "public speaking", "presentation skills", "facilitation",
    "literacy development", "numeracy development",
    "english as a second language", "esl", "tesol", "ielts preparation",

    # ── Marketing & Communications ────────────────────────────────────
    "google analytics", "google ads", "google tag manager",
    "facebook ads", "instagram ads", "linkedin ads", "tiktok ads",
    "seo", "sem", "content marketing", "email marketing",
    "hubspot", "salesforce", "marketo", "mailchimp", "klaviyo",
    "social media management", "hootsuite", "buffer", "sprout social",
    "copywriting", "content writing", "technical writing", "proofreading",
    "public relations", "media relations", "press releases",
    "market research", "consumer insights", "brand strategy",
    "product marketing", "go-to-market strategy",

    # ── Science & Research ────────────────────────────────────────────
    "pcr", "gel electrophoresis", "cell culture", "microscopy",
    "chromatography", "hplc", "mass spectrometry", "spectroscopy",
    "lab safety", "gmp", "gcp", "glp",
    "literature review", "systematic review", "meta-analysis",
    "nvivo", "endnote", "zotero", "mendeley",
    "grant writing", "research proposal", "ethics submission",
    "python", "r", "bioinformatics", "genomics", "proteomics",

    # ── Logistics & Supply Chain ──────────────────────────────────────
    "sap mm", "sap wm", "sap sd", "oracle scm",
    "warehouse management", "inventory control", "stock management",
    "procurement", "sourcing", "vendor management", "contract negotiation",
    "freight management", "incoterms", "customs", "import/export",
    "demand planning", "supply planning", "s&op",
    "lean", "kaizen", "5s", "value stream mapping",
    "forklift license", "dangerous goods", "cold chain",

    # ── Languages ─────────────────────────────────────────────────────
    "english", "mandarin", "spanish", "french", "german", "arabic",
    "japanese", "korean", "portuguese", "italian", "hindi",
    "naati", "translation", "interpreting",

    # ── Soft Skills ───────────────────────────────────────────────────
    "leadership", "team management", "stakeholder management",
    "problem solving", "critical thinking", "decision making",
    "communication", "negotiation", "conflict resolution",
    "time management", "multitasking", "adaptability",
    "emotional intelligence", "active listening",
}

def parse_skills(skills_text: str) -> list[str]:
    lower = skills_text.lower()
    return sorted(skill for skill in KNOWN_SKILLS if skill in lower)

KNOWN_CERTIFICATIONS = {

    # ── Construction & Trades ─────────────────────────────────────────
    "white card", "general construction induction",
    "working at heights", "confined spaces",
    "dogman licence", "rigging licence", "scaffolding licence",
    "forklift licence", "elevated work platform", "ewp",
    "asbestos awareness", "asbestos removal licence",
    "demolition licence", "explosive power tool",
    "gas fitting licence", "plumbing licence",
    "electrical licence", "electrical contractor licence",
    "arc flash", "switchboard operation",
    "traffic control", "traffic management",
    "crane operation", "overhead crane",
    "first aid", "senior first aid", "advanced first aid",
    "cpr", "apply first aid", "provide first aid",
    "fire warden", "fire extinguisher", "fire safety",
    "dangerous goods", "hazmat",
    "radiation safety", "radiation use licence",
    "occupational health and safety", "ohs", "whs",
    "iso 45001", "ohsas 18001",

    # ── IT & Cybersecurity ────────────────────────────────────────────
    "comptia a+", "comptia network+", "comptia security+",
    "comptia linux+", "comptia cloud+", "comptia cysa+",
    "comptia pentest+", "comptia casp+",
    "cisco ccna", "cisco ccnp", "cisco ccie", "cisco cct",
    "cisco devnet", "cisco cyberops",
    "certified ethical hacker", "ceh",
    "oscp", "offensive security certified professional",
    "cissp", "certified information systems security professional",
    "cism", "certified information security manager",
    "cisa", "certified information systems auditor",
    "crisc", "cgeit",
    "aws certified cloud practitioner",
    "aws certified solutions architect",
    "aws certified developer",
    "aws certified sysops administrator",
    "aws certified devops engineer",
    "aws certified data analytics",
    "aws certified machine learning",
    "azure fundamentals", "az-900",
    "azure administrator", "az-104",
    "azure developer", "az-204",
    "azure solutions architect", "az-305",
    "azure devops engineer", "az-400",
    "azure security engineer", "az-500",
    "google cloud associate", "google cloud professional",
    "google cloud architect", "google cloud developer",
    "certified kubernetes administrator", "cka",
    "certified kubernetes application developer", "ckad",
    "hashicorp terraform associate",
    "red hat certified engineer", "rhce",
    "red hat certified administrator", "rhcsa",
    "linux professional institute", "lpic",
    "itil foundation", "itil 4",
    "prince2 foundation", "prince2 practitioner",
    "pmp", "project management professional",
    "microsoft certified azure fundamentals",
    "microsoft 365 certified", "ms-900",
    "microsoft certified solutions expert", "mcse",
    "oracle certified professional", "ocp",
    "salesforce administrator", "salesforce developer",
    "servicenow certified", "splunk certified",
    "cobit", "togaf", "zachman",
    "iso 27001 lead auditor", "iso 27001 lead implementer",

    # ── Finance & Accounting ──────────────────────────────────────────
    "cpa", "certified practising accountant",
    "ca", "chartered accountant", "ca anz",
    "cfa", "chartered financial analyst",
    "cfa level 1", "cfa level 2", "cfa level 3",
    "cfp", "certified financial planner",
    "frm", "financial risk manager",
    "cma", "certified management accountant",
    "cia", "certified internal auditor",
    "acca", "association of chartered certified accountants",
    "cfe", "certified fraud examiner",
    "xero certified advisor", "xero payroll certified",
    "quickbooks certified proadvisor",
    "myob certified consultant",
    "rg 146", "tier 1 financial advice", "tier 2 financial advice",
    "aml/ctf compliance", "anti-money laundering",
    "dip financial planning", "advanced dip financial planning",
    "tax agent registration",
    "bas agent registration",
    "fpa membership", "smsf specialist",

    # ── Healthcare & Medicine ─────────────────────────────────────────
    "ahpra registration",
    "registered nurse", "rn",
    "enrolled nurse", "en",
    "nurse practitioner",
    "medical registration", "specialist registration",
    "dental registration", "pharmacy registration",
    "physiotherapy registration", "occupational therapy registration",
    "psychology registration", "social work registration",
    "bls", "basic life support",
    "acls", "advanced cardiac life support",
    "pals", "paediatric advanced life support",
    "atls", "advanced trauma life support",
    "als", "advanced life support",
    "mental health first aid", "mhfa",
    "certificate iv in aged care",
    "certificate iii in individual support",
    "disability support worker check",
    "working with children check", "wwcc",
    "national police check",
    "radiation therapy licence",
    "infection prevention and control", "ipac",
    "manual handling", "patient handling",
    "medication endorsement",
    "immunisation endorsement",
    "ndis worker screening",
    "food safety supervisor",
    "dialysis technician certification",
    "phlebotomy certification",

    # ── Education & Childcare ─────────────────────────────────────────
    "bachelor of education",
    "graduate diploma of education",
    "master of teaching",
    "teacher registration", "teacher accreditation",
    "tesol certificate", "tesol diploma",
    "celta", "delta",
    "certificate iii in early childhood education",
    "certificate iv in education support",
    "diploma of early childhood education and care",
    "working with children check", "wwcc",
    "first aid for children", "hltaid012",
    "anaphylaxis training", "asthma training",
    "child protection training",
    "mandatory reporter training",

    # ── Engineering ───────────────────────────────────────────────────
    "engineers australia", "mieaust", "chartered engineer",
    "national engineering register", "ner",
    "cpeng", "chartered professional engineer",
    "nper", "national professional engineers register",
    "rpeq", "registered professional engineer queensland",
    "iso 9001 lead auditor",
    "iso 9001 lead implementer",
    "iso 14001 lead auditor",
    "functional safety engineer", "iec 61508",
    "six sigma green belt", "six sigma black belt",
    "lean six sigma",
    "autocad certified user", "autocad certified professional",
    "solidworks associate", "cswa",
    "solidworks professional", "cswp",
    "ansys certified professional",
    "drone licence", "repl", "uav licence",
    "high voltage licence",
    "pressure vessel competency",
    "boilermaker certificate",
    "certificate ii in engineering",
    "certificate iii in engineering",
    "radiation safety officer",

    # ── Project Management ────────────────────────────────────────────
    "pmp", "project management professional",
    "prince2 foundation", "prince2 practitioner",
    "agile certified practitioner", "pmi-acp",
    "certified scrum master", "csm",
    "certified scrum product owner", "cspo",
    "safe agilist", "safe scrum master",
    "certified agile coach",
    "capm", "certified associate in project management",
    "msp", "managing successful programmes",
    "p3o foundation", "p3o practitioner",
    "change management foundation", "prosci",
    "itil 4 foundation",
    "pgmp", "program management professional",
    "risk management professional", "pmi-rmp",

    # ── Business Analysis ─────────────────────────────────────────────
    "ccba", "certification of capability in business analysis",
    "cbap", "certified business analysis professional",
    "ecba", "entry certificate in business analysis",
    "pmi-pba", "professional in business analysis",
    "iiba membership",
    "lean six sigma yellow belt",
    "lean six sigma green belt",
    "lean six sigma black belt",

    # ── Human Resources ───────────────────────────────────────────────
    "shrm-cp", "shrm-scp",
    "cipd level 3", "cipd level 5", "cipd level 7",
    "ahri certification", "ahri practising certification",
    "cert iv in human resources",
    "diploma of human resources management",
    "fair work act training",
    "workplace investigations certificate",
    "mediator accreditation",
    "return to work coordinator",
    "ergonomics assessment",

    # ── Marketing & Digital ───────────────────────────────────────────
    "google analytics certification", "ga4 certification",
    "google ads certification", "google ads search",
    "google ads display", "google ads video",
    "google ads shopping", "google ads apps",
    "hubspot content marketing certification",
    "hubspot inbound marketing certification",
    "hubspot email marketing certification",
    "hubspot social media certification",
    "hubspot seo certification",
    "facebook blueprint certification",
    "meta certified digital marketing associate",
    "hootsuite social media marketing",
    "semrush seo certification",
    "moz seo essentials",
    "linkedin marketing labs",
    "mailchimp foundations",

    # ── Data & Analytics ──────────────────────────────────────────────
    "google data analytics certificate",
    "ibm data science professional certificate",
    "microsoft certified data analyst", "pl-300",
    "tableau desktop specialist",
    "tableau certified associate",
    "power bi data analyst", "pl-300",
    "databricks certified associate",
    "snowflake certifications",
    "sas certified specialist",
    "cloudera data engineer",
    "tensorflow developer certificate",
    "pytorch certification",
    "aws certified machine learning specialty",

    # ── Legal & Compliance ────────────────────────────────────────────
    "practising certificate",
    "barrister admission",
    "solicitor admission",
    "notary public",
    "justice of the peace", "jp",
    "privacy law certificate",
    "gdpr certification",
    "aml compliance certification",
    "compliance institute membership",
    "certificate iv in security",
    "security licence",
    "crowd controller licence",
    "private investigator licence",

    # ── Hospitality & Food ────────────────────────────────────────────
    "rsa", "responsible service of alcohol",
    "rsg", "responsible service of gambling",
    "food safety supervisor certificate",
    "certificate iii in hospitality",
    "certificate iv in hospitality",
    "barista certificate",
    "food handling certificate",
    "haccp certification",
    "liquor licence",
    "approved manager licence",

    # ── Transport & Logistics ─────────────────────────────────────────
    "heavy rigid licence", "hr licence",
    "heavy combination licence", "hc licence",
    "multi combination licence", "mc licence",
    "dangerous goods driver", "adg",
    "taxi driver accreditation",
    "rideshare accreditation",
    "maritime qualifications", "coxswain",
    "marine radio licence",
    "pilots licence", "ppl", "cpl", "atpl",
    "drone remote pilot licence",
    "rail safety worker", "rail induction",
    "forklift licence", "lf",
    "reach truck", "order picker",
    "chain of responsibility", "cor",

    # ── Real Estate & Property ────────────────────────────────────────
    "real estate licence",
    "certificate of registration",
    "buyers agent licence",
    "property manager registration",
    "strata manager licence",
    "auctioneer licence",
    "certificate iv in property services",
    "diploma of property services",

    # ── Fitness & Wellness ────────────────────────────────────────────
    "cert iii in fitness",
    "cert iv in fitness",
    "personal trainer certificate",
    "group fitness instructor",
    "swim teacher certificate",
    "yoga teacher training", "ryt 200", "ryt 500",
    "pilates instructor certificate",
    "sports first aid",
    "exercise physiology registration",
    "nutrition coaching certificate",

    # ── Arts & Media ─────────────────────────────────────────────────
    "adobe certified professional",
    "adobe certified expert",
    "autodesk certified user",
    "autodesk certified professional",
    "unity certified associate",
    "unity certified professional",
    "unreal engine certification",
    "avid certified user",
    "apple certified pro",

    # ── Environment & Sustainability ──────────────────────────────────
    "iso 14001 lead auditor",
    "iso 50001 energy management",
    "leed accredited professional", "leed ap",
    "green star accredited professional",
    "nabers assessor",
    "environmental auditor",
    "sustainability reporting gri",
    "carbon neutral certification",
    "eri certification",
    "contaminated land assessor",

    # ── Languages & Communication ─────────────────────────────────────
    "naati certified translator",
    "naati certified interpreter",
    "ielts", "toefl", "toeic",
    "cambridge english certificate",
    "delf", "dalf",
    "goethe certificate",
    "jlpt", "hsk",
    "dele",
}

def parse_certifications(certifications_text: str) -> list[str]:
    lower = certifications_text.lower()
    return sorted(skill for skill in KNOWN_CERTIFICATIONS if skill in lower)

# ── Main parser ───────────────────────────────────────────────────────
def parse_resume(pdf_path: str) -> dict:
    text     = extract_text_from_pdf(pdf_path)
    sections = split_sections(text)

    return {
        "name":       parse_name(text),
        "contact":    parse_contact(text),
        "summary":    sections.get("summary", ""),
        "experience": sections.get("experience", ""),
        "education":  sections.get("education", ""),
        "skills":     parse_skills(sections.get("skills", "")),
        "projects":   sections.get("projects", ""),
        "certifications":     parse_certifications(sections.get("certifications", "")),
        "raw_text":   text,
    }

# ── Run ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import json
    import sys

    path   = sys.argv[1] if len(sys.argv) > 1 else "resume.pdf"
    result = parse_resume(path)
    print(json.dumps(result, indent=2))