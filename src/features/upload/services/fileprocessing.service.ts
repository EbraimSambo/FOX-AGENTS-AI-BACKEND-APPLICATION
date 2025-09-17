// file-processing.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as mammoth from 'mammoth';

export interface ProcessedFile {
  filename: string;
  type: string;
  content: string;
  size: number;
  description: string;
}

@Injectable()
export class FileProcessingService {
  
  async processFiles(files: Express.Multer.File[]): Promise<ProcessedFile[]> {
    const processedFiles: ProcessedFile[] = [];
    
    for (const file of files) {
      try {
        const processed = await this.processFile(file);
        processedFiles.push(processed);
      } catch (error) {
        console.error(`Erro ao processar arquivo ${file.originalname}:`, error);
        // Adiciona arquivo com erro mas sem conteúdo
        processedFiles.push({
          filename: file.originalname,
          type: file.mimetype,
          content: '',
          size: file.size,
          description: `Erro ao processar arquivo: ${file.originalname}`
        });
      }
    }
    
    return processedFiles;
  }

  private async processFile(file: Express.Multer.File): Promise<ProcessedFile> {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    
    let content = '';
    let description = '';

    switch (true) {
      // Documentos de texto
      case mimeType === 'text/plain' || fileExtension === '.txt':
        content = file.buffer.toString('utf-8');
        description = `Documento de texto: ${file.originalname}`;
        break;

      // Documentos Word
      case mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
           fileExtension === '.docx':
        const docResult = await mammoth.extractRawText({ buffer: file.buffer });
        content = docResult.value;
        description = `Documento Word: ${file.originalname}`;
        break;

      // PDFs
    //   case mimeType === 'application/pdf' || fileExtension === '.pdf':
    //     const pdfResult = await pdfParse(file.buffer);
    //     content = pdfResult.text;
    //     description = `Documento PDF: ${file.originalname}`;
    //     break;

      // Imagens
      case mimeType.startsWith('image/'):
        content = await this.processImage(file);
        description = `Imagem: ${file.originalname} (${mimeType})`;
        break;

      // JSON
      case mimeType === 'application/json' || fileExtension === '.json':
        content = file.buffer.toString('utf-8');
        description = `Arquivo JSON: ${file.originalname}`;
        break;

      // CSV
      case mimeType === 'text/csv' || fileExtension === '.csv':
        content = file.buffer.toString('utf-8');
        description = `Arquivo CSV: ${file.originalname}`;
        break;

      // XML
      case mimeType === 'application/xml' || mimeType === 'text/xml' || fileExtension === '.xml':
        content = file.buffer.toString('utf-8');
        description = `Arquivo XML: ${file.originalname}`;
        break;

      // Código fonte
      case this.isCodeFile(fileExtension):
        content = file.buffer.toString('utf-8');
        description = `Código fonte ${fileExtension}: ${file.originalname}`;
        break;

      default:
        content = `[Arquivo não suportado: ${file.originalname}]`;
        description = `Arquivo não suportado: ${file.originalname} (${mimeType})`;
    }

    return {
      filename: file.originalname,
      type: mimeType,
      content,
      size: file.size,
      description
    };
  }

  private async processImage(file: Express.Multer.File): Promise<string> {
    // Para imagens, convertemos para base64 para enviar ao modelo
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64}`;
    
    // Retornamos uma descrição que será processada pelo LLM
    return `[IMAGEM: ${file.originalname} - O modelo deve analisar esta imagem e descrever seu conteúdo]`;
  }

  private isCodeFile(extension: string): boolean {
    const codeExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', 
      '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.dart',
      '.html', '.css', '.scss', '.sass', '.less', '.sql', '.sh',
      '.bash', '.ps1', '.yml', '.yaml', '.toml', '.ini'
    ];
    return codeExtensions.includes(extension);
  }

  // Função para formatar arquivos para o prompt do LLM
  formatFilesForPrompt(processedFiles: ProcessedFile[]): string {
    if (processedFiles.length === 0) {
      return '';
    }

    let prompt = '\n\nARQUIVOS ANEXADOS:\n';
    
    for (const file of processedFiles) {
      prompt += `\n--- ${file.description} ---\n`;
      
      if (file.content) {
        // Limita o tamanho do conteúdo para não sobrecarregar o prompt
        const maxLength = 10000; // 10k caracteres por arquivo
        const truncatedContent = file.content.length > maxLength 
          ? file.content.substring(0, maxLength) + '\n[...conteúdo truncado...]'
          : file.content;
        
        prompt += truncatedContent;
      } else {
        prompt += '[Conteúdo não disponível]';
      }
      
      prompt += '\n--- Fim do arquivo ---\n';
    }

    prompt += '\nPor favor, analise os arquivos acima e responda baseado no seu conteúdo juntamente com a pergunta do usuário.\n';
    
    return prompt;
  }
}