export const DOCUMENT_TYPES = {
    LEGAL_CORRESPONDENCE: 'legal-correspondence',
    COURT_ORDER: 'court-order',
    BACKGROUND_CHECKS: 'background-checks',
    MEDICAL_REPORTS: 'medical-reports',
    CAFCASS_REPORTS: 'cafcass-reports',
    HOME_STUDY_ASSESSMENT: 'home-study-assessment',
    CHILD_PERMANENCE_REPORT: 'child-permanence-report',
    PROSPECTIVE_ADOPTER_REPORT: 'prospective-adopter-report',
    MATCHING_REPORT: 'matching-report',
    PLACEMENT_PLAN: 'placement-plan',
    SUPPORT_PLAN: 'support-plan',
    CONTACT_ARRANGEMENTS: 'contact-arrangements',
    IDENTITY_DOCUMENTS: 'identity-documents',
    PHOTOGRAPHS: 'photographs',
    OTHER: 'other'
};
export const DOCUMENT_TYPE_LABELS = {
    [DOCUMENT_TYPES.LEGAL_CORRESPONDENCE]: 'Legal correspondence',
    [DOCUMENT_TYPES.COURT_ORDER]: 'Court order',
    [DOCUMENT_TYPES.BACKGROUND_CHECKS]: 'Background checks (DBS, references)',
    [DOCUMENT_TYPES.MEDICAL_REPORTS]: 'Medical reports',
    [DOCUMENT_TYPES.CAFCASS_REPORTS]: 'Cafcass reports',
    [DOCUMENT_TYPES.HOME_STUDY_ASSESSMENT]: 'Home study assessment',
    [DOCUMENT_TYPES.CHILD_PERMANENCE_REPORT]: 'Child permanence report',
    [DOCUMENT_TYPES.PROSPECTIVE_ADOPTER_REPORT]: 'Prospective adopter report',
    [DOCUMENT_TYPES.MATCHING_REPORT]: 'Matching report',
    [DOCUMENT_TYPES.PLACEMENT_PLAN]: 'Placement plan',
    [DOCUMENT_TYPES.SUPPORT_PLAN]: 'Support plan',
    [DOCUMENT_TYPES.CONTACT_ARRANGEMENTS]: 'Contact arrangements',
    [DOCUMENT_TYPES.IDENTITY_DOCUMENTS]: 'Identity documents',
    [DOCUMENT_TYPES.PHOTOGRAPHS]: 'Photographs',
    [DOCUMENT_TYPES.OTHER]: 'Other (please describe)'
};
export const DOCUMENT_TYPE_HELP_TEXT = {
    [DOCUMENT_TYPES.LEGAL_CORRESPONDENCE]: 'Letters and emails from legal representatives',
    [DOCUMENT_TYPES.COURT_ORDER]: 'Orders issued by the court',
    [DOCUMENT_TYPES.BACKGROUND_CHECKS]: 'DBS checks, references, and other background information',
    [DOCUMENT_TYPES.MEDICAL_REPORTS]: 'Medical assessments and reports',
    [DOCUMENT_TYPES.CAFCASS_REPORTS]: 'Reports from Cafcass officers',
    [DOCUMENT_TYPES.HOME_STUDY_ASSESSMENT]: 'Assessment of prospective adopters\' home',
    [DOCUMENT_TYPES.CHILD_PERMANENCE_REPORT]: 'Report detailing child\'s background and needs',
    [DOCUMENT_TYPES.PROSPECTIVE_ADOPTER_REPORT]: 'Report on prospective adopters',
    [DOCUMENT_TYPES.MATCHING_REPORT]: 'Report on matching child with adopters',
    [DOCUMENT_TYPES.PLACEMENT_PLAN]: 'Plan for child\'s placement',
    [DOCUMENT_TYPES.SUPPORT_PLAN]: 'Support services plan',
    [DOCUMENT_TYPES.CONTACT_ARRANGEMENTS]: 'Arrangements for contact with birth family',
    [DOCUMENT_TYPES.IDENTITY_DOCUMENTS]: 'Passports, birth certificates, etc.',
    [DOCUMENT_TYPES.PHOTOGRAPHS]: 'Photos of child, family, or events',
    [DOCUMENT_TYPES.OTHER]: 'Any other relevant document'
};
export const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/tiff'
];
export const ALLOWED_EXTENSIONS = [
    '.pdf',
    '.docx',
    '.doc',
    '.jpg',
    '.jpeg',
    '.png',
    '.tiff',
    '.tif'
];
export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_BULK_UPLOAD = 10;
export const DESCRIPTION_MAX_LENGTH = 500;
