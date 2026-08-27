import { ComplianceFinding, ExtractedDocField, LabCenter } from '@/types';

export const DEMO_COMPLIANCE_FINDINGS: ComplianceFinding[] = [
  {
    id: 'gap-1',
    title: 'Rated voltage marking format missing in submitted nameplate artwork',
    severity: 'CRITICAL',
    clauseCitation: 'IS 302-1 · Clause 7.1 & IS 302-2-14 Clause 7.1',
    standardCode: 'IS 302-2-14',
    clauseNumber: 'Clause 7.1',
    requirement: 'Appliance nameplate shall explicitly display rated voltage or voltage range in Volts (e.g., "230 V" or "220-240 V"), nature of supply symbol (~) or "50 Hz", and rated power input in Watts (W).',
    observed: 'Submitted specification datasheet mentions "Power: 750W", but the accompanying laser marking artwork drawing (Doc Ref: ART-MG-04) omits the voltage unit symbol and supply frequency ("230V ~ 50Hz").',
    recommendedAction: 'Revise nameplate engineering drawing to incorporate "230 V AC, 50 Hz, 750 W" adjacent to the ISI Mark placeholder before factory pre-audit.',
    status: 'fail',
    section: 'Required Markings'
  },
  {
    id: 'gap-2',
    title: 'Motor locked-rotor thermal overload trip test report not submitted',
    severity: 'CRITICAL',
    clauseCitation: 'IS 302-2-14 · Clause 19.11 (Amended 2022)',
    standardCode: 'IS 302-2-14',
    clauseNumber: 'Clause 19.11',
    requirement: 'Motor must undergo 30-second locked rotor abnormal operation test without winding insulation exceeding 150°C and thermal overload protector (TOP) must trip safely without flame.',
    observed: 'Uploaded in-house factory test summary (File: TR_2026_01.pdf) only includes routine high-voltage insulation test (1500V for 1 sec). Locked rotor thermal cycling test evidence is absent.',
    recommendedAction: 'Conduct locked-rotor trip endurance test on 3 production samples in accordance with Clause 19.11 and attach calibrated temperature-rise curve data.',
    status: 'fail',
    section: 'Safety Test Evidence'
  },
  {
    id: 'gap-3',
    title: 'Supply power cord certificate missing IS 694 mark verification',
    severity: 'ATTENTION',
    clauseCitation: 'IS 302-1 · Clause 25.7 & IS 694',
    standardCode: 'IS 302-1',
    clauseNumber: 'Clause 25.7',
    requirement: 'Flexible supply cord must be 3-core copper conductor of at least 0.75 mm² cross-section, certified under BIS Scheme I (IS 694 ISI marked) with valid vendor CM/L number.',
    observed: 'Bill of Materials (BOM) item #14 lists "3-core 0.75 mm² PVC Cord", but vendor test certificate lacks valid BIS licence number (CM/L XXXXXXX) and ISI mark stamp.',
    recommendedAction: 'Procure valid BIS Licensee test certificate from cord supplier (with active CM/L reference) or test incoming cord lot at BIS-recognized lab.',
    status: 'warning',
    section: 'Technical Documentation'
  },
  {
    id: 'gap-4',
    title: '3-Pin molded plug pin insulating sleeve documentation ambiguous',
    severity: 'ATTENTION',
    clauseCitation: 'IS 1293 · Clause 12.1',
    standardCode: 'IS 1293',
    clauseNumber: 'Clause 12.1',
    requirement: 'Fitted 6A 3-pin plug must comply with IS 1293:2019 with insulated live and neutral pin sleeves to prevent live finger contact.',
    observed: 'Product specification mentions "Fitted 3-pin 6A plug", but does not verify whether pin sleeves adhere to the mandatory 2019 revision dimension gauge.',
    recommendedAction: 'Provide dimensional drawing and Certificate of Conformity for the molded plug verifying compliance with IS 1293:2019 Table 1 gauge specifications.',
    status: 'warning',
    section: 'Product Scope'
  },
  {
    id: 'gap-5',
    title: 'Earthing continuity resistance test values missing from routine QC record',
    severity: 'ATTENTION',
    clauseCitation: 'IS 302-1 · Clause 27.5',
    standardCode: 'IS 302-1',
    clauseNumber: 'Clause 27.5',
    requirement: 'Earth resistance between accessible metal parts and earthing pin shall not exceed 0.1 Ω with a test current of 25 A passed for 1 second.',
    observed: 'Routine factory inspection sheet logs "Earth OK" (binary pass/fail) without recording quantitative resistance measurement in milliohms.',
    recommendedAction: 'Update QA inspection logs to record numerical resistance values (e.g. 0.04 Ω) using calibrated milliohmmeter for BIS factory audit compliance.',
    status: 'warning',
    section: 'Factory Information'
  },
  {
    id: 'gap-6',
    title: 'Product Scope & Class I classification properly documented',
    severity: 'READY',
    clauseCitation: 'IS 302-2-14 · Clause 1.1',
    standardCode: 'IS 302-2-14',
    clauseNumber: 'Clause 1.1',
    requirement: 'Appliance rated voltage 230V AC single phase, power rating 750W within the 250V / 1000W domestic threshold.',
    observed: 'Product description and schematics clearly confirm single-phase 230V domestic kitchen mixer grinder.',
    recommendedAction: 'No action required. Meets IS 302-2-14 scope definition.',
    status: 'pass',
    section: 'Product Scope'
  },
  {
    id: 'gap-7',
    title: 'High-voltage electric strength baseline verified (1500V AC)',
    severity: 'READY',
    clauseCitation: 'IS 302-1 · Clause 13.3',
    standardCode: 'IS 302-1',
    clauseNumber: 'Clause 13.3',
    requirement: '1500 V AC applied across live conductors and external chassis for 60 seconds without dielectric breakdown.',
    observed: 'Routine test sheet demonstrates zero breakdown at 1500 V AC with leakage current < 0.32 mA.',
    recommendedAction: 'Keep calibration records of flash tester up to date for auditor review.',
    status: 'pass',
    section: 'Safety Test Evidence'
  },
  {
    id: 'gap-8',
    title: 'Stainless steel jar food-contact material grade verified',
    severity: 'READY',
    clauseCitation: 'IS 302-2-14 · Clause 32 & IS 6911',
    standardCode: 'IS 302-2-14',
    clauseNumber: 'Clause 32',
    requirement: 'Materials coming in contact with food ingredients shall be corrosion resistant and non-toxic (SS 304 / food-grade polymer).',
    observed: 'Material test certificate submitted (AISI 304 stainless steel with spectral analysis certificate).',
    recommendedAction: 'Complies. Retain mill test certificate in technical construction file.',
    status: 'pass',
    section: 'Technical Documentation'
  },
  {
    id: 'gap-9',
    title: 'User instruction booklet safety warning clauses formatted properly',
    severity: 'READY',
    clauseCitation: 'IS 302-1 · Clause 7.12',
    standardCode: 'IS 302-1',
    clauseNumber: 'Clause 7.12',
    requirement: 'User manual contains standard cautionary text regarding unplugging before blade cleaning and cord replacement safety.',
    observed: 'Draft user manual (Doc: UM-MG-2026) includes all required safety warning paragraphs in English and Hindi.',
    recommendedAction: 'Complies. Ensure print production matches submitted draft.',
    status: 'pass',
    section: 'Technical Documentation'
  },
  {
    id: 'gap-10',
    title: 'Manufacturing plant manufacturing machinery and test equipment verified',
    severity: 'READY',
    clauseCitation: 'BIS Scheme I · STI (Scheme of Testing & Inspection)',
    standardCode: 'IS 302-2-14',
    clauseNumber: 'STI Clause 3',
    requirement: 'In-house test equipment for HV test, insulation resistance, earth continuity, leakage current, and locked-rotor fixture available.',
    observed: 'Plant machinery & QA laboratory equipment layout provided with valid calibration certificates from NABL lab.',
    recommendedAction: 'Ready for Stage 1 desktop audit by BIS inspecting officer.',
    status: 'pass',
    section: 'Factory Information'
  }
];

export const DEMO_EXTRACTED_FIELDS: ExtractedDocField[] = [
  { id: 'f-1', label: 'Product Name', value: 'Domestic Mixer Grinder 750W', confidence: 99, pageNumber: 1, boundingSnippet: 'PRODUCT SPECIFICATION: DOMESTIC ELECTRIC MIXER GRINDER (MODEL: NX-750 TURBO)', category: 'general' },
  { id: 'f-2', label: 'Rated Power Input', value: '750 Watts', confidence: 98, pageNumber: 1, boundingSnippet: 'Rated Power: 750 W at 230V nominal supply (Heavy Duty Copper Motor)', category: 'electrical' },
  { id: 'f-3', label: 'Operating Voltage', value: '230 V AC (Single Phase)', confidence: 98, pageNumber: 1, boundingSnippet: 'Electrical Input: 230 V AC ~ 50 Hz, Single Phase A.C.', category: 'electrical' },
  { id: 'f-4', label: 'Insulation Class', value: 'Class F (Double Insulated / Class I with Earth)', confidence: 94, pageNumber: 2, boundingSnippet: 'Motor Winding: Class F Copper wire with thermal overload switch rating 130°C', category: 'safety' },
  { id: 'f-5', label: 'Operating Speed (RPM)', value: '18,000 - 20,000 RPM (No Load)', confidence: 96, pageNumber: 2, boundingSnippet: 'Speed Control: 3 Speeds with Incher pulse, No-load RPM: 20,000 ± 5%', category: 'mechanical' },
  { id: 'f-6', label: 'Vessel / Jar Material', value: 'SS 304 Food Grade Stainless Steel', confidence: 97, pageNumber: 2, boundingSnippet: 'Jar Construction: 1.5L Wet Jar (SS 304), 1.0L Dry Jar (SS 304), 0.4L Chutney Jar (SS 304)', category: 'mechanical' },
  { id: 'f-7', label: 'Safety Overload Protection', value: 'Thermal Overload Protector (TOP 3.2A)', confidence: 93, pageNumber: 3, boundingSnippet: 'Circuit Protection: Automatic reset Thermal Overload Protector (Rating: 3.2A / 250V)', category: 'safety' },
  { id: 'f-8', label: 'Power Cord Specification', value: '3 x 0.75 mm² PVC Insulated Flexible Cord', confidence: 91, pageNumber: 3, boundingSnippet: 'Supply Lead: 1.8 meter, 3-core 0.75 sq.mm with molded 6A 3-pin plug', category: 'electrical' },
  { id: 'f-9', label: 'Ingress Protection', value: 'IPX0 (Normal Indoor Enclosure)', confidence: 89, pageNumber: 3, boundingSnippet: 'Water Ingress Rating: Ordinary appliance with drainage canal on motor base', category: 'safety' }
];

export const DEMO_LABORATORIES: LabCenter[] = [
  {
    id: 'lab-1',
    name: 'National Test House (WR), Mumbai',
    location: 'Plot No. F-10, MIDC, Andheri East, Mumbai, Maharashtra 400093',
    city: 'Mumbai',
    state: 'Maharashtra',
    recognizedFor: ['Household Electrical Appliances', 'Wires & Cables', 'Plugs & Sockets', 'Switchgear'],
    relevantIsCodes: ['IS 302-2-14', 'IS 302-1', 'IS 694', 'IS 1293', 'IS 3854'],
    recognitionStatus: 'ACTIVE',
    turnaroundDays: '7–10 Working Days',
    contact: '+91 22 2832 7701 · nth-mumbai@nic.in',
    sampleType: '2 Complete Appliance Samples + 2 Power Cords'
  },
  {
    id: 'lab-2',
    name: 'BIS Central Laboratory, Sahibabad',
    location: 'Plot No. 20/9, Site IV, Industrial Area, Sahibabad, Ghaziabad, UP 201010',
    city: 'Ghaziabad / Delhi NCR',
    state: 'Uttar Pradesh',
    recognizedFor: ['All Electrical Appliances', 'Mechanical Products', 'Chemical & Food', 'Metrology'],
    relevantIsCodes: ['IS 302-2-14', 'IS 302-1', 'IS 4151', 'IS 14543', 'IS 694'],
    recognitionStatus: 'ACTIVE',
    turnaroundDays: '5–8 Working Days',
    contact: '+91 120 417 8200 · cl@bis.gov.in',
    sampleType: '3 Production Units + Component Spares'
  },
  {
    id: 'lab-3',
    name: 'Electrical Research and Development Association (ERDA), Vadodara',
    location: 'ERDA Road, GIDC, Makarpura Industrial Estate, Vadodara, Gujarat 390010',
    city: 'Vadodara',
    state: 'Gujarat',
    recognizedFor: ['High Voltage & Motor Testing', 'Appliance Safety', 'Transformers & Motors', 'EMC/EMI'],
    relevantIsCodes: ['IS 302-2-14', 'IS 302-1', 'IS 12615', 'IS 9849'],
    recognitionStatus: 'ACTIVE',
    turnaroundDays: '10–12 Working Days',
    contact: '+91 265 304 3128 · info@erda.org',
    sampleType: '2 Units with Internal Temperature Sensors'
  },
  {
    id: 'lab-4',
    name: 'Central Power Research Institute (CPRI), Bengaluru',
    location: 'Prof. Sir C.V. Raman Road, Sadashivanagar, Bengaluru, Karnataka 560080',
    city: 'Bengaluru',
    state: 'Karnataka',
    recognizedFor: ['High Power Testing', 'Domestic Appliances', 'Battery Systems', 'Electronics'],
    relevantIsCodes: ['IS 302-2-14', 'IS 16046', 'IS 694', 'IS 302-1'],
    recognitionStatus: 'ACTIVE',
    turnaroundDays: '8–12 Working Days',
    contact: '+91 80 2207 2200 · cpri@nic.in',
    sampleType: '2 Complete Appliances'
  },
  {
    id: 'lab-5',
    name: 'National Test House (SR), Chennai',
    location: 'Tharamani, Chennai, Tamil Nadu 600113',
    city: 'Chennai',
    state: 'Tamil Nadu',
    recognizedFor: ['Kitchen Appliances', 'Packaging Materials', 'Chemicals', 'Metals'],
    relevantIsCodes: ['IS 302-2-14', 'IS 302-1', 'IS 14543', 'IS 6911'],
    recognitionStatus: 'ACTIVE',
    turnaroundDays: '6–9 Working Days',
    contact: '+91 44 2254 1157 · nth-chennai@gov.in',
    sampleType: '2 Appliances + Material Swatches'
  }
];

export const DEMO_CONSUMER_LICENCES = {
  'CM/L-8472910': {
    found: true,
    cmlNumber: 'CM/L-8472910',
    licenseeName: 'Prestige Consumer Appliances Pvt. Ltd.',
    factoryLocation: 'Plot 42, Hosur Industrial Complex, Tamil Nadu 635126',
    brandName: 'PRESTIGE / PRETHI',
    productName: 'Domestic Electric Food Mixer & Grinder',
    standardCode: 'IS 302-2-14',
    standardTitle: 'Safety of Household and Similar Electrical Appliances — Kitchen Machines',
    status: 'OPERATIVE (VALID)',
    validFrom: '15-Jan-2022',
    validUpto: '14-Jan-2027',
    scheme: 'Scheme I (ISI Mark)',
    markingsAuthorized: 'ISI Mark with CM/L number on rating plate'
  },
  'R-41029837': {
    found: true,
    cmlNumber: 'R-41029837',
    licenseeName: 'Samsung India Electronics Pvt. Ltd.',
    factoryLocation: 'Sector 81, Noida, Gautam Buddha Nagar, Uttar Pradesh 201305',
    brandName: 'SAMSUNG',
    productName: 'Secondary Lithium-ion Battery Pack',
    standardCode: 'IS 16046 (Part 2) : 2018 / IEC 62133-2 : 2017',
    standardTitle: 'Secondary cells and batteries containing alkaline electrolytes',
    status: 'OPERATIVE (VALID)',
    validFrom: '01-Aug-2023',
    validUpto: '31-Jul-2028',
    scheme: 'Scheme II (CRS)',
    markingsAuthorized: 'Standard Mark (CRS) with Registration Number R-41029837'
  },
  'HUID-KJ9482': {
    found: true,
    cmlNumber: 'HUID: KJ9482-9012',
    licenseeName: 'Tanishq Jewellers (Titan Company Ltd.)',
    factoryLocation: 'Assaying and Hallmarking Centre AHC-KA-004, Bengaluru',
    brandName: 'TANISHQ 22K916',
    productName: 'Gold Jewellery 22 Karat (91.6% Purity)',
    standardCode: 'IS 1417 : 2019',
    standardTitle: 'Gold and Gold Alloys, Jewellery/Artefacts — Fineness and Marking',
    status: 'VERIFIED GENUINE',
    validFrom: 'Assayed on 12-Feb-2026',
    validUpto: 'Perpetual Hallmarked Integrity',
    scheme: 'Hallmarking Scheme',
    markingsAuthorized: 'BIS Logo + 22K916 + 6-digit alphanumeric HUID (KJ9482)'
  }
};
