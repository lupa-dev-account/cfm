-- Add footer_text_translations column to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS footer_text_translations JSONB;

-- Example: Update existing company with footer text translations
-- Replace 'YOUR-COMPANY-ID-HERE' with your actual company ID
-- UPDATE companies 
-- SET footer_text_translations = '{
--   "en": "PORTS AND RAILWAYS OF MOZAMBIQUE, E.P.",
--   "pt": "PORTOS E CAMINHOS DE FERRO DE MOÇAMBIQUE, E.P.",
--   "es": "PUERTOS Y FERROCARRILES DE MOZAMBIQUE, E.P.",
--   "fr": "PORTS ET CHEMINS DE FER DU MOZAMBIQUE, E.P.",
--   "de": "HÄFEN UND EISENBAHNEN VON MOSAMBIK, E.P.",
--   "it": "PORTI E FERROVIE DEL MOZAMBICO, E.P.",
--   "ru": "ПОРТЫ И ЖЕЛЕЗНЫЕ ДОРОГИ МОЗАМБИКА, E.P.",
--   "zh": "莫桑比克港口和铁路, E.P.",
--   "ja": "モザンビークの港と鉄道, E.P.",
--   "ar": "موانئ وسكك حديد موزمبيق، E.P."
-- }'::jsonb
-- WHERE id = 'YOUR-COMPANY-ID-HERE';

