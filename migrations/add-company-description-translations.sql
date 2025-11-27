-- Add description_translations column to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS description_translations JSONB;

-- Example: Update existing company with translations
-- Replace 'YOUR-COMPANY-ID-HERE' with your actual company ID
-- UPDATE companies 
-- SET description_translations = '{
--   "en": "Mozambican public company responsible for managing and operating the country''s ports and railways. Its mission is to provide integrated and efficient logistical solutions for goods and passengers, contributing to the economic development of Mozambique and the wider region.",
--   "ru": "Мозамбикская государственная компания, ответственная за управление и эксплуатацию портов и железных дорог страны. Ее миссия - предоставление интегрированных и эффективных логистических решений для грузов и пассажиров, способствуя экономическому развитию Мозамбика и более широкого региона.",
--   "pt": "Empresa pública moçambicana responsável pela gestão e operação dos portos e ferrovias do país. Sua missão é fornecer soluções logísticas integradas e eficientes para mercadorias e passageiros, contribuindo para o desenvolvimento econômico de Moçambique e da região mais ampla.",
--   "es": "Empresa pública mozambiqueña responsable de gestionar y operar los puertos y ferrocarriles del país. Su misión es proporcionar soluciones logísticas integradas y eficientes para mercancías y pasajeros, contribuyendo al desarrollo económico de Mozambique y la región más amplia.",
--   "fr": "Entreprise publique mozambicaine responsable de la gestion et de l''exploitation des ports et chemins de fer du pays. Sa mission est de fournir des solutions logistiques intégrées et efficaces pour les marchandises et les passagers, contribuant au développement économique du Mozambique et de la région élargie.",
--   "de": "Mozambikanisches öffentliches Unternehmen, das für die Verwaltung und den Betrieb der Häfen und Eisenbahnen des Landes verantwortlich ist. Seine Mission ist es, integrierte und effiziente logistische Lösungen für Güter und Passagiere bereitzustellen und zur wirtschaftlichen Entwicklung Mosambiks und der weiteren Region beizutragen.",
--   "it": "Azienda pubblica mozambicana responsabile della gestione e del funzionamento dei porti e delle ferrovie del paese. La sua missione è fornire soluzioni logistiche integrate ed efficienti per merci e passeggeri, contribuendo allo sviluppo economico del Mozambico e della regione più ampia.",
--   "zh": "负责管理和运营该国港口和铁路的莫桑比克公共公司。其使命是为货物和乘客提供综合高效的物流解决方案，为莫桑比克和更广泛地区的经济发展做出贡献。",
--   "ja": "国の港と鉄道の管理と運営を担当するモザンビークの公共企業。その使命は、貨物と乗客のための統合された効率的な物流ソリューションを提供し、モザンビークとより広い地域の経済発展に貢献することです。",
--   "ar": "شركة موزمبيقية عامة مسؤولة عن إدارة وتشغيل موانئ وسكك الحديد في البلاد. مهمتها هي توفير حلول لوجستية متكاملة وفعالة للبضائع والركاب، مما يساهم في التنمية الاقتصادية لموزمبيق والمنطقة الأوسع."
-- }'::jsonb
-- WHERE id = 'YOUR-COMPANY-ID-HERE'::uuid;

