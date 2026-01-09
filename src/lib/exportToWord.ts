import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType,
  BorderStyle
} from "docx";
import { saveAs } from "file-saver";
import { Mensagem } from "@/types/chat";

interface ParsedBlock {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'list-item' | 'ordered-item';
  content: string;
  number?: number;
}

const parseMarkdownLine = (line: string, index: number, lines: string[]): ParsedBlock | null => {
  const trimmed = line.trim();
  
  if (!trimmed) return null;

  // Headers
  if (trimmed.startsWith('### ')) {
    return { type: 'heading3', content: trimmed.slice(4) };
  }
  if (trimmed.startsWith('## ')) {
    return { type: 'heading2', content: trimmed.slice(3) };
  }
  if (trimmed.startsWith('# ')) {
    return { type: 'heading1', content: trimmed.slice(2) };
  }

  // Unordered list
  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    return { type: 'list-item', content: trimmed.slice(2) };
  }

  // Ordered list
  const orderedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
  if (orderedMatch) {
    return { type: 'ordered-item', content: orderedMatch[2], number: parseInt(orderedMatch[1]) };
  }

  // Regular paragraph
  return { type: 'paragraph', content: trimmed };
};

const parseInlineFormatting = (text: string): TextRun[] => {
  const runs: TextRun[] = [];
  
  // Regex to match bold, italic, and bold-italic patterns
  const pattern = /(\*\*\*(.+?)\*\*\*)|(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`(.+?)`)|([^*`]+)/g;
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    if (match[2]) {
      // Bold + Italic (***text***)
      runs.push(new TextRun({ text: match[2], bold: true, italics: true }));
    } else if (match[4]) {
      // Bold (**text**)
      runs.push(new TextRun({ text: match[4], bold: true }));
    } else if (match[6]) {
      // Italic (*text*)
      runs.push(new TextRun({ text: match[6], italics: true }));
    } else if (match[8]) {
      // Code (`text`)
      runs.push(new TextRun({ text: match[8], font: "Courier New" }));
    } else if (match[9]) {
      // Regular text
      runs.push(new TextRun({ text: match[9] }));
    }
  }
  
  return runs.length > 0 ? runs : [new TextRun({ text })];
};

const createParagraphFromBlock = (block: ParsedBlock): Paragraph => {
  const runs = parseInlineFormatting(block.content);
  
  switch (block.type) {
    case 'heading1':
      return new Paragraph({
        children: runs,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 }
      });
    
    case 'heading2':
      return new Paragraph({
        children: runs,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      });
    
    case 'heading3':
      return new Paragraph({
        children: runs,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 160, after: 80 }
      });
    
    case 'list-item':
      return new Paragraph({
        children: [new TextRun({ text: "• " }), ...runs],
        spacing: { before: 60, after: 60 },
        indent: { left: 720 }
      });
    
    case 'ordered-item':
      return new Paragraph({
        children: [new TextRun({ text: `${block.number}. ` }), ...runs],
        spacing: { before: 60, after: 60 },
        indent: { left: 720 }
      });
    
    default:
      return new Paragraph({
        children: runs,
        spacing: { before: 120, after: 120 }
      });
  }
};

export const exportConversationToWord = async (
  mensagens: Mensagem[],
  titulo: string,
  modo: string
): Promise<void> => {
  const children: Paragraph[] = [];
  
  // Document title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: titulo || "Conversa LogosFlow", bold: true, size: 32 })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 }
    })
  );
  
  // Mode subtitle
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Modo: ${modo}`, italics: true, color: "666666" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );
  
  // Separator
  children.push(
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" }
      },
      spacing: { after: 400 }
    })
  );

  // Process messages
  mensagens.forEach((mensagem, msgIndex) => {
    // Message header
    const senderLabel = mensagem.remetente_ia ? "LogosFlow" : "Você";
    children.push(
      new Paragraph({
        children: [new TextRun({ text: senderLabel, bold: true, color: mensagem.remetente_ia ? "B8860B" : "333333" })],
        spacing: { before: msgIndex > 0 ? 300 : 0, after: 100 }
      })
    );

    // Parse and add message content
    if (mensagem.conteudo) {
      const lines = mensagem.conteudo.split('\n');
      lines.forEach((line, index) => {
        const block = parseMarkdownLine(line, index, lines);
        if (block) {
          children.push(createParagraphFromBlock(block));
        }
      });
    }
    
    // Add spacing after each message
    children.push(new Paragraph({ spacing: { after: 200 } }));
  });

  // Footer
  const date = new Date().toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  children.push(
    new Paragraph({
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" }
      },
      spacing: { before: 400 }
    })
  );
  
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Exportado do LogosFlow em ${date}`, italics: true, color: "999999", size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 }
    })
  );

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children
    }]
  });

  // Generate and save file
  const blob = await Packer.toBlob(doc);
  const fileName = `${titulo || 'logosflow'}-${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, fileName);
};

export const exportSingleMessageToWord = async (
  content: string,
  titulo: string
): Promise<void> => {
  const children: Paragraph[] = [];
  
  // Document title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: titulo || "Mensagem LogosFlow", bold: true, size: 32 })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );

  // Parse and add content
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const block = parseMarkdownLine(line, index, lines);
    if (block) {
      children.push(createParagraphFromBlock(block));
    }
  });

  // Footer
  const date = new Date().toLocaleDateString('pt-BR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  children.push(
    new Paragraph({
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" }
      },
      spacing: { before: 400 }
    })
  );
  
  children.push(
    new Paragraph({
      children: [new TextRun({ text: `Exportado do LogosFlow em ${date}`, italics: true, color: "999999", size: 20 })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 }
    })
  );

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children
    }]
  });

  // Generate and save file
  const blob = await Packer.toBlob(doc);
  const fileName = `mensagem-${new Date().toISOString().split('T')[0]}.docx`;
  saveAs(blob, fileName);
};
