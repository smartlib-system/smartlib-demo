// Static manifest generation only; this is not an application build system or backend.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const configPath=path.resolve(root,process.argv[2]||'config.js');
const output=path.resolve(root,process.argv[3]||'manifest.webmanifest');
try{
  const context=vm.createContext({window:{},URL,console});
  vm.runInContext(fs.readFileSync(configPath,'utf8'),context,{timeout:1000});
  vm.runInContext(fs.readFileSync(path.join(root,'js/config.js'),'utf8'),context,{timeout:1000});
  const {config,state}=context.window.smartlibConfiguration;
  if(!state.valid)throw new Error(state.errors.join('; '));
  const tokens={APP_NAME:config.appName,SCHOOL_NAME:config.schoolName,FULL_APP_NAME:config.fullAppName,RESOURCE_CENTRE_NAME:config.resourceCentreName,ICON_192:config.assets.icon192,ICON_512:config.assets.icon512};
  const replace=value=>typeof value==='string'?value.replace(/\{\{([A-Z0-9_]+)\}\}/g,(_,key)=>{if(!(key in tokens))throw new Error('Unknown manifest token');return tokens[key];}):Array.isArray(value)?value.map(replace):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,replace(v)])):value;
  const result=replace(JSON.parse(fs.readFileSync(path.join(root,'manifest.template.webmanifest'),'utf8')));
  fs.writeFileSync(output,JSON.stringify(result,null,2)+'\n');
  console.log('Static manifest generated: '+path.basename(output));
}catch(error){console.error('CONFIG ERROR: '+error.message);process.exitCode=1;}
