import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const outputDir = path.resolve('..', 'docs', 'media', 'frames');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Clean old files if any
const existingFiles = fs.readdirSync(outputDir);
for (const file of existingFiles) {
  if (file.endsWith('.png')) {
    fs.unlinkSync(path.join(outputDir, file));
  }
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function capture() {
  console.log('Launching browser for CLEAN real route capture...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 1. Landing Page
  console.log('1. Landing Page...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(outputDir, 'frame_01_landing.png') });

  // 2. Login Page
  console.log('2. Login Page...');
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' });
  await delay(1000);
  await page.screenshot({ path: path.join(outputDir, 'frame_02_login.png') });

  // --- DOCTOR FLOW ---
  console.log('3. Logging in as Doctor...');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Physician') || text.includes('Dr. Chen')) {
      await btn.click();
      break;
    }
  }
  await delay(500);

  const signInBtn = await page.$('button[type="submit"]');
  if (signInBtn) await signInBtn.click();
  await delay(2000);

  console.log('Doctor Dashboard URL:', page.url());
  await page.screenshot({ path: path.join(outputDir, 'frame_03_doctor_dashboard.png') });

  // Doctor Patients
  console.log('4. Doctor Patients Worklist...');
  await page.goto('http://127.0.0.1:5173/doctor/patients', { waitUntil: 'networkidle0' });
  await delay(1500);
  await page.screenshot({ path: path.join(outputDir, 'frame_04_doctor_patients.png') });

  // Doctor Reports
  console.log('5. Doctor Reports...');
  await page.goto('http://127.0.0.1:5173/doctor/reports', { waitUntil: 'networkidle0' });
  await delay(1500);
  await page.screenshot({ path: path.join(outputDir, 'frame_05_doctor_reports.png') });


  // --- ADMIN FLOW ---
  console.log('6. Logging in as Admin...');
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' });
  await delay(1000);

  const buttonsA = await page.$$('button');
  for (const btn of buttonsA) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Executive') || text.includes('M. Torres')) {
      await btn.click();
      break;
    }
  }
  await delay(500);

  const signInAdmin = await page.$('button[type="submit"]');
  if (signInAdmin) await signInAdmin.click();
  await delay(2000);

  console.log('Admin Dashboard URL:', page.url());
  await page.screenshot({ path: path.join(outputDir, 'frame_06_admin_dashboard.png') });

  // Admin Analytics & Audit Logs
  console.log('7. Admin Analytics & Audit Logs...');
  await page.goto('http://127.0.0.1:5173/admin/analytics', { waitUntil: 'networkidle0' });
  await delay(1500);
  await page.screenshot({ path: path.join(outputDir, 'frame_07_admin_analytics.png') });

  // Admin Model Monitor
  console.log('8. Admin Model Monitor...');
  await page.goto('http://127.0.0.1:5173/admin/model-monitor', { waitUntil: 'networkidle0' });
  await delay(1500);
  await page.screenshot({ path: path.join(outputDir, 'frame_08_model_monitor.png') });


  // --- PATIENT FLOW ---
  console.log('9. Logging in as Patient...');
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' });
  await delay(1000);

  const buttonsP = await page.$$('button');
  for (const btn of buttonsP) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('Patient') || text.includes('J. Wilson')) {
      await btn.click();
      break;
    }
  }
  await delay(500);

  const signInPatient = await page.$('button[type="submit"]');
  if (signInPatient) await signInPatient.click();
  await delay(2000);

  console.log('Patient Dashboard URL:', page.url());
  await page.screenshot({ path: path.join(outputDir, 'frame_09_patient_dashboard.png') });

  // Patient Risk
  console.log('10. Patient Readmission Risk...');
  await page.goto('http://127.0.0.1:5173/patient/risk', { waitUntil: 'networkidle0' });
  await delay(1500);
  await page.screenshot({ path: path.join(outputDir, 'frame_10_patient_risk.png') });

  // Patient Care Plan
  console.log('11. Patient Care Plan...');
  await page.goto('http://127.0.0.1:5173/patient/care-plan', { waitUntil: 'networkidle0' });
  await delay(1500);
  await page.screenshot({ path: path.join(outputDir, 'frame_11_patient_care_plan.png') });

  // Model Card
  console.log('12. AI Model Card...');
  await page.goto('http://127.0.0.1:5173/model-card', { waitUntil: 'networkidle0' });
  await delay(1500);
  await page.screenshot({ path: path.join(outputDir, 'frame_12_model_card.png') });

  console.log('All 12 CLEAN authenticated screens captured successfully!');
  await browser.close();
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});
