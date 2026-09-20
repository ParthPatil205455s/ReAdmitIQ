import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const outputDir = path.resolve('..', 'docs', 'media', 'frames');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Login Page
  console.log('1. Capturing Login Page...');
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(outputDir, 'frame_01_login.png') });

  // 2. Doctor Dashboard
  console.log('2. Capturing Doctor Workstation...');
  await page.goto('http://127.0.0.1:5173/dashboard', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(outputDir, 'frame_02_doctor_dashboard.png') });

  // Scroll down for charts
  await page.evaluate(() => window.scrollBy(0, 500));
  await delay(500);
  await page.screenshot({ path: path.join(outputDir, 'frame_03_doctor_charts.png') });

  // 3. Patient Worklist
  console.log('3. Capturing Patient Worklist...');
  await page.goto('http://127.0.0.1:5173/worklist', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(outputDir, 'frame_04_patient_worklist.png') });

  // 4. Assessment Form
  console.log('4. Capturing Bedside Assessment Form...');
  await page.goto('http://127.0.0.1:5173/assessment', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(outputDir, 'frame_05_assessment_form.png') });

  // 5. Executive Admin Dashboard
  console.log('5. Capturing Executive Admin Operations...');
  await page.goto('http://127.0.0.1:5173/admin', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(outputDir, 'frame_06_admin_dashboard.png') });

  // Scroll down for Audit logs
  await page.evaluate(() => window.scrollBy(0, 400));
  await delay(500);
  await page.screenshot({ path: path.join(outputDir, 'frame_07_audit_logs.png') });

  // 6. AI Model Governance Monitor
  console.log('6. Capturing AI Model Monitor...');
  await page.goto('http://127.0.0.1:5173/admin/model-monitor', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(outputDir, 'frame_08_model_monitor.png') });

  // 7. Patient Portal Dashboard
  console.log('7. Capturing Patient Portal...');
  await page.goto('http://127.0.0.1:5173/patient', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(outputDir, 'frame_09_patient_portal.png') });

  // 8. Patient Care Plan Roadmap
  console.log('8. Capturing Patient Care Plan...');
  await page.goto('http://127.0.0.1:5173/patient/care-plan', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(outputDir, 'frame_10_care_plan.png') });

  // 9. AI Algorithmic Model Card
  console.log('9. Capturing AI Model Card Transparency...');
  await page.goto('http://127.0.0.1:5173/model-card', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(outputDir, 'frame_11_model_card.png') });

  console.log('All 11 high-res 1920x1080 frames captured successfully!');
  await browser.close();
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
