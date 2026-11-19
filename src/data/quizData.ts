export type ChoiceKey = 'A' | 'B' | 'C' | 'D';

export interface QuizChoice {
  key: ChoiceKey;
  labelLatex: string;
  labelPlain: string;
}

export interface ProofStep {
  heading: string;
  contentLatex: string;
  contentPlain: string[];
}

export interface QuizQuestion {
  id: number;
  title: string;
  topic: string;
  statementLatex: string;
  statementPlain: string;
  choices: QuizChoice[];
  correctAnswer: ChoiceKey;
  statementNote?: {
    title: string;
    contentLatex: string;
    contentPlain: string[];
  };
  steps: ProofStep[];
  conclusionLatex: string;
  conclusionPlain: string;
  diagramType?: 'circle-q6' | 'triangle-q7';
}

export const QUIZ_META = {
  pageTitle: 'CORRIGÉ DÉTAILLÉ — GEN MOME',
  challengeTitle: 'Défi Mathématique — Gen MOME',
  organizer: 'Gen MOME',
  author: 'MILLOGO Ariès',
  motto: 'Comprendre le raisonnement, c’est progresser en mathématiques.',
  closingMessage:
    'Merci d’avoir participé au Défi Mathématique Gen MOME. Continue à apprendre, à raisonner et à progresser.',
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    title: 'Question 1 — Proportionnalité',
    topic: 'Proportionnalité',
    statementLatex:
      'On donne $\\dfrac{a}{x} = \\dfrac{b}{y}$, avec $x \\neq 0$, $y \\neq 0$ et $x + y \\neq 0$. Laquelle des égalités suivantes est toujours vraie ?',
    statementPlain:
      'On donne a/x = b/y, avec x ≠ 0, y ≠ 0 et x + y ≠ 0. Laquelle des égalités suivantes est toujours vraie ?',
    choices: [
      { key: 'A', labelLatex: '$\\dfrac{a}{x} = \\dfrac{a+b}{xy}$', labelPlain: 'a/x = (a + b) / (xy)' },
      { key: 'B', labelLatex: '$\\dfrac{a}{x} = \\dfrac{a+b}{x+y}$', labelPlain: 'a/x = (a + b) / (x + y)' },
      { key: 'C', labelLatex: '$\\dfrac{a}{x} = \\dfrac{ab}{x+y}$', labelPlain: 'a/x = (ab) / (x + y)' },
      { key: 'D', labelLatex: '$\\dfrac{a}{x} = \\dfrac{a-b}{x+y}$', labelPlain: 'a/x = (a − b) / (x + y)' },
    ],
    correctAnswer: 'B',
    steps: [
      {
        heading: 'Étape 1 : Introduire le coefficient de proportionnalité',
        contentLatex:
          'Posons $k = \\dfrac{a}{x} = \\dfrac{b}{y}$ (ce qui est légitime car $x \\neq 0$ et $y \\neq 0$). On obtient alors :\n$$a = kx \\quad \\text{et} \\quad b = ky$$',
        contentPlain: [
          'Posons k = a/x = b/y (légitime car x ≠ 0 et y ≠ 0).',
          'On obtient alors : a = kx et b = ky.',
        ],
      },
      {
        heading: 'Étape 2 : Additionner et factoriser',
        contentLatex:
          'En additionnant les deux égalités membre à membre, puis en factorisant par $k$ :\n$$a + b = kx + ky = k(x + y)$$',
        contentPlain: [
          'En additionnant les deux égalités membre à membre et en factorisant par k :',
          'a + b = kx + ky = k(x + y).',
        ],
      },
      {
        heading: 'Étape 3 : Diviser par x + y',
        contentLatex:
          'Puisque $x + y \\neq 0$, on peut diviser les deux membres par $x + y$ :\n$$\\dfrac{a + b}{x + y} = k$$\nOr $k = \\dfrac{a}{x}$. Par conséquent :\n$$\\dfrac{a}{x} = \\dfrac{a + b}{x + y}$$',
        contentPlain: [
          'Puisque x + y ≠ 0, on divise par (x + y) : (a + b)/(x + y) = k.',
          'Or k = a/x, d’où a/x = (a + b)/(x + y).',
        ],
      },
    ],
    conclusionLatex: 'L’égalité toujours vérifiée est $\\dfrac{a}{x} = \\dfrac{a+b}{x+y}$. Bonne réponse : B.',
    conclusionPlain: 'L’égalité toujours vérifiée est a/x = (a + b)/(x + y). Bonne réponse : B.',
  },
  {
    id: 2,
    title: 'Question 2 — Identité remarquable',
    topic: 'Identités remarquables',
    statementLatex:
      'On suppose que $p + \\dfrac{1}{p} = \\sqrt{5}$, avec $p \\neq 0$. Quelle est la valeur de $p^2 + \\dfrac{1}{p^2}$ ?',
    statementPlain:
      'On suppose que p + 1/p = √5, avec p ≠ 0. Quelle est la valeur de p² + 1/p² ?',
    choices: [
      { key: 'A', labelLatex: '$5$', labelPlain: '5' },
      { key: 'B', labelLatex: '$7$', labelPlain: '7' },
      { key: 'C', labelLatex: '$3$', labelPlain: '3' },
      { key: 'D', labelLatex: '$\\sqrt{5} - 2$', labelPlain: '√5 − 2' },
    ],
    correctAnswer: 'C',
    steps: [
      {
        heading: 'Étape 1 : Élever l’égalité au carré',
        contentLatex:
          'En élevant les deux membres de $p + \\dfrac{1}{p} = \\sqrt{5}$ au carré :\n$$\\left(p + \\dfrac{1}{p}\\right)^2 = (\\sqrt{5})^2 = 5$$',
        contentPlain: [
          'En élevant les deux membres de p + 1/p = √5 au carré :',
          '(p + 1/p)² = (√5)² = 5.',
        ],
      },
      {
        heading: 'Étape 2 : Développer le carré d’une somme',
        contentLatex:
          'En appliquant l’identité $(u + v)^2 = u^2 + 2uv + v^2$ :\n$$p^2 + 2 \\cdot p \\cdot \\dfrac{1}{p} + \\dfrac{1}{p^2} = 5$$\nComme $p \\neq 0$, le produit $p \\cdot \\dfrac{1}{p}$ vaut $1$, ce qui donne :\n$$p^2 + 2 + \\dfrac{1}{p^2} = 5$$',
        contentPlain: [
          'En développant : p² + 2·p·(1/p) + 1/p² = 5.',
          'Comme p·(1/p) = 1, on obtient : p² + 2 + 1/p² = 5.',
        ],
      },
      {
        heading: 'Étape 3 : Isoler l’expression recherchée',
        contentLatex:
          'En soustrayant $2$ aux deux membres :\n$$p^2 + \\dfrac{1}{p^2} = 5 - 2 = 3$$',
        contentPlain: [
          'En soustrayant 2 : p² + 1/p² = 5 − 2 = 3.',
        ],
      },
    ],
    conclusionLatex: 'On obtient $p^2 + \\dfrac{1}{p^2} = 3$. Bonne réponse : C.',
    conclusionPlain: 'On obtient p² + 1/p² = 3. Bonne réponse : C.',
  },
  {
    id: 3,
    title: 'Question 3 — Calcul d’une somme de cubes',
    topic: 'Somme de cubes',
    statementLatex:
      'Avec la même donnée $p + \\dfrac{1}{p} = \\sqrt{5}$ ($p \\neq 0$), quelle est la valeur de $p^3 + \\dfrac{1}{p^3}$ ?',
    statementPlain:
      'Avec la même donnée p + 1/p = √5 (p ≠ 0), quelle est la valeur de p³ + 1/p³ ?',
    choices: [
      { key: 'A', labelLatex: '$5\\sqrt{5}$', labelPlain: '5√5' },
      { key: 'B', labelLatex: '$2\\sqrt{5}$', labelPlain: '2√5' },
      { key: 'C', labelLatex: '$3\\sqrt{5}$', labelPlain: '3√5' },
      { key: 'D', labelLatex: '$8\\sqrt{5}$', labelPlain: '8√5' },
    ],
    correctAnswer: 'B',
    steps: [
      {
        heading: 'Étape 1 : Utiliser l’identité remarquable du cube',
        contentLatex:
          'On rappelle l’identité algébrique :\n$$u^3 + v^3 = (u + v)^3 - 3uv(u + v)$$\nEn posant $u = p$ et $v = \\dfrac{1}{p}$, on a $uv = p \\cdot \\dfrac{1}{p} = 1$. Ainsi :\n$$p^3 + \\dfrac{1}{p^3} = \\left(p + \\dfrac{1}{p}\\right)^3 - 3\\left(p + \\dfrac{1}{p}\\right)$$',
        contentPlain: [
          'On utilise l’identité : u³ + v³ = (u + v)³ − 3uv(u + v).',
          'Pour u = p et v = 1/p, on a uv = 1, donc :',
          'p³ + 1/p³ = (p + 1/p)³ − 3(p + 1/p).',
        ],
      },
      {
        heading: 'Étape 2 : Remplacer par la valeur connue et simplifier',
        contentLatex:
          'En remplaçant $p + \\dfrac{1}{p}$ par $\\sqrt{5}$ :\n$$p^3 + \\dfrac{1}{p^3} = (\\sqrt{5})^3 - 3\\sqrt{5}$$\nOr $(\\sqrt{5})^3 = (\\sqrt{5})^2 \\cdot \\sqrt{5} = 5\\sqrt{5}$. Donc :\n$$p^3 + \\dfrac{1}{p^3} = 5\\sqrt{5} - 3\\sqrt{5} = 2\\sqrt{5}$$',
        contentPlain: [
          'En remplaçant p + 1/p par √5 : p³ + 1/p³ = (√5)³ − 3√5.',
          'Or (√5)³ = 5√5, donc p³ + 1/p³ = 5√5 − 3√5 = 2√5.',
        ],
      },
    ],
    conclusionLatex: 'La somme de cubes vaut $p^3 + \\dfrac{1}{p^3} = 2\\sqrt{5}$. Bonne réponse : B.',
    conclusionPlain: 'La somme de cubes vaut p³ + 1/p³ = 2√5. Bonne réponse : B.',
  },
  {
    id: 4,
    title: 'Question 4 — Identité algébrique',
    topic: 'Factorisation algébrique',
    statementLatex:
      'Soient deux réels $a$ et $b$ tels que $a + b = 1$. Quelle expression est équivalente à $ab - \\dfrac{1}{4}$ ?',
    statementPlain:
      'Soient deux réels a et b tels que a + b = 1. Quelle expression est équivalente à ab − 1/4 ?',
    choices: [
      { key: 'A', labelLatex: '$-\\dfrac{(1 - 2a)^2}{2}$', labelPlain: '−(1 − 2a)² / 2' },
      { key: 'B', labelLatex: '$\\dfrac{(1 - 2a)^2}{4}$', labelPlain: '(1 − 2a)² / 4' },
      { key: 'C', labelLatex: '$-\\dfrac{(1 - 2a)^2}{4}$', labelPlain: '−(1 − 2a)² / 4' },
      { key: 'D', labelLatex: '$-\\dfrac{(1 + 2a)^2}{4}$', labelPlain: '−(1 + 2a)² / 4' },
    ],
    correctAnswer: 'C',
    statementNote: {
      title: 'Point de vigilance sur le dénominateur',
      contentLatex:
        'Attention au piège classique : lorsqu’on écrit $a - \\dfrac{1}{2} = \\dfrac{2a - 1}{2}$, l’élévation au carré élève aussi le dénominateur $2$ au carré, donnant $2^2 = 4$ et non $2$.',
      contentPlain: [
        'Attention : lorsqu’on écrit a − 1/2 = (2a − 1)/2, l’élévation au carré donne 2² = 4 au dénominateur, et non 2.',
      ],
    },
    steps: [
      {
        heading: 'Étape 1 : Exprimer b en fonction de a',
        contentLatex:
          'À partir de $a + b = 1$, on isole $b$ :\n$$b = 1 - a$$',
        contentPlain: [
          'À partir de a + b = 1, on exprime b = 1 − a.',
        ],
      },
      {
        heading: 'Étape 2 : Substituer b dans l’expression',
        contentLatex:
          'On remplace $b$ par $1 - a$ dans $ab - \\dfrac{1}{4}$ :\n$$ab - \\dfrac{1}{4} = a(1 - a) - \\dfrac{1}{4} = a - a^2 - \\dfrac{1}{4}$$',
        contentPlain: [
          'On remplace b : ab − 1/4 = a(1 − a) − 1/4 = a − a² − 1/4.',
        ],
      },
      {
        heading: 'Étape 3 : Factoriser sous forme d’un carré',
        contentLatex:
          'On met $-1$ en facteur pour reconnaître un carré parfait :\n$$a - a^2 - \\dfrac{1}{4} = -\\left(a^2 - a + \\dfrac{1}{4}\\right) = -\\left(a - \\dfrac{1}{2}\\right)^2$$\nOr $a - \\dfrac{1}{2} = \\dfrac{2a - 1}{2} = -\\dfrac{1 - 2a}{2}$. En élevant au carré (et comme $(-X)^2 = X^2$) :\n$$-\\left(a - \\dfrac{1}{2}\\right)^2 = -\\left(\\dfrac{1 - 2a}{2}\\right)^2 = -\\dfrac{(1 - 2a)^2}{4}$$',
        contentPlain: [
          'On factorise : a − a² − 1/4 = −(a² − a + 1/4) = −(a − 1/2)².',
          'Comme a − 1/2 = (2a − 1)/2 et (2a − 1)² = (1 − 2a)², on obtient :',
          'ab − 1/4 = −(1 − 2a)² / 4.',
        ],
      },
    ],
    conclusionLatex: 'L’expression équivalente est $-\\dfrac{(1 - 2a)^2}{4}$ (dénominateur $4$). Bonne réponse : C.',
    conclusionPlain: 'L’expression équivalente est −(1 − 2a)² / 4 (dénominateur 4). Bonne réponse : C.',
  },
  {
    id: 5,
    title: 'Question 5 — Équation avec des racines carrées',
    topic: 'Équations irrationnelles',
    statementLatex:
      'Résoudre dans l’intervalle $[3, +\\infty[$ l’équation : $\\sqrt{t + 2} - \\sqrt{t - 3} = 1$.',
    statementPlain:
      'Résoudre pour t ≥ 3 l’équation : √(t + 2) − √(t − 3) = 1.',
    choices: [
      { key: 'A', labelLatex: '$t = 3$', labelPlain: 't = 3' },
      { key: 'B', labelLatex: '$t = 5$', labelPlain: 't = 5' },
      { key: 'C', labelLatex: '$t = 7$', labelPlain: 't = 7' },
      { key: 'D', labelLatex: '$t = 9$', labelPlain: 't = 9' },
    ],
    correctAnswer: 'C',
    steps: [
      {
        heading: 'Étape 1 : Multiplier par l’expression conjuguée (rationaliser)',
        contentLatex:
          'Pour $t \\ge 3$, les deux radicandes sont positifs ($t + 2 \\ge 5 > 0$ et $t - 3 \\ge 0$), donc $\\sqrt{t+2} + \\sqrt{t-3} > 0$. Multiplions les deux membres par $\\sqrt{t+2} + \\sqrt{t-3}$ :\n$$\\big(\\sqrt{t+2} - \\sqrt{t-3}\\big)\\big(\\sqrt{t+2} + \\sqrt{t-3}\\big) = 1 \\cdot \\big(\\sqrt{t+2} + \\sqrt{t-3}\\big)$$\nLe membre de gauche est de la forme $(A-B)(A+B) = A^2 - B^2$ :\n$$(t + 2) - (t - 3) = 5 \\implies \\sqrt{t + 2} + \\sqrt{t - 3} = 5$$',
        contentPlain: [
          'Pour t ≥ 3, √(t+2) + √(t−3) > 0. En multipliant les deux membres par cette somme :',
          '[√(t+2) − √(t−3)] × [√(t+2) + √(t−3)] = √(t+2) + √(t−3).',
          'À gauche, on obtient (t + 2) − (t − 3) = 5, donc √(t+2) + √(t−3) = 5.',
        ],
      },
      {
        heading: 'Étape 2 : Résoudre le système linéaire en les deux racines',
        contentLatex:
          'On dispose du système :\n$$\\begin{cases} \\sqrt{t + 2} - \\sqrt{t - 3} = 1 \\\\ \\sqrt{t + 2} + \\sqrt{t - 3} = 5 \\end{cases}$$\nEn additionnant les deux équations :\n$$2\\sqrt{t + 2} = 6 \\implies \\sqrt{t + 2} = 3$$\nEn soustrayant la première équation de la seconde :\n$$2\\sqrt{t - 3} = 4 \\implies \\sqrt{t - 3} = 2$$',
        contentPlain: [
          'On résout le système : √(t+2) − √(t−3) = 1 et √(t+2) + √(t−3) = 5.',
          'Par addition : 2√(t+2) = 6, soit √(t+2) = 3.',
          'Par soustraction : 2√(t−3) = 4, soit √(t−3) = 2.',
        ],
      },
      {
        heading: 'Étape 3 : Déterminer t et vérifier la solution',
        contentLatex:
          'De $\\sqrt{t + 2} = 3$, on déduit $t + 2 = 9$, soit $t = 7$ (cohérent avec $\\sqrt{t - 3} = 2 \\implies t - 3 = 4 \\implies t = 7$).\nVérification directe dans l’équation initiale : $7 \\ge 3$ et\n$$\\sqrt{7 + 2} - \\sqrt{7 - 3} = \\sqrt{9} - \\sqrt{4} = 3 - 2 = 1$$',
        contentPlain: [
          '√(t+2) = 3 implique t + 2 = 9, donc t = 7.',
          'Vérification : 7 ≥ 3 et √9 − √4 = 3 − 2 = 1. L’équation est bien satisfaite.',
        ],
      },
    ],
    conclusionLatex: 'L’unique solution est $t = 7$. Bonne réponse : C.',
    conclusionPlain: 'L’unique solution est t = 7. Bonne réponse : C.',
  },
  {
    id: 6,
    title: 'Question 6 — Géométrie du cercle',
    topic: 'Géométrie du cercle',
    diagramType: 'circle-q6',
    statementLatex:
      'Soient $(C)$ un cercle de diamètre $[IJ]$, et $E, F$ deux points distincts de $(C)$ n’appartenant pas à $\\{I, J\\}$ et non diamétralement opposés. On note $M$ le point d’intersection des droites $(EJ)$ et $(FI)$, et $N$ celui des droites $(IE)$ et $(JF)$. Quelle propriété relie les droites $(IJ)$ et $(MN)$ ?',
    statementPlain:
      'Soient (C) un cercle de diamètre [IJ], et E, F deux points de (C) (E, F ∉ {I, J}, E ≠ F et [EF] non diamètre). M est l’intersection de (EJ) et (FI), et N celle de (IE) et (JF). Quelle relation lie (IJ) et (MN) ?',
    choices: [
      { key: 'A', labelLatex: '$(IJ) \\parallel (MN)$', labelPlain: '(IJ) ∥ (MN)' },
      { key: 'B', labelLatex: '$(IJ) \\perp (MN)$', labelPlain: '(IJ) ⊥ (MN)' },
      {
        key: 'C',
        labelLatex: '$(MN)$ passe toujours par le centre de $(C)$',
        labelPlain: '(MN) passe toujours par le centre de (C)',
      },
      {
        key: 'D',
        labelLatex: '$(IJ)$ et $(MN)$ forment un angle de $45^\\circ$',
        labelPlain: '(IJ) et (MN) forment un angle de 45°',
      },
    ],
    correctAnswer: 'B',
    statementNote: {
      title: 'Précision rigoureuse sur les hypothèses de non-dégénérescence',
      contentLatex:
        'Si l’énoncé brut mentionne seulement « $E, F \\in (C)$ et $[IJ]$ diamètre », trois cas dégénérés doivent être exclus pour que $M$, $N$ et la droite $(MN)$ existent : (1) $E \\notin \\{I, J\\}$ et $F \\notin \\{I, J\\}$ (sinon certaines droites sont indéfinies ou confondues avec $(IJ)$) ; (2) $E \\neq F$ (sinon $M = N = E$ et la droite $(MN)$ n’est pas définie) ; (3) $[EF]$ n’est pas un diamètre de $(C)$ (sinon $IEJF$ est un rectangle, $(EJ) \\parallel (FI)$ et $(IE) \\parallel (JF)$, donc $M$ et $N$ n’existent pas). Sous ces conditions, la propriété $(IJ) \\perp (MN)$ est toujours vraie.',
      contentPlain: [
        'Conditions de non-dégénérescence indispensables : (1) E, F ∉ {I, J} ; (2) E ≠ F (sinon M = N = E) ; (3) [EF] n’est pas un diamètre (sinon (EJ) ∥ (FI) et (IE) ∥ (JF), M et N n’existent pas).',
      ],
    },
    steps: [
      {
        heading: 'Étape 1 : Méthode géométrique (angles inscrits et orthocentre)',
        contentLatex:
          'Comme $[IJ]$ est un diamètre du cercle $(C)$ et que $E, F \\in (C) \\setminus \\{I, J\\}$, le théorème de l’angle inscrit dans un demi-cercle donne deux angles droits :\n$$\\widehat{IEJ} = 90^\\circ \\implies (EJ) \\perp (IE) \\qquad \\text{et} \\qquad \\widehat{IFJ} = 90^\\circ \\implies (FI) \\perp (JF)$$\nConsidérons le triangle $NIJ$ (qui est non aplati car $N = (IE) \\cap (JF)$ n’appartient pas à $(IJ)$ sous les conditions de non-dégénérescence) :\n- la droite $(EJ)$ passe par le sommet $J$ et est perpendiculaire au côté $(IN) = (IE)$ : c’est donc la hauteur issue de $J$ ;\n- la droite $(FI)$ passe par le sommet $I$ et est perpendiculaire au côté $(JN) = (JF)$ : c’est donc la hauteur issue de $I$.\nLeur point d’intersection $M = (EJ) \\cap (FI)$ est par conséquent l’orthocentre du triangle $NIJ$. La troisième hauteur, issue de $N$, passe nécessairement par $M$ et est perpendiculaire à $(IJ)$ : donc $(MN) \\perp (IJ)$.',
        contentPlain: [
          'Par le théorème de l’angle inscrit dans un demi-cercle de diamètre [IJ] :',
          '∠IEJ = 90° ⇒ (EJ) ⊥ (IE) et ∠IFJ = 90° ⇒ (FI) ⊥ (JF).',
          'Dans le triangle NIJ : (EJ) passe par J et est perpendiculaire à (IN) = (IE) (hauteur issue de J) ; (FI) passe par I et est perpendiculaire à (JN) = (JF) (hauteur issue de I).',
          'Leur intersection M est donc l’orthocentre de NIJ. La droite (MN) est la troisième hauteur, donc (MN) ⊥ (IJ).',
        ],
      },
      {
        heading: 'Étape 2 : Vérification analytique complète — Choix du repère et équations des droites',
        contentLatex:
          'Plaçons-nous dans un repère orthonormé $(O; \\vec{i}, \\vec{j})$ centré au centre $O$ du cercle $(C)$ de rayon $R > 0$, tel que $I(-R, 0)$ et $J(R, 0)$ (la droite $(IJ)$ est donc l’axe des abscisses $y = 0$). Posons $E(x_1, y_1)$ et $F(x_2, y_2)$ avec $x_1^2 + y_1^2 = R^2$, $x_2^2 + y_2^2 = R^2$, $y_1 \\neq 0$, $y_2 \\neq 0$, $(x_1, y_1) \\neq (x_2, y_2)$ et $(x_2, y_2) \\neq (-x_1, -y_1)$.\nLes équations cartésiennes des quatre droites sont :\n- $(EJ)$ : $(x_1 - R)y = y_1(x - R)$\n- $(FI)$ : $(x_2 + R)y = y_2(x + R)$\n- $(IE)$ : $(x_1 + R)y = y_1(x + R)$\n- $(JF)$ : $(x_2 - R)y = y_2(x - R)$',
        contentPlain: [
          'Méthode analytique : repère orthonormé centré en O (rayon R > 0) avec I(−R, 0), J(R, 0), E(x₁, y₁), F(x₂, y₂) vérifiant x₁² + y₁² = R², x₂² + y₂² = R², y₁ ≠ 0, y₂ ≠ 0, E ≠ F et F ≠ −E.',
          'Équations des droites : (EJ): (x₁−R)y = y₁(x−R) ; (FI): (x₂+R)y = y₂(x+R) ; (IE): (x₁+R)y = y₁(x+R) ; (JF): (x₂−R)y = y₂(x−R).',
        ],
      },
      {
        heading: 'Étape 3 : Calcul des abscisses de M et N et preuve algébrique de x_M = x_N',
        contentLatex:
          'En égalant $y$ pour $M = (EJ) \\cap (FI)$ (le dénominateur $D_M = y_1(x_2 + R) - y_2(x_1 - R)$ est non nul car $F \\neq -E$ et $y_1, y_2 \\neq 0$) :\n$$x_M = R \\cdot \\dfrac{y_1(x_2 + R) + y_2(x_1 - R)}{y_1(x_2 + R) - y_2(x_1 - R)}$$\nDe même, pour $N = (IE) \\cap (JF)$ (dénominateur $D_N = y_1(x_2 - R) - y_2(x_1 + R) \\neq 0$) :\n$$x_N = -R \\cdot \\dfrac{y_1(x_2 - R) + y_2(x_1 + R)}{y_1(x_2 - R) - y_2(x_1 + R)}$$\nVérifions que $x_M - x_N = 0$. Le numérateur de $\\dfrac{x_M - x_N}{R}$ vaut :\n$$\\big[y_1(x_2 + R) + y_2(x_1 - R)\\big]\\big[y_1(x_2 - R) - y_2(x_1 + R)\\big] + \\big[y_1(x_2 - R) + y_2(x_1 + R)\\big]\\big[y_1(x_2 + R) - y_2(x_1 - R)\\big]$$\nEn développant cette somme de deux produits, les termes croisés en $y_1 y_2$ s’annulent deux à deux et il reste :\n$$2\\big[y_1^2(x_2^2 - R^2) + y_2^2(R^2 - x_1^2)\\big]$$\nOr $x_2^2 - R^2 = -y_2^2$ et $R^2 - x_1^2 = y_1^2$ puisque $E, F \\in (C)$. D’où :\n$$2\\big[y_1^2(-y_2^2) + y_2^2(y_1^2)\\big] = 0 \\implies x_M = x_N$$',
        contentPlain: [
          'En résolvant les intersections M = (EJ)∩(FI) et N = (IE)∩(JF) :',
          'x_M = R·[y₁(x₂+R) + y₂(x₁−R)] / [y₁(x₂+R) − y₂(x₁−R)],',
          'x_N = −R·[y₁(x₂−R) + y₂(x₁+R)] / [y₁(x₂−R) − y₂(x₁+R)].',
          'Le numérateur de (x_M − x_N)/R se simplifie en 2[y₁²(x₂²−R²) + y₂²(R²−x₁²)].',
          'Puisque x₂²−R² = −y₂² et R²−x₁² = y₁², ce numérateur vaut 2[−y₁²y₂² + y₂²y₁²] = 0, donc x_M = x_N.',
        ],
      },
      {
        heading: 'Étape 4 : Non-coïncidence de M et N et perpendicularité',
        contentLatex:
          'Si l’on avait $M = N = P$, alors $P \\in (EJ) \\cap (IE) = \\{E\\}$ et $P \\in (FI) \\cap (JF) = \\{F\\}$, ce qui impliquerait $E = F$, exclu par hypothèse. Ainsi $y_M \\neq y_N$ et $x_M = x_N$. Le vecteur $\\overrightarrow{MN} = (0, y_N - y_M)$ est non nul et vérifie $\\overrightarrow{IJ} \\cdot \\overrightarrow{MN} = 2R \\cdot 0 + 0 \\cdot (y_N - y_M) = 0$. Les droites $(IJ)$ et $(MN)$ sont donc perpendiculaires.',
        contentPlain: [
          'De plus M ≠ N dès que E ≠ F (car sinon M = N appartiendrait à (EJ)∩(IE) = {E} et à (FI)∩(JF) = {F}, soit E = F).',
          'Donc MN⃗ = (0, y_N − y_M) est non nul et orthogonal à IJ⃗ = (2R, 0), ce qui prouve (IJ) ⊥ (MN).',
        ],
      },
    ],
    conclusionLatex:
      'Sous les conditions de non-dégénérescence ($E, F \\notin \\{I, J\\}$, $E \\neq F$, $[EF]$ non diamètre), on a rigoureusement $(IJ) \\perp (MN)$. Bonne réponse : B.',
    conclusionPlain:
      'Sous les conditions de non-dégénérescence (E, F ∉ {I, J}, E ≠ F, [EF] non diamètre), on a rigoureusement (IJ) ⊥ (MN). Bonne réponse : B.',
  },
  {
    id: 7,
    title: 'Question 7 — Triangle rectangle',
    topic: 'Triangles semblables & Pythagore',
    diagramType: 'triangle-q7',
    statementLatex:
      'Soit $ABC$ un triangle rectangle en $A$. Soit $D$ le milieu de $[AB]$, et $E$ le projeté orthogonal de $D$ sur $[BC]$. Quelle relation est toujours vérifiée ?',
    statementPlain:
      'Soit ABC un triangle rectangle en A. D est le milieu de [AB], et E est le projeté orthogonal de D sur [BC]. Quelle relation est toujours vérifiée ?',
    choices: [
      { key: 'A', labelLatex: '$EC^2 = AC^2 + EB^2$', labelPlain: 'EC² = AC² + EB²' },
      { key: 'B', labelLatex: '$EC^2 = AB^2 + EB^2$', labelPlain: 'EC² = AB² + EB²' },
      { key: 'C', labelLatex: '$EB^2 = AC^2 + EC^2$', labelPlain: 'EB² = AC² + EC²' },
      { key: 'D', labelLatex: '$EC^2 = AC^2 + DE^2$', labelPlain: 'EC² = AC² + DE²' },
    ],
    correctAnswer: 'A',
    statementNote: {
      title: 'Position de E sur le segment [BC]',
      contentLatex:
        'Dans le triangle $ABC$ rectangle en $A$ (non aplati, $AB > 0, AC > 0$), l’angle $\\widehat{ABC}$ est strictement aigu. Cela garantit que le projeté orthogonal $E$ de $D$ sur $(BC)$ appartient strictement au segment $[BC]$, et donc que $EC = BC - BE$.',
      contentPlain: [
        'Dans ABC rectangle en A, l’angle en B est aigu, ce qui garantit que E appartient strictement au segment [BC] et que EC = BC − BE.',
      ],
    },
    steps: [
      {
        heading: 'Étape 1 : Identifier les triangles rectangles et l’alignement',
        contentLatex:
          '- Le triangle $ABC$ est rectangle en $A$.\n- Comme $E$ est le projeté orthogonal de $D$ sur $[BC]$, on a $(DE) \\perp (BC)$, donc le triangle $BDE$ est rectangle en $E$.\n- Les points $B, E, C$ sont alignés sur $[BC]$.',
        contentPlain: [
          'Le triangle ABC est rectangle en A ; le triangle BDE est rectangle en E car (DE) ⊥ (BC) ; B, E, C sont alignés.',
        ],
      },
      {
        heading: 'Étape 2 : Exploiter la similitude des triangles BDE et BAC',
        contentLatex:
          'Les triangles $BDE$ et $BAC$ ont :\n- un angle droit chacun : $\\widehat{BED} = \\widehat{BAC} = 90^\\circ$ ;\n- l’angle en $B$ en commun : $\\widehat{DBE} = \\widehat{ABC}$.\nIls sont donc semblables, d’où l’égalité des rapports de longueurs :\n$$\\dfrac{BE}{BA} = \\dfrac{BD}{BC}$$\nOr $D$ est le milieu de $[AB]$, donc $BD = \\dfrac{AB}{2}$. En substituant :\n$$\\dfrac{BE}{AB} = \\dfrac{AB}{2\\,BC} \\implies BE = \\dfrac{AB^2}{2\\,BC}$$\nComme $0 < AB < BC$ (car $AC > 0$), on a $0 < BE < \\dfrac{BC^2}{2\\,BC} = \\dfrac{BC}{2} < BC$, ce qui confirme que $E \\in ]B, C[$ et $EC = BC - BE$.',
        contentPlain: [
          'Les triangles BDE et BAC sont semblables (angle droit en E et A, angle commun en B), donc BE/BA = BD/BC.',
          'Comme D est le milieu de [AB], BD = AB/2, d’où BE = AB² / (2·BC).',
          'Comme AB < BC, on a 0 < BE < BC/2 < BC, donc E ∈ ]B, C[ et EC = BC − BE.',
        ],
      },
      {
        heading: 'Étape 3 : Calcul algébrique complet via Pythagore jusqu’à EC² = AC² + EB²',
        contentLatex:
          'Calculons $EC^2 - EB^2$ en utilisant $EC = BC - BE$ :\n$$EC^2 - EB^2 = (BC - BE)^2 - BE^2 = BC^2 - 2\\cdot BC \\cdot BE + BE^2 - BE^2 = BC^2 - 2\\cdot BC \\cdot BE$$\nRemplaçons $BE$ par l’expression trouvée à l’étape 2 ($BE = \\dfrac{AB^2}{2\\,BC}$) :\n$$2\\cdot BC \\cdot BE = 2\\cdot BC \\cdot \\dfrac{AB^2}{2\\,BC} = AB^2$$\nOn obtient ainsi :\n$$EC^2 - EB^2 = BC^2 - AB^2$$\nOr, d’après le théorème de Pythagore dans le triangle $ABC$ rectangle en $A$, on a $BC^2 = AB^2 + AC^2$, soit $BC^2 - AB^2 = AC^2$. En substituant :\n$$EC^2 - EB^2 = AC^2 \\iff EC^2 = AC^2 + EB^2$$',
        contentPlain: [
          'Calculons EC² − EB² avec EC = BC − BE :',
          'EC² − EB² = (BC − BE)² − EB² = BC² − 2·BC·BE + BE² − EB² = BC² − 2·BC·BE.',
          'En remplaçant BE = AB² / (2·BC) : 2·BC·BE = AB², donc EC² − EB² = BC² − AB².',
          'Or par Pythagore dans ABC rectangle en A, BC² = AB² + AC², soit BC² − AB² = AC².',
          'D’où EC² − EB² = AC², soit EC² = AC² + EB².',
        ],
      },
      {
        heading: 'Étape 4 : Vérification indépendante par le théorème de Pythagore (via CD²)',
        contentLatex:
          'On peut confirmer ce résultat directement en appliquant Pythagore dans trois triangles rectangles :\n1. Dans $ACD$ (rectangle en $A$) : $CD^2 = AC^2 + AD^2$.\n2. Dans $DEC$ (rectangle en $E$) : $CD^2 = DE^2 + EC^2$.\n3. Dans $BDE$ (rectangle en $E$) : $BD^2 = BE^2 + DE^2 \\implies DE^2 = BD^2 - BE^2$.\nEn reportant $DE^2$ dans la deuxième égalité et en utilisant $AD = BD$ ($D$ milieu de $[AB]$) :\n$$AC^2 + BD^2 = (BD^2 - BE^2) + EC^2 \\implies AC^2 = EC^2 - EB^2 \\implies EC^2 = AC^2 + EB^2$$',
        contentPlain: [
          'Vérification alternative par Pythagore :',
          'Dans ACD : CD² = AC² + AD². Dans DEC : CD² = DE² + EC². Dans BDE : DE² = BD² − BE².',
          'Comme AD = BD, on a AC² + BD² = (BD² − BE²) + EC², d’où EC² = AC² + EB².',
        ],
      },
    ],
    conclusionLatex:
      'Les deux démonstrations établissent rigoureusement que $EC^2 = AC^2 + EB^2$. Bonne réponse : A.',
    conclusionPlain:
      'Les deux démonstrations établissent rigoureusement que EC² = AC² + EB². Bonne réponse : A.',
  },
];
