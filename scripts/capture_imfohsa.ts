/**
 * Script para capturar TODA la información del sistema IMFOHSA Lab
 * Este script navega, se autentica y documenta TODO el formulario de pedidos
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const CREDENTIALS = {
  url: 'https://imfohsalab.genbri.com/home',
  orderUrl: 'https://imfohsalab.genbri.com/pages/orden',
  email: 'asesorcomercial@sitintegrados.com',
  password: 'Abc123'
};

async function captureIMFOHSASystem() {
  console.log('🚀 Iniciando captura del sistema IMFOHSA Lab...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Ver el navegador para debugging
    slowMo: 500 // Ralentizar para ver qué pasa
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  let capturedData: any = {
    timestamp: new Date().toISOString(),
    url: CREDENTIALS.url,
    sections: []
  };

  try {
    // 1. NAVEGAR A LA PÁGINA DE LOGIN
    console.log('📍 Navegando a:', CREDENTIALS.url);
    await page.goto(CREDENTIALS.url, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/01_login_page.png', fullPage: true });

    // 2. BUSCAR CAMPOS DE LOGIN
    console.log('🔍 Buscando campos de login...');
    
    // Intentar diferentes selectores comunes para email/usuario
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[id="email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="correo" i]'
    ];
    
    let emailInput = null;
    for (const selector of emailSelectors) {
      emailInput = await page.$(selector);
      if (emailInput) {
        console.log('✅ Campo de email encontrado:', selector);
        break;
      }
    }

    // Intentar diferentes selectores para password
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[id="password"]'
    ];
    
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      passwordInput = await page.$(selector);
      if (passwordInput) {
        console.log('✅ Campo de contraseña encontrado:', selector);
        break;
      }
    }

    if (!emailInput || !passwordInput) {
      console.error('❌ No se encontraron los campos de login');
      const pageContent = await page.content();
      fs.writeFileSync('debug_login_page.html', pageContent);
      console.log('💾 HTML guardado en debug_login_page.html para inspección');
      throw new Error('Campos de login no encontrados');
    }

    // 3. AUTENTICARSE
    console.log('🔐 Autenticando...');
    await emailInput.fill(CREDENTIALS.email);
    await passwordInput.fill(CREDENTIALS.password);
    
    // Buscar botón de submit
    const submitButton = await page.$('button[type="submit"]') || 
                         await page.$('input[type="submit"]') ||
                         await page.$('button:has-text("Ingresar")') ||
                         await page.$('button:has-text("Login")');
    
    if (submitButton) {
      await submitButton.click();
      await page.waitForNavigation({ waitUntil: 'networkidle' });
      console.log('✅ Login exitoso');
    } else {
      throw new Error('Botón de submit no encontrado');
    }

    await page.screenshot({ path: 'screenshots/02_dashboard.png', fullPage: true });

    // 4. NAVEGAR A REALIZAR PEDIDO
    console.log('📍 Navegando a formulario de pedido...');
    await page.goto(CREDENTIALS.orderUrl, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/03_order_form_full.png', fullPage: true });

    // 5. CAPTURAR TODA LA ESTRUCTURA DEL FORMULARIO
    console.log('📋 Analizando formulario de pedido...');
    
    // Capturar todos los inputs
    const inputs = await page.$$eval('input', elements => 
      elements.map(el => ({
        type: el.type,
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
        value: el.value,
        required: el.required,
        className: el.className
      }))
    );

    // Capturar todos los selects
    const selects = await page.$$eval('select', elements =>
      elements.map(el => ({
        name: el.name,
        id: el.id,
        required: el.required,
        options: Array.from(el.options).map(opt => ({
          value: opt.value,
          text: opt.text
        }))
      }))
    );

    // Capturar todos los textareas
    const textareas = await page.$$eval('textarea', elements =>
      elements.map(el => ({
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
        required: el.required
      }))
    );

    // Capturar todos los botones
    const buttons = await page.$$eval('button', elements =>
      elements.map(el => ({
        type: el.type,
        text: el.textContent?.trim(),
        className: el.className
      }))
    );

    // Capturar todos los labels
    const labels = await page.$$eval('label', elements =>
      elements.map(el => ({
        for: el.htmlFor,
        text: el.textContent?.trim()
      }))
    );

    capturedData.sections.push({
      name: 'Formulario de Pedido',
      url: CREDENTIALS.orderUrl,
      inputs,
      selects,
      textareas,
      buttons,
      labels
    });

    // 6. CAPTURAR HTML COMPLETO DEL FORMULARIO
    const formHTML = await page.content();
    fs.writeFileSync('captured_form.html', formHTML);
    console.log('💾 HTML completo guardado en captured_form.html');

    // 7. GENERAR MARKDOWN DOCUMENTACIÓN
    const markdown = generateMarkdown(capturedData);
    fs.writeFileSync(path.join(__dirname, '../INSTRUCCIONES/servicios.md'), markdown);
    console.log('✅ Documentación generada en INSTRUCCIONES/servicios.md');

  } catch (error) {
    console.error('❌ Error durante la captura:', error);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

function generateMarkdown(data: any): string {
  let md = `# ANÁLISIS COMPLETO: IMFOHSA LAB - Sistema de Pedidos\n\n`;
  md += `**URL Base:** ${data.url}\n`;
  md += `**Fecha de Análisis:** ${data.timestamp}\n`;
  md += `**Objetivo:** Documentar TODO el flujo y lógica del formulario de pedidos para replicarlo en DentalFlow\n\n`;
  md += `---\n\n`;

  for (const section of data.sections) {
    md += `## 📋 ${section.name}\n\n`;
    md += `**URL:** ${section.url}\n\n`;

    if (section.inputs && section.inputs.length > 0) {
      md += `### Campos de Entrada (Inputs)\n\n`;
      md += `| Tipo | Name | ID | Placeholder | Required |\n`;
      md += `|------|------|----|--------------|-----------|\n`;
      for (const input of section.inputs) {
        md += `| ${input.type} | ${input.name || '-'} | ${input.id || '-'} | ${input.placeholder || '-'} | ${input.required ? '✅' : '❌'} |\n`;
      }
      md += `\n`;
    }

    if (section.selects && section.selects.length > 0) {
      md += `### Selectores (Dropdowns)\n\n`;
      for (const select of section.selects) {
        md += `#### ${select.name || select.id}\n`;
        md += `- **Required:** ${select.required ? '✅' : '❌'}\n`;
        md += `- **Opciones:**\n`;
        for (const opt of select.options) {
          md += `  - \`${opt.value}\`: ${opt.text}\n`;
        }
        md += `\n`;
      }
    }

    if (section.labels && section.labels.length > 0) {
      md += `### Etiquetas (Labels)\n\n`;
      for (const label of section.labels) {
        md += `- **${label.text}** (for: ${label.for || 'N/A'})\n`;
      }
      md += `\n`;
    }

    if (section.buttons && section.buttons.length > 0) {
      md += `### Botones\n\n`;
      for (const btn of section.buttons) {
        md += `- **${btn.text}** (type: ${btn.type})\n`;
      }
      md += `\n`;
    }
  }

  return md;
}

// Ejecutar
captureIMFOHSASystem().catch(console.error);
