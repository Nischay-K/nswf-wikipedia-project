// JavaScript Application Logic for NSWF Digital Portal

// 1. Dataset for Noise Monitoring Study (Pune 2025)
const noiseData = [
    {
        location: "Shaniwar Peth",
        slot: "Evening",
        db: 106.8,
        safeLimit: 55,
        energyMultiplier: 151356,
        healthImpact: "Immediate hearing damage risk. Prolonged exposure causes permanent sensorineural hearing loss, extreme sleep disturbance, and elevates cardiovascular stress metrics."
    },
    {
        location: "Fergusson College Road (FC Road)",
        slot: "Evening",
        db: 102.1,
        safeLimit: 55,
        energyMultiplier: 51286,
        healthImpact: "Highly dangerous exposure level. Exceeds the maximum continuous industrial noise allowance by over 17 dB, causing acute cognitive fatigue and acoustic trauma."
    },
    {
        location: "Laxmi Road",
        slot: "Afternoon",
        db: 98.5,
        safeLimit: 55,
        energyMultiplier: 22387,
        healthImpact: "Severe commercial district noise. Promotes high stress hormone release (cortisol/adrenaline), resulting in elevated blood pressure and chronic auditory fatigue."
    },
    {
        location: "Karve Road",
        slot: "Evening",
        db: 95.4,
        safeLimit: 55,
        energyMultiplier: 10964,
        healthImpact: "Harmful environment for children and elderly. Exceeds CPCB silence zone parameters by 45.4 dB, leading to communication interference and nervous strain."
    },
    {
        location: "Tilak Road",
        slot: "Morning",
        db: 88.2,
        safeLimit: 55,
        energyMultiplier: 2089,
        healthImpact: "Breaches safe limits by over 33 dB. Causes difficulty in concentration, increases errors in cognitive tasks, and contributes to baseline hearing degradation."
    }
];

// 2. Tab Navigation Titles
const tabMetadata = {
    "dashboard": {
        title: "Dashboard Overview",
        subtitle: "Key metrics and high-level campaign summary"
    },
    "dossier": {
        title: "Digital Dossier",
        subtitle: "Fully compiled organization documentation and campaign records"
    },
    "wiki-preview": {
        title: "Wikipedia Live Previewer",
        subtitle: "Raw WikiText draft side-by-side with desktop Wikipedia replica"
    },
    "noise-analyzer": {
        title: "Noise Level Monitoring Analyzer",
        subtitle: "Interactive data-driven decibel calculator and safety assessment"
    },
    "media-gallery": {
        title: "Media Asset Gallery",
        subtitle: "Curated campaign photographs and brand assets"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initNoiseAnalyzer();
    loadFiles();
});

// Tab Navigation Logic
function initTabs() {
    const navItems = document.querySelectorAll(".nav-item");
    const tabContents = document.querySelectorAll(".tab-content");
    const pageTitle = document.getElementById("page-title");
    const pageSubtitle = document.getElementById("page-subtitle");

    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetTab = item.getAttribute("data-tab");

            // Toggle active classes
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");

            tabContents.forEach(tab => {
                tab.classList.remove("active");
                if (tab.id === targetTab) {
                    tab.classList.add("active");
                }
            });

            // Update Titles
            if (tabMetadata[targetTab]) {
                pageTitle.textContent = tabMetadata[targetTab].title;
                pageSubtitle.textContent = tabMetadata[targetTab].subtitle;
            }
        });
    });
}

// Noise Level Calculator logic
function initNoiseAnalyzer() {
    const selector = document.getElementById("location-selector");
    
    // Clear and build buttons
    selector.innerHTML = "";
    noiseData.forEach((item, index) => {
        const btn = document.createElement("button");
        btn.className = `loc-btn ${index === 0 ? 'active' : ''}`;
        btn.innerHTML = `
            <span>${item.location} <small>(${item.slot})</small></span>
            <span class="loc-db">${item.db} dB</span>
        `;
        btn.addEventListener("click", () => {
            document.querySelectorAll(".loc-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            updateCalculatorDisplay(item);
        });
        selector.appendChild(btn);
    });

    // Load initial item
    updateCalculatorDisplay(noiseData[0]);
}

function updateCalculatorDisplay(item) {
    document.getElementById("calc-loc-name").textContent = `${item.location} (${item.slot})`;
    document.getElementById("calc-db-val").textContent = `${item.db} dB`;
    
    const dbDiff = (item.db - item.safeLimit).toFixed(1);
    document.getElementById("calc-db-diff").textContent = `+${dbDiff} dB`;
    
    // Percentage for decibel bar (assuming max 120 dB in range)
    const pct = Math.min((item.db / 120) * 100, 100);
    document.getElementById("calc-meter-bar").style.width = `${pct}%`;
    
    // Formatted sound energy string
    const energyStr = item.energyMultiplier.toLocaleString();
    document.getElementById("calc-energy-mult").textContent = `~${energyStr} times louder`;
    
    // Health description
    const healthDesc = document.getElementById("calc-health-desc");
    healthDesc.innerHTML = `
        <i class="fa-solid fa-circle-exclamation"></i>
        <span>${item.healthImpact}</span>
    `;
}

// Load static content files to display
async function loadFiles() {
    try {
        // Fetch raw wiki source and show in editor
        const wikiRes = await fetch("wikipedia_draft.mw");
        if (wikiRes.ok) {
            const wikiText = await wikiRes.text();
            document.getElementById("wiki-source-textarea").value = wikiText;
        } else {
            throw new Error("Wiki file fetch response status not OK");
        }
    } catch (err) {
        console.warn("Using local fallback for Wiki Source due to CORS/Fetch restriction: ", err);
        document.getElementById("wiki-source-textarea").value = fallbackWikiText;
    }

    try {
        // Fetch dossier markdown and render into html
        const dossierRes = await fetch("digital_documentation.md");
        if (dossierRes.ok) {
            const mdText = await dossierRes.text();
            renderDossierHTML(mdText);
        } else {
            throw new Error("Dossier file fetch response status not OK");
        }
    } catch (err) {
        console.warn("Using local fallback for Dossier Markdown due to CORS/Fetch restriction: ", err);
        renderDossierHTML(fallbackDossierText);
    }
}

// Simple Custom Markdown Renderer to keep index.html clean and styled
function renderDossierHTML(md) {
    const container = document.getElementById("dossier-rendered-content");
    
    // Parse tables first
    let lines = md.split('\n');
    let outputLines = [];
    let currentTable = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
            currentTable.push(line);
        } else {
            if (currentTable.length > 0) {
                outputLines.push(renderTableHelper(currentTable));
                currentTable = [];
            }
            outputLines.push(lines[i]);
        }
    }
    if (currentTable.length > 0) {
        outputLines.push(renderTableHelper(currentTable));
    }
    
    let html = outputLines.join('\n')
        // Clean markdown headers
        .replace(/^# (.*$)/gim, '<h1 style="font-size:1.8rem; font-weight:800; margin-bottom:1rem; border-bottom:2px solid var(--primary); padding-bottom:0.5rem; background: linear-gradient(135deg, var(--text-primary), var(--primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 style="font-size:1.4rem; font-weight:700; margin-top:2rem; margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.5rem; color:var(--text-primary);">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 style="font-size:1.1rem; font-weight:600; margin-top:1.5rem; margin-bottom:0.75rem; color:var(--primary);">$1</h3>')
        // Callouts
        .replace(/> \[\!CAUTION\]\s*> (.*$)/gim, '<div style="background:rgba(239, 68, 68, 0.05); border-left:4px solid var(--danger); padding:1.25rem 1.5rem; border-radius:8px; margin:1.5rem 0;"><strong>Caution:</strong> $1</div>')
        .replace(/> \[\!NOTE\]\s*> (.*$)/gim, '<div style="background:rgba(6, 182, 212, 0.05); border-left:4px solid var(--secondary); padding:1.25rem 1.5rem; border-radius:8px; margin:1.5rem 0;"><strong>Note:</strong> $1</div>')
        // Multi-line blockquotes helper
        .replace(/> (.*$)/gim, '<blockquote style="background:rgba(255,255,255,0.02); border-left:4px solid var(--text-secondary); padding:0.5rem 1rem; margin:1rem 0; color:var(--text-secondary);">$1</blockquote>')
        // Lists
        .replace(/^\* (.*$)/gim, '<li style="margin-left:1.5rem; margin-bottom:0.5rem; color:var(--text-secondary); list-style-type:square;">$1</li>')
        .replace(/^- (.*$)/gim, '<li style="margin-left:1.5rem; margin-bottom:0.5rem; color:var(--text-secondary); list-style-type:circle;">$1</li>')
        // Bold / Italics
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Horizontal Rules
        .replace(/^---$/gim, '<hr style="border:none; border-top:1px solid var(--border-color); margin:2rem 0;">')
        // Resolve images relative to the media folder
        .replace(/!\[(.*?)\]\(media\/(.*?)\)/g, '<img src="media/$2" alt="$1" style="max-width:100%; height:auto; border-radius:8px; border:1px solid var(--border-color); margin-top:0.5rem; margin-bottom:1rem;">')
        // Resolve links
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:var(--primary); text-decoration:none;">$1</a>')
        // Fix line breaks
        .replace(/\n\n/g, '<p style="margin-bottom:1rem; line-height:1.6; color:var(--text-secondary);"></p>');

    container.innerHTML = html;
}

// Helper to convert Markdown Table rows to HTML table
function renderTableHelper(rows) {
    let html = '<table style="width:100%; border-collapse:collapse; margin:1.5rem 0; font-size:0.9rem;">';
    
    // Filter out divider rows (e.g., | :--- | :--- |)
    const contentRows = rows.filter(row => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c !== '');
        return !cells.every(c => c.match(/^:?-+:?$/));
    });
    
    contentRows.forEach((row, rowIndex) => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c !== '');
        html += '<tr style="border-bottom:1px solid var(--border-color);">';
        cells.forEach(cell => {
            const tag = rowIndex === 0 ? 'th' : 'td';
            const style = tag === 'th' 
                ? 'background:rgba(255,255,255,0.02); font-weight:600; padding:0.8rem 1rem; border:1px solid var(--border-color); text-align:left;' 
                : 'padding:0.8rem 1rem; border:1px solid var(--border-color); color:var(--text-secondary); text-align:left;';
            html += `<${tag} style="${style}">${cell}</${tag}>`;
        });
        html += '</tr>';
    });
    
    html += '</table>';
    return html;
}

// Fallback data structures in case of CORS fetch blockers on local file:/// openings
const fallbackWikiText = `<!--
WIKIPEDIA SUBMISSION & PUBLISHING GUIDELINES FOR NSWF:
1. Conflict of Interest (COI): If you are directly affiliated with Nisarg Srishti Welfare Foundation (as an employee, volunteer, or intern), Wikipedia's guidelines require you to declare this. When creating the page, do not publish it directly to the mainspace. Instead, submit it via the "Articles for Creation" (AfC) process (https://en.wikipedia.org/wiki/Wikipedia:Articles_for_creation) where independent editors will review it.
2. How to Declare COI: On your user page, add: {{User COI|Nisarg Srishti Welfare Foundation}}.
3. Uploading Images: To use NSWF's logo and campaign photos, upload them first to Wikipedia Commons (https://commons.wikimedia.org) under a free creative commons license (CC BY-SA 4.0). Once uploaded, you can reference them in the Infobox (e.g., | image = NSWF_Logo.png).
-->
{{Infobox organization
| name             = Nisarg Srishti Welfare Foundation
| image            = NSWF Logo.png
| image_size       = 220px
| image_alt        = Nisarg Srishti Welfare Foundation Logo
| caption          = Logo of Nisarg Srishti Welfare Foundation
| type             = Non-governmental organization (Section 8 Non-Profit)
| registration_id  = U85300PN2023NPL217884
| founded          = {{Start date and age|2023|01|11}}
| founder          = Dr. Garima Kavathekar
| location         = Manjari BK, Pune, Maharashtra, India
| key_people       = Smt. Deepali Kavathekar (Director)<br>Shri. Nagesh Alkunthe (Director)<br>Dr. Garima Kavathekar (Founder-Director)
| area_served      = India
| focus            = Environmental conservation, noise pollution awareness, community welfare, sustainability
| website          = {{URL|https://www.nisargsrishti.org}}
}}

The '''Nisarg Srishti Welfare Foundation''' ('''NSWF''') is an Indian non-governmental organization based in Pune, Maharashtra. Incorporated on January 11, 2023, the foundation operates as a Section 8 non-profit company. NSWF specializes in environmental conservation, sustainability advocacy, and community welfare, with a flagship focus on noise pollution awareness, data-driven noise level monitoring, and public health impact campaigns.

The foundation's public outreach campaigns and noise level monitoring drives have received international coverage, including a documentary feature by the French international news network France 24.

== History and leadership ==
The Nisarg Srishti Welfare Foundation was incorporated under the Indian Companies Act in Pune on January 11, 2023, to address pressing environmental issues such as urban noise and resource depletion. The organization was co-founded by social activist and speaker Dr. Garima Kavathekar, who serves as the Founder-Director alongside co-directors Deepali Kavathekar and Nagesh Alkunthe.

Dr. Garima Kavathekar, who holds honorary doctorates in humanities and social work, leads the organization’s strategic initiatives. She is a TEDx speaker and has received several honors, including the "Best Social Worker Award 2024," the "Samaj Ratan Award 2023," and the "Spandan National Achiever’s Award 2023" for her contributions to environmental advocacy and public welfare.

== Programs and campaigns ==

=== Noise pollution monitoring and advocacy ===
NSWF conducts active on-ground research to study and address the public health impacts of urban noise pollution, which is classified by the organization as a significant yet neglected environmental hazard. The foundation's initiatives focus on demonstrating the physiological effects of high decibel levels—such as cardiac stress, hearing loss, and sleep disorders—through workshops and monitoring drives in schools, colleges, and residential zones.

In 2025, during the Ganesh Utsav festival in Pune, the foundation conducted a 6-day systematic noise monitoring campaign to measure festival decibel levels against the regulatory guidelines of the Central Pollution Control Board (CPCB) and World Health Organization (WHO) standards. The study evaluated noise levels across morning, afternoon, and evening slots at ten major festival locations.

The monitoring recorded significant deviations from the daytime residential limit of 55 decibels (dB), with average evening levels reaching:
* '''Shaniwar Peth:''' 106.8 dB (representing a substantial logarithmic sound energy increase over the safe threshold)
* '''Fergusson College Road (FC Road):''' 102.1 dB
* '''Laxmi Road:''' 98.5 dB
* '''Karve Road:''' 95.4 dB

=== "Control Honk" campaign ===
To reduce daily traffic-related noise pollution, NSWF runs the "Control Honk" campaign. Volunteers deploy to major traffic intersections in Indian cities to display educational placards, distribute informative brochures, and organize pledge campaigns for commercial and private drivers to discourage unnecessary honking, particularly around hospital zones and school zones.

=== Sustainability and water conservation ===
The foundation designs and supports community-scale water conservation projects. It provides consulting and technical assistance to residential housing societies and schools in Pune for setting up rainwater harvesting systems. The organization also runs tree-planting campaigns and promotes sustainable waste-management practices at the neighborhood level.

=== Social and community welfare ===
Beyond environmental conservation, NSWF runs social development programs including:
* Educational support for tribal school students in Maharashtra (distribution of learning kits, stationery, and environmental studies materials).
* Healthcare and hygiene sessions for women in rural and semi-urban communities.
* Career guidance and motivational seminars for students in secondary schools.

== Collaborations ==
NSWF partners with academic and administrative institutions to conduct scientific research. During the Ganesh Utsav 2025 noise monitoring project, the foundation collaborated with student researchers from the Gokhale Institute of Politics and Economics (GIPE) to design field routes, establish measurement protocols, and compile decibel datasets for public awareness and policy recommendations.

== Awards and recognition ==
* '''Best Social Worker Award (2024)''' – Awarded to Founder-Director Dr. Garima Kavathekar for leadership in noise pollution mitigation.
* '''Samaj Ratan Award (2023)''' – Awarded for community development and environmental sustainability programs.
* '''Spandan National Achiever’s Award (2023)''' – For grassroots environmental advocacy.

== References ==
{{reflist}}

== External links ==
* {{Official website|https://www.nisargsrishti.org}}

[[Category:Environmental organisations based in India]]
[[Category:Organizations established in 2023]]
[[Category:Non-governmental organisations based in Maharashtra]]
[[Category:2023 establishments in India]]
[[Category:Non-profit organizations based in Pune]]`;

const fallbackDossierText = `# Nisarg Srishti Welfare Foundation (NSWF)
## Digital Documentation & Organization Dossier

This document serves as the official digital profile of the **Nisarg Srishti Welfare Foundation (NSWF)**. It provides a user-friendly overview of the organization's structure, a brutally honest representation of the noise pollution data gathered during campaigns, and a catalog of supporting media.

---

## 1. Executive Organization Profile

| Metric | Details |
| :--- | :--- |
| **Legal Name** | Nisarg Srishti Welfare Foundation |
| **Corporate Identification Number (CIN)** | U85300PN2023NPL217884 |
| **Date of Incorporation** | January 11, 2023 |
| **Registration Jurisdiction** | Registrar of Companies (RoC), Pune, Maharashtra, India |
| **Entity Type** | Private, Non-Governmental Company (Limited by Shares, Section 8 Non-Profit) |
| **Active Status** | Active |
| **Registered Office** | Manjari BK, Pune, Maharashtra - 412307, India |
| **Founder & Director** | Dr. Garima Kavathekar (Social Activist, TEDx Speaker) |
| **Directors** | Smt. Deepali Kavathekar, Shri. Nagesh Alkunthe |
| **Core Contact Email** | nisarg.srishti@gmail.com |
| **Official Website** | [nisargsrishti.org](https://www.nisargsrishti.org) |

---

## 2. Mission & Core Philosophy
The core philosophy of NSWF is built on the premise that **environmental health is directly tied to human survival and public wellness**. 

While many environmental organizations focus exclusively on planting trees or managing physical waste, NSWF was established to tackle **noise pollution**—a silent, invisible, and highly destructive environmental threat that is systematically ignored in rapidly urbanizing Indian cities.

### Strategic Objectives:
1. **Science-Backed Advocacy:** Combating the cultural and social indifference to noise pollution through real-time monitoring and data dissemination.
2. **Behavioral Intervention:** Instilling a sense of responsibility in citizens, particularly young drivers and students, to reduce auditory waste (e.g., unnecessary honking).
3. **Integrated Sustainability:** Implementing actionable conservation projects, including rainwater harvesting and community-led tree plantation.
4. **Empowerment and Career Building:** Educating underprivileged and tribal students while supporting women’s health and career development.

---

## 3. The Brutal Truth: Festival & Urban Noise Pollution Data

To address noise pollution, NSWF believes in presenting the **unvarnished, science-backed truth**. The foundation conducts on-ground monitoring campaigns to highlight how severely Indian urban centers breach safety regulations.

### The Ganesh Utsav 2025 Noise Level Monitoring Study
In collaboration with student researchers from the **Gokhale Institute of Politics and Economics (GIPE)**, NSWF conducted a comprehensive 6-day monitoring project covering **10 major festival junctions in Pune** across three daily time slots (morning, afternoon, and evening).

#### The Standard vs. The Reality
The World Health Organization (WHO) and the Central Pollution Control Board (CPCB) of India define the following safe noise level limits:
*   **Residential Areas:** 55 dB (Daytime) / 45 dB (Nighttime)
*   **Silence Zones (near hospitals/schools):** 50 dB (Daytime) / 40 dB (Nighttime)

#### Study Findings (Pune, 2025):
Below is the un-sugarcoated reality of decibel levels recorded during the festival processions:

| Location | Time Slot | CPCB Safe Limit (Day) | Recorded Level (Average) | Excess Level (dB) | Relative Sound Energy Increase |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Shaniwar Peth** | Evening | 55 dB | **106.8 dB** | +51.8 dB | **~150,000 times louder** than safe limit |
| **Laxmi Road** | Afternoon | 55 dB | **98.5 dB** | +43.5 dB | **~22,000 times louder** than safe limit |
| **FC Road** | Evening | 55 dB | **102.1 dB** | +47.1 dB | **~51,000 times louder** than safe limit |
| **Karve Road** | Evening | 55 dB | **95.4 dB** | +40.4 dB | **~11,000 times louder** than safe limit |
| **Tilak Road** | Morning | 55 dB | **88.2 dB** | +33.2 dB | **~2,100 times louder** than safe limit |

### Decibel Exposure vs. WHO Safety Standards
The chart below shows the measured average decibel levels compared directly to the WHO Safe Limit and the Threshold for Hearing Damage (85 dB). Note how every single campaign location breaches safety limits.

\`\`\`text
WHO Safe Limit (55 dB)          [55.0 dB]  ███████████████████████████
Hearing Damage Limit (85 dB)    [85.0 dB]  ██████████████████████████████████████████
Tilak Road (Morning)            [88.2 dB]  ████████████████████████████████████████████
Karve Road (Evening)            [95.4 dB]  ███████████████████████████████████████████████
Laxmi Road (Afternoon)          [98.5 dB]  █████████████████████████████████████████████████
FC Road (Evening)              [102.1 dB]  ███████████████████████████████████████████████████
Shaniwar Peth (Evening)        [106.8 dB]  █████████████████████████████████████████████████████
\`\`\`


> [!CAUTION]
> **Understanding the Logarithmic Scale of Noise:**
> Decibels (dB) are measured on a logarithmic scale. A 10 dB increase represents a **10-fold increase** in sound energy. A 20 dB increase is a **100-fold increase**. 
> The recorded level of **106.8 dB** is not double the CPCB limit of 55 dB—it is a **150,000+ fold increase** in sound energy. Constant exposure to noise above 85 dB causes permanent sensorineural hearing loss, acute stress, and severe sleep disturbances, yet these levels are routinely tolerated during public festivals.

---

## 4. Key Programs & Community Initiatives

### A. Noise Pollution Awareness & Workshops
NSWF conducts direct workshops in academic institutions and corporate offices. 
*   **Practical Demonstrations:** NSWF trainers show students how to use decibel meters to measure noise in their immediate environment, making the invisible threat visible.
*   **Curriculum Integration:** Introducing training modules that teach school-age children the physical and psychological damage caused by high-decibel sounds.

### B. The "Control Honk" Campaign
Reckless and unnecessary honking is a major source of stress in metropolitan areas.
*   **Traffic Junction Outreach:** NSWF volunteers deploy to busy city intersections during peak hours, displaying informative placards and engaging directly with drivers.
*   **Pledge Drives:** Urging commercial and private drivers to take the "No Honking" pledge, particularly near schools, hospitals, and residential complexes.

### C. Water Conservation & Rainwater Harvesting
Recognizing water scarcity as a compounding environmental crisis in Maharashtra:
*   **Feasibility Audits:** NSWF provides free consultations for housing societies and schools to evaluate rainwater harvesting viability.
*   **Implementation Support:** Assisting local communities in building low-cost, high-efficiency groundwater recharge structures.

### D. Community & Tribal Welfare
*   **Educational Outreach:** Support for tribal schools (Ashramshalas) by providing books, stationary, and environmental education kits.
*   **Women's Wellness Programs:** Direct health check-ups and career counseling sessions for women in rural and semi-urban areas.

---

## 5. Media Asset Catalog

These curated concept designs represent NSWF's brand presence and on-ground campaigns:

### 1. Foundation Logo
![NSWF Logo](media/nswf_logo.png)
*Concept logo combining the leaf (representing environmental conservation) with a clean, peaceful aesthetic representing noise pollution control.*

### 2. On-Ground Noise Monitoring
![NSWF Noise Monitoring](media/nswf_noise_monitoring.png)
*Volunteer researchers performing real-time decibel measurements using specialized digital meters during high-decibel public events in Pune.*

### 3. "Control Honk" Campaign Outreach
![NSWF Control Honk](media/nswf_control_honk.png)
*Public awareness drive at busy urban intersections, with volunteers holding placards educating commuters about the psychological and physiological dangers of traffic honking.*

---

## 6. Verification and Citation Index

To ensure digital credibility and Wikipedia compatibility, NSWF's activities are verified by independent secondary sources:

| Source Name | Publisher | Coverage Focus | URL Citation |
| :--- | :--- | :--- | :--- |
| **France 24 Coverage** | France 24 | Documentary detailing NSWF's noise pollution awareness drive in Delhi. | [India Chronicle / France 24 Report](https://indiachronicle.in/international-visibility-for-dr-garima-kavathekars-noise-pollution-campaign-documentary-by-france-24/) |
| **Festival Noise Study** | India Chronicle | Real-time noise monitoring study during Ganesh Festival in Pune in collaboration with GIPE. | [Ganesh Utsav 2025 Study](https://indiachronicle.in/nisarg-srishti-welfare-foundation-and-gokhale-institute-students-pioneering-real-time-noise-monitoring/) |
| **MCA Corporate Database** | ZaubaCorp | Official registration details, directors, incorporation date (January 11, 2023). | [ZaubaCorp NSWF Profile](https://www.zaubacorp.com/company/NISARG-SRISHTI-WELFARE-FOUNDATION/U85300PN2023NPL217884) |
| **NGO Profile & Direction** | Bharat Good Times | Overview of Dr. Garima Kavathekar's achievements and NSWF's national outreach programs. | [Bharat Good Times Profile](https://bharatgoodtimes.com/dr-garima-kavathekar-championing-environmental-and-social-change/) |
| **Outreach and Awards** | Stay Featured | Detailed breakdown of NSWF's multi-disciplinary social campaigns and green projects. | [Stay Featured Outreach Profile](https://stayfeatured.com/nisarg-srishti-welfare-foundation-grassroots-sustainability/) |`;
