export interface Validator {
  title: string;
  compiledCode: string;
  hash: string;
}

export interface Plutus {
  preamble: {
    title: string;
    version: string;
    plutusVersion: string;
    compiler: { name: string; version: string };
    license: string;
  };
  validators: Validator[];
}
