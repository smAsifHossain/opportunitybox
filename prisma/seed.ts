import "dotenv/config";
import {
  PrismaClient,
  OpportunityType,
  FundingLevel,
  OpportunityStatus,
  OpportunityOrigin,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { opportunitySlug } from "../src/lib/slug";

const db = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL!) });

/** Days from now, normalized to a clean timestamp. */
function days(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(23, 59, 0, 0);
  return d;
}

type SeedOpportunity = {
  title: string;
  description: string;
  type: OpportunityType;
  homepageUrl: string;
  applyUrl?: string;
  deadline?: Date;
  startDate?: Date;
  endDate?: Date;
  city?: string;
  country?: string;
  online?: boolean;
  funding: FundingLevel;
  fundingNotes?: string;
  tags: string[];
  field?: string;
};

const opportunities: SeedOpportunity[] = [
  {
    title: "AI Unlocked Workshop",
    description:
      "A fully funded, hands-on workshop introducing researchers and students to the NAIRR Pilot resources for AI research. Participants learn to access national-scale compute, datasets, and models. Travel and accommodation are fully reimbursed for accepted applicants. Funded by NAIRR and NSF.",
    type: OpportunityType.WORKSHOP,
    homepageUrl: "https://nairrpilot.org/ai-unlocked",
    applyUrl: "https://nairrpilot.org/ai-unlocked",
    deadline: days(35),
    startDate: days(70),
    endDate: days(72),
    city: "Boulder",
    country: "United States",
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "Full travel and lodging reimbursement for accepted participants.",
    tags: ["AI", "NSF", "NAIRR", "research-computing"],
    field: "Artificial Intelligence",
  },
  {
    title: "NeurIPS 2026: Call for Papers",
    description:
      "The Thirty-ninth Annual Conference on Neural Information Processing Systems. Submissions are invited on all aspects of machine learning, neuroscience, statistics, and optimization. One of the most prestigious venues in AI research.",
    type: OpportunityType.CFP_CONFERENCE,
    homepageUrl: "https://neurips.cc",
    applyUrl: "https://openreview.net/group?id=NeurIPS.cc",
    deadline: days(22),
    startDate: days(180),
    endDate: days(186),
    city: "Vancouver",
    country: "Canada",
    funding: FundingLevel.PARTIALLY_FUNDED,
    fundingNotes: "Financial assistance and volunteer programs available for students.",
    tags: ["machine-learning", "AI", "paper-submission"],
    field: "Artificial Intelligence",
  },
  {
    title: "Fulbright Foreign Student Program",
    description:
      "The Fulbright Program offers fully funded master's and PhD study in the United States for international students, including tuition, airfare, living stipend, and health insurance. Open to applicants from over 160 countries.",
    type: OpportunityType.FELLOWSHIP,
    homepageUrl: "https://foreign.fulbrightonline.org",
    applyUrl: "https://foreign.fulbrightonline.org/applicants",
    deadline: days(95),
    online: false,
    country: "United States",
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "Tuition, airfare, living stipend, and health insurance covered.",
    tags: ["graduate-study", "international", "scholarship"],
    field: "All Fields",
  },
  {
    title: "Google PhD Fellowship Program",
    description:
      "Recognizes outstanding graduate students doing exceptional research in computer science and related fields. Fellows receive full tuition and fees plus a stipend, and are paired with a Google Research Mentor.",
    type: OpportunityType.FELLOWSHIP,
    homepageUrl: "https://research.google/programs-and-events/phd-fellowship/",
    deadline: days(48),
    online: true,
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "Full tuition, fees, and stipend for the fellowship period.",
    tags: ["PhD", "computer-science", "research"],
    field: "Computer Science",
  },
  {
    title: "CERN Summer Student Programme",
    description:
      "Spend the summer at CERN in Geneva working on an advanced technical project with international research teams. Includes lectures by leading scientists, lab visits, and a vibrant student community. Open to bachelor's and master's students in physics, computing, and engineering.",
    type: OpportunityType.TRAINING,
    homepageUrl: "https://careers.cern/summer",
    applyUrl: "https://careers.smartrecruiters.com/CERN",
    deadline: days(60),
    startDate: days(220),
    endDate: days(290),
    city: "Geneva",
    country: "Switzerland",
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "Stipend, travel allowance, and health insurance provided.",
    tags: ["physics", "internship", "summer-program"],
    field: "Physics",
  },
  {
    title: "ICLR 2027: Call for Papers",
    description:
      "The International Conference on Learning Representations invites submissions on deep learning and representation learning, spanning theory, applications, and infrastructure.",
    type: OpportunityType.CFP_CONFERENCE,
    homepageUrl: "https://iclr.cc",
    applyUrl: "https://openreview.net/group?id=ICLR.cc",
    deadline: days(110),
    city: "Vienna",
    country: "Austria",
    funding: FundingLevel.UNKNOWN,
    tags: ["deep-learning", "paper-submission"],
    field: "Artificial Intelligence",
  },
  {
    title: "MLH Global Hack Week",
    description:
      "A week of online hackathon events from Major League Hacking: build projects, attend workshops, and earn swag. Beginner friendly, free to join from anywhere in the world.",
    type: OpportunityType.HACKATHON,
    homepageUrl: "https://ghw.mlh.io",
    deadline: days(14),
    startDate: days(20),
    endDate: days(27),
    online: true,
    funding: FundingLevel.NOT_FUNDED,
    tags: ["hackathon", "beginner-friendly", "online"],
    field: "Software Engineering",
  },
  {
    title: "NSF Graduate Research Fellowship Program (GRFP)",
    description:
      "The GRFP provides three years of financial support (an annual stipend plus cost-of-education allowance) for outstanding US graduate students in NSF-supported STEM disciplines.",
    type: OpportunityType.GRANT,
    homepageUrl: "https://www.nsfgrfp.org",
    applyUrl: "https://www.research.gov/grfp/",
    deadline: days(130),
    country: "United States",
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "$37,000 annual stipend plus $16,000 cost-of-education allowance.",
    tags: ["STEM", "graduate", "US-citizens"],
    field: "All STEM Fields",
  },
  {
    title: "DAAD EPOS Scholarships, Development-Related Postgraduate Courses",
    description:
      "German Academic Exchange Service scholarships for professionals from developing countries to pursue master's degrees in Germany, covering tuition, travel, insurance, and a monthly stipend.",
    type: OpportunityType.FELLOWSHIP,
    homepageUrl: "https://www.daad.de/en/studying-in-germany/scholarships/development-related-postgraduate-courses/",
    deadline: days(85),
    country: "Germany",
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "Monthly stipend, travel, insurance, and tuition covered.",
    tags: ["masters", "germany", "international-development"],
    field: "All Fields",
  },
  {
    title: "CHI 2027: Call for Papers",
    description:
      "The ACM Conference on Human Factors in Computing Systems is the premier international venue for human-computer interaction research.",
    type: OpportunityType.CFP_CONFERENCE,
    homepageUrl: "https://chi2027.acm.org",
    deadline: days(75),
    city: "Yokohama",
    country: "Japan",
    funding: FundingLevel.UNKNOWN,
    tags: ["HCI", "paper-submission", "ACM"],
    field: "Human-Computer Interaction",
  },
  {
    title: "Wikipedia Wikimania Volunteer Program",
    description:
      "Volunteer at Wikimania, the annual conference of the Wikimedia movement. Volunteers help with registration, session support, and community activities, and receive free conference access.",
    type: OpportunityType.VOLUNTEER,
    homepageUrl: "https://wikimania.wikimedia.org",
    deadline: days(40),
    startDate: days(90),
    endDate: days(93),
    city: "Nairobi",
    country: "Kenya",
    funding: FundingLevel.PARTIALLY_FUNDED,
    fundingNotes: "Free conference access; limited travel scholarships available separately.",
    tags: ["volunteer", "open-knowledge", "community"],
    field: "Open Knowledge",
  },
  {
    title: "Machine Learning Summer School (MLSS)",
    description:
      "An intensive two-week summer school covering modern machine learning topics, taught by leading researchers. Aimed at graduate students and early-career researchers worldwide.",
    type: OpportunityType.TRAINING,
    homepageUrl: "https://mlss.cc",
    deadline: days(55),
    startDate: days(150),
    endDate: days(164),
    city: "Cape Town",
    country: "South Africa",
    funding: FundingLevel.PARTIALLY_FUNDED,
    fundingNotes: "Travel grants available for students from underrepresented regions.",
    tags: ["machine-learning", "summer-school", "graduate"],
    field: "Artificial Intelligence",
  },
  {
    title: "IEEE Transactions on AI, Special Issue on Trustworthy LLMs",
    description:
      "Call for journal papers on safety, alignment, robustness, interpretability, and evaluation of large language models. Original research and survey papers welcome.",
    type: OpportunityType.CFP_JOURNAL,
    homepageUrl: "https://cis.ieee.org/publications/ieee-transactions-on-artificial-intelligence",
    deadline: days(65),
    online: true,
    funding: FundingLevel.UNKNOWN,
    tags: ["journal", "LLM", "trustworthy-AI", "paper-submission"],
    field: "Artificial Intelligence",
  },
  {
    title: "NASA International Space Apps Challenge",
    description:
      "The world's largest global hackathon: 48 hours solving challenges using NASA's open data, in hundreds of cities and online. Open to all skill levels.",
    type: OpportunityType.HACKATHON,
    homepageUrl: "https://www.spaceappschallenge.org",
    deadline: days(100),
    startDate: days(120),
    endDate: days(122),
    online: true,
    funding: FundingLevel.NOT_FUNDED,
    tags: ["space", "open-data", "hackathon", "global"],
    field: "Space Science",
  },
  {
    title: "Schmidt Science Fellows",
    description:
      "A postdoctoral fellowship placing exceptional early-career scientists in a discipline different from their PhD, with a $110,000 annual stipend and world-class mentorship.",
    type: OpportunityType.FELLOWSHIP,
    homepageUrl: "https://schmidtsciencefellows.org",
    deadline: days(120),
    online: false,
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "$110,000/year stipend for one to two years.",
    tags: ["postdoc", "interdisciplinary", "science"],
    field: "Natural Sciences",
  },
  {
    title: "Grace Hopper Celebration, Student Scholarships",
    description:
      "Scholarships covering registration, travel, and lodging for students and faculty to attend the world's largest gathering of women and non-binary technologists.",
    type: OpportunityType.CONFERENCE,
    homepageUrl: "https://ghc.anitab.org",
    deadline: days(30),
    startDate: days(140),
    endDate: days(143),
    city: "Chicago",
    country: "United States",
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "Registration, travel, meals, and lodging covered for scholars.",
    tags: ["diversity", "women-in-tech", "scholarship"],
    field: "Computer Science",
  },
  {
    title: "EuroPython 2026",
    description:
      "The largest Python conference in Europe: talks, tutorials, and sprints for the global Python community. Financial aid program covers tickets and travel for those who need it.",
    type: OpportunityType.CONFERENCE,
    homepageUrl: "https://europython.eu",
    deadline: days(45),
    startDate: days(75),
    endDate: days(81),
    city: "Prague",
    country: "Czech Republic",
    funding: FundingLevel.PARTIALLY_FUNDED,
    fundingNotes: "Financial aid available for tickets, travel, and accommodation.",
    tags: ["python", "open-source", "community"],
    field: "Software Engineering",
  },
  {
    title: "UN Online Volunteers Program",
    description:
      "Contribute skills in translation, research, design, data, and outreach to UN agencies and NGOs entirely online. Flexible commitment from anywhere in the world.",
    type: OpportunityType.VOLUNTEER,
    homepageUrl: "https://www.unv.org/become-online-volunteer",
    online: true,
    funding: FundingLevel.NOT_FUNDED,
    tags: ["volunteer", "remote", "united-nations", "social-impact"],
    field: "Social Impact",
  },
  {
    title: "Heidelberg Laureate Forum",
    description:
      "A week-long networking event where 200 selected young researchers in mathematics and computer science meet Abel, Fields, Turing, and Nevanlinna laureates. Travel and accommodation fully covered.",
    type: OpportunityType.CONFERENCE,
    homepageUrl: "https://www.heidelberg-laureate-forum.org",
    deadline: days(52),
    startDate: days(200),
    endDate: days(205),
    city: "Heidelberg",
    country: "Germany",
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "Travel, accommodation, and meals fully covered for selected participants.",
    tags: ["mathematics", "computer-science", "networking", "young-researchers"],
    field: "Mathematics",
  },
  {
    title: "Outreachy Internships",
    description:
      "Paid, remote, three-month internships in open source and open science for people subject to systemic bias and underrepresentation in tech. $7,000 stipend, no degree required.",
    type: OpportunityType.TRAINING,
    homepageUrl: "https://www.outreachy.org",
    applyUrl: "https://www.outreachy.org/apply/",
    deadline: days(28),
    online: true,
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "$7,000 USD internship stipend, fully remote.",
    tags: ["open-source", "internship", "diversity", "remote"],
    field: "Software Engineering",
  },
  {
    title: "ACL 2026: Call for Papers",
    description:
      "The Annual Meeting of the Association for Computational Linguistics invites papers on all areas of natural language processing and computational linguistics.",
    type: OpportunityType.CFP_CONFERENCE,
    homepageUrl: "https://2026.aclweb.org",
    deadline: days(8),
    city: "Singapore",
    country: "Singapore",
    funding: FundingLevel.UNKNOWN,
    tags: ["NLP", "paper-submission", "computational-linguistics"],
    field: "Natural Language Processing",
  },
  {
    title: "Chan Zuckerberg Biohub Investigator Program",
    description:
      "Grants for bold, risk-taking biomedical researchers at partner universities, providing unrestricted funding to pursue transformative science.",
    type: OpportunityType.GRANT,
    homepageUrl: "https://www.czbiohub.org",
    deadline: days(140),
    country: "United States",
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "Up to $1M unrestricted research funding over five years.",
    tags: ["biomedical", "research-funding"],
    field: "Biology",
  },
  {
    title: "Google Summer of Code",
    description:
      "A global online program funding contributors to work on open source projects for 12+ weeks under mentor guidance. Stipends vary by project size and location.",
    type: OpportunityType.TRAINING,
    homepageUrl: "https://summerofcode.withgoogle.com",
    deadline: days(18),
    online: true,
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "Stipend of $1,500-$6,600 depending on project size and location.",
    tags: ["open-source", "students", "remote", "mentorship"],
    field: "Software Engineering",
  },
  {
    title: "World Bank Youth Summit",
    description:
      "Annual flagship event engaging young people worldwide in development topics, with competitive selection for in-person attendance in Washington, DC and a global livestream.",
    type: OpportunityType.CONFERENCE,
    homepageUrl: "https://www.worldbank.org/en/events/youth-summit",
    deadline: days(58),
    city: "Washington, DC",
    country: "United States",
    online: true,
    funding: FundingLevel.NOT_FUNDED,
    tags: ["development", "youth", "policy"],
    field: "Economics",
  },
  {
    title: "Nature Communications, Special Collection on Climate Adaptation",
    description:
      "Open call for primary research on climate change adaptation strategies, spanning environmental science, economics, and public health.",
    type: OpportunityType.CFP_JOURNAL,
    homepageUrl: "https://www.nature.com/ncomms/",
    deadline: days(90),
    online: true,
    funding: FundingLevel.UNKNOWN,
    tags: ["journal", "climate", "paper-submission"],
    field: "Environmental Science",
  },
  {
    title: "AAAS Mass Media Science & Engineering Fellows Program",
    description:
      "A 10-week summer fellowship placing STEM graduate students in newsrooms across the US to work as science journalists. Weekly stipend plus travel costs.",
    type: OpportunityType.FELLOWSHIP,
    homepageUrl: "https://www.aaas.org/programs/mass-media-fellowship",
    deadline: days(70),
    country: "United States",
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "Weekly stipend and travel covered for the 10-week placement.",
    tags: ["science-communication", "journalism", "summer"],
    field: "Science Communication",
  },
  {
    title: "ICSE 2027: Call for Papers",
    description:
      "The International Conference on Software Engineering is the premier venue for software engineering research, covering testing, program analysis, AI for SE, and empirical studies.",
    type: OpportunityType.CFP_CONFERENCE,
    homepageUrl: "https://conf.researchr.org/series/icse",
    deadline: days(42),
    city: "Sydney",
    country: "Australia",
    funding: FundingLevel.UNKNOWN,
    tags: ["software-engineering", "paper-submission"],
    field: "Software Engineering",
  },
  {
    title: "Open Source Summit Europe, Diversity Scholarship",
    description:
      "The Linux Foundation offers complimentary registration and travel funding for community members from underrepresented groups to attend Open Source Summit Europe.",
    type: OpportunityType.CONFERENCE,
    homepageUrl: "https://events.linuxfoundation.org/open-source-summit-europe/",
    deadline: days(26),
    startDate: days(95),
    endDate: days(98),
    city: "Amsterdam",
    country: "Netherlands",
    funding: FundingLevel.PARTIALLY_FUNDED,
    fundingNotes: "Free registration; travel fund up to $1,500 for selected scholars.",
    tags: ["open-source", "linux", "diversity", "scholarship"],
    field: "Software Engineering",
  },
  {
    title: "Erasmus Mundus Joint Master Degrees",
    description:
      "Fully funded master's programmes delivered by consortia of European universities: EU-funded scholarships cover tuition, travel, installation, and monthly living costs.",
    type: OpportunityType.FELLOWSHIP,
    homepageUrl: "https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en",
    deadline: days(105),
    country: "European Union",
    funding: FundingLevel.FULLY_FUNDED,
    fundingNotes: "Tuition, travel, installation costs, and ~€1,400/month stipend.",
    tags: ["masters", "europe", "scholarship", "international"],
    field: "All Fields",
  },
  {
    title: "PyCon US Volunteer Crew",
    description:
      "Help run the largest annual Python conference: session chairing, registration desk, tutorial support. Volunteers receive conference credit and community recognition.",
    type: OpportunityType.VOLUNTEER,
    homepageUrl: "https://us.pycon.org",
    deadline: days(33),
    startDate: days(60),
    endDate: days(66),
    city: "Pittsburgh",
    country: "United States",
    funding: FundingLevel.NOT_FUNDED,
    tags: ["python", "volunteer", "community"],
    field: "Software Engineering",
  },
];

async function main() {
  // Dev admin account so the moderation dashboard is usable immediately.
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@opportunitybox.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "admin1234";
  await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN", emailVerified: new Date() },
    create: {
      email: adminEmail,
      name: "OpportunityBox Admin",
      role: "ADMIN",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      // Seeded accounts skip the verification email, otherwise the first
      // admin could never log in to a fresh deployment.
      emailVerified: new Date(),
    },
  });
  console.log(`Admin user ready: ${adminEmail}`);

  let created = 0;
  for (const opp of opportunities) {
    const slug = opportunitySlug(opp.title, opp.homepageUrl);
    await db.opportunity.upsert({
      where: { slug },
      update: {},
      create: {
        ...opp,
        slug,
        online: opp.online ?? false,
        status: OpportunityStatus.APPROVED,
        origin: OpportunityOrigin.ADMIN,
      },
    });
    created++;
  }
  console.log(`Seeded ${created} opportunities.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
