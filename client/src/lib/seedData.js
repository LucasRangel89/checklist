// Dados seed completos embutidos no cliente para funcionamento 100% Offline (PWA / LocalStorage)

export const INITIAL_SPECIALTIES = [
  {
    id: 1,
    slug: 'clinica-medica',
    name: 'Clínica Médica',
    icon: 'Stethoscope',
    color: '#3b82f6',
    description:
      'Investigação diagnóstica estruturada, manejo de doenças crônicas agudizadas, cardiologia, pneumologia, infectologia e raciocínio clínico integral no adulto.',
    skeleton:
      'Anamnese dirigida → Exame físico segmentar → Hipóteses diagnósticas → Solicitação de exames → Conduta terapêutica → Orientação ao paciente',
  },
  {
    id: 2,
    slug: 'cirurgia',
    name: 'Cirurgia Geral',
    icon: 'Scissors',
    color: '#ef4444',
    description:
      'Atendimento sistematizado ao politraumatizado (ATLS), avaliação de abdome agudo, procedimentos cirúrgicos ambulatoriais, pré e pós-operatório.',
    skeleton:
      'Avaliação primária (ABCDE) → Reanimação → Avaliação secundária → Exame físico dirigido → Conduta cirúrgica → Orientações',
  },
  {
    id: 3,
    slug: 'ginecologia-obstetricia',
    name: 'Ginecologia e Obstetrícia',
    icon: 'Baby',
    color: '#ec4899',
    description:
      'Assistência pré-natal, urgências obstétricas, rastreamento de câncer ginecológico, planejamento reprodutivo e infecções sexualmente transmissíveis.',
    skeleton:
      'Acolhimento e privacidade → Anamnese gineco-obstétrica (DUM/GPA) → Exame físico/especular/obstétrico → Interpretação de exames → Conduta e prescrição → Aconselhamento',
  },
  {
    id: 4,
    slug: 'pediatria',
    name: 'Pediatria',
    icon: 'Heart',
    color: '#f59e0b',
    description:
      'Puericultura, avaliação do crescimento e neurodesenvolvimento, calendário vacinal PNI, aleitamento materno e urgências pediátricas prevalentes.',
    skeleton:
      'Acolhimento da família → Anamnese pediátrica e caderneta → Antropometria e curvas OMS → Exame físico completo → Avaliação vacinal/DNPM → Orientação aos responsáveis',
  },
  {
    id: 5,
    slug: 'medicina-familia',
    name: 'Medicina de Família e Comunidade',
    icon: 'Users',
    color: '#10b981',
    description:
      'Atenção Primária à Saúde (APS), Método Clínico Centrado na Pessoa (SIFE), vigilância epidemiológica, abordagem familiar e coordenação do cuidado.',
    skeleton:
      'Acolhimento e escuta qualificada → Método clínico centrado na pessoa (SIFE) → Exame físico direcionado → Abordagem familiar e comunitária → Plano conjunto → Longitudinalidade',
  },
  {
    id: 6,
    slug: 'saude-mental',
    name: 'Saúde Mental',
    icon: 'Brain',
    color: '#8b5cf6',
    description:
      'Entrevista psiquiátrica acolhedora, exame psíquico sistematizado, estratificação de risco de suicídio, emergências psiquiátricas e articulação com a RAPS.',
    skeleton:
      'Vínculo empático e ambiente seguro → Entrevista psiquiátrica → Exame do estado mental (súmula) → Avaliação de risco → Manejo farmacológico e psicossocial → Articulação com RAPS/CAPS',
  },
  {
    id: 7,
    slug: 'urgencia-emergencia',
    name: 'Urgência e Emergência',
    icon: 'Siren',
    color: '#f97316',
    description:
      'Suporte Básico e Avançado de Vida (BLS/ACLS), manejo de choque, insuficiência respiratória aguda, sepse e estabilização em sala vermelha.',
    skeleton:
      'Avaliação inicial → Suporte de vida → Monitorização (MOV) → Diagnóstico diferencial → Conduta imediata → Reavaliação',
  },
];

export const INITIAL_STATIONS = [
  {
    specialty_slug: 'clinica-medica',
    title: 'Dor Torácica na Emergência — IAM com Supra de ST',
    description:
      'Homem de 58 anos, tabagista e hipertenso, chega ao pronto-socorro com dor retroesternal opressiva há 90 minutos irradiada para membro superior esquerdo e sudorese fria.',
    difficulty: 'avançado',
    duration_min: 10,
    items: [
      {
        category: 'Acolhimento',
        description: 'Identifica-se, acolhe o paciente e encaminha imediatamente para sala vermelha com MOV',
        expected_standard:
          'Apresenta-se pelo nome e função, tranquiliza o paciente e solicita monitorização multiparamétrica, oximetria de pulso e acesso venoso periférico calibroso imediato.',
        weight: 1.0,
      },
      {
        category: 'Anamnese',
        description: 'Caracteriza a dor torácica e investiga contraindicações para trombólise e nitrato',
        expected_standard:
          'Investiga início, caráter opressivo, irradiação, fatores desencadeantes, história de AVC prévio, sangramento ativo e uso recente de inibidores de fosfodiesterase-5 (sildenafila/tadalafila).',
        weight: 1.2,
      },
      {
        category: 'Avaliação',
        description: 'Solicita e interpreta ECG de 12 derivações em até 10 minutos da admissão',
        expected_standard:
          'Solicita ECG de 12 derivações imediatamente, identifica supradesnivelamento do segmento ST em parede anterior (V1 a V4) e solicita derivações direitas/posteriores se necessário.',
        weight: 1.5,
      },
      {
        category: 'Exame Físico',
        description: 'Realiza exame físico cardiovascular e pulmonar direcionado com classificação de Killip',
        expected_standard:
          'Verifica sinais vitais nos dois membros superiores, ausculta cardíaca (pesquisa de B3 ou sopro novo), ausculta pulmonar (estertores crepitantes) e classifica em Killip-Kimball I.',
        weight: 1.0,
      },
      {
        category: 'Conduta',
        description: 'Prescreve dupla antiagregação plaquetária e anticoagulação plena na dose correta',
        expected_standard:
          'Prescreve AAS 200-300 mg VO macerado, Clopidogrel 300 mg (ou Ticagrelor 180 mg) em dose de ataque e Enoxaparina conforme peso e idade do paciente.',
        weight: 1.5,
      },
      {
        category: 'Conduta',
        description: 'Define estratégia de reperfusão miocárdica (angioplastia primária vs. fibrinólise)',
        expected_standard:
          'Avalia tempo porta-balão (<120 min para transferência ou <90 min local); caso indisponível em tempo hábil, indica fibrinólise venosa em até 30 minutos (porta-agulha).',
        weight: 1.5,
      },
      {
        category: 'Plano',
        description: 'Solicita marcadores de necrose miocárdica sem atrasar a reperfusão e comunica a família',
        expected_standard:
          'Solicita troponina seriada, eletrólitos, função renal e coagulograma sem postergar a terapia de reperfusão e explica o quadro grave com linguagem clara.',
        weight: 0.8,
      },
    ],
  },
  {
    specialty_slug: 'clinica-medica',
    title: 'Dispneia Aguda — Exacerbação Infecciosa de DPOC',
    description:
      'Paciente de 67 anos, ex-tabagista (50 anos-maço), comparece com piora da dispneia basal há 3 dias, aumento do volume do escarro e mudança para aspecto purulento.',
    difficulty: 'intermediário',
    duration_min: 10,
    items: [
      {
        category: 'Anamnese',
        description: 'Avalia critérios de Anthonisen e histórico de exacerbações/internações prévias',
        expected_standard:
          'Questiona os três sintomas cardinais (piora da dispneia, aumento do volume do escarro e purulência), carga tabágica, uso domiciliar de O2 e intubações prévias.',
        weight: 1.2,
      },
      {
        category: 'Exame Físico',
        description: 'Avalia sinais de esforço respiratório, oximetria e ausculta pulmonar',
        expected_standard:
          'Identifica tiragem intercostal, frequência respiratória elevada, sibilos difusos, tempo expiratório prolongado e verifica nível de consciência (sinais de narcose por CO2).',
        weight: 1.0,
      },
      {
        category: 'Conduta',
        description: 'Titula oxigenoterapia suplementar com alvo de SpO2 entre 88% e 92%',
        expected_standard:
          'Instala cateter nasal de baixo fluxo ou máscara de Venturi titulada para manter saturação entre 88% e 92%, evitando hiperóxia e retenção hipercápnica.',
        weight: 1.4,
      },
      {
        category: 'Conduta',
        description: 'Prescreve broncodilatadores de curta ação (SABA + SAMA), corticoide sistêmico e antibiótico',
        expected_standard:
          'Prescreve fenoterol/salbutamol associado a brometo de ipratrópio inalatório, prednisona 40 mg VO por 5 dias e antibioticoterapia empírica (amoxicilina-clavulanato ou macrolídeo).',
        weight: 1.5,
      },
      {
        category: 'Avaliação',
        description: 'Solicita gasometria arterial, radiografia de tórax e indica VNI se acidose respiratória',
        expected_standard:
          'Solicita gasometria arterial para avaliar pH e PaCO2, radiografia para descartar pneumonia/pneumotórax e indica ventilação não invasiva (VNI) se pH < 7,35 com PaCO2 > 45 mmHg.',
        weight: 1.2,
      },
    ],
  },
  {
    specialty_slug: 'clinica-medica',
    title: 'Hipertensão Arterial Sistêmica e Estratificação Cardiovascular',
    description:
      'Homem de 52 anos, obeso e sedentário, traz medidas ambulatoriais de PA em torno de 164x102 mmHg em duas consultas anteriores para definição diagnóstica e terapêutica.',
    difficulty: 'básico',
    duration_min: 10,
    items: [
      {
        category: 'Anamnese',
        description: 'Investiga fatores de risco cardiovascular, hábitos de vida e sintomas de lesão de órgão-alvo',
        expected_standard:
          'Questiona tabagismo, etilismo, ingestão de sódio, histórico familiar de doença coronariana precoce, dislipidemia, diabetes e queixas visuais, renais ou cardiovasculares.',
        weight: 1.0,
      },
      {
        category: 'Exame Físico',
        description: 'Realiza aferição padronizada da pressão arterial e antropometria completa',
        expected_standard:
          'Confirma repouso de 5 minutos, bexiga vazia, braço na altura do coração com manguito adequado, mede circunferência abdominal, IMC e palpa pulsos periféricos.',
        weight: 1.2,
      },
      {
        category: 'Avaliação',
        description: 'Solicita exames básicos de rotina hipertensiva segundo Diretriz Brasileira de HAS',
        expected_standard:
          'Solicita ECG simples, glicemia de jejum, HbA1c, perfil lipídico completo, creatinina sérica com cálculo de TFG (CKD-EPI), potássio sérico, ácido úrico e sumário de urina (EAS).',
        weight: 1.3,
      },
      {
        category: 'Conduta',
        description: 'Inicia terapia farmacológica combinada (dupla) por tratar-se de HAS Estágio 2',
        expected_standard:
          'Classifica como HAS Estágio 2 e prescreve associação de IECA ou BRA (ex: Enalapril ou Losartana) com bloqueador de canal de cálcio (Anlodipino) ou diurético tiazídico (Hidroclorotiazida).',
        weight: 1.5,
      },
      {
        category: 'Plano',
        description: 'Orienta medidas não farmacológicas (dieta DASH, restrição de sódio e atividade física)',
        expected_standard:
          'Orienta redução do consumo de sal (< 2g de sódio ou 5g de sal/dia), adoção da dieta DASH, perda ponderal, atividade física aeróbica (150 min/semana) e retorno em 4 semanas.',
        weight: 1.0,
      },
    ],
  },
  {
    specialty_slug: 'cirurgia',
    title: 'Atendimento Inicial ao Politraumatizado (ATLS)',
    description:
      'Jovem de 24 anos vítima de colisão motociclística de alta energia dá entrada na sala de trauma taquicárdico, hipoxêmico e com assimetria torácica à direita.',
    difficulty: 'avançado',
    duration_min: 10,
    items: [
      {
        category: 'Procedimento',
        description: 'Paramenta-se com EPI e executa etapa A (Via aérea com proteção da coluna cervical)',
        expected_standard:
          'Coloca luvas, máscara e óculos, estabiliza manualmente a coluna cervical com colar rígido, avalia permeabilidade da via aérea e fornece O2 em máscara não reinalante a 10-15 L/min.',
        weight: 1.2,
      },
      {
        category: 'Avaliação',
        description: 'Executa etapa B e diagnostica clinicamente Pneumotórax Hipertensivo à direita',
        expected_standard:
          'Inspeciona, palpa, percute e ausculta o tórax; identifica murmúrio vesicular abolido à direita, hipertimpanismo, turgência jugular, desvio de traqueia e instabilidade hemodinâmica.',
        weight: 1.5,
      },
      {
        category: 'Procedimento',
        description: 'Realiza descompressão torácica imediata seguida de drenagem pleural em selo d’água',
        expected_standard:
          'Indica toracocentese de alívio imediata (5º espaço intercostal na linha axilar anterior/média no adulto segundo ATLS 10ª ed.) sem aguardar radiografia, seguida de drenagem tubular definitiva.',
        weight: 1.5,
      },
      {
        category: 'Conduta',
        description: 'Executa etapa C (Circulação com controle de hemorragia e reposição volêmica)',
        expected_standard:
          'Garante dois acessos venosos periféricos calibrosos (14G/16G), coleta tipagem sanguínea, inicia ringer lactato aquecido, solicita e-FAST, avalia pelve e administra ácido tranexâmico se indicado.',
        weight: 1.3,
      },
      {
        category: 'Exame Físico',
        description: 'Executa etapas D (Escala de Coma de Glasgow e pupilas) e E (Exposição com controle de hipotermia)',
        expected_standard:
          'Calcula pontuação da Escala de Coma de Glasgow, avalia fotorreatividade e simetria pupilar, despe completamente o paciente, faz rolamento em bloco e previne hipotermia com manta térmica.',
        weight: 1.0,
      },
      {
        category: 'Plano',
        description: 'Realiza reavaliação do ABCDE e coleta história AMPLA antes da avaliação secundária',
        expected_standard:
          'Reavalia sinais vitais após intervenções críticas e investiga Alergias, Medicamentos, Passado médico/prenhez, Líquidos/última refeição e Ambiente/mecanismo do trauma.',
        weight: 0.9,
      },
    ],
  },
  {
    specialty_slug: 'cirurgia',
    title: 'Abdome Agudo Inflamatório — Apendicite Aguda',
    description:
      'Paciente masculino de 21 anos refere dor abdominal iniciada em epigástrio há 18 horas com migração para fossa ilíaca direita, associada a anorexia, náuseas e febre baixa.',
    difficulty: 'básico',
    duration_min: 10,
    items: [
      {
        category: 'Anamnese',
        description: 'Caracteriza a cronologia de Murphy e sintomas associados do abdome agudo',
        expected_standard:
          'Investiga dor visceral periumbilical/epigástrica inicial com migração somática para fossa ilíaca direita, hiporexia marcante, náuseas, febre baixa e hábito intestinal/urinário.',
        weight: 1.2,
      },
      {
        category: 'Exame Físico',
        description: 'Executa exame abdominal completo pesquisando sinais de Blumberg, Rovsing e Dunphy',
        expected_standard:
          'Realiza ausculta antes da palpação, identifica defesa e descompressão brusca dolorosa no ponto de McBurney (Blumberg +) e descreve corretamente Rovsing, Psoas ou Obturador.',
        weight: 1.5,
      },
      {
        category: 'Avaliação',
        description: 'Aplica escore de Alvarado e solicita exames laboratoriais/imagem apropriados',
        expected_standard:
          'Solicita hemograma completo (leucocitose com desvio à esquerda), PCR, sumário de urina e ultrassonografia ou tomografia computadorizada de abdome conforme estratificação de risco.',
        weight: 1.1,
      },
      {
        category: 'Conduta',
        description: 'Indica dieta zero, hidratação venosa, antibioticoprofilaxia e apendicectomia',
        expected_standard:
          'Deixa paciente em jejum absoluto, prescreve hidratação cristalóide, analgesia endovenosa, antibioticoprofilaxia cirúrgica (ex: cefoxitina ou ceftriaxona + metronidazol) e solicita apendicectomia videolaparoscópica.',
        weight: 1.4,
      },
    ],
  },
  {
    specialty_slug: 'cirurgia',
    title: 'Hemorragia Digestiva Alta Varicosa no Cirrótico',
    description:
      'Homem de 54 anos, portador de cirrose hepática por hepatite C, apresenta dois episódios volumosos de hematêmese e melena, chegando pálido e taquicárdico (PA 88x54 mmHg).',
    difficulty: 'avançado',
    duration_min: 10,
    items: [
      {
        category: 'Conduta',
        description: 'Estabiliza hemodinamicamente na sala de emergência e adota estratégia transfusional restritiva',
        expected_standard:
          'Instala MOV, obtém dois acessos calibrosos, inicia reposição cristalóide cautelosa e indica concentrado de hemácias com meta de hemoglobina entre 7 e 8 g/dL.',
        weight: 1.4,
      },
      {
        category: 'Conduta',
        description: 'Prescreve droga vasoativa esplâncnica imediatamente na suspeita de HDA varicosa',
        expected_standard:
          'Inicia terlipressina, octreotida ou somatostaina endovenosa imediatamente, mesmo antes da realização da endoscopia digestiva alta.',
        weight: 1.5,
      },
      {
        category: 'Conduta',
        description: 'Prescreve antibioticoprofilaxia para prevenção de peritonite bacteriana espontânea (PBE)',
        expected_standard:
          'Prescreve Ceftriaxona 1g EV ao dia por até 7 dias para redução de mortalidade e ressangramento no paciente cirrótico com HDA.',
        weight: 1.4,
      },
      {
        category: 'Procedimento',
        description: 'Solicita Endoscopia Digestiva Alta (EDA) em até 12 horas com ligadura elástica',
        expected_standard:
          'Indica EDA após estabilização hemodinâmica (dentro de 12 horas) para confirmação diagnóstica e ligadura elástica das varizes esofágicas.',
        weight: 1.2,
      },
      {
        category: 'Plano',
        description: 'Planeja profilaxia secundária com betabloqueador não seletivo após controle agudo',
        expected_standard:
          'Orienta introdução de propranolol ou carvedilol após suspensão do vasoconstritor esplâncnico, associado a programa seriado de erradicação endoscópica.',
        weight: 0.9,
      },
    ],
  },
  {
    specialty_slug: 'ginecologia-obstetricia',
    title: 'Assistência Pré-Natal de Risco Habitual — 28 Semanas',
    description:
      'Gestante de 26 anos, G2P1A0, comparece à UBS com 28 semanas de idade gestacional trazendo exames do segundo trimestre (TOTG 75g e Coombs indireto) e dúvidas sobre vacinação.',
    difficulty: 'básico',
    duration_min: 10,
    items: [
      {
        category: 'Anamnese',
        description: 'Calcula idade gestacional, DPP e investiga queixas obstétricas de alarme',
        expected_standard:
          'Confere cartão da gestante, confirma IG pela DUM e USG de 1º trimestre, questiona movimentação fetal, contrações, perda líquida, sangramento vaginal, cefaleia e escotomas.',
        weight: 1.0,
      },
      {
        category: 'Exame Físico',
        description: 'Realiza exame obstétrico completo: PA, peso, altura uterina, manobras de Leopold e BCF',
        expected_standard:
          'Afere PA e ganho ponderal, mede altura uterina com fita métrica, executa os 4 tempos das manobras de Leopold-Zweifel e ausculta batimentos cardiofetais (normal: 110 a 160 bpm).',
        weight: 1.4,
      },
      {
        category: 'Avaliação',
        description: 'Interpreta corretamente o TOTG 75g e pesquisa aloimunização Rh',
        expected_standard:
          'Analisa pontos de corte do TOTG 75g (jejum >= 92, 1h >= 180, 2h >= 153 mg/dL para DMG) e verifica Coombs indireto negativo em gestante Rh negativo, indicando imunoglobulina anti-D com 28 semanas.',
        weight: 1.5,
      },
      {
        category: 'Conduta',
        description: 'Indica vacina dTpa a partir da 20ª semana e mantém suplementação de ferro/cálcio',
        expected_standard:
          'Prescreve vacina dTpa acelular (indicada a toda gestante a partir de 20 semanas em cada gestação) e mantém sulfato ferroso profilático.',
        weight: 1.2,
      },
      {
        category: 'Plano',
        description: 'Orienta sinais de alerta para trabalho de parto prematuro e agenda retorno quinzenal',
        expected_standard:
          'Explica periodicidade das consultas no 3º trimestre (quinzenal entre 28 e 36 semanas, depois semanal) e orienta procurar maternidade se perda líquida, sangramento ou redução de movimentos fetais.',
        weight: 0.9,
      },
    ],
  },
  {
    specialty_slug: 'ginecologia-obstetricia',
    title: 'Coleta de Citopatológico do Colo Uterino (Papanicolaou)',
    description:
      'Mulher de 31 anos comparece à UBS para coleta de exame preventivo de câncer do colo do útero. Relata dois exames anteriores anuais normais.',
    difficulty: 'básico',
    duration_min: 10,
    items: [
      {
        category: 'Acolhimento',
        description: 'Acolhe com privacidade, solicita acompanhante/auxiliar e verifica condições de preparo pré-coleta',
        expected_standard:
          'Explica o procedimento, garante presença de profissional auxiliar na sala e questiona abstinência sexual, uso de duchas/lubrificantes ou sangramento menstrual nas últimas 48 horas.',
        weight: 1.0,
      },
      {
        category: 'Procedimento',
        description: 'Introduz espéculo de Collins sem lubrificante e visualiza integralmente o colo uterino',
        expected_standard:
          'Calça luvas de procedimento, inspeciona vulva, introduz espéculo em sentido oblíquo/vertical sem lubrificante (apenas soro fisiológico se mucosa ressecada) e centraliza o orifício externo do colo.',
        weight: 1.3,
      },
      {
        category: 'Procedimento',
        description: 'Executa coleta ectocervical (espátula de Ayre) e endocervical (escova endocervical) com fixação imediata',
        expected_standard:
          'Raspa a ectocérvice em 360° com a extremidade chanfrada da espátula de Ayre, coleta canal endocervical com escova girando 360°, estende na lâmina identificada e fixa imediatamente com álcool 96% ou spray.',
        weight: 1.5,
      },
      {
        category: 'Plano',
        description: 'Orienta periodicidade trienal do rastreamento segundo diretrizes do INCA/MS',
        expected_standard:
          'Esclarece que a população-alvo é de 25 a 64 anos e que, após dois exames anuais consecutivos normais, o intervalo do preventivo passa a ser a cada 3 anos.',
        weight: 1.2,
      },
    ],
  },
  {
    specialty_slug: 'ginecologia-obstetricia',
    title: 'Hemorragia Pós-Parto Imediata por Atonia Uterina',
    description:
      'Puérpera imediata de parto vaginal macrossômico apresenta sangramento vaginal volumoso (> 600 mL) 20 minutos após a dequitação placentária, com útero amolecido acima da cicatriz umbilical.',
    difficulty: 'avançado',
    duration_min: 10,
    items: [
      {
        category: 'Avaliação',
        description: 'Aciona ajuda multiprofissional, calcula Índice de Choque e investiga os 4 Ts',
        expected_standard:
          'Chama equipe de obstetrícia/enfermagem, calcula Índice de Choque (FC/PAS > 0,9 indica gravidade) e revisa sistematicamente Tônus (atonia), Trauma, Tecido e Trombina.',
        weight: 1.3,
      },
      {
        category: 'Procedimento',
        description: 'Inicia massagem uterina bimanual (Manobra de Hamilton) e esvaziamento vesical',
        expected_standard:
          'Executa compressão uterina bimanual vigorosa imediatamente após sondagem vesical de alívio, mantendo monitorização e dois acessos venosos calibrosos.',
        weight: 1.4,
      },
      {
        category: 'Conduta',
        description: 'Prescreve ocitocina endovenosa em primeira linha associada ao ácido tranexâmico',
        expected_standard:
          'Administra Ocitocina (5 UI EV lento + manutenção de 20-40 UI em 500 mL de cristalóide) e Ácido Tranexâmico 1g EV em 10 minutos precocemente.',
        weight: 1.5,
      },
      {
        category: 'Conduta',
        description: 'Escalona uterotônicos (metilergometrina e misoprostol) verificando contraindicações',
        expected_standard:
          'Caso refratário à ocitocina, prescreve Metilergometrina 0,2 mg IM (após descartar hipertensão/pré-eclâmpsia) e Misoprostol 800 mcg via retal.',
        weight: 1.3,
      },
      {
        category: 'Procedimento',
        description: 'Indica balão de tamponamento intrauterino (Bakri/artesanal) ou abordagem cirúrgica (B-Lynch)',
        expected_standard:
          'Diante de falha farmacológica na atonia, indica passagem de balão intrauterino com antibioticoprofilaxia ou sutura compressiva de B-Lynch / ligadura vascular.',
        weight: 1.1,
      },
    ],
  },
  {
    specialty_slug: 'pediatria',
    title: 'Puericultura de Lactente aos 6 Meses e Introdução Alimentar',
    description:
      'Mãe traz lactente de 6 meses completos, nascido a termo com 3.200g, em aleitamento materno exclusivo até hoje, para avaliação de rotina e orientações sobre introdução alimentar.',
    difficulty: 'básico',
    duration_min: 10,
    items: [
      {
        category: 'Acolhimento',
        description: 'Acolhe a mãe, elogia o aleitamento materno exclusivo e solicita a Caderneta da Criança',
        expected_standard:
          'Parabeniza pelo sucesso do aleitamento materno exclusivo até os 6 meses, escuta dúvidas maternas com empatia e analisa registros perinatais na Caderneta da Criança.',
        weight: 1.0,
      },
      {
        category: 'Avaliação',
        description: 'Realiza antropometria (peso, comprimento e perímetro cefálico) e plota nas curvas da OMS',
        expected_standard:
          'Anota peso, estatura e perímetro cefálico, plota os pontos nos gráficos de escore-Z da OMS (Peso/Idade, Estatura/Idade, IMC/Idade e PC/Idade) e interpreta como eutrófico.',
        weight: 1.3,
      },
      {
        category: 'Exame Físico',
        description: 'Avalia marcos do desenvolvimento neuropsicomotor esperados para os 6 meses',
        expected_standard:
          'Verifica sinais de prontidão para alimentação (sustento cefálico firme, senta com apoio, redução do reflexo de protrusão da língua, leva objetos à boca e rola no leito).',
        weight: 1.3,
      },
      {
        category: 'Avaliação',
        description: 'Revisa cartão vacinal do PNI para os 6 meses de vida',
        expected_standard:
          'Checa vacinas prévias e indica doses dos 6 meses pelo PNI: 3ª dose da Pentavalente, 3ª dose da VIP (Poliomielite inativada), Influenza e COVID-19 conforme calendário vigente.',
        weight: 1.2,
      },
      {
        category: 'Plano',
        description: 'Orienta introdução da alimentação complementar mantendo leite materno até 2 anos ou mais',
        expected_standard:
          'Orienta duas papas de frutas e uma refeição principal (almoço) amassada com garfo (nunca liquidificada ou peneirada), contendo cereal/tubérculo, leguminosa, proteína animal e hortaliças, sem sal excessivo e zero açúcar/mel antes de 2 anos.',
        weight: 1.5,
      },
      {
        category: 'Conduta',
        description: 'Prescreve suplementação profilática de ferro e vitamina D conforme SBP',
        expected_standard:
          'Prescreve sulfato ferroso profilático (1 mg de ferro elementar/kg/dia a partir dos 6 meses no lactente a termo AIG) e mantém colecalciferol (Vitamina D 400 UI/dia até 12 meses).',
        weight: 1.2,
      },
    ],
  },
  {
    specialty_slug: 'pediatria',
    title: 'Criança com Febre sem Sinais Localizatórios (FSSL)',
    description:
      'Lactente de 2 meses de idade é trazido ao pronto-socorro com febre aferida de 38,6 °C há 12 horas, sem coriza, tosse ou diarreia.',
    difficulty: 'intermediário',
    duration_min: 10,
    items: [
      {
        category: 'Avaliação',
        description: 'Aplica o Triângulo de Avaliação Pediátrica (TAP) e pesquisa sinais de toxemia',
        expected_standard:
          'Avalia aparência geral (tônus, interatividade, consolabilidade, olhar/choro), trabalho respiratório e circulação cutânea (tempo de enchimento capilar e manchas), além de fontanela anterior.',
        weight: 1.4,
      },
      {
        category: 'Avaliação',
        description: 'Solicita triagem infecciosa completa para lactente jovem febril (Rochester / Baraff)',
        expected_standard:
          'Solicita hemograma completo, hemocultura, PCR/procalcitonina, sumário de urina (EAS) + urocultura coletada por cateterismo vesical ou punção suprapúbica (nunca saco coletor para cultura) e avalia punção lombar.',
        weight: 1.5,
      },
      {
        category: 'Conduta',
        description: 'Prescreve antitérmico na dose ponderal e define necessidade de internação/antibiótico empírico',
        expected_standard:
          'Prescreve paracetamol ou dipirona ajustado ao peso, orienta sinais de alarme e estratifica risco de infecção bacteriana grave (IBG) para decisão de observação hospitalar ou ceftriaxona empírica.',
        weight: 1.3,
      },
    ],
  },
  {
    specialty_slug: 'medicina-familia',
    title: 'Consulta Centrada na Pessoa — Diabetes Mellitus Tipo 2 e Adesão',
    description:
      'Senhora de 59 anos, costureira, portadora de DM2 com HbA1c de 9,8%, comparece à UBS dizendo que parou a insulina porque "tem medo de ficar cega igual à irmã que usava insulina".',
    difficulty: 'intermediário',
    duration_min: 10,
    items: [
      {
        category: 'Acolhimento',
        description: 'Acolhe sem julgamento e explora a experiência da doença pelo acrônimo SIFE',
        expected_standard:
          'Escuta sem interromper nos primeiros momentos e explora Sentimentos (medo da cegueira), Ideias (crença de que a insulina causou a cegueira da irmã), Funcionalidade (trabalho como costureira) e Expectativas.',
        weight: 1.5,
      },
      {
        category: 'Anamnese',
        description: 'Compreende a pessoa como um todo: contexto familiar, rotina alimentar e rede de apoio',
        expected_standard:
          'Investiga dinâmica familiar, horários de refeição, condições financeiras, dificuldades de aplicação ou armazenamento da insulina e episódios de hipoglicemia.',
        weight: 1.2,
      },
      {
        category: 'Exame Físico',
        description: 'Realiza exame completo do pé diabético (monofilamento de 10g, diapasão e pulsos)',
        expected_standard:
          'Inspeciona pele, unhas, calosidades e micoses interdigitais, testa sensibilidade protetora plantar com monofilamento Semmes-Weinstein de 10g, sensibilidade vibratória e palpa pulsos pediosos e tibiais posteriores.',
        weight: 1.4,
      },
      {
        category: 'Plano',
        description: 'Desmistifica o mito sobre a insulina e pactua plano terapêutico compartilhado',
        expected_standard:
          'Explica de forma empática e acessível que a retinopatia decorre do diabetes descontrolado e não da insulina, ajustando metformina + insulina NPH noturna conforme rotina da paciente.',
        weight: 1.4,
      },
      {
        category: 'Plano',
        description: 'Solicita rastreamento de complicações microvasculares e aciona equipe multiprofissional (eMulti)',
        expected_standard:
          'Solicita fundoscopia/retinografia, relação albumina/creatinina urinária, revisão de técnica de aplicação com enfermagem e acompanhamento conjunto na APS.',
        weight: 1.0,
      },
    ],
  },
  {
    specialty_slug: 'medicina-familia',
    title: 'Manejo Clínico e Notificação de Dengue — Classificação Grupo B',
    description:
      'Mulher de 68 anos, hipertensa e diabética, procura a UBS no 3º dia de febre alta (39 °C), cefaleia retro-orbitária, mialgia intensa e exantema maculopapular, sem sinais de alarme.',
    difficulty: 'básico',
    duration_min: 10,
    items: [
      {
        category: 'Anamnese',
        description: 'Pesquisa ativamente todos os sinais de alarme e condições especiais/comorbidades',
        expected_standard:
          'Questiona dor abdominal intensa e contínua, vômitos persistentes, hipotensão postural/lipotimia, sangramento de mucosas, letargia/irritabilidade e identifica idade > 65 anos + comorbidades.',
        weight: 1.3,
      },
      {
        category: 'Exame Físico',
        description: 'Realiza aferição de PA em duas posições e executa a Prova do Laço',
        expected_standard:
          'Verifica PA sentada e em pé (pesquisa de hipotensão postural), hidratação de mucosas, hepatomegalia dolorosa e realiza Prova do Laço na média da PAS/PAD por 5 minutos (positiva se >= 20 petéquias no adulto).',
        weight: 1.4,
      },
      {
        category: 'Avaliação',
        description: 'Estadia corretamente no Grupo B do Ministério da Saúde e solicita hemograma em leito de observação',
        expected_standard:
          'Classifica como Dengue Grupo B (sem sinais de alarme, mas com risco social/comorbidades/idade > 65 anos ou sangramento cutâneo espontâneo/prova do laço +) e solicita hemograma obrigatório.',
        weight: 1.5,
      },
      {
        category: 'Conduta',
        description: 'Prescreve hidratação oral supervisionada (60 mL/kg/dia) e contraindica AINEs/AAS',
        expected_standard:
          'Inicia hidratação oral imediata (1/3 com sais de reidratação oral e 2/3 com líquidos caseiros), prescreve dipirona ou paracetamol e proíbe expressamente AAS e anti-inflamatórios não esteroidais.',
        weight: 1.3,
      },
      {
        category: 'Plano',
        description: 'Realiza notificação compulsória no SINAN, entrega Cartão da Dengue e agenda reavaliação diária',
        expected_standard:
          'Notifica o caso suspeito no SINAN, preenche o Cartão de Acompanhamento da Dengue e orienta retorno diário até 48 horas após a defervescência da febre (período crítico).',
        weight: 1.0,
      },
    ],
  },
  {
    specialty_slug: 'saude-mental',
    title: 'Avaliação de Risco de Suicídio e Manejo de Crise Depressiva Grave',
    description:
      'Homem de 34 anos, recém-desempregado e divorciado, é trazido pela irmã à UPA após enviar mensagens de despedida e dizer que comprou medicações para "acabar com o sofrimento".',
    difficulty: 'avançado',
    duration_min: 10,
    items: [
      {
        category: 'Acolhimento',
        description: 'Garante ambiência segura, postura empática e escuta ativa sem julgamentos morais',
        expected_standard:
          'Recebe o paciente com respeito, valida seu sofrimento emocional sem minimizar ou dar conselhos superficiais ("pense positivo") e mantém ambiente protegido.',
        weight: 1.2,
      },
      {
        category: 'Anamnese',
        description: 'Pergunta diretamente sobre ideação, intenção, plano estruturado e acesso a meios letais',
        expected_standard:
          'Investiga de forma direta e cuidadosa a presença de pensamentos de morte, planejamento específico, posse dos comprimidos/outros meios letais, carta de despedida e tentativas prévias.',
        weight: 1.5,
      },
      {
        category: 'Avaliação',
        description: 'Realiza Exame do Estado Mental (súmula psicopatológica) e pesquisa fatores de proteção',
        expected_standard:
          'Avalia humor deprimido, afeto hipomodulado, desesperança, anedonia, sintomas psicóticos congruentes com o humor (delírios de ruína/culpa), uso de álcool/substâncias e suporte familiar.',
        weight: 1.3,
      },
      {
        category: 'Avaliação',
        description: 'Classifica como Alto Risco de Suicídio e contraindica alta desprotegida',
        expected_standard:
          'Estratifica como alto risco (ideação ativa + plano estruturado + acesso ao meio + estressores agudos + desesperança), indicando vigilância contínua e proteção imediata.',
        weight: 1.5,
      },
      {
        category: 'Conduta',
        description: 'Aciona suporte familiar para restrição de meios letais e articula CAPS III / internação psiquiátrica',
        expected_standard:
          'Orienta a irmã a recolher todas as medicações e objetos letais do domicílio, mantém paciente em observação protegida e referencia para acolhimento integral em CAPS III ou leito de saúde mental em hospital geral.',
        weight: 1.3,
      },
      {
        category: 'Plano',
        description: 'Realiza notificação de violência autoprovocada (se tentativa) e elabora plano de segurança',
        expected_standard:
          'Registra em prontuário, realiza notificação compulsória imediata no SINAN em caso de tentativa de suicídio e informa canais de apoio como CVV (188) e fluxo da RAPS.',
        weight: 0.9,
      },
    ],
  },
  {
    specialty_slug: 'saude-mental',
    title: 'Síndrome de Abstinência Alcoólica Grave e Prevenção de Wernicke',
    description:
      'Homem de 49 anos, etilista pesado há 20 anos, interrompeu o consumo há 48 horas e apresenta tremores grosseiros de extremidades, sudorese profusa, agitação psicomotora, PA 168x104 mmHg e alucinações visuais (zoopsias).',
    difficulty: 'intermediário',
    duration_min: 10,
    items: [
      {
        category: 'Avaliação',
        description: 'Reconhece Síndrome de Abstinência Alcoólica grave / Delirium Tremens e aplica escala CIWA-Ar',
        expected_standard:
          'Identifica hiperatividade autonômica, tremores, desorientação e zoopsias após cessação do álcool, avaliando gravidade clínica e descartando traumatismo craniano, hipoglicemia e infecções.',
        weight: 1.3,
      },
      {
        category: 'Conduta',
        description: 'Administra Tiamina (Vitamina B1) parenteral ANTES de qualquer infusão de glicose',
        expected_standard:
          'Prescreve Tiamina 300-500 mg EV/IM antes da administração de soluções glicosadas para prevenir precipitação de Encefalopatia de Wernicke (confusão, ataxia e oftalmoplegia).',
        weight: 1.5,
      },
      {
        category: 'Conduta',
        description: 'Prescreve benzodiazepínico de meia-vida longa (Diazepam ou Lorazepam se hepatopata)',
        expected_standard:
          'Indica Diazepam EV/VO titulado pelos sintomas (ou Lorazepam se insuficiência hepática avançada) como tratamento padrão-ouro para controle da abstinência e prevenção de crises convulsivas.',
        weight: 1.5,
      },
      {
        category: 'Avaliação',
        description: 'Solicita glicemia capilar, eletrólitos (magnésio, potássio, sódio), função hepática e renal',
        expected_standard:
          'Realiza HGT imediato e solicita dosagem sérica de magnésio, potássio, transaminases, bilirrubinas, albumina, INR e hemograma.',
        weight: 1.0,
      },
      {
        category: 'Plano',
        description: 'Garante ambiente calmo e planeja encaminhamento longitudinal ao CAPS AD após estabilização',
        expected_standard:
          'Mantém paciente em ambiente silencioso e bem iluminado, evita contenção física desnecessária e referencia ao CAPS Álcool e Drogas (CAPS AD) na alta.',
        weight: 0.9,
      },
    ],
  },
  {
    specialty_slug: 'urgencia-emergencia',
    title: 'Parada Cardiorrespiratória em FV/TV sem Pulso (BLS e ACLS)',
    description:
      'Paciente de 61 anos apresenta colapso súbito na sala de observação do pronto-socorro. Ao chegar ao leito, você encontra o paciente inconsciente.',
    difficulty: 'avançado',
    duration_min: 10,
    items: [
      {
        category: 'Avaliação',
        description: 'Reconhece a PCR (irresponsividade, apneia/gasping e ausência de pulso carotídeo em 5 a 10s)',
        expected_standard:
          'Checa responsividade tocando os ombros, avalia simultaneamente respiração e pulso central (carotídeo) por no mínimo 5 e no máximo 10 segundos e solicita ajuda + carrinho de parada/desfibrilador.',
        weight: 1.3,
      },
      {
        category: 'Procedimento',
        description: 'Inicia compressões torácicas de alta qualidade imediatamente',
        expected_standard:
          'Comprime o centro do tórax sobre superfície rígida na frequência de 100 a 120/min, profundidade de 5 a 6 cm, permitindo retorno total do tórax, minimizando interrupções e revezando o compressor a cada 2 minutos.',
        weight: 1.5,
      },
      {
        category: 'Procedimento',
        description: 'Identifica ritmo chocável (Fibrilação Ventricular) e aplica desfibrilação bifásica imediata',
        expected_standard:
          'Posiciona pás no tórax, identifica Fibrilação Ventricular, carrega o desfibrilador bifásico (200 J), afasta toda a equipe com comando verbal claro, aplica o choque e reinicia RCP imediatamente por 2 minutos sem checar pulso.',
        weight: 1.5,
      },
      {
        category: 'Conduta',
        description: 'Administra Adrenalina 1 mg EV após o 2º choque e Amiodarona 300 mg EV após o 3º choque',
        expected_standard:
          'Prescreve Adrenalina 1 mg EV/IO após o segundo choque (repetindo a cada 3 a 5 min) e Amiodarona 300 mg EV em bolus após o terceiro choque (seguida de 150 mg se persistir refratária), sempre seguidas de flush de 20 mL de SF e elevação do membro.',
        weight: 1.5,
      },
      {
        category: 'Avaliação',
        description: 'Investiga e trata sistematicamente as causas reversíveis (5Hs e 5Ts)',
        expected_standard:
          'Verbaliza e investiga Hipovolemia, Hipóxia, H+ (acidose), Hipo/Hipercalemia, Hipotermia, Tensão no tórax (pneumotórax), Tamponamento cardíaco, Toxinas, Trombose coronariana e Trombose pulmonar.',
        weight: 1.2,
      },
      {
        category: 'Conduta',
        description: 'Institui cuidados pós-PCR após Retorno da Circulação Espontânea (RCE)',
        expected_standard:
          'Garante via aérea avançada com capnografia em onda (ETCO2 35-40 mmHg), mantém SpO2 92-98%, PAM >= 65 mmHg, solicita ECG de 12 derivações, controla temperatura e encaminha para hemodinâmica/UTI.',
        weight: 1.0,
      },
    ],
  },
];

export const INITIAL_DEMO_ATTEMPTS = [
  {
    stationIdx: 0,
    daysAgo: 16,
    duration_sec: 545,
    notes:
      'Primeira tentativa em dor torácica. Esqueci de perguntar uso de sildenafila antes do nitrato e demorei para definir porta-agulha.',
    statuses: ['ok', 'erro', 'ok', 'parcial', 'ok', 'parcial', 'omitido'],
    itemNotes: {
      1: 'Não perguntei sobre uso de inibidores de PDE-5.',
      3: 'Auscultei mas esqueci de verbalizar a classificação de Killip.',
      5: 'Confundi o tempo máximo porta-balão de transferência.',
      6: 'Faltou tempo para comunicar a família.',
    },
  },
  {
    stationIdx: 3,
    daysAgo: 14,
    duration_sec: 580,
    notes:
      'Reconheci o pneumotórax hipertensivo, mas indiquei a punção no 2º EIC em vez do 5º EIC na linha axilar média (ATLS 10ª ed).',
    statuses: ['ok', 'ok', 'parcial', 'ok', 'parcial', 'omitido'],
    itemNotes: {
      2: 'Verbalizei 2º espaço intercostal linha hemiclavicular (protocolo antigo).',
      4: 'Esqueci de mencionar prevenção de hipotermia com manta térmica.',
      5: 'Cronômetro zerou antes de coletar história AMPLA completa.',
    },
  },
  {
    stationIdx: 6,
    daysAgo: 12,
    duration_sec: 490,
    notes:
      'Boa condução geral do pré-natal, porém esqueci de indicar imunoglobulina anti-D na gestante Rh negativo com Coombs indireto negativo.',
    statuses: ['ok', 'ok', 'parcial', 'ok', 'ok'],
    itemNotes: {
      2: 'Interpretei o TOTG corretamente, mas omiti a profilaxia anti-D às 28 semanas.',
    },
  },
  {
    stationIdx: 9,
    daysAgo: 10,
    duration_sec: 520,
    notes:
      'Excelente revisão da caderneta e curvas da OMS. Preciso reforçar a dose exata do ferro elementar profilático.',
    statuses: ['ok', 'ok', 'ok', 'ok', 'ok', 'parcial'],
    itemNotes: {
      5: 'Lembrei da vitamina D 400 UI, mas hesitei na dose de 1 mg/kg/dia de ferro elementar.',
    },
  },
  {
    stationIdx: 13,
    daysAgo: 7,
    duration_sec: 560,
    notes:
      'Acolhimento empático e pergunta direta sobre plano suicida. Faltou mencionar a notificação compulsória no SINAN.',
    statuses: ['ok', 'ok', 'ok', 'ok', 'parcial', 'erro'],
    itemNotes: {
      4: 'Encaminhei para CAPS, mas não especifiquei CAPS III com acolhimento 24h.',
      5: 'Esqueci que tentativa de suicídio exige notificação imediata no SINAN.',
    },
  },
  {
    stationIdx: 11,
    daysAgo: 5,
    duration_sec: 510,
    notes:
      'Apliquei muito bem o método SIFE para acolher o medo da insulina e realizei o exame do pé diabético com monofilamento.',
    statuses: ['ok', 'ok', 'ok', 'ok', 'parcial'],
    itemNotes: {
      4: 'Solicitei fundoscopia, mas esqueci a relação albumina/creatinina urinária.',
    },
  },
  {
    stationIdx: 15,
    daysAgo: 3,
    duration_sec: 475,
    notes:
      'Sequência de RCP, choque bifásico e drogas (adrenalina + amiodarona) executada com segurança. Esqueci apenas de citar todos os 5Hs e 5Ts.',
    statuses: ['ok', 'ok', 'ok', 'ok', 'parcial', 'ok'],
    itemNotes: {
      4: 'Citei apenas 4Hs e 3Ts durante o ciclo de RCP.',
    },
  },
  {
    stationIdx: 0,
    daysAgo: 1,
    duration_sec: 460,
    notes:
      'Segunda tentativa na estação de IAMCSST! Corrigi os erros anteriores, investiguei uso de sildenafila e defini reperfusão rapidamente.',
    statuses: ['ok', 'ok', 'ok', 'ok', 'ok', 'ok', 'parcial'],
    itemNotes: {
      6: 'Comuniquei a família bem, apenas esqueci de pedir coagulograma junto à troponina.',
    },
  },
];
