const fs = require('fs');

const srcPath = '/Users/mac/development/vueprojects/nexap_frontend/src/views/Home.vue';
let src = fs.readFileSync(srcPath, 'utf8');

// The issue seems to be a missing closing div in the Hero Section.
// Looking at the structure:
// <section id="home" class="hero-section">
//   <div class="video-background"> (closes early?)
//   ...
//   <div class="hero-content">
//     <div class="container">
//       <div class="hero-grid">
//         ...
//       </div>
//     </div>
//   </div>
// </section>

// Wait, the error `Mismatched tags! Opened <div> at line 32, trying to close with </video> at line 37`
// Line 32 is: <video v-for...
// Line 31 is: <div class="video-background">
// Ah! <video> is NOT self-closing, but maybe the parser got confused by the Vue syntax?
// Wait, my parser thought `video` wasn't self-closing, and it didn't push `<source>` because it's listed as self-closing.
// Wait! `source` is self closing. `<video>` has `</video>`.
// So why did the parser fail on `<video>`? Let's check the regex. `<\/?([a-zA-Z0-9\-]+)(?:[^>]*?)>`
// `<video v-for="(video, index) in videos" :key="index" :ref="(el) => { if (el) videoRefs[index] = el as HTMLVideoElement; }" autoplay muted loop playsinline class="hero-video" :class="{ active: currentVideoIndex === index }">`
// This regex fails to match the entire tag because of the `>` inside the arrow function `(el) =>`!
// Yes! `:ref="(el) => { if (el) videoRefs[index] = el as HTMLVideoElement; }"` contains a `>`.

// Let's use `vue/compiler-dom` directly since it's already installed in the project!

const { parse } = require('@vue/compiler-dom');

try {
  const ast = parse(src);
  console.log("Vue compiler successfully parsed the AST! That means there is NO syntax error.");
} catch (e) {
  console.error("Vue compiler parsing failed:");
  console.error(e.message);
  if (e.loc) {
    console.log(`Error at line ${e.loc.start.line}, column ${e.loc.start.column}`);
    const lines = src.split('\n');
    console.log("Context:");
    for(let i=Math.max(0, e.loc.start.line-3); i<Math.min(lines.length, e.loc.start.line+2); i++) {
      console.log(`${i+1}: ${lines[i]}`);
    }
  }
}
