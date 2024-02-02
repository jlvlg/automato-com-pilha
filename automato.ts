export default class Automato<
  Alfabeto extends string[],
  Estados extends string[],
  Auxiliar extends string[]
> {
  public estado: Estados[number];
  public transicoes: { [key: string]: { [key: string]: (() => boolean)[] } };
  public pilha: Auxiliar[number][];
  public fita: string;

  constructor(
    public inicial: Estados[number],
    public finais: Estados[number][]
  ) {
    this.transicoes = {};
    this.pilha = [];
    this.estado = inicial;
    this.fita = "";
  }

  add_transicao(
    estado_inicio: Estados[number],
    simbolo: Alfabeto[number] | "?" | "",
    estado_destino: Estados[number],
    leitura?: Auxiliar[number] | "?",
    escrita?: Auxiliar[number]
  ) {
    this.transicoes[estado_inicio] ??= {};
    this.transicoes[estado_inicio][simbolo] ??= [];

    function transicao(this: Automato<Alfabeto, Estados, Auxiliar>) {
      let result = true;
      this.estado = estado_destino;
      if (leitura) {
        if (!this.pilha.length) {
          result = leitura === "?";
        } else if (this.pilha[0] === leitura) {
          this.pilha.shift();
          result = true;
        } else {
          result = false;
        }
      }
      if (escrita) {
        this.pilha.unshift(escrita);
      }

      if (simbolo) this.fita = this.fita.slice(1);
      return result;
    }

    this.transicoes[estado_inicio][simbolo].push(transicao);
  }

  transicao() {
    let regras: (typeof this.transicoes)[Estados[number]];
    let transicoes: (typeof regras)[Alfabeto[number]];
    let result: boolean;
    if (!(regras = this.transicoes[this.estado])) return false;
    if (!(transicoes = regras[this.fita[0]])) return false;
    result = transicoes[0].bind(this)();
    return result;
  }

  analizar() {
    let regras: (typeof this.transicoes)[Estados[number]];
    let transicoes: (typeof regras)[Alfabeto[number]];
    while (true) {
      const char = this.fita[0];
      if ((regras = this.transicoes[this.estado])) {
        if ((transicoes = regras[char]))
          if (transicoes.length > 1) return this.naodeterminismo(transicoes);
        if (regras[""]) {
          return this.naodeterminismo(
            [regras[""], regras[char] ? regras[char] : []].flat()
          );
        }
      }
      if (this.fita.length === 0)
        if ((regras = this.transicoes[this.estado]) && (transicoes = regras["?"]))
          this.fita = "?"
        else return this.finais.indexOf(this.estado) !== -1;
      if (!this.transicao()) return false;
    }
  }

  ler(fita: string) {
    this.fita = fita;
    this.estado = this.inicial;
    return this.analizar();
  }

  naodeterminismo(transicoes: (() => boolean)[]): boolean {
    for (const t of transicoes) {
      const automato = new Automato<Alfabeto, Estados, Auxiliar>(
        this.estado,
        this.finais.slice()
      );
      automato.pilha = this.pilha.slice();
      automato.transicoes = this.transicoes;
      automato.fita = this.fita;
      t.bind(automato)();
      if (automato.analizar()) return true;
    }
    return false;
  }
}
