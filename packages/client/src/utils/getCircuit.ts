/* 
// uncomment this block if you want to compile the circuit in the browser
import { compile, createFileManager } from '@noir-lang/noir_wasm';
import { CompiledCircuit } from '@noir-lang/types';

export async function getCircuit() {
  const fm = createFileManager('/');
  const main = (await fetch(new URL(`../circuit/src/main.nr`, import.meta.url)))
    .body as ReadableStream<Uint8Array>;
  const nargoToml = (await fetch(new URL(`../circuit/Nargo.toml`, import.meta.url)))
    .body as ReadableStream<Uint8Array>;

  fm.writeFile('./src/main.nr', main);
  fm.writeFile('./Nargo.toml', nargoToml);
  const result = await compile(fm);
  if (!('program' in result)) {
    throw new Error('Compilation failed');
  }
  return result.program as CompiledCircuit;
}
*/
import { CompiledCircuit } from '@noir-lang/types';
import voteJson from '../circuit/target/vote.json';

export async function getCircuit(): Promise<CompiledCircuit> {
    return voteJson as CompiledCircuit;
}
