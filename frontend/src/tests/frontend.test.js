import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Frontend Architecture & Accessibility Verification', async (t) => {
  await t.test('index.html contains accessible metadata, title, and viewport', () => {
    const indexPath = path.resolve('index.html');
    const content = fs.readFileSync(indexPath, 'utf-8');
    assert.match(content, /<title>.*Healthcare.*<\/title>/i);
    assert.match(content, /<meta name="viewport"/i);
    assert.match(content, /lang="en"/i);
  });

  await t.test('App.tsx coordinates role-based views for Patient and Doctor workflows', () => {
    const appPath = path.resolve('src/app/App.tsx');
    const content = fs.readFileSync(appPath, 'utf-8');
    assert.match(content, /LoginPage/);
    assert.match(content, /RegisterPage/);
    assert.match(content, /DoctorDashboard/);
    assert.match(content, /PatientDashboard/);
    assert.match(content, /isDoctor/);
  });

  await t.test('HealthEngineScoreCard displays rule-based scoring and clinical safety notice', () => {
    const cardPath = path.resolve('src/features/patient/HealthEngineCard.tsx');
    const content = fs.readFileSync(cardPath, 'utf-8');
    assert.match(content, /HealthEngine/i);
    assert.match(content, /Clinical Safety Notice|diagnostic evaluation/i);
  });

  await t.test('CareFinderPage provides facility searching', () => {
    const carePath = path.resolve('src/features/care-finder/CareFinderPage.tsx');
    const content = fs.readFileSync(carePath, 'utf-8');
    assert.match(content, /Care Finder/i);
    assert.match(content, /facilities/i);
  });

  await t.test('Production build assets are clean and generated', () => {
    const distPath = path.resolve('dist/index.html');
    assert.ok(fs.existsSync(distPath), 'dist/index.html must exist');
  });
});
