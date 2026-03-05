import { DimensionKey } from "@/types/dimensions";

export interface CauseQuestion {
  question: string;
  options: string[];
}

export const CAUSE_QUESTIONS: Record<DimensionKey, CauseQuestion[]> = {
  fysisk_halsa: [
    {
      question: "Hur ser din sömnkvalitet ut?",
      options: [
        "Jag sover bra och vaknar utvilad",
        "Jag sover okej men vill förbättra",
        "Jag har ofta svårt att sova",
        "Sömnbrist är ett stort problem",
      ],
    },
    {
      question: "Hur ofta rör du på dig?",
      options: [
        "Regelbunden träning flera gånger i veckan",
        "Jag rör mig ibland men inte regelbundet",
        "Sällan eller aldrig",
        "Jag vill träna men hittar inte tiden",
      ],
    },
    {
      question: "Hur mår du fysiskt just nu?",
      options: [
        "Jag känner mig stark och frisk",
        "Överlag okej men har mindre besvär",
        "Jag har smärta eller besvär som påverkar mig",
        "Jag har kroniska hälsoproblem",
      ],
    },
  ],
  mental_halsa: [
    {
      question: "Hur hanterar du stress?",
      options: [
        "Jag har bra strategier och känner mig i balans",
        "Ibland stressad men hanterar det oftast",
        "Stress påverkar mig dagligen",
        "Jag känner mig utbränd eller överväldigad",
      ],
    },
    {
      question: "Hur ofta känner du dig orolig eller nedstämd?",
      options: [
        "Sällan, jag mår bra",
        "Ibland, men det går över",
        "Ofta, det påverkar min vardag",
        "Nästan hela tiden",
      ],
    },
    {
      question: "Har du tid för återhämtning och sådant du tycker om?",
      options: [
        "Ja, jag prioriterar det regelbundet",
        "Ibland men önskar mer tid",
        "Sällan, andra saker tar all tid",
        "Aldrig, jag vet inte vad jag tycker om längre",
      ],
    },
  ],
  familj: [
    {
      question: "Hur skulle du beskriva din relation till din närmaste familj?",
      options: [
        "Nära och trygg",
        "Bra men vi kunde kommunicera bättre",
        "Komplicerad, det finns konflikter",
        "Distanserad eller frånvarande",
      ],
    },
    {
      question: "Hur ofta har ni kvalitetstid tillsammans?",
      options: [
        "Regelbundet, vi prioriterar det",
        "Ibland men vi är ofta upptagna",
        "Sällan, vardagen tar över",
        "Vi lever mest parallella liv",
      ],
    },
    {
      question: "Känner du stöd från din familj?",
      options: [
        "Ja, vi stöttar varandra",
        "Oftast, men inte alltid",
        "Sällan, jag känner mig ensam",
        "Familjen är en källa till stress",
      ],
    },
  ],
  vanner: [
    {
      question: "Hur ofta träffar du vänner?",
      options: [
        "Varje vecka eller oftare",
        "Några gånger i månaden",
        "Sällan, kanske varannan månad",
        "Nästan aldrig",
      ],
    },
    {
      question: "Har du nära vänner du kan prata med om allt?",
      options: [
        "Ja, flera stycken",
        "Ja, en eller två",
        "Inte riktigt, mest ytliga relationer",
        "Nej, jag saknar nära vänner",
      ],
    },
    {
      question: "Hur känns ditt sociala liv?",
      options: [
        "Rikt och meningsfullt",
        "Okej men jag vill ha mer",
        "Ensamt, jag saknar gemenskap",
        "Jag prioriterar bort det av andra skäl",
      ],
    },
  ],
  boende: [
    {
      question: "Hur trivs du i ditt hem?",
      options: [
        "Jag älskar mitt hem",
        "Det fungerar bra men kunde vara bättre",
        "Det finns saker som stör mig",
        "Jag trivs inte alls",
      ],
    },
    {
      question: "Känns ditt boende ekonomiskt hållbart?",
      options: [
        "Ja, inga ekonomiska bekymmer",
        "Det funkar men det är tight",
        "Det skapar stress och oro",
        "Ekonomin kring boendet är ohållbar",
      ],
    },
    {
      question: "Hur påverkar ditt boende din vardag?",
      options: [
        "Det ger mig energi och lugn",
        "Det är neutralt",
        "Praktiska problem tar energi",
        "Boendet påverkar mitt mående negativt",
      ],
    },
  ],
  jobb: [
    {
      question: "Känner du meningsfullhet i ditt arbete?",
      options: [
        "Ja, jag brinner för det jag gör",
        "Mestadels, vissa delar är tråkiga",
        "Sällan, jobbet är mest ett måste",
        "Nej, jag känner mig fast",
      ],
    },
    {
      question: "Hur är din arbetsbelastning?",
      options: [
        "Lagom, bra balans",
        "Lite för mycket men hanterbart",
        "Ofta stressigt och för mycket",
        "Ohållbart, jag är överbelastad",
      ],
    },
    {
      question: "Hur påverkar jobbet resten av ditt liv?",
      options: [
        "Positivt, det ger mig energi",
        "Neutralt, jag kan koppla av efter jobbet",
        "Negativt, jobbet följer med hem",
        "Det tar all min energi och tid",
      ],
    },
  ],
};
