const fs = require('fs');

const src = fs.readFileSync('/Users/mac/development/vueprojects/nexap_frontend/src/views/Home.vue', 'utf8');
const templateMatch = src.match(/<template>([\s\S]*?)<\/template>/);

if (templateMatch) {
  const tags = [];
  const regex = /<\/?([a-zA-Z0-9\-]+)(?:[^>]*?)>/g;
  let match;
  const selfClosing = ['img', 'br', 'hr', 'input', 'source', 'link', 'meta', 'VaIcon', 'VaInput'];
  
  let currentString = templateMatch[1];
  let lines = currentString.split('\n');
  
  for(let i=0; i<lines.length; i++) {
    const lineNum = i + 2; // +1 for 0-index, +1 because template is line 1
    const line = lines[i];
    
    let lineMatch;
    const lineRegex = /<\/?([a-zA-Z0-9\-]+)(?:[^>]*?)>/g;
    while ((lineMatch = lineRegex.exec(line)) !== null) {
      const tagComplete = lineMatch[0];
      const tag = lineMatch[1];
      
      if (tagComplete.endsWith('/>') || selfClosing.includes(tag)) {
        continue;
      }
      
      if (tagComplete.startsWith('</')) {
        const last = tags.pop();
        if (!last) {
          console.log(`Extra closing tag </${tag}> found around line ${lineNum}`);
        } else if (last.tag !== tag) {
          console.log(`Mismatched tags! Opened <${last.tag}> at line ${last.line}, trying to close with </${tag}> at line ${lineNum}`);
        }
      } else {
        tags.push({ tag, line: lineNum });
      }
    }
  }
  
  if (tags.length > 0) {
    console.log("Unclosed tags remaining:");
    console.log(tags);
  } else {
    console.log("No tag mismatches found by simple script.");
  }
} else {
  console.log("No template found");
}
