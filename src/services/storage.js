const STORAGE_KEY = "ats_resumes";

// Generate unique ID
const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all saved resumes
export const getResumes = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error reading resumes from storage:", error);
        return [];
    }
};

// Save a new resume
export const saveResume = (name, latex, jobDescription, analysis, optimizedLatex = null) => {
    try {
        const resumes = getResumes();
        const newResume = {
            id: generateId(),
            name: name || `Resume ${resumes.length + 1}`,
            latex,
            jobDescription,
            analysis,
            optimizedLatex,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        resumes.unshift(newResume); // Add to beginning
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
        return newResume;
    } catch (error) {
        console.error("Error saving resume:", error);
        throw error;
    }
};

// Update an existing resume
export const updateResume = (id, updates) => {
    try {
        const resumes = getResumes();
        const index = resumes.findIndex((r) => r.id === id);
        if (index === -1) {
            throw new Error("Resume not found");
        }
        resumes[index] = {
            ...resumes[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumes));
        return resumes[index];
    } catch (error) {
        console.error("Error updating resume:", error);
        throw error;
    }
};

// Get a specific resume by ID
export const getResume = (id) => {
    try {
        const resumes = getResumes();
        return resumes.find((r) => r.id === id) || null;
    } catch (error) {
        console.error("Error getting resume:", error);
        return null;
    }
};

// Delete a resume
export const deleteResume = (id) => {
    try {
        const resumes = getResumes();
        const filtered = resumes.filter((r) => r.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error("Error deleting resume:", error);
        return false;
    }
};

// Default LaTeX resume template
export const getDefaultResume = () => {
    return `\\documentclass[10pt, letterpaper]{article}

% Packages:
\\usepackage[
    ignoreheadfoot, % set margins without considering header and footer
    top=2 cm, % seperation between body and page edge from the top
    bottom=2 cm, % seperation between body and page edge from the bottom
    left=2 cm, % seperation between body and page edge from the left
    right=2 cm, % seperation between body and page edge from the right
    footskip=1.0 cm, % seperation between body and footer
    % showframe % for debugging 
]{geometry} % for adjusting page geometry
\\usepackage{titlesec} % for customizing section titles
\\usepackage{tabularx} % for making tables with fixed width columns
\\usepackage{array} % tabularx requires this
\\usepackage[dvipsnames]{xcolor} % for coloring text
\\definecolor{primaryColor}{RGB}{0, 128, 128} % define primary color as teal
\\definecolor{headerColor}{RGB}{0, 0, 0} % define header color as black
\\usepackage{enumitem} % for customizing lists
\\usepackage{fontawesome5} % for using icons
\\usepackage{amsmath} % for math
\\usepackage[
    pdftitle={DM Nihal's CV},
    pdfauthor={DM Nihal},
    pdfcreator={LaTeX with RenderCV},
    colorlinks=true,
    linkcolor=black,
    urlcolor=primaryColor,
    citecolor=black
]{hyperref} % for links, metadata and bookmarks
\\usepackage[pscoord]{eso-pic} % for floating text on the page
\\usepackage{calc} % for calculating lengths
\\usepackage{bookmark} % for bookmarks
\\usepackage{lastpage} % for getting the total number of pages
\\usepackage{changepage} % for one column entries (adjustwidth environment)
\\usepackage{paracol} % for two and three column entries
\\usepackage{ifthen} % for conditional statements
\\usepackage{needspace} % for avoiding page brake right after the section title
\\usepackage{iftex} % check if engine is pdflatex, xetex or luatex

% Ensure that generate pdf is machine readable/ATS parsable:
\\ifPDFTeX
    \\input{glyphtounicode}
    \\pdfgentounicode=1
    \\usepackage[T1]{fontenc}
    \\usepackage[utf8]{inputenc}
    \\usepackage{lmodern}
\\fi

\\usepackage{charter}

% Some settings:
\\raggedright
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt} % remove space before adjustwidth environment
\\pagestyle{empty} % no header or footer
\\setcounter{secnumdepth}{0} % no section numbering
\\setlength{\\parindent}{0pt} % no indentation
\\setlength{\\topskip}{0pt} % no top skip
\\setlength{\\columnsep}{0.15cm} % set column seperation
\\pagenumbering{gobble} % no page numbering
\\hypersetup{colorlinks=true, urlcolor=black}

\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\large\\color{primaryColor}}{}{0pt}{}[\\vspace{1pt}\\titlerule]

\\titlespacing{\\section}{
    % left space:
    -1pt
}{
    % top space:
    0.3 cm
}{
    % bottom space:
    0.2 cm
} % section title spacing

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$} % custom bullet points
\\newenvironment{highlights}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0 cm + 10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights


\\newenvironment{highlightsforbulletentries}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights for bullet entries

\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{
        0 cm + 0.00001 cm
    }{
        0 cm + 0.00001 cm
    }
}{
    \\end{adjustwidth}
} % new environment for one column entries

\\newenvironment{twocolentry}[2][]{
    \\onecolentry
    \\def\\secondColumn{#2}
    \\setcolumnwidth{\\fill, 4.5 cm}
    \\begin{paracol}{2}
}{
    \\switchcolumn \\raggedleft \\secondColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for two column entries

\\newenvironment{threecolentry}[3][]{
    \\onecolentry
    \\def\\thirdColumn{#3}
    \\setcolumnwidth{, \\fill, 4.5 cm}
    \\begin{paracol}{3}
    {\\raggedright #2} \\switchcolumn
}{
    \\switchcolumn \\raggedleft \\thirdColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for three column entries

\\newenvironment{header}{
    \\setlength{\\topsep}{0pt}\\par\\kern\\topsep\\centering\\linespread{1.5}
    \\color{headerColor} % ensure header content is black
}{
    \\par\\kern\\topsep
} % new environment for the header

\\newcommand{\\placelastupdatedtext}{% \\placetextbox{<horizontal pos>}{<vertical pos>}{<stuff>}
  \\AddToShipoutPictureFG*{% Add <stuff> to current page foreground
    \\put(
        \\LenToUnit{\\paperwidth-2 cm-0 cm+0.05cm},
        \\LenToUnit{\\paperheight-1.0 cm}
    ){\\vtop{{\\null}\\makebox[0pt][c]{
        \\small\\color{gray}\\textit{Last updated in September 2024}\\hspace{\\widthof{Last updated in September 2024}}
    }}}%
  }%
}%

% save the original href command in a new command:
\\let\\hrefWithoutArrow\\href

% Create a special version for header links
\\newcommand{\\headerHref}[2]{\\textcolor{headerColor}{\\href{#1}{#2}}}

\\begin{document}
    \\newcommand{\\AND}{\\unskip
        \\cleaders\\copy\\ANDbox\\hskip\\wd\\ANDbox
        \\ignorespaces
    }
    \\newsavebox\\ANDbox
    \\sbox\\ANDbox{$|$}

    \\begin{header}
        \\fontsize{25 pt}{25 pt}\\selectfont D M Nihal

        \\vspace{5 pt}

        \\normalsize
        % \\mbox{DIP, Dubai}%
        \\mbox{Bengaluru}%
        \\kern 5.0 pt%
        \\AND%
        \\kern 5.0 pt%
        \\mbox{\\textcolor{black}{\\headerHref{mailto:Nihaldm65@gmail.com}{Nihaldm65@gmail.com}}}%
        \\kern 5.0 pt%
        \\AND%
        \\kern 5.0 pt%
        % \\mbox{\\hrefWithoutArrow{tel:+971 522368608}{+971 522368608}}%
        \\mbox{\\headerHref{tel:+91 8197922447}{+91 8197922447}}%
        \\kern 5.0 pt%
         \\AND%
        \\kern 5.0 pt%
         % \\mbox{\\hrefWithoutArrow{tel:+971 522368608}{+971 522368608}}%
        \\mbox{\\href{https://www.linkedin.com/in/dmnihal65/}{\\textcolor{blue}{\\underline{linkedin}}}}%
        \\kern 5.0 pt%
         \\AND%
        \\kern 5.0 pt%
       \\mbox{\\href{https://dmnihal.vercel.app/}{\\textcolor{blue}{\\underline{Portfolio}}}}%

        \\kern 5.0 pt%
    \\end{header}

    \\vspace{5 pt - 0.2 cm}


    \\section{Professional Summary}

\\begin{onecolentry}
Experienced Software and Data Engineer with 2+ years in full-stack development and data engineering, eager to leverage expertise in Python, \\textbf{FastAPI}, \\textbf{PySpark}, \\textbf{Kafka}, \\textbf{Spark}, \\textbf{AWS}, and \\textbf{React} to contribute to building robust and scalable \\textbf{AI platforms}. Proven ability to bridge \\textbf{backend}, \\textbf{data}, and \\textbf{frontend} to deliver innovative solutions, with a strong interest in \\textbf{Generative AI}, and platform architecture focused on enhancing developer experience and deploying large-scale enterprise AI solutions.
\\end{onecolentry}

\\section{Skills}
\\begin{itemize}[noitemsep,leftmargin=*]
    \\item \\textbf{Languages:} Python, PySpark, SQL
    \\item \\textbf{Frontend:} React.js, Vue.js, HTML/CSS, TailwindCSS
    \\item \\textbf{Backend:} FastAPI
    \\item \\textbf{Databases:} PostgreSQL, MySQL, TimeSeries Database, Vector Stores, CromaDB
    \\item \\textbf{Data Engineering:} Apache Spark/PySpark, ETL/ELT, Data Modeling, Kafka, Azure Data Factory, Databricks, Medallion Architecture, Real-Time Streaming
    \\item \\textbf{AI:} Generative AI, Agentic AI, RAG (Retrieval-Augmented Generation), Pinecone, LangChain, LangGraph, Autogen,  Hugging Face, Fine-tuning, LlamaIndex, LoRA / QLoRA
    \\item \\textbf{Cloud \\& DevOps:} AWS (EC2, S3, RDS), Azure (Data Factory, Blob Storage), Docker, Git

    \\item \\textbf{Tools \\& Practices:} Git, API Design, Authentication, System Design
\\end{itemize}



            

\\section{Experience}

% ========== Project Associate II ==========
\\begin{twocolentry}{
    June 2024 – Present\\\\
}
\\textbf{\\Large Project Associate - II -- Data and Software Engineer} \\\\
\\textbf{Central Manufacturing Technology Institute (CMTI), Bengaluru} \\\\
{\\small\\textit{\\footnotesize An autonomous R\\&D institute under the Ministry of Heavy Industries, Govt. of India}}
\\end{twocolentry}

\\vspace{0.2cm}
\\begin{onecolentry}
\\begin{highlights}
    \\item Architected and optimized MES/IoT data pipelines, enhancing real-time data ingestion reliability by 30\\% and enabling advanced analytics and monitoring for multiple production lines within factory environments.
    \\item Developed and deployed scalable machine efficiency dashboards leveraging \\textbf{Spark} Structured Streaming, Delta Lake, and complex window functions, providing accurate production KPIs and time-based insights that improved operational decision-making.
    \\item Engineered and deployed an end-to-end microservices and analytics stack using \\textbf{FastAPI}, \\textbf{Kafka}, \\textbf{PostgreSQL}, and \\textbf{React}, integrated with robust \\textbf{CI/CD pipelines} for scalable deployment, observability, and automated system management.
\\end{highlights}
\\end{onecolentry}

\\vspace{0.4cm}

% ========== Project Associate I ==========
\\begin{twocolentry}{
    March 2023 – May 2024\\\\
}
\\textbf{\\Large Project Associate - I -- Full Stack and Data Engineer} \\\\
\\textbf{Central Manufacturing Technology Institute (CMTI), Bengaluru} \\\\
\\small\\textit{\\footnotesize An autonomous R\\&D institute under the Ministry of Heavy Industries, Govt. of India}
\\end{twocolentry}

\\vspace{0.2cm}
\\begin{onecolentry}
\\begin{highlights}
    \\item Led Agile teams in the full lifecycle delivery of production-ready IoT software for manufacturing automation, designing and implementing scalable \\textbf{ETL} pipelines with \\textbf{Azure Data Factory} and \\textbf{Spark} that reduced manual reporting time by 70\\%.
    \\item Developed an IoT-enabled MES module capable of ingesting and processing 100+ OPC-UA sensor parameters using \\textbf{Kafka} and \\textbf{PySpark}, delivering real-time operational insights via \\textbf{React} dashboards and \\textbf{PostgreSQL}.
    \\item Architected secure and highly available \\textbf{AWS}-based document and inventory management systems, integrating \\textbf{S3} with multipart uploads and presigned URLs, ensuring data integrity and optimizing large file transfers.
    \\item Created robust machine maintenance and monitoring solutions utilizing \\textbf{PySpark}, \\textbf{MongoDB}, and \\textbf{PostgreSQL}, exposing critical analytics through \\textbf{REST APIs} and interactive \\textbf{React} dashboards, improving maintenance efficiency.
    \\item Engineered a real-time logistics optimization platform with \\textbf{SocketIO} for efficient bidirectional communication, leveraging \\textbf{AWS} backend services and a \\textbf{React} frontend to enable dynamic order/vehicle assignment and fleet status monitoring for multi-role users.
\\end{highlights}
\\end{onecolentry}

\\vspace{0.4cm}
\\vspace{0.4cm}

% ========== Graduate Apprentice ==========
\\begin{twocolentry}{
    July 2022 – February 2023\\\\
}
\\textbf{\\Large Graduate Apprentice – Full Stack Developer} \\\\
\\textbf{Central Manufacturing Technology Institute (CMTI), Bengaluru} \\\\
\\small\\textit{An autonomous R\\&D institute under the Ministry of Heavy Industries, Govt. of India}
\\end{twocolentry}

\\vspace{0.2cm}
\\begin{onecolentry}
\\begin{highlights}
    \\item Developed a real-time welding machine monitoring system leveraging \\textbf{Vue.js}, \\textbf{FastAPI}, \\textbf{PostgreSQL}, and \\textbf{WebSockets} to provide live health tracking and anomaly alerts, enhancing predictive maintenance capabilities.
    \\item Created responsive, data-driven dashboards and web applications, utilizing efficient \\textbf{SQL} queries and \\textbf{Python} scripts for data extraction and transformation, which improved operational decision-making by 20\\%.
    \\item Implemented robust \\textbf{REST APIs} and backend logic using \\textbf{FastAPI}, integrating secure authentication, pagination, and comprehensive data validation into \\textbf{React} frontends to ensure data integrity and security protocols.
\\end{highlights}
\\end{onecolentry}

\\vspace{0.4cm}


\\vspace{0.3cm}


\\vspace{0.3cm}




\\section{Projects}
\\begin{highlights}

\\item \\textbf{Smart Traffic Analytics Platform (Kafka/Data Engineering)} — Engineered a real-time traffic congestion monitoring system for urban planning. Leveraged \\textbf{Apache Kafka} for high-throughput data ingestion, \\textbf{PostgreSQL} for persistent storage, and \\textbf{Streamlit} for interactive dashboards. Simulated diverse IoT traffic sensor data through scalable \\textbf{Dockerized pipelines}, enabling live congestion insights and achieving reduction in data latency.
\\vspace{0.2cm}

\\item \\textbf{GenAI Mock Interview Simulator (Generative AI/Full-Stack Development)} — Developed an AI-powered mock interview platform to enhance interview preparedness. Utilized \\textbf{React.js} for a dynamic user interface, integrated \\textbf{Gemini AI} (or other LLM) for intelligent question generation and voice-based feedback, and \\textbf{PostgreSQL} for secure data management. This platform improved user mock interview scores by \\textbf{30\\%} through personalized feedback and realistic simulation.
\\vspace{0.2cm}

\\item \\textbf{CodeSnippet Master (SaaS) (AI-Assisted Documentation/Platform Development)} — Created a SaaS tool to streamline code snippet management and enhance developer experience. Featured \\textbf{AI-assisted auto-documentation} capabilities (using \\textbf{Langchain/Hugging Face} concepts) to generate explanations for reusable code. Built with \\textbf{React.js}, \\textbf{Drizzle ORM}, and \\textbf{TailwindCSS}, enabling developers to efficiently store, organize, and auto-document code, boosting productivity.
\\vspace{0.2cm}

\\end{highlights}


    \\section{Education}

        \\begin{twocolentry}{
             2019 – 2023
        }
            \\textbf{Acharya Institute of Technology}, BE in Computer Science and Engineering\\end{twocolentry}

\\section{Achievements}

\\begin{onecolentry}
\\begin{highlights}
    \\item Solved over \\textbf{250+ Data Structures and Algorithms problems} across LeetCode, TUF+, and multiple competitive coding platforms, demonstrating strong problem-solving skills.
    \\item Received the prestigious award for the \\textbf{Best Final Year Project Presentation} at Acharya Institute of Technology, recognizing innovative project design and execution.
\\end{highlights}
\\end{onecolentry}


\\end{document}`;
};
