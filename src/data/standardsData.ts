import { StandardItem } from '@/types';

export const STANDARDS_DATABASE: Record<string, StandardItem> = {
  'IS 302-2-14': {
    id: 'is-302-2-14',
    code: 'IS 302-2-14',
    title: 'Particular Requirements for Kitchen Machines',
    fullTitle: 'Safety of Household and Similar Electrical Appliances — Part 2: Particular Requirements, Section 14: Kitchen Machines',
    status: 'ACTIVE',
    amendmentsCount: 2,
    lastVerified: 'Today (BIS Gazette Sync)',
    category: 'Household Electrical & Consumer Electronics',
    scheme: 'Scheme I (ISI Mark)',
    mandatoryStatus: 'MANDATORY (QCO)',
    qcoDetails: 'Electrical Appliances (Quality Control) Order, 2023 under Section 16 of BIS Act, 2016.',
    matchScore: 96,
    whyMatched: [
      'Electric motor-driven mechanism',
      'Domestic / household food processing application',
      'Operating voltage nominal 230V AC, 50Hz single phase',
      'Rated input up to 1000W with detachable grinding / blending vessels'
    ],
    whyNotApplied: 'Does not apply to industrial food preparation machines intended for continuous commercial catering (which fall under IS 9849).',
    applicableProducts: [
      'Mixer Grinders & Blenders',
      'Food Processors',
      'Juicers & Citrus Presses',
      'Coffee Grinders & Wet Grinders',
      'Hand Blenders & Dough Kneaders'
    ],
    timeline: [
      { year: '2009', event: 'First revision published aligned with IEC 60335-2-14', status: 'past' },
      { year: '2018', event: 'Reaffirmed with mandatory earth continuity stipulations', status: 'past' },
      { year: '2022', event: 'Amendment 1: Added thermal overload protector endurance test protocols', status: 'past' },
      { year: '2024', event: 'Amendment 2: Mandated dual-stage interlock on food processor lid mechanisms', status: 'current' },
      { year: '2026', event: 'Harmonized compliance enforcement under revised QCO mandate', status: 'future' }
    ],
    relatedStandards: ['IS 302-1', 'IS 694', 'IS 1293', 'IS 9849', 'IS 13947'],
    clauses: [
      {
        standardCode: 'IS 302-2-14',
        clauseNumber: 'Clause 1.1',
        clauseTitle: 'Scope and Object',
        text: 'This standard deals with the safety of electric kitchen machines for household and similar purposes, their rated voltage being not more than 250 V for single-phase appliances. Appliances not intended for normal household use but which nevertheless may be a source of danger to the public, such as appliances intended to be used by laymen in shops, in light industry and on farms, are within the scope of this standard.',
        highlightedText: 'This standard deals with the safety of electric kitchen machines for household and similar purposes, their rated voltage being not more than 250 V for single-phase appliances.',
        context: 'Directly establishes applicability for domestic 230V 750W mixer grinders and kitchen machines.',
        editionYear: '2009 (with Amd. 1 & 2)',
        status: 'ACTIVE'
      },
      {
        standardCode: 'IS 302-2-14',
        clauseNumber: 'Clause 7.1',
        clauseTitle: 'Marking and Instructions',
        text: 'Appliances shall be marked with rated voltage or rated voltage range in volts (V), symbol for nature of supply unless rated frequency is marked, rated power input in watts (W) or rated current in amperes (A), name or trade mark or identification mark of the manufacturer or responsible vendor, and model or type reference. The Standard Mark (ISI mark) shall be affixed in accordance with the BIS Licence provisions.',
        highlightedText: 'Appliances shall be marked with rated voltage or rated voltage range in volts (V), symbol for nature of supply, rated power input in watts (W), and model or type reference.',
        context: 'Marking verification requirement. Critical check in factory sample inspection.',
        editionYear: '2009 (with Amd. 1 & 2)',
        status: 'ACTIVE'
      },
      {
        standardCode: 'IS 302-2-14',
        clauseNumber: 'Clause 8.1',
        clauseTitle: 'Protection Against Access to Live Parts',
        text: 'Appliances shall be constructed and enclosed so that there is adequate protection against accidental contact with live parts. Test probe B of IS 1401 is applied with a force not exceeding 20 N; the probe shall not enter openings leading to uninsulated live conductors or internal motor windings.',
        highlightedText: 'Appliances shall be constructed and enclosed so that there is adequate protection against accidental contact with live parts. Test probe B shall not enter openings.',
        context: 'Safety enclosure ingress requirement for motor housing ventilation slots.',
        editionYear: '2009 (with Amd. 1 & 2)',
        status: 'ACTIVE'
      },
      {
        standardCode: 'IS 302-2-14',
        clauseNumber: 'Clause 13.2',
        clauseTitle: 'Leakage Current and Electric Strength at Operating Temperature',
        text: 'The leakage current of the appliance shall not be excessive and its electric strength shall be adequate. For Class I appliances, the leakage current measured between any pole of supply and accessible metal parts shall not exceed 0.75 mA or 0.75 mA per kW rated input, whichever is higher.',
        highlightedText: 'For Class I appliances, the leakage current measured between any pole of supply and accessible metal parts shall not exceed 0.75 mA.',
        context: 'Mandatory routine and type laboratory safety test.',
        editionYear: '2009 (with Amd. 1 & 2)',
        status: 'ACTIVE'
      },
      {
        standardCode: 'IS 302-2-14',
        clauseNumber: 'Clause 19.11',
        clauseTitle: 'Abnormal Operation & Motor Lock Test',
        text: 'Motor-operated appliances shall be tested under locked-rotor conditions for a duration of 30 seconds or until the thermal overload protector operates. The temperature of the windings shall not exceed the values specified in Table 8, and no fire or molten insulation hazard shall occur.',
        highlightedText: 'tested under locked-rotor conditions for a duration of 30 seconds or until the thermal overload protector operates.',
        context: 'Mandatory thermal trip device testing on mixer grinders.',
        editionYear: '2009 (with Amd. 1 & 2)',
        status: 'AMENDED',
        amendmentNote: 'Amended in 2022 to mandate auto-resetting or manual-reset overload protector cycling verification.'
      },
      {
        standardCode: 'IS 302-2-14',
        clauseNumber: 'Clause 20.2',
        clauseTitle: 'Stability and Mechanical Hazards',
        text: 'Moving parts of kitchen machines, such as rotating cutter blades and beaters, shall be arranged or enclosed so as to provide adequate protection against personal injury. Blades shall be securely anchored to withstand 1.2 times maximum rated speed with jar loaded with viscous test medium.',
        highlightedText: 'Moving parts of kitchen machines, such as rotating cutter blades, shall provide adequate protection against personal injury.',
        context: 'Mechanical safety of stainless steel jar blade assembly.',
        editionYear: '2009 (with Amd. 1 & 2)',
        status: 'ACTIVE'
      }
    ]
  },

  'IS 302-1': {
    id: 'is-302-1',
    code: 'IS 302-1',
    title: 'Safety of Household and Similar Electrical Appliances — General Requirements',
    fullTitle: 'Safety of Household and Similar Electrical Appliances — Part 1: General Requirements',
    status: 'ACTIVE',
    amendmentsCount: 4,
    lastVerified: 'Today (BIS Gazette Sync)',
    category: 'General Electrical Safety',
    scheme: 'Scheme I (ISI Mark)',
    mandatoryStatus: 'MANDATORY (QCO)',
    qcoDetails: 'Base standard applicable to all Part 2 series household appliances.',
    matchScore: 78,
    whyMatched: [
      'Provides foundational electrical insulation and creepage distance norms',
      'Applies in conjunction with all Part 2 specific standards like IS 302-2-14',
      'Covers earth bonding, supply cord anchorages, and flammability tests'
    ],
    whyNotApplied: 'This is the parent general standard; it must be applied together with the specific Part 2 standard (IS 302-2-14) for final certification.',
    applicableProducts: ['All domestic electrical appliances (Refrigerators, Mixers, Irons, Geysers, Fans)'],
    timeline: [
      { year: '2008', event: 'Consolidated edition incorporating IS/IEC 60335-1', status: 'past' },
      { year: '2017', event: 'Amendment 2: Glow-wire flammability test compliance mandated for unattended appliances', status: 'past' },
      { year: '2023', event: 'Amendment 4: Harmonized testing protocols for IoT / smart appliance controllers', status: 'current' }
    ],
    relatedStandards: ['IS 302-2-14', 'IS 694', 'IS 1293', 'IS 1401'],
    clauses: [
      {
        standardCode: 'IS 302-1',
        clauseNumber: 'Clause 7.12',
        clauseTitle: 'Instructions for Use and Earthing',
        text: 'Instructions for appliances with type Y attachment or type Z attachment shall contain the substance of the following: If the supply cord is damaged, it must be replaced by the manufacturer, its service agent or similarly qualified persons in order to avoid a hazard.',
        highlightedText: 'If the supply cord is damaged, it must be replaced by the manufacturer, its service agent or similarly qualified persons.',
        context: 'Required manual text clause.',
        editionYear: '2008 (Rev. 2)',
        status: 'ACTIVE'
      },
      {
        standardCode: 'IS 302-1',
        clauseNumber: 'Clause 25.7',
        clauseTitle: 'Supply Cords and Cable Spec',
        text: 'Supply cords shall not be lighter than ordinary tough rubber sheathed cord (code designation 60245 IEC 53) or ordinary polyvinyl chloride sheathed cord (code designation IS 694 / 60227 IEC 53). Cord cross-section for appliances rated above 3A and up to 6A shall be at least 0.75 mm².',
        highlightedText: 'Cord cross-section for appliances rated above 3A and up to 6A shall be at least 0.75 mm² conforming to IS 694.',
        context: 'Cables must comply with IS 694.',
        editionYear: '2008 (Rev. 2)',
        status: 'ACTIVE'
      }
    ]
  },

  'IS 4151': {
    id: 'is-4151',
    code: 'IS 4151',
    title: 'Protective Helmets for Two Wheeler Riders',
    fullTitle: 'Protective Helmets for Two Wheeler Riders — Specification (Fourth Revision)',
    status: 'ACTIVE',
    amendmentsCount: 3,
    lastVerified: 'Yesterday',
    category: 'Personal Protective Equipment & Automotive',
    scheme: 'Scheme I (ISI Mark)',
    mandatoryStatus: 'MANDATORY (QCO)',
    qcoDetails: 'Mandatory under Ministry of Road Transport and Highways (MoRTH) Central Motor Vehicles Rules.',
    matchScore: 42,
    whyMatched: ['Head protective gear', 'Two wheeler rider safety equipment'],
    applicableProducts: ['Full face helmets', 'Open face helmets', 'Modular motorcycle helmets'],
    timeline: [
      { year: '2015', event: 'Fourth revision published reducing maximum permissible helmet weight to 1.2 kg', status: 'past' },
      { year: '2020', event: 'Weight ceiling revised to 1.5 kg to accommodate international safety materials', status: 'past' },
      { year: '2024', event: 'Strict prohibition of non-ISI certified two-wheeler helmets enforced across all states', status: 'current' }
    ],
    relatedStandards: ['IS 9944', 'IS 7692'],
    clauses: [
      {
        standardCode: 'IS 4151',
        clauseNumber: 'Clause 4.1',
        clauseTitle: 'General Construction & Materials',
        text: 'The helmet shall consist of a hard outer shell, an energy-absorbing impact liner, comfort padding, and a retention system (chin strap and buckle). All materials coming into contact with the skin shall not cause dermatitis or skin irritation.',
        highlightedText: 'The helmet shall consist of a hard outer shell, an energy-absorbing impact liner, and a retention system.',
        context: 'Basic material and construction baseline.',
        editionYear: '2015',
        status: 'ACTIVE'
      }
    ]
  },

  'IS 694': {
    id: 'is-694',
    code: 'IS 694',
    title: 'PVC Insulated Cables for Working Voltages up to and Including 1100 V',
    fullTitle: 'Polyvinyl Chloride Insulated Unsheathed and Sheathed Cables/Cords with Rigid and Flexible Conductors for Working Voltages up to and Including 1100 V',
    status: 'ACTIVE',
    amendmentsCount: 1,
    lastVerified: '3 days ago',
    category: 'Electrical Wiring & Power Conductors',
    scheme: 'Scheme I (ISI Mark)',
    mandatoryStatus: 'MANDATORY (QCO)',
    qcoDetails: 'Wires and Cables (Quality Control) Order.',
    matchScore: 35,
    whyMatched: ['Electrical cables and cords used in appliance power input wiring'],
    applicableProducts: ['Appliance power cords', 'Building wires', 'Flexible copper cords'],
    timeline: [
      { year: '2010', event: 'Fourth revision incorporating Lead-Free (LF) and Flame Retardant (FR) formulations', status: 'past' },
      { year: '2021', event: 'Amendment 1: Mandated continuous laser or indentation marking of licence details', status: 'past' }
    ],
    relatedStandards: ['IS 8130', 'IS 5831', 'IS 10810'],
    clauses: [
      {
        standardCode: 'IS 694',
        clauseNumber: 'Clause 6.1',
        clauseTitle: 'Conductor Resistance Test',
        text: 'Conductors shall be of plain or tinned annealed high-conductivity copper or aluminum conforming to IS 8130. Maximum conductor resistance at 20°C shall not exceed the values specified in Table 2 for the designated nominal cross-sectional area.',
        highlightedText: 'Conductors shall be of plain or tinned annealed high-conductivity copper conforming to IS 8130.',
        context: 'Cable conductor core quality test.',
        editionYear: '2010',
        status: 'ACTIVE'
      }
    ]
  },

  'IS 14543': {
    id: 'is-14543',
    code: 'IS 14543',
    title: 'Packaged Drinking Water (Other than Packaged Natural Mineral Water)',
    fullTitle: 'Packaged Drinking Water (Other Than Packaged Natural Mineral Water) — Specification (Second Revision)',
    status: 'ACTIVE',
    amendmentsCount: 3,
    lastVerified: 'Today',
    category: 'Food, Beverage & Agro',
    scheme: 'Scheme I (ISI Mark)',
    mandatoryStatus: 'MANDATORY (QCO)',
    qcoDetails: 'Mandatory under Food Safety and Standards Authority of India (FSSAI) & BIS Act.',
    matchScore: 10,
    whyMatched: ['Drinking water bottling and packaging'],
    applicableProducts: ['Bottled drinking water', '20L water jars', 'Pouch packaged water'],
    timeline: [
      { year: '2004', event: 'Second revision with stringent pesticide residue limits (max 0.0001 mg/L)', status: 'past' },
      { year: '2021', event: 'Amendment 2: Mandated inclusion of essential minerals (Calcium & Magnesium minimum thresholds)', status: 'past' },
      { year: '2023', event: 'Amendment 3: QR code traceability requirements on packaged containers', status: 'current' }
    ],
    relatedStandards: ['IS 13428', 'IS 10500'],
    clauses: [
      {
        standardCode: 'IS 14543',
        clauseNumber: 'Clause 3.2',
        clauseTitle: 'Microbiological Requirements',
        text: 'The water shall be completely free from Escherichia coli, coliform bacteria, Faecal streptococci, Pseudomonas aeruginosa, and sulphite-reducing anaerobes in 250 ml sample testing.',
        highlightedText: 'The water shall be completely free from Escherichia coli, coliform bacteria, and Pseudomonas aeruginosa.',
        context: 'Zero tolerance microbiological safety parameters.',
        editionYear: '2004 (Rev. 2)',
        status: 'ACTIVE'
      }
    ]
  },

  'IS 16046': {
    id: 'is-16046',
    code: 'IS 16046 (Part 2) / IEC 62133-2',
    title: 'Secondary Cells and Batteries (Lithium Systems)',
    fullTitle: 'Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes — Safety Requirements for Portable Sealed Secondary Cells (Part 2 Lithium Systems)',
    status: 'ACTIVE',
    amendmentsCount: 1,
    lastVerified: '2 days ago',
    category: 'Electronics & Information Technology (CRS)',
    scheme: 'Scheme II (CRS)',
    mandatoryStatus: 'MANDATORY (QCO)',
    qcoDetails: 'Compulsory Registration Scheme (CRS) administered by MeitY and BIS.',
    matchScore: 18,
    whyMatched: ['Rechargeable battery packs', 'Portable energy storage', 'Lithium-ion cells'],
    applicableProducts: ['Power banks', 'Laptop battery packs', 'Mobile phone cells', 'EV portable packs'],
    timeline: [
      { year: '2018', event: 'Split into Part 1 (Nickel) and Part 2 (Lithium) aligned with IEC 62133:2017', status: 'past' },
      { year: '2022', event: 'Strict thermal runaway and drop testing compliance implemented', status: 'current' }
    ],
    relatedStandards: ['IS 16047', 'IS 13252'],
    clauses: [
      {
        standardCode: 'IS 16046 (Part 2)',
        clauseNumber: 'Clause 7.3.3',
        clauseTitle: 'External Short Circuit Test',
        text: 'The fully charged cell or battery is short-circuited by connecting the positive and negative terminals with a total external resistance of 80 mΩ ± 20 mΩ at 55°C ± 5°C. No fire or explosion shall occur within 24 hours.',
        highlightedText: 'No fire or explosion shall occur within 24 hours of external short circuit test at 55°C.',
        context: 'Extreme thermal safety test.',
        editionYear: '2018',
        status: 'ACTIVE'
      }
    ]
  },

  'IS 1293': {
    id: 'is-1293',
    code: 'IS 1293',
    title: 'Plugs and Socket-Outlets of Rated Voltage up to and Including 250 Volts',
    fullTitle: 'Plugs and Socket-Outlets of Rated Voltage up to and Including 250 V and Rated Current up to and Including 16 A — Specification',
    status: 'ACTIVE',
    amendmentsCount: 2,
    lastVerified: 'Today',
    category: 'Electrical Accessories',
    scheme: 'Scheme I (ISI Mark)',
    mandatoryStatus: 'MANDATORY (QCO)',
    qcoDetails: 'Plugs and Socket-Outlets (Quality Control) Order.',
    matchScore: 30,
    whyMatched: ['Molded power plug attached to mixer grinder power cord'],
    applicableProducts: ['6A 3-pin plugs', '16A 3-pin plugs', 'Wall socket outlets'],
    timeline: [
      { year: '2019', event: 'Fifth revision published introducing insulated pin sleeves for live pins', status: 'past' },
      { year: '2023', event: 'Mandatory enforcement for all appliances sold with fitted plugs', status: 'current' }
    ],
    relatedStandards: ['IS 302-1', 'IS 694'],
    clauses: [
      {
        standardCode: 'IS 1293',
        clauseNumber: 'Clause 12.1',
        clauseTitle: 'Dimensions and Pin Sleeving',
        text: 'Plugs shall comply with the dimensional gauges specified in Table 1. Live pins shall be provided with insulating sleeves to prevent accidental finger contact during insertion into socket outlets.',
        highlightedText: 'Live pins shall be provided with insulating sleeves to prevent accidental finger contact during insertion.',
        context: 'Mandated plug pin safety sleeve requirement.',
        editionYear: '2019',
        status: 'ACTIVE'
      }
    ]
  }
};
