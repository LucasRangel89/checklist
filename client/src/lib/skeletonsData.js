// Guia de Esqueletos Mentais OSCE (Revalida / INEP) — Estruturas em branco para orientação de estudo

export const UNIVERSAL_SKELETON = {
  title: 'Esqueleto Universal de Porta (Toda Estação do INEP)',
  subtitle:
    'Etapas obrigatórias de abertura (primeiros 45s) e fechamento (últimos 45s) que pontuam em praticamente todas as estações do Revalida.',
  opening: [
    {
      id: 'univ-open-1',
      step: 'Higienização das mãos e paramentação',
      detail:
        'Ao entrar na estação, verbalize: "Higienizo minhas mãos com álcool em gel / água e sabão" (e coloque EPI se cena de emergência/procedimento).',
    },
    {
      id: 'univ-open-2',
      step: 'Apresentação profissional e cordialidade',
      detail:
        'Cumprimente o ator/atriz: "Bom dia/boa tarde, meu nome é Dr(a). [Seu Nome], sou o(a) médico(a) responsável pelo seu atendimento hoje."',
    },
    {
      id: 'univ-open-3',
      step: 'Identificação completa do paciente (e acompanhante)',
      detail:
        'Pergunte nome completo, como prefere ser chamado(a), idade, profissão, estado civil e procedência (na Pediatria/Psiquiatria, identifique também o acompanhante e vínculo).',
    },
    {
      id: 'univ-open-4',
      step: 'Escuta aberta inicial sem interrupção',
      detail:
        'Pergunte: "O que trouxe você à consulta hoje?" e escute os primeiros segundos sem interromper antes de iniciar o interrogatório dirigido.',
    },
  ],
  closing: [
    {
      id: 'univ-close-1',
      step: 'Comunicação clara do diagnóstico e plano',
      detail:
        'Explique a hipótese diagnóstica e o tratamento sem termos técnicos complexos, olhando nos olhos do paciente.',
    },
    {
      id: 'univ-close-2',
      step: 'Verificação de compreensão e dúvidas (Teach-back)',
      detail:
        'Pergunte obrigatoriamente: "Ficou claro o que conversamos? Você tem alguma dúvida ou preocupação?"',
    },
    {
      id: 'univ-close-3',
      step: 'Sinais de alarme e rede de apoio',
      detail:
        'Verbalize de 3 a 4 sinais de alarme claros que indicam retorno imediato ao pronto-socorro ou UBS.',
    },
    {
      id: 'univ-close-4',
      step: 'Notificação Compulsória (SINAN) e Documentos Médicos',
      detail:
        'Pergunte a si mesmo antes de encerrar: "Esta doença/agravo exige notificação no SINAN? Precisa de CAT, receita em duas vias, cartão de acompanhamento ou encaminhamento?"',
    },
  ],
};

export const SPECIALTY_SKELETONS = [
  {
    slug: 'clinica-medica',
    name: 'Clínica Médica',
    icon: 'Stethoscope',
    color: '#3b82f6',
    summary:
      'Anamnese dirigida → Exame físico segmentar → Hipóteses diagnósticas → Solicitação de exames → Conduta terapêutica → Orientação ao paciente',
    flowSteps: [
      'Acolhimento & Identificação',
      'HDA (7 atributos do sintoma)',
      'Antecedentes, Medicações & Hábitos',
      'Sinais Vitais & Exame Segmentar',
      'Hipóteses & Diagnóstico Diferencial',
      'Exames Direcionados',
      'Terapêutica (Não Farmacológica + Farmacológica)',
      'Sinais de Alarme & Seguimento',
    ],
    sections: [
      {
        stage: '1. Anamnese Dirigida (HDA + Interrogatório Sintomatológico)',
        items: [
          {
            id: 'cm-1',
            title: 'Caracterização completa do sintoma-guia (PQRST / 7 atributos)',
            guide:
              'Início (agudo vs. insidioso), localização, caráter/tipo, intensidade (0 a 10), irradiação, fatores de melhora/piora, evolução temporal e episódios prévios.',
          },
          {
            id: 'cm-2',
            title: 'Sintomas associados e sinais constitucionais (Sinais B / Alarme)',
            guide:
              'Febre (aferida, padrão, calafrios), perda ponderal involuntária, sudorese noturna, anorexia, dispneia, dor torácica, alterações urinárias ou hábito intestinal.',
          },
          {
            id: 'cm-3',
            title: 'Antecedentes pessoais, comorbidades, alergias e medicações em uso',
            guide:
              'HAS, DM, dislipidemia, nefropatia, cardiopatia prévia, cirurgias, internações, alergia medicamentosa e adesão às medicações atuais (e uso de AINEs/fitoterápicos/PDE-5).',
          },
          {
            id: 'cm-4',
            title: 'Hábitos de vida, história familiar e vínculo epidemiológico',
            guide:
              'Tabagismo (carga tabágica em anos-maço), etilismo, drogas ilícitas, atividade física, viagens recentes, contato com sintomáticos, animais, água/enchentes ou carrapatos.',
          },
        ],
      },
      {
        stage: '2. Exame Físico Geral e Segmentar',
        items: [
          {
            id: 'cm-5',
            title: 'Higienização das mãos, permissão ao paciente e Sinais Vitais completos',
            guide:
              'Solicitar PA (em dois membros ou deitado/em pé se indicado), FC, FR, Temperatura axilar, SpO2, glicemia capilar (HGT) e dados antropométricos (Peso, Altura, IMC, Circunferência Abdominal).',
          },
          {
            id: 'cm-6',
            title: 'Ectoscopia geral e avaliação do estado hemodinâmico/hidratação',
            guide:
              'Estado geral, nível de consciência, mucosas (coradas, hidratadas, ictéricas, cianóticas), turgência jugular, perfusão periférica (TEC) e pesquisa de edema de MMII/empastamento de panturrilhas.',
          },
          {
            id: 'cm-7',
            title: 'Exame físico dirigido ao aparelho acometido (Cardio / Pulmonar / Abdominal / Neurológico)',
            guide:
              'Ausculta cardíaca e pulmonar, exame abdominal completo (inspeção, ausculta, percussão, palpação) ou exame neurológico/articular conforme queixa.',
          },
        ],
      },
      {
        stage: '3. Raciocínio Clínico e Exames Complementares',
        items: [
          {
            id: 'cm-8',
            title: 'Formulação da Hipótese Diagnóstica Principal + Diagnósticos Diferenciais',
            guide:
              'Verbalizar claramente a hipótese mais provável (com classificação/estadiamento se aplicável) e pelo menos 2 diagnósticos diferenciais pertinentes.',
          },
          {
            id: 'cm-9',
            title: 'Solicitação racional de exames laboratoriais e de imagem/ECG',
            guide:
              'Solicitar exames de forma direcionada (hemograma, função renal, eletrólitos, marcadores inflamatórios/necrose, gasometria, radiografia, ECG) e interpretar os achados em voz alta.',
          },
        ],
      },
      {
        stage: '4. Conduta Terapêutica e Orientações',
        items: [
          {
            id: 'cm-10',
            title: 'Definição do local de manejo (Ambulatorial vs. Observação vs. Sala Vermelha/UTI)',
            guide:
              'Indicar claramente se o paciente permanece internado/em observação (com dieta, hidratação, monitorização) ou recebe tratamento ambulatorial.',
          },
          {
            id: 'cm-11',
            title: 'Prescrição medicamentosa específica (fármaco, dose, via e tempo) + medidas não farmacológicas',
            guide:
              'Verbalizar o fármaco de escolha, via de administração, ajustes e orientações de estilo de vida (cessação do tabagismo, restrição de sódio, dieta, vacinação).',
          },
          {
            id: 'cm-12',
            title: 'Orientação de sinais de alarme, notificação (se infecto) e agendamento de retorno',
            guide:
              'Orientar quando procurar emergência imediatamente, notificar agravos infecciosos no SINAN se aplicável e checar dúvidas.',
          },
        ],
      },
    ],
    neverForget: [
      'Sempre perguntar sobre ALERGIAS medicamentosas antes de prescrever.',
      'Em dor torácica, perguntar uso de sildenafila/tadalafila antes de nitrato e checar contraindicações de trombólise.',
      'Em doenças infecciosas (Dengue, Tuberculose, Leptospirose, Meningite), lembrar da Notificação Compulsória no SINAN.',
      'Sempre aferir/solicitar Glicemia Capilar (HGT) em pacientes com alteração aguda ou descompensação.',
    ],
  },
  {
    slug: 'cirurgia',
    name: 'Cirurgia Geral e Trauma',
    icon: 'Scissors',
    color: '#ef4444',
    summary:
      'Avaliação primária (ABCDE) → Reanimação → Avaliação secundária → Exame físico dirigido → Conduta cirúrgica → Orientações',
    flowSteps: [
      'Paramentação (EPI) & Cena',
      'A — Via Aérea + Coluna Cervical',
      'B — Ventilação & Tórax',
      'C — Circulação & Hemorragia',
      'D — Disfunção Neurológica (Glasgow)',
      'E — Exposição & Hipotermia',
      'História AMPLA & Exame Cirúrgico',
      'Preparo Pré-Operatório / Conduta',
    ],
    sections: [
      {
        stage: '1. Preparo e Avaliação Primária do Trauma (ABCDE — ATLS)',
        items: [
          {
            id: 'cir-1',
            title: 'Paramentação completa (EPI) e transferência segura (MOV)',
            guide:
              'Colocar luvas, máscara, óculos e avental; solicitar monitorização multiparamétrica, oximetria e prancha/colar se trauma.',
          },
          {
            id: 'cir-2',
            title: 'A — Via Aérea com proteção e restrição do movimento da coluna cervical',
            guide:
              'Estabilizar manualmente a coluna cervical / manter colar cervical rígido; testar permeabilidade da via aérea (fala clara), aspirar secreções, ofertar O2 sob máscara não reinalante (10-15 L/min) e indicar via aérea definitiva se Glasgow <= 8.',
          },
          {
            id: 'cir-3',
            title: 'B — Respiração e Ventilação (Inspeção, Palpação, Percussão e Ausculta Torácica)',
            guide:
              'Descartar e tratar imediatamente lesões ameaçadoras à vida (Pneumotórax Hipertensivo → punção de alívio no 5º EIC linha axilar média + drenagem em selo d’água; Hemotórax Maciço; Pneumotórax Aberto).',
          },
          {
            id: 'cir-4',
            title: 'C — Circulação com controle da hemorragia',
            guide:
              'Comprimir sangramentos externos, avaliar PA, FC, pulso, pele e TEC, fechar anel pélvico se instável, garantir 2 acessos venosos periféricos calibrosos (14G/16G), coletar tipagem sanguínea/prova cruzada/β-hCG/lactato, iniciar cristaloide aquecido (Ringer Lactato), solicitar e-FAST e considerar ácido tranexâmico / transfusão.',
          },
          {
            id: 'cir-5',
            title: 'D — Avaliação Neurológica e E — Exposição com controle do ambiente',
            guide:
              'Calcular Escala de Coma de Glasgow (AO + RV + RM), avaliar pupilas (simetria e fotorreatividade), HGT; despir totalmente o paciente, fazer rolamento em bloco inspecionando dorso/toque retal se indicado e aquecer com manta térmica (prevenir tríade letal).',
          },
        ],
      },
      {
        stage: '2. Abdome Agudo / Consulta Cirúrgica Não Traumática',
        items: [
          {
            id: 'cir-6',
            title: 'História AMPLA (no trauma) ou Caracterização da Dor Abdominal / Síndrome Cirúrgica',
            guide:
              'No trauma: Alergias, Medicamentos, Passado médico/Prenhez, Líquidos/última refeição, Ambiente/mecanismo. No abdome agudo: início, migração (cronologia de Murphy), vômitos, parada de eliminação de gases/fezes, febre, colúria/acolhia.',
          },
          {
            id: 'cir-7',
            title: 'Exame físico abdominal cirúrgico sistematizado + Manobras especiais',
            guide:
              'Inspeção (cicatrizes, distensão, hérnias), ausculta (RHA), percussão (timpanismo, perda da macicez hepática — Sinal de Jobert), palpação superficial e profunda (Sinais de Blumberg, Murphy, Rovsing, Giordano, Lenander) e toque retal.',
          },
        ],
      },
      {
        stage: '3. Exames Complementares e Preparo Pré-Operatório (Conduta)',
        items: [
          {
            id: 'cir-8',
            title: 'Solicitação de exames laboratoriais e de imagem conforme estabilidade hemodinâmica',
            guide:
              'Lembrar: paciente instável NÃO vai para tomografia! Solicitar hemograma, amilase/lipase, bilirrubinas/FA/GGT, coagulograma, rotina de abdome agudo (RX tórax em pé + abdome em pé e deitado), USG ou TC de abdome.',
          },
          {
            id: 'cir-9',
            title: 'Prescrição de preparo pré-operatório (Os "5 D’s" da internação cirúrgica)',
            guide:
              '1. Dieta zero (jejum absoluto); 2. Hidratação venosa de manutenção/reposição; 3. Analgesia e antiemético EV; 4. Antibioticoprofilaxia ou antibioticoterapia; 5. Sonda nasogástrica / vesical de demora (com controle de diurese >= 0,5 mL/kg/h) e profilaxia de TEV.',
          },
          {
            id: 'cir-10',
            title: 'Indicação do procedimento cirúrgico definitivo e Termo de Consentimento Livre e Esclarecido',
            guide:
              'Explicar a indicação cirúrgica (ou tratamento conservador) ao paciente/família, riscos, benefícios e solicitar assinatura do Termo de Consentimento.',
          },
        ],
      },
    ],
    neverForget: [
      'No trauma, NUNCA pular a sequência ABCDE e sempre reavaliar após cada intervenção.',
      'Diagnóstico de Pneumotórax Hipertensivo é CLÍNICO — nunca pedir radiografia antes da descompressão imediata!',
      'Em todo paciente cirúrgico: Dieta zero + Hidratação + Analgesia + Antibiótico + Termo de Consentimento.',
      'Checar antitetânica e profilaxia antibiótica em ferimentos/mordeduras/fraturas expostas.',
    ],
  },
  {
    slug: 'ginecologia-obstetricia',
    name: 'Ginecologia e Obstetrícia',
    icon: 'Baby',
    color: '#ec4899',
    summary:
      'Acolhimento e privacidade → Anamnese gineco-obstétrica (DUM/GPA) → Exame físico/especular/obstétrico → Interpretação de exames → Conduta e prescrição → Aconselhamento',
    flowSteps: [
      'Privacidade & Acompanhante/Auxiliar',
      'DUM, IG, DPP e Paridade (G P A)',
      'Queixas Gineco-Obstétricas',
      'Exame Físico (Mamas / Obstétrico / Especular)',
      'Interpretação de Sorologias & USG/CTG',
      'Conduta & Prescrição',
      'Planejamento Reprodutivo / Sinais de Alerta',
    ],
    sections: [
      {
        stage: '1. Acolhimento, Privacidade e Anamnese Gineco-Obstétrica',
        items: [
          {
            id: 'go-1',
            title: 'Garantia de privacidade, sigilo e presença de profissional auxiliar na sala',
            guide:
              'Fechar a porta, explicar cada etapa do exame ginecológico/obstétrico, fornecer avental/lençol e solicitar obrigatoriamente a presença de auxiliar/técnico(a) de enfermagem durante o exame.',
          },
          {
            id: 'go-2',
            title: 'História menstrual e obstétrica: Menarca, DUM, Ciclos, Gesta/Para/Aborto (GPA), IG e DPP',
            guide:
              'Calcular Idade Gestacional (pela DUM e pelo USG de 1º trimestre) e Data Provável do Parto (Regra de Naegele); questionar via de partos anteriores, peso dos RNs e intercorrências (pré-eclâmpsia, DMG, HPP).',
          },
          {
            id: 'go-3',
            title: 'História sexual, contraceptiva, rastreamento oncológico e sintomas de alarme',
            guide:
              'Sexarca, número de parcerias, uso de preservativo, método contraceptivo atual, data e resultado do último Papanicolaou/Mamografia. Na gestante: movimentação fetal, contrações, perda de líquido, sangramento vaginal, cefaleia, escotomas, epigastralgia.',
          },
        ],
      },
      {
        stage: '2. Exame Físico Ginecológico e Obstétrico',
        items: [
          {
            id: 'go-4',
            title: 'Sinais vitais (atenção à PA na gestante), peso, IMC e exame clínico das mamas',
            guide:
              'Aferir PA sentada, verificar ganho ponderal, edema e realizar inspeção estática/dinâmica e palpação axilar/mamária + expressão papilar se queixa.',
          },
          {
            id: 'go-5',
            title: 'Exame Obstétrico: Altura Uterina (AU), Manobras de Leopold (4 tempos) e BCF',
            guide:
              'Posicionar a gestante, medir AU com fita métrica, executar os 4 tempos de Leopold-Zweifel (situação, posição, apresentação e insinuação), auscultar BCF (normal: 110–160 bpm) e avaliar dinâmica uterina.',
          },
          {
            id: 'go-6',
            title: 'Exame Ginecológico: Inspeção vulvar, Exame Especular e Toque Vaginal Bimanual',
            guide:
              'Inspecionar genitália externa, introduzir espéculo de Collins (sem lubrificante se coleta de citopatológico), descrever colo e conteúdo vaginal (teste de Whiff/pH se corrimento) e realizar toque vaginal bimanual (mobilização do colo, anexos).',
          },
        ],
      },
      {
        stage: '3. Exames Complementares, Conduta e Aconselhamento',
        items: [
          {
            id: 'go-7',
            title: 'Revisão do Cartão da Gestante / Exames de Pré-Natal ou Rastreamento (INCA/MS)',
            guide:
              'Checar tipagem sanguínea/Rh (Coombs indireto), testes rápidos (HIV, Sífilis, Hepatite B e C), toxoplasmose, hemograma, glicemia/TOTG 75g, EAS/urocultura e calendário vacinal (dT, dTpa a partir de 20 sem, Hepatite B, Influenza).',
          },
          {
            id: 'go-8',
            title: 'Conduta terapêutica (tratamento da paciente e parceria se IST) e suplementação',
            guide:
              'Na gestante: ácido fólico (até 12 sem) e sulfato ferroso/cálcio; nas ISTs: tratar paciente + convocar/tratar parceria sexual + notificar se sífilis/HIV; nas urgências (pré-eclâmpsia grave/eclâmpsia): sulfato de magnésio (Pritchard/Zuspan) + anti-hipertensivo.',
          },
          {
            id: 'go-9',
            title: 'Aconselhamento em planejamento reprodutivo (critérios de elegibilidade OMS) e sinais de alerta',
            guide:
              'Orientar dupla proteção (preservativo + método de alta eficácia), sinais de trabalho de parto/alarme obstétrico e periodicidade de retorno (mensal até 28 sem, quinzenal 28–36 sem, semanal após 36 sem).',
          },
        ],
      },
    ],
    neverForget: [
      'SEMPRE solicitar a presença de um(a) profissional auxiliar na sala e cobrir a paciente com lençol antes do exame ginecológico/mamário.',
      'Gestante Rh negativo com parceiro Rh positivo e Coombs indireto negativo: indicar Imunoglobulina Anti-D às 28 semanas e em até 72h pós-parto/sangramento.',
      'Em sangramento da 2ª metade da gestação (suspeita de Placenta Prévia), NUNCA realizar toque vaginal antes da ultrassonografia!',
      'Em ISTs (Sífilis, Gonorreia/Clamídia, Tricomoníase), sempre tratar a parceria sexual, ofertar testes rápidos para outras ISTs e orientar abstinência durante o tratamento.',
    ],
  },
  {
    slug: 'pediatria',
    name: 'Pediatria e Puericultura',
    icon: 'Heart',
    color: '#f59e0b',
    summary:
      'Acolhimento da família → Anamnese pediátrica e caderneta → Antropometria e curvas OMS → Exame físico completo → Avaliação vacinal/DNPM → Orientação aos responsáveis',
    flowSteps: [
      'Acolhimento da Família & Caderneta',
      'Antecedentes Perinatais & Triagens',
      'Alimentação (AME / Fórmulas / IA)',
      'Vacinação (PNI) & DNPM',
      'Antropometria & Curvas OMS (Escore-Z)',
      'Exame Físico Pediátrico Completo',
      'Suplementação (Ferro / Vit D) & Conduta',
      'Prevenção de Acidentes & Sinais de Alarme',
    ],
    sections: [
      {
        stage: '1. Acolhimento Familiar, Caderneta da Criança e Anamnese Pediátrica',
        items: [
          {
            id: 'ped-1',
            title: 'Acolhimento empático dos pais/responsáveis e solicitação da Caderneta da Criança',
            guide:
              'Identificar a criança (idade exata em dias/meses/anos) e o acompanhante, elogiar o cuidado e solicitar imediatamente a Caderneta da Criança.',
          },
          {
            id: 'ped-2',
            title: 'História gestacional, perinatal e triagens neonatais ("Testes do RN")',
            guide:
              'Investigar intercorrências no pré-natal, tipo de parto, Idade Gestacional ao nascer (termo vs. prematuro), Peso/Comprimento/PC ao nascer, Apgar, eliminação de mecônio e resultados dos testes do Pezinho, Olhinho, Orelhinha, Coraçãozinho e Linguinha.',
          },
          {
            id: 'ped-3',
            title: 'Inquérito alimentar detalhado (Aleitamento Materno, Fórmulas ou Introdução Alimentar)',
            guide:
              'Avaliar pega e posição na amamentação, frequência das mamadas (livre demanda), uso de bicos/chupetas/água/chás; após os 6 meses, investigar consistência (amassada no garfo, nunca liquidificada), grupos alimentares e consumo de ultraprocessados/açúcar/mel.',
          },
          {
            id: 'ped-4',
            title: 'Revisão do Calendário Nacional de Vacinação (PNI) e Marcos do DNPM',
            guide:
              'Conferir vacinas aplicadas para a idade na caderneta (indicando atualização se atraso) e interrogar marcos motores, cognitivos, linguagem e socioemocionais para a faixa etária.',
          },
        ],
      },
      {
        stage: '2. Antropometria, Curvas da OMS e Exame Físico Pediátrico',
        items: [
          {
            id: 'ped-5',
            title: 'Aferição e plotagem de Peso, Comprimento/Estatura, Perímetro Cefálico e IMC nas curvas da OMS',
            guide:
              'Plotar os pontos nas curvas de Escore-Z (Peso/Idade, Estatura/Idade, Peso/Estatura ou IMC/Idade e PC/Idade até 2 anos) e classificar o estado nutricional.',
          },
          {
            id: 'ped-6',
            title: 'Triângulo de Avaliação Pediátrica (TAP) e Sinais Vitais por faixa etária',
            guide:
              'Avaliar Aparência, Trabalho Respiratório (FR conforme idade, tiragem subcostal, batimento de asa nasal, estridor) e Circulação Cutânea (TEC, palidez, moteamento), temperatura e oximetria.',
          },
          {
            id: 'ped-7',
            title: 'Exame físico céfalo-caudal completo (incluindo fontanelas, otoscopia, oroscopia, genitália e reflexos)',
            guide:
              'Deixar manobras desconfortáveis (oroscopia e otoscopia) por último; palpar fontanela bregmática, avaliar coto umbilical, ausculta cardio-pulmonar, abdome, genitália (testículos na bolsa escrotal / sinéquia vulvar) e manobra de Ortolani/Barlow no lactente jovem.',
          },
        ],
      },
      {
        stage: '3. Conduta, Prescrição Ponderal e Orientações aos Pais',
        items: [
          {
            id: 'ped-8',
            title: 'Prescrição de suplementação profilática (Vitamina D e Sulfato Ferroso) ou terapêutica ajustada ao peso',
            guide:
              'Calcular todas as medicações em mg/kg/dose ou mL/kg (ex: SRO no Plano A/B/C de desidratação, antitérmico, antibiótico) e revisar profilaxia de Vitamina D (400 UI/dia no 1º ano, 600 UI/dia no 2º ano) e Ferro conforme SBP/MS.',
          },
          {
            id: 'ped-9',
            title: 'Orientações de promoção da saúde, prevenção de acidentes e sono seguro',
            guide:
              'Orientar posição supina (barriga para cima) para dormir, prevenção de quedas/engasgos/queimaduras/afogamento, transporte seguro no bebê-conforto/cadeirinha e zero exposição a telas antes dos 2 anos.',
          },
          {
            id: 'ped-10',
            title: 'Orientação de sinais de perigo (AIDPI) e agendamento do próximo retorno de puericultura',
            guide:
              'Orientar retorno imediato se recusa alimentar/não consegue beber ou mamar, vômitos incoercíveis, letargia/irritabilidade intensa, convulsões, tiragem subcostal ou febre em lactente jovem.',
          },
        ],
      },
    ],
    neverForget: [
      'SEMPRE pedir e olhar a Caderneta da Criança logo no início da estação (vacinas + curvas OMS + dados perinatais).',
      'Toda prescrição pediátrica deve ser calculada pelo PESO da criança em kg.',
      'Deixar otoscopia e oroscopia para o FINAL do exame físico e pedir ajuda da mãe para conter a criança com carinho.',
      'Proibir mel antes de 1 ano (risco de botulismo intestinal) e açúcar/ultraprocessados antes de 2 anos.',
    ],
  },
  {
    slug: 'medicina-familia',
    name: 'Medicina de Família e Comunidade',
    icon: 'Users',
    color: '#10b981',
    summary:
      'Acolhimento e escuta qualificada → Método clínico centrado na pessoa (SIFE) → Exame físico direcionado → Abordagem familiar e comunitária → Plano conjunto → Longitudinalidade',
    flowSteps: [
      'Acolhimento & Vínculo',
      'MCCP — Explorar o SIFE',
      'Compreender a Pessoa & Família (Genograma/ECOMAPA)',
      'Exame Físico Direcionado & Rastreamentos',
      'Elaboração de Plano Conjunto (Decisão Compartilhada)',
      'Equipe Multiprofissional (eMulti / ACS) & Rede',
      'Prevenção Quaternária & Longitudinalidade',
    ],
    sections: [
      {
        stage: '1. Acolhimento e Método Clínico Centrado na Pessoa (MCCP — SIFE)',
        items: [
          {
            id: 'mfc-1',
            title: 'Escuta qualificada sem julgamentos e exploração da agenda oculta',
            guide:
              'Acolher a demanda espontânea ou programada, validar o sofrimento e investigar se há outros motivos por trás do pedido inicial (ex: pedido de "check-up geral").',
          },
          {
            id: 'mfc-2',
            title: 'Aplicação estruturada do acrônimo SIFE (Sentimentos, Ideias, Funcionalidade e Expectativas)',
            guide:
              'Perguntar ativamente: 1. Sentimentos ("Qual seu maior receio sobre isso?"); 2. Ideias ("O que você acha que está causando isso?"); 3. Funcionalidade ("Como isso afeta sua rotina e trabalho?"); 4. Expectativas ("Como você esperava que eu te ajudasse hoje?").',
          },
          {
            id: 'mfc-3',
            title: 'Compreensão da pessoa como um todo: ciclo de vida, contexto socioeconômico e familiar',
            guide:
              'Investigar com quem mora, rede de apoio, condições de moradia/trabalho, estressores familiares, violência doméstica ou sobrecarga de cuidador (aplicar ferramentas como Genograma e Ecomapa se pertinente).',
          },
        ],
      },
      {
        stage: '2. Exame Físico Direcionado, Rastreamento e Vigilância na APS',
        items: [
          {
            id: 'mfc-4',
            title: 'Exame físico focado na queixa e avaliação de risco global (ex: pé diabético, PA, antropometria)',
            guide:
              'Realizar exame físico direcionado, estratificação de risco cardiovascular, exame dos pés com monofilamento de 10g no diabético ou prova do laço em arboviroses.',
          },
          {
            id: 'mfc-5',
            title: 'Rastreamento oportunístico baseado em evidências e Prevenção Quaternária',
            guide:
              'Verificar rastreamentos indicados pela idade/sexo segundo o Ministério da Saúde/INCA (PA, glicemia, perfil lipídico, citopatológico 25–64 anos, mamografia 50–69 anos, testes rápidos IST) e evitar exames sem evidência científica (prevenção quaternária).',
          },
        ],
      },
      {
        stage: '3. Plano Conjunto, Abordagem Comunitária e Coordenação do Cuidado',
        items: [
          {
            id: 'mfc-6',
            title: 'Pactuação de Plano Terapêutico Compartilhado (negociação de metas realistas)',
            guide:
              'Desmistificar crenças equivocadas sem confrontar, negociar mudanças de estilo de vida possíveis para a realidade financeira do paciente e simplificar posologia medicamentosa para melhorar adesão.',
          },
          {
            id: 'mfc-7',
            title: 'Acionamento da Equipe de Saúde da Família (ACS, Enfermagem, eMulti) e Visita Domiciliar',
            guide:
              'Envolver Agente Comunitário de Saúde (ACS), consulta compartilhada/interconsulta com eMulti (nutrição, psicologia, fisioterapia, serviço social, farmácia), grupos operativos na UBS e Projeto Terapêutico Singular (PTS).',
          },
          {
            id: 'mfc-8',
            title: 'Notificação epidemiológica, territorialização e garantia de longitudinalidade',
            guide:
              'Realizar notificação no SINAN se agravo transmissível/violência, acionar vigilância em saúde/controle vetorial no território e agendar retorno programado para acompanhamento longitudinal.',
          },
        ],
      },
    ],
    neverForget: [
      'Em toda estação de MFC, verbalizar explicitamente as 4 perguntas do SIFE (Sentimentos, Ideias, Funcionalidade, Expectativas).',
      'Nunca impor condutas de forma autoritária — usar termos como "Vamos construir juntos um plano que caiba na sua rotina".',
      'Lembrar sempre dos recursos da APS: Agente Comunitário de Saúde (ACS), Visita Domiciliar, Equipe eMulti e Projeto Terapêutico Singular (PTS).',
      'Se o paciente pedir exames desnecessários (ex: PSA/CEA/TSH de rotina em assintomático sem indicação), aplicar Prevenção Quaternária com empatia.',
    ],
  },
  {
    slug: 'saude-mental',
    name: 'Saúde Mental e Psiquiatria',
    icon: 'Brain',
    color: '#8b5cf6',
    summary:
      'Vínculo empático e ambiente seguro → Entrevista psiquiátrica → Exame do estado mental (súmula) → Avaliação de risco → Manejo farmacológico e psicossocial → Articulação com RAPS/CAPS',
    flowSteps: [
      'Ambiência Segura & Vínculo Empático',
      'Entrevista Psiquiátrica & Cronologia',
      'Avaliação Direta de Risco (Suicídio / Heteroagressão)',
      'Súmula Psicopatológica (Exame do Estado Mental)',
      'Descarte de Causas Orgânicas & Substâncias',
      'Manejo Farmacológico & Descalonamento Verbal',
      'Articulação com a RAPS (CAPS / UBS / Hospital Geral)',
    ],
    sections: [
      {
        stage: '1. Ambiência Segura, Vínculo e Entrevista Psiquiátrica',
        items: [
          {
            id: 'sm-1',
            title: 'Postura acolhedora, validação do sofrimento e garantia de segurança na sala',
            guide:
              'Manter tom de voz calmo, validar a dor psíquica sem minimizar ("Imagino o quanto está sendo difícil passar por isso"), sem julgamentos morais ou frases clichês, garantindo rota de saída se agitação.',
          },
          {
            id: 'sm-2',
            title: 'Caracterização temporal dos sintomas psiquiátricos, gatilhos e episódios prévios (incluindo mania/hipomania)',
            guide:
              'Investigar início, duração (> 2 semanas para depressão, > 6 meses para TAG, etc.), impacto funcional, estressores recentes (luto, desemprego, separação) e SEMPRE pesquisar episódios prévios de euforia/mania antes de iniciar antidepressivo.',
          },
          {
            id: 'sm-3',
            title: 'Investigação direta e obrigatória de Risco de Suicídio e Heteroagressividade',
            guide:
              'Perguntar de forma direta e empática sobre: pensamentos de morte, ideação suicida ativa, intenção, plano estruturado, acesso a meios letais (medicações, armas, venenos), tentativas prévias, desesperança e fatores de proteção (família, filhos, planos).',
          },
          {
            id: 'sm-4',
            title: 'Pesquisa de uso de álcool/outras substâncias e causas clínicas/orgânicas',
            guide:
              'Questionar padrão de consumo de álcool (CAGE/AUDIT), abstinência, uso de substâncias psicoativas, medicações e descartar condições orgânicas (hipotireoidismo, hipoglicemia, infecções, delirium, TCE).',
          },
        ],
      },
      {
        stage: '2. Exame do Estado Mental (Súmula Psicopatológica) e Estratificação',
        items: [
          {
            id: 'sm-5',
            title: 'Avaliação e verbalização das funções psíquicas (Exame Psíquico)',
            guide:
              'Observar aparência/atitude, consciência, orientação alo e autopsíquica, atenção, memória, humor (eutímico, deprimido, irritável, elado), afeto (modulação e congruência), pensamento (curso, forma e conteúdo — delírios), sensopercepção (alucinações), psicomotricidade e juízo crítico/insight.',
          },
          {
            id: 'sm-6',
            title: 'Estratificação de risco (Baixo, Moderado ou Alto Risco) e hipótese diagnóstica',
            guide:
              'Definir gravidade do quadro (presença de sintomas psicóticos, catatonia, recusa alimentar ou alto risco suicida) para decidir entre manejo ambulatorial ou proteção intensiva.',
          },
        ],
      },
      {
        stage: '3. Manejo Terapêutico, Plano de Segurança e Rede de Atenção Psicossocial (RAPS)',
        items: [
          {
            id: 'sm-7',
            title: 'Manejo agudo (descalonamento verbal, tiamina na abstinência alcoólica ou psicofármaco adequado)',
            guide:
              'Na agitação: 1º manejo verbal/ambiental, depois medicação VO/IM conforme etiologia; na abstinência alcoólica: Tiamina parenteral ANTES da glicose + benzodiazepínico; nos quadros depressivos/ansiosos: ISRS explicando latência de 2–4 semanas e efeitos adversos iniciais.',
          },
          {
            id: 'sm-8',
            title: 'Elaboração de Plano de Segurança com a família e restrição de meios letais',
            guide:
              'Convocar familiar/rede de apoio, orientar retirada imediata de medicações/objetos letais do alcance do paciente, supervisão contínua (não deixar sozinho se risco moderado/alto) e informar o CVV (telefone 188).',
          },
          {
            id: 'sm-9',
            title: 'Articulação com a RAPS (CAPS I/II/III, CAPS AD, CAPS i, UBS ou Leito em Hospital Geral) e Notificação',
            guide:
              'Referenciar ao dispositivo adequado da RAPS conforme gravidade e perfil (CAPS III 24h ou leito de saúde mental em hospital geral nos quadros graves; CAPS AD se álcool/drogas) e realizar Notificação Compulsória Imediata no SINAN se tentativa de suicídio.',
          },
        ],
      },
    ],
    neverForget: [
      'Perguntar sobre suicídio NÃO induz ao ato — no Revalida é obrigatório perguntar diretamente sobre ideação, plano e acesso a meios letais.',
      'Antes de prescrever antidepressivo (ISRS), SEMPRE perguntar sobre episódios prévios de mania/hipomania (descartar Transtorno Bipolar).',
      'Em etilistas / abstinência alcoólica, NUNCA infundir glicose antes de administrar Tiamina (Vitamina B1) parenteral (prevenção de Wernicke).',
      'Tentativa de suicídio / violência autoprovocada é de Notificação Compulsória IMEDIATA (em até 24h) no SINAN.',
    ],
  },
  {
    slug: 'urgencia-emergencia',
    name: 'Urgência e Emergência',
    icon: 'Siren',
    color: '#f97316',
    summary:
      'Avaliação inicial → Suporte de vida → Monitorização (MOV) → Diagnóstico diferencial → Conduta imediata → Reavaliação',
    flowSteps: [
      'Segurança, EPI & Sala Vermelha',
      'Responsividade, Respiração & Pulso (BLS/ACLS)',
      'MOV (Monitor + Oximetria + Veia) + HGT',
      'Sinais Vitais & Estabilidade Hemodinâmica',
      'Diagnóstico Sindrômico Rápido (ECG / Gaso / POCUS)',
      'Intervenção Imediata (Drogas / Choque / Via Aérea)',
      'Busca de Causas Reversíveis & Reavaliação',
    ],
    sections: [
      {
        stage: '1. Avaliação Inicial, Sala Vermelha e Suporte de Vida (BLS / ACLS)',
        items: [
          {
            id: 'urg-1',
            title: 'Encaminhamento imediato para Sala Vermelha, paramentação (EPI) e checagem de responsividade',
            guide:
              'Reconhecer gravidade na porta, levar para sala de emergência, checar resposta verbal/tátil, respiração e pulso carotídeo simultaneamente em 5 a 10 segundos.',
          },
          {
            id: 'urg-2',
            title: 'Se PCR: Iniciar RCP de alta qualidade + Desfibrilador/Carrinho de Parada imediatamente',
            guide:
              'Compressões 100–120/min (5–6 cm), checar ritmo: se chocável (FV/TVsp) → Choque bifásico 200J + RCP 2 min + Adrenalina 1mg após 2º choque + Amiodarona 300mg após 3º choque; se não chocável (Assistolia/AESP) → Adrenalina 1mg no 1º ciclo + Protocolo da Linha Reta (Cabo, Ganho, Derivação) + investigar 5Hs e 5Ts.',
          },
          {
            id: 'urg-3',
            title: 'Se com pulso: Instalar MOV (Monitorização cardíaca, Oximetria/O2 e 2 Acessos Venosos) + HGT',
            guide:
              'Solicitar monitor cardíaco contínuo, oximetria de pulso (ofertar O2 se SpO2 < 90-94%), dois acessos venosos periféricos calibrosos, aferir PA, FC, FR, Temperatura e Glicemia Capilar (HGT).',
          },
        ],
      },
      {
        stage: '2. Diagnóstico Sindrômico Rápido e Estabilização (Choque / Sepse / Arritmias / Insuf. Respiratória)',
        items: [
          {
            id: 'urg-4',
            title: 'Identificação de sinais de instabilidade hemodinâmica (Os "5 D’s" da instabilidade)',
            guide:
              'Avaliar nas taqui/bradiarritmias: 1. Dor torácica isquêmica; 2. Dispneia/congestão pulmonar; 3. Diminuição do nível de consciência; 4. Diminuição da PA (hipotensão/choque); 5. Desmaio/síncope.',
          },
          {
            id: 'urg-5',
            title: 'Solicitação de exames imediatos à beira-leito (ECG em 10 min, Gasometria, Lactato, Culturas)',
            guide:
              'Solicitar ECG de 12 derivações, gasometria arterial com lactato, hemograma, eletrólitos, função renal, coagulograma e 2 pares de hemoculturas (se suspeita de sepse, sem atrasar o antibiótico).',
          },
          {
            id: 'urg-6',
            title: 'Conduta imediata direcionada ao protocolo de emergência',
            guide:
              'Taquiarritmia instável → Cardioversão Elétrica Sincronizada (sedar se consciente); Bradiarritmia instável → Atropina 1mg EV / Marcapasso transcutâneo; Sepse/Choque Séptico → Pacote de 1 hora (30 mL/kg de cristaloide + antibiótico amplo espectro na 1ª hora + Noradrenalina se PAM < 65); Anafilaxia → Adrenalina IM no vasto lateral da coxa.',
          },
        ],
      },
      {
        stage: '3. Reavaliação Sistemática, Cuidados Pós-Estabilização e Transferência/UTI',
        items: [
          {
            id: 'urg-7',
            title: 'Avaliação de indicação de Via Aérea Avançada (Sequência Rápida de Intubação — 7 Ps)',
            guide:
              'Preparação, Pré-oxigenação, Pré-tratamento/otimização hemodinâmica, Paralisia com indução (Etomidato ou Cetamina + Succinilcolina ou Rocurônio), Posicionamento, Passagem do tubo com confirmação por capnografia em onda (ETCO2) e Pós-intubação.',
          },
          {
            id: 'urg-8',
            title: 'Reavaliação seriada dos sinais vitais, diurese e resposta às intervenções',
            guide:
              'Rechecar PA, FC, SpO2, ausculta pulmonar, tempo de enchimento capilar, clareamento do lactato e débito urinário por sonda vesical de demora.',
          },
          {
            id: 'urg-9',
            title: 'Solicitação de vaga em UTI/Hemodinâmica e comunicação estruturada com a família',
            guide:
              'Acionar regulação/vaga de UTI, registrar condutas e explicar de forma empática e clara a gravidade e as medidas adotadas aos familiares.',
          },
        ],
      },
    ],
    neverForget: [
      'Qualquer paciente grave na emergência começa com: Sala Vermelha + MOV (Monitor, Oxigênio, Veia) + Sinais Vitais + Glicemia Capilar (HGT).',
      'Em Assistolia, sempre confirmar o Protocolo da Linha Reta (Checar Cabos, aumentar Ganho, trocar Derivação) antes de declarar o ritmo.',
      'Na Taquicardia com pulso: Estável = medicação / manobra vagal; Instável = Cardioversão Elétrica Sincronizada (com sedação prévia se acordado!).',
      'Na Anafilaxia, a droga salvadora de 1ª linha é ADRENALina INTRAMUSCULAR na face anterolateral da coxa (nunca esperar corticoide/anti-histamínico fazer efeito).',
    ],
  },
];
