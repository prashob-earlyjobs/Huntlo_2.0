const fs = require('fs');
const p = 'src/modules/outreach/qualification-qa.service.ts';
let s = fs.readFileSync(p, 'utf8');
const needle = "return { action: 'skipped_already_complete' };";
const idx = s.indexOf(needle);
if (idx < 0) {
  console.error('needle not found');
  process.exit(1);
}
// Only the first occurrence in processQualificationAfterReply
const insert = `await notifyHuntlo360QualificationComplete({
      campaign: input.campaign,
      enrollment,
      status: qualStatus === 'rejected' ? 'rejected' : 'qualified',
    });
    `;
if (s.includes('Re-fire Huntlo 360 stage advance')) {
  console.log('already patched');
  process.exit(0);
}
s = s.slice(0, idx) + insert + s.slice(idx);
fs.writeFileSync(p, s);
console.log('patched at', idx);
