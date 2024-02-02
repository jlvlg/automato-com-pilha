import { stdin as input, stdout as output } from "process";
import * as readline from "readline";
import Automato from "./automato";

const automato = new Automato<["{", "}"], ["q1", "q2", "q3"], ["x"]>(
  "q1",
  ["q3"]
);
automato.add_transicao("q1", "{", "q1", undefined, "x");
automato.add_transicao("q1", "", "q2");
automato.add_transicao("q2", "}", "q2", "x");
automato.add_transicao("q2", "?", "q3", "?");

const rl = readline.createInterface(input, output);

function query(query: string) {
  return new Promise<string>(resolve => rl.question(query, (str) => resolve(str)));
}

async function execute() {
  let str: string;
  console.clear();
  console.log("Linguagem: {ⁿ}ⁿ | n >= 0");
  while ((str = await query("Insira uma palavra para checagem (exit para sair): ")) !== "exit") {
    console.log(`\n\"${str}\" ${automato.ler(str) ? '' : 'não '}pertence à linguagem`);
    await query("\nPressione enter.");
    console.clear();
    console.log("Linguagem: {ⁿ}ⁿ | n >= 0");
  }
  process.exit();
}

execute();