import PDFDocument from 'pdfkit';
import { ResumeContent } from './openai';

export async function exportResumeToPDF(resumeContent: ResumeContent): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Header
      doc.fontSize(24)
         .text(resumeContent.personalInfo.name, 50, 50)
         .fontSize(12)
         .text(resumeContent.personalInfo.email, 50, 80)
         .text(resumeContent.personalInfo.phone, 200, 80)
         .text(resumeContent.personalInfo.location, 350, 80)
         .text(resumeContent.personalInfo.linkedinUrl, 50, 95);

      let yPosition = 130;

      // Summary
      doc.fontSize(16)
         .text('Professional Summary', 50, yPosition)
         .fontSize(11)
         .text(resumeContent.summary, 50, yPosition + 20, { width: 500 });

      yPosition += 80;

      // Experience
      doc.fontSize(16)
         .text('Experience', 50, yPosition);
      yPosition += 25;

      resumeContent.experience.forEach((exp) => {
        doc.fontSize(12)
           .text(`${exp.title} | ${exp.company}`, 50, yPosition)
           .fontSize(10)
           .text(exp.duration, 50, yPosition + 15);
        
        yPosition += 35;

        exp.achievements.forEach((achievement) => {
          doc.fontSize(10)
             .text(`• ${achievement}`, 70, yPosition, { width: 480 });
          yPosition += 15;
        });

        yPosition += 10;
      });

      // Skills
      doc.fontSize(16)
         .text('Skills', 50, yPosition)
         .fontSize(11)
         .text(resumeContent.skills.join(', '), 50, yPosition + 20, { width: 500 });

      yPosition += 60;

      // Education
      if (resumeContent.education.length > 0) {
        doc.fontSize(16)
           .text('Education', 50, yPosition);
        yPosition += 25;

        resumeContent.education.forEach((edu) => {
          doc.fontSize(12)
             .text(`${edu.degree} | ${edu.institution}`, 50, yPosition)
             .fontSize(10)
             .text(edu.year, 50, yPosition + 15);
          yPosition += 35;
        });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function exportResumeToDocx(resumeContent: ResumeContent): Buffer {
  // For DOCX export, we'll create a simple text-based version
  // In a production environment, you might want to use a proper DOCX library
  const content = `
${resumeContent.personalInfo.name}
${resumeContent.personalInfo.email} | ${resumeContent.personalInfo.phone}
${resumeContent.personalInfo.location}
${resumeContent.personalInfo.linkedinUrl}

PROFESSIONAL SUMMARY
${resumeContent.summary}

EXPERIENCE
${resumeContent.experience.map(exp => `
${exp.title} | ${exp.company}
${exp.duration}
${exp.achievements.map(achievement => `• ${achievement}`).join('\n')}
`).join('\n')}

SKILLS
${resumeContent.skills.join(', ')}

EDUCATION
${resumeContent.education.map(edu => `
${edu.degree} | ${edu.institution}
${edu.year}
`).join('\n')}
`;

  return Buffer.from(content, 'utf-8');
}
