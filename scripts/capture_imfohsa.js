// Script para capturar TODA la información del sistema IMFOHSA Lab
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CREDENTIALS = {
  url: 'https://imfohsalab.genbri.com/home',
  orderUrl: 'https://imfohsalab.genbri.com/pages/orden',
  email: 'asesorcomercial@sitintegrados.com',
  password: 'Abc123'
};

async function captureIMFOHSASystem() {
  console.log('🚀 Iniciando captura del sistema IMFOHSA Lab...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const capturedData = {
    timestamp: new Date().toISOString(),
    url: CREDENTIALS.url,
    sections: []
  };

  try {
    // 1. NAVEGAR A LA PÁGINA DE LOGIN
    console.log('📍 Navegando a:', CREDENTIALS.url);
    await page.goto(CREDENTIALS.url, { waitUntil: 'networkidle', timeout: 60000 });
    
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    
    await page.screenshot({ path: 'screenshots/01_login_page.png', fullPage: true });

    // 2. BUSCAR Y LLENAR CAMPOS DE LOGIN
    console.log('🔍 Buscando campos de login...');
    
    await page.waitForTimeout(2000);
    
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[name="username"]',
      'input[id="email"]'
    ];
    
    let emailFilled = false;
    for (const selector of emailSelectors) {
      try {
        await page.fill(selector, CREDENTIALS.email, { timeout: 2000 });
        console.log('✅ Email ingresado con selector:', selector);
        emailFilled = true;
        break;
      } catch (e) {
        continue;
      }
    }

    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[id="password"]'
    ];
    
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        await page.fill(selector, CREDENTIALS.password, { timeout: 2000 });
        console.log('✅ Contraseña ingresada con selector:', selector);
        passwordFilled = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!emailFilled || !passwordFilled) {
      console.error('❌ No se pudieron llenar los campos de login');
      const pageContent = await page.content();
      fs.writeFileSync('debug_login_page.html', pageContent);
      console.log('💾 HTML guardado en debug_login_page.html');
      throw new Error('No se pudieron llenar campos de login');
    }

    // 3. HACER CLICK EN SUBMIT
    console.log('🔐 Intentando login...');
    
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Ingresar")',
      'button:has-text("Login")',
      'button:has-text("Entrar")'
    ];
    
    let loginSuccess = false;
    for (const selector of submitSelectors) {
      try {
        await page.click(selector, { timeout: 2000 });
        await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 });
        console.log('✅ Login exitoso');
        loginSuccess = true;
        break;
      } catch (e) {
        continue;
      }
    }

    if (!loginSuccess) {
      throw new Error('No se pudo hacer login');
    }

    await page.screenshot({ path: 'screenshots/02_dashboard.png', fullPage: true });

    // 4. NAVEGAR A REALIZAR PEDIDO
    console.log('📍 Navegando a formulario de pedido...');
    await page.goto(CREDENTIALS.orderUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screenshots/03_order_form_full.png', fullPage: true });

    // 5. CAPTURAR TODA LA ESTRUCTURA DEL FORMULARIO
    console.log('📋 Analizando formulario de pedido...');
    
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

    const textareas = await page.$$eval('textarea', elements =>
      elements.map(el => ({
        name: el.name,
        id: el.id,
        placeholder: el.placeholder,
        required: el.required
      }))
    );

    const buttons = await page.$$eval('button', elements =>
      elements.map(el => ({
        type: el.type,
        text: el.textContent?.trim(),
        className: el.className
      }))
    );

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

    // 6. CAPTURAR HTML COMPLETO
    const formHTML = await page.content();
    fs.writeFileSync('captured_form.html', formHTML);
    console.log('💾 HTML completo guardado en captured_form.html');

    // 7. GENERAR MARKDOWN
    const markdown = generateMarkdown(capturedData);
    fs.writeFileSync(path.join(__dirname, '../INSTRUCCIONES/servicios.md'), markdown);
    console.log('✅ Documentación generada en INSTRUCCIONES/servicios.md');
    
    console.log('\n📊 RESUMEN:');
    console.log(`- Inputs: ${inputs.length}`);
    console.log(`- Selects: ${selects.length}`);
    console.log(`- Textareas: ${textareas.length}`);
    console.log(`- Buttons: ${buttons.length}`);
    console.log(`- Labels: ${labels.length}`);

  } catch (error) {
    console.error('❌ Error durante la captura:', error);
    await page.screenshot({ path: 'screenshots/error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

function generateMarkdown(data) {
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
      md += `| Tipo | Name | ID | Placeholder | Required | ClassName |\n`;
      md += `|------|------|----|--------------|-----------|-----------|\n`;
      for (const input of section.inputs) {
        md += `| ${input.type} | ${input.name || '-'} | ${input.id || '-'} | ${input.placeholder || '-'} | ${input.required ? '✅' : '❌'} | ${input.className || '-'} |\n`;
      }
      md += `\n`;
    }

    if (section.selects && section.selects.length > 0) {
      md += `### Selectores (Dropdowns)\n\n`;
      for (const select of section.selects) {
        md += `#### ${select.name || select.id || 'Sin nombre'}\n`;
        md += `- **Required:** ${select.required ? '✅' : '❌'}\n`;
        md += `- **Opciones:**\n`;
        for (const opt of select.options) {
          md += `  - \`${opt.value}\`: ${opt.text}\n`;
        }
        md += `\n`;
      }
    }

    if (section.textareas && section.textareas.length > 0) {
      md += `### Áreas de Texto (Textareas)\n\n`;
      for (const ta of section.textareas) {
        md += `- **${ta.name || ta.id}**: ${ta.placeholder || 'Sin placeholder'} (Required: ${ta.required ? '✅' : '❌'})\n`;
      }
      md += `\n`;
    }

    if (section.labels && section.labels.length > 0) {
      md += `### Etiquetas (Labels)\n\n`;
      for (const label of section.labels) {
        if (label.text) {
          md += `- **${label.text}** (for: ${label.for || 'N/A'})\n`;
        }
      }
      md += `\n`;
    }

    if (section.buttons && section.buttons.length > 0) {
      md += `### Botones\n\n`;
      for (const btn of section.buttons) {
        if (btn.text) {
          md += `- **${btn.text}** (type: ${btn.type || 'button'})\n`;
        }
      }
      md += `\n`;
    }
  }

  return md;
}

captureIMFOHSASystem().catch(console.error);
