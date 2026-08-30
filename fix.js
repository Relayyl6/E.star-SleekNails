const fs = require('fs');
let content = fs.readFileSync('seed_services.js', 'utf8');

content = content.replace(/images: \["https:\/\/images\.unsplash\.com[^"]+"\]/g, 'images: ["https://placehold.co/600x400/1a1414/ffffff?text=Image+Coming+Soon"]');

content = content.replace(/name: "Plain Acrylic Full Set — (.*?)"/g, 'name: "$1 — Plain Acrylic Full Set"');
content = content.replace(/name: "Plain Gel X Full Set — (.*?)"/g, 'name: "$1 — Plain Gel X Full Set"');
content = content.replace(/name: "BIAB on Natural Nails — (.*?)"/g, 'name: "$1 — BIAB on Natural Nails"');
content = content.replace(/name: "Plain Gel Stick-On Set — (.*?)"/g, 'name: "$1 — Plain Gel Stick-On Set"');

// also replace standard hyphen if it was used
content = content.replace(/name: "Plain Acrylic Full Set - (.*?)"/g, 'name: "$1 — Plain Acrylic Full Set"');
content = content.replace(/name: "Plain Gel X Full Set - (.*?)"/g, 'name: "$1 — Plain Gel X Full Set"');
content = content.replace(/name: "BIAB on Natural Nails - (.*?)"/g, 'name: "$1 — BIAB on Natural Nails"');
content = content.replace(/name: "Plain Gel Stick-On Set - (.*?)"/g, 'name: "$1 — Plain Gel Stick-On Set"');


fs.writeFileSync('seed_services.js', content);
