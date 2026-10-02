type ResumeLine = { text: string; size?: number; gap?: number; bold?: boolean };

const resume: ResumeLine[] = [
  { text: "M. Faiz Khan", size: 27, bold: true, gap: 38 },
  { text: "WEB DEVELOPER", size: 11, bold: true, gap: 22 },
  { text: "Karachi, Pakistan | aimsfaiz27@gmail.com | +92 306 2573751", size: 10, gap: 18 },
  { text: "github.com/m-faizkhan | linkedin.com/in/faiz-khan-877a1835b", size: 10, gap: 31 },
  { text: "PROFILE", size: 12, bold: true, gap: 21 },
  { text: "Web developer with practical full stack internship experience. Building responsive", gap: 15 },
  { text: "interfaces and dynamic websites using React, JavaScript, PHP and MySQL.", gap: 29 },
  { text: "EXPERIENCE", size: 12, bold: true, gap: 23 },
  { text: "Web Developer | Webixus | June 2026", bold: true, gap: 19 },
  { text: "Responsive websites with React and Tailwind CSS, API integration,", gap: 15 },
  { text: "performance optimization and maintainable code. Karachi, Pakistan.", gap: 25 },
  { text: "Web Development Intern | AIMS Advertising | Oct to Dec 2025", bold: true, gap: 19 },
  { text: "Responsive interfaces and dynamic pages using HTML, CSS, JavaScript,", gap: 15 },
  { text: "PHP and MySQL. Frontend development and feature delivery.", gap: 25 },
  { text: "UI/UX & Web Development Intern | UIUX | Oct to Dec 2025", bold: true, gap: 19 },
  { text: "Interface design and web development internship. Karachi, Pakistan.", gap: 30 },
  { text: "EDUCATION", size: 12, bold: true, gap: 23 },
  { text: "Aptech Institute | Diploma in Web Development", bold: true, gap: 17 },
  { text: "January 2021 to December 2025", gap: 23 },
  { text: "Mehran Degree College | Intermediate | 2021 to 2024", gap: 23 },
  { text: "Happy Palace Grammar School | Matriculation | 2020", gap: 30 },
  { text: "TECHNICAL SKILLS", size: 12, bold: true, gap: 22 },
  { text: "HTML5, CSS3, JavaScript, React, Tailwind CSS, Bootstrap", gap: 17 },
  { text: "PHP, MySQL, Node.js, Git and GitHub", gap: 17 },
  { text: "Responsive interface design, API integration, MS Word and MS Excel", gap: 25 },
];

// Generate the PDF locally, since the original site's CV file is unavailable.
export function downloadCV() {
  let y = 790;
  const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const content = resume.map((line) => {
    const command = `BT /${line.bold ? "F2" : "F1"} ${line.size ?? 10.5} Tf 0.13 0.14 0.12 rg 1 0 0 1 48 ${y} Tm (${escape(line.text)}) Tj ET`;
    y -= line.gap ?? 18;
    return command;
  }).join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "Faiz_Khan_CV.pdf";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}