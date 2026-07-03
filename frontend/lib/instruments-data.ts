export interface ScaleStep {
  exp: string;
  size: string;
  name: string;
  note: string;
}

export interface Quote {
  text: string;
  who: string;
  era: string;
}

export const SCALE_STEPS: ScaleStep[] = [
  {
    exp: "10⁻¹⁵",
    size: "1 femtometru",
    name: "Un proton",
    note: "Subsolul materiei. Mai mic decât are imaginația vreun drept să coboare.",
  },
  {
    exp: "10⁻¹²",
    size: "1 picometru",
    name: "Lungimea de undă a unei raze gamma",
    note: "Lumină, răsucită mai strâns decât poate cuprinde orice atom.",
  },
  {
    exp: "10⁻¹⁰",
    size: "1 ångström",
    name: "Un atom de hidrogen",
    note: "În mare parte spațiu gol, imitând convingător un lucru.",
  },
  {
    exp: "10⁻⁹",
    size: "1 nanometru",
    name: "O catenă de ADN",
    note: "Doi nanometri lățime — și totuși își amintește cum să construiască un tu.",
  },
  {
    exp: "10⁻⁷",
    size: "100 de nanometri",
    name: "Un virus",
    note: "Pe granița tăcută dintre chimie și viață.",
  },
  {
    exp: "10⁻⁵",
    size: "10 micrometri",
    name: "O globulă roșie",
    note: "Opt dintre acestea, așezate în șir, ar acoperi un singur grăunte de sare.",
  },
  {
    exp: "10⁻⁴",
    size: "0,1 milimetri",
    name: "Un grăunte de nisip fin",
    note: "Cel mai mic lucru pe care vârfurile degetelor tale îl pot găsi cu siguranță.",
  },
  {
    exp: "10⁻²",
    size: "1 centimetru",
    name: "O nucă",
    note: "Înapoi în lumea confortabilă a lucrurilor pe care le poți ține în mână.",
  },
  {
    exp: "10⁰",
    size: "1 metru",
    name: "O ființă umană",
    note: "Cu aproximație. Aceasta este scara după care le măsori, în taină, pe toate celelalte.",
  },
  {
    exp: "10¹",
    size: "10 metri",
    name: "O balenă albastră",
    note: "Cel mai mare animal care a trăit vreodată pe această planetă.",
  },
  {
    exp: "10²",
    size: "100 de metri",
    name: "Un sequoia",
    note: "Cele mai înalte ființe vii — turnuri tăcute de apă lentă.",
  },
  {
    exp: "10³",
    size: "1 kilometru",
    name: "Un munte mic",
    note: "O mie de metri de stâncă răbdătoare.",
  },
  {
    exp: "10⁴",
    size: "8,8 kilometri",
    name: "Muntele Everest",
    note: "Cea mai înaltă întindere a Pământului e totuși, cosmic vorbind, o eroare de rotunjire.",
  },
  {
    exp: "10⁶",
    size: "3.474 km",
    name: "Luna",
    note: "Destul de aproape s-o atingi, în singurii termeni pe care îi respectă universul.",
  },
  {
    exp: "10⁷",
    size: "12.742 km",
    name: "Pământul",
    note: "Douăsprezece mii de kilometri cuprinzând fiecare om pe care îl vei cunoaște vreodată.",
  },
  {
    exp: "10⁹",
    size: "1,4 milioane km",
    name: "Soarele",
    note: "Un milion de Pământuri ar încăpea înăuntrul lui, și tot ar mai rămâne loc.",
  },
  {
    exp: "10¹¹",
    size: "1 UA",
    name: "Orbita Pământului",
    note: "O unitate astronomică — vreo opt minute de lumină solară, de la un capăt la altul.",
  },
  {
    exp: "10¹³",
    size: "≈ 9 miliarde km",
    name: "Sistemul Solar",
    note: "Dincolo de Neptun, unde Soarele e doar cea mai strălucitoare stea de pe cer.",
  },
  {
    exp: "10¹⁶",
    size: "1 an-lumină",
    name: "Un an-lumină",
    note: "Distanța pe care o străbate lumina într-un an — iar cea mai apropiată stea e la patru de-astea depărtare.",
  },
  {
    exp: "10²¹",
    size: "100.000 de ani-lumină",
    name: "Calea Lactee",
    note: "O sută de miliarde de sori, al nostru printre ei, pe un braț exterior liniștit.",
  },
  {
    exp: "10²²",
    size: "2,5 milioane de ani-lumină",
    name: "Andromeda",
    note: "Cea mai apropiată galaxie mare, căzând încet și sigur spre noi.",
  },
  {
    exp: "10²⁴",
    size: "≈ 100 de milioane de ani-lumină",
    name: "Superroiul local",
    note: "Galaxii cu miile, înșirate ca roua pe o pânză nevăzută.",
  },
  {
    exp: "10²⁶",
    size: "93 de miliarde de ani-lumină",
    name: "Universul observabil",
    note: "Marginea a tot ce am putea vreodată, chiar și în principiu, să vedem.",
  },
];

export const QUOTES: Quote[] = [
  {
    text: "Ai putere asupra minții tale — nu asupra evenimentelor din afară. Înțelege asta și vei găsi putere.",
    who: "Marcus Aurelius",
    era: "Meditații, cca. 170 e.n.",
  },
  {
    text: "Suferim mai des în imaginație decât în realitate.",
    who: "Seneca",
    era: "Scrisori, cca. 65 e.n.",
  },
  {
    text: "Cosmosul este în noi. Suntem făcuți din materie stelară.",
    who: "Carl Sagan",
    era: "Cosmos, 1980",
  },
  {
    text: "Mărginește-te la prezent.",
    who: "Marcus Aurelius",
    era: "Meditații, cca. 170 e.n.",
  },
  {
    text: "Privește în sus la stele, nu în jos la picioarele tale.",
    who: "Stephen Hawking",
    era: "2010",
  },
  {
    text: "Nu avem prea puțin timp de trăit, ci risipim mult din el.",
    who: "Seneca",
    era: "Despre scurtimea vieții, cca. 49 e.n.",
  },
  {
    text: "Suntem un fel prin care universul ajunge să se cunoască pe sine.",
    who: "Carl Sagan",
    era: "Cosmos, 1980",
  },
  {
    text: "Sufletul se colorează în culoarea gândurilor sale.",
    who: "Marcus Aurelius",
    era: "Meditații, cca. 170 e.n.",
  },
  {
    text: "Norocul este ceea ce se întâmplă când pregătirea întâlnește ocazia.",
    who: "Seneca",
    era: "atribuit",
  },
];
