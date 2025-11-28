-- Add translation columns to company_services table
ALTER TABLE company_services 
ADD COLUMN IF NOT EXISTS title_translations JSONB,
ADD COLUMN IF NOT EXISTS description_translations JSONB;

-- Example: Update existing services with translations
-- Replace 'your-service-id' with actual service IDs
-- UPDATE company_services 
-- SET 
--   title_translations = '{"en": "Handling Of Cargo", "ru": "Обработка грузов", "pt": "Manuseio de Carga", "es": "Manejo de Carga", "fr": "Manutention de Cargaison", "de": "Frachtabfertigung", "it": "Gestione del Carico", "zh": "货物处理", "ja": "貨物の取り扱い", "ar": "معالجة البضائع"}'::jsonb,
--   description_translations = '{"en": "Work with a view to improving our infrastructure.", "ru": "Работа с целью улучшения нашей инфраструктуры.", "pt": "Trabalhar com o objetivo de melhorar nossa infraestrutura.", "es": "Trabajar con el objetivo de mejorar nuestra infraestructura.", "fr": "Travailler dans le but d'améliorer notre infrastructure.", "de": "Arbeiten mit dem Ziel, unsere Infrastruktur zu verbessern.", "it": "Lavorare con l'obiettivo di migliorare la nostra infrastruttura.", "zh": "致力于改善我们的基础设施。", "ja": "インフラストラクチャの改善を目指して取り組む。", "ar": "العمل بهدف تحسين بنيتنا التحتية."}'::jsonb
-- WHERE id = 'your-service-id';


