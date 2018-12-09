const fs = require('fs');

const buf = Buffer.from(process.argv[2], 'hex');
fs.writeFileSync("out.bin",buf,{encoding:'binary'});