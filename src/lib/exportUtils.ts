import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export const exportToWord = async (title: string, content: string, filename: string) => {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          ...content.split('\n').map(line => {
            if (line.trim().startsWith('# ')) {
              return new Paragraph({
                text: line.replace('# ', ''),
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
              });
            }
            return new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 22, // 11pt
                }),
              ],
              spacing: { after: 120 },
            });
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};
