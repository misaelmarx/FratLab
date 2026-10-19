const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const project=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(project,'dist/index.html'),'utf8');
class Element {
  constructor(){this.value='';this.checked=false;this.hidden=false;this.textContent='';this.innerHTML='';this.dataset={};this.style={};this.attrs={};this.events={};const classes=new Set();this.classList={toggle(k,value){const on=value??!classes.has(k);on?classes.add(k):classes.delete(k);return on;},add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k)};}
  setAttribute(k,v){this.attrs[k]=String(v);}
  getAttribute(k){return this.attrs[k]??null;}
  hasAttribute(k){return Object.hasOwn(this.attrs,k);}
  removeAttribute(k){delete this.attrs[k];}
  insertAdjacentHTML(p,s){this.innerHTML+=s;}
  addEventListener(k,fn){this.events[k]=fn;}
  focus(){this.focused=true;}
  showModal(){this.open=true;}
  close(){this.open=false;}
}
const elements=new Map();
for(const match of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)){
  assert(!elements.has('#'+match[1]),'unique id '+match[1]);const el=new Element();el.value=match[0].match(/value="([^"]*)"/)?.[1]||'';el.checked=/\bchecked\b/.test(match[0]);el.hidden=/\bhidden\b/.test(match[0]);elements.set('#'+match[1],el);
}
for(const selector of['.autosave','.page-title','#fretboard svg'])elements.set(selector,new Element());
const modes=['free','chord','scale'].map(mode=>Object.assign(new Element(),{dataset:{mode}}));
const tabs=['chords','scales'].map(presetTab=>Object.assign(new Element(),{dataset:{presetTab}}));
const document={body:new Element(),events:{},addEventListener(k,fn){this.events[k]=fn;},querySelector(selector){if(selector.startsWith('[data-key='))return new Element();assert(elements.has(selector),'selector exists '+selector);return elements.get(selector);},querySelectorAll(selector){return selector==='[data-mode]'?modes:selector==='[data-preset-tab]'?tabs:[];}};
const storage=new Map();
const context=vm.createContext({document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},structuredClone,Blob,TextEncoder,URL,console,setTimeout(fn,ms){const timer=setTimeout(fn,ms);timer.unref();return timer;},clearTimeout});
for(const file of['music.js','app.js'])vm.runInContext(fs.readFileSync(path.join(project,'dist',file),'utf8'),context);
const run=s=>vm.runInContext(s,context),get=id=>elements.get('#'+id);let count=0;
function check(expression,message){assert(run(expression),message);count++;}
check("$('#positionCount').textContent==='12 posições' && $('#pitchCount').textContent==='5 notas'",'live selection counts');
check("$('#fretboard').innerHTML.match(/tabindex=\"0\"/g).length===1",'one fretboard tab stop');
check("$('#fretboard').innerHTML.includes('role=\"group\"')",'interactive board exposes controls');
assert.equal(modes[2].attrs['aria-pressed'],'true');count++;
run("state.mode='chord';state.selected=[];selectPosition('0:5');selectPosition('0:7')");check("state.selected.length===1&&state.selected[0]==='0:7'",'one note per string');
check("$('#positionCount').textContent==='1 posição'&&$('#pitchCount').textContent==='1 nota'",'singular counts');
run("history('undo')");check("state.selected[0]==='0:5'",'undo');run("history('redo')");check("state.selected[0]==='0:7'",'redo');
run("state=structuredClone(defaultState);transpose(1)");check("state.root===10&&state.selected.includes('0:6')",'transpose');
run("state=structuredClone(defaultState);state.left=true;state.intervals=true;state.notation='sol';render()");check("boardSVG().includes('Lá')&&boardSVG().includes('tabindex=\"0\"')",'left handed solfege');
run("state=structuredClone(defaultState);state.title='Pentatônica inicial';state.student='Aluno Ana';$('#saveShape').onclick();state.id=null;state.title='Acorde com nona';state.student='Aluno Bruno';$('#saveShape').onclick();");check('saved.length===2','save collection');
run("$('#librarySearch').value='ANA';renderLibrary()");check("$('#savedShapes').innerHTML.includes('Pentatônica inicial')&&!$('#savedShapes').innerHTML.includes('Acorde com nona')",'case insensitive search by student');
run("$('#librarySearch').value='nona';renderLibrary()");check("$('#savedShapes').innerHTML.includes('Acorde com nona')&&!$('#savedShapes').innerHTML.includes('Pentatônica inicial')",'search by title');
run("$('#librarySearch').value='nenhum resultado';renderLibrary()");check("$('#savedShapes').innerHTML.includes('Nenhum shape encontrado.')",'search empty state');
run("$('#librarySearch').value='';showView('library')");check("$('#studioView').hidden&&!$('#libraryView').hidden&&$('#navLibrary').getAttribute('aria-current')==='page'",'library navigation');
run("showView('studio')");check("!$('#studioView').hidden&&$('#libraryView').hidden&&$('#navStudio').getAttribute('aria-current')==='page'",'studio navigation');
run("state.selected.push('0:24');state.region='0:5';render()");check("$('#hiddenNotes').textContent.length>0&&exportSVG().includes('24</text>')",'hidden notes remain in exports');
run("state.title='<script>test</script>';state.notes='<b>Orientação</b>';state.student='Aluno teste';$('#exportNotes').checked=true");check("exportSVG().includes('&lt;script&gt;')&&!exportSVG().includes('<script>')",'export escaping');
run("$('#exportNotes').checked=false");check("!exportSVG().includes('Aluno(a): Aluno teste')&&!exportSVG().includes('&lt;b&gt;Orientação')",'annotation privacy');
const svg=run('boardSVG()');const positions=[...svg.matchAll(/data-key="([^"]+)"/g)];assert.equal(positions.length,36);count++;
for(const use of html.matchAll(/<use href="#([^"]+)"/g)){assert(html.includes('id="'+use[1]+'"'),'icon exists '+use[1]);}
const css=fs.readFileSync(path.join(project,'dist/style.css'),'utf8');assert(css.includes('prefers-reduced-motion'));assert(css.includes(':focus-visible'));assert(css.includes('@media (max-width: 360px)'));count+=3;
console.log(`${count} UI regression checks passed.`);
