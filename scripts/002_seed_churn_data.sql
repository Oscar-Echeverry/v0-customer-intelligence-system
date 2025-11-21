-- Seed churn clients data with Colombian companies

INSERT INTO churn_clients (name, monthly_investment, months_as_client, churn_probability, potential_loss) VALUES
('Inversiones Globales S.A.', 8500000, 24, 0.85, 204000000),
('Tecnología Avanzada Ltda', 6200000, 18, 0.78, 111600000),
('Servicios Financieros del Pacífico', 5800000, 36, 0.72, 208800000),
('Grupo Industrial del Norte', 4500000, 12, 0.88, 54000000),
('Comercializadora Internacional', 7100000, 28, 0.65, 198800000),
('Soluciones Empresariales Premium', 3200000, 8, 0.91, 25600000),
('Constructora del Valle', 5500000, 32, 0.58, 176000000),
('Retail y Consumo Masivo', 4800000, 16, 0.75, 76800000),
('Logística y Transporte S.A.S.', 3900000, 20, 0.69, 78000000),
('Energía Renovable Colombia', 6800000, 44, 0.42, 299200000),
('Telecomunicaciones Andinas', 9200000, 52, 0.38, 478400000),
('Agro Inversiones del Caribe', 2800000, 6, 0.94, 16800000),
('Farmacéutica Nacional', 5200000, 40, 0.45, 208000000),
('Consultoría Estratégica Global', 4100000, 14, 0.82, 57400000),
('Manufactura y Producción Industrial', 7500000, 48, 0.51, 360000000),
('Educación Superior Privada', 3600000, 22, 0.67, 79200000),
('Hotelería y Turismo Premium', 5900000, 30, 0.61, 177000000),
('Seguros y Reaseguros del Sur', 4400000, 26, 0.73, 114400000),
('Medios Digitales y Publicidad', 3100000, 10, 0.89, 31000000),
('Banca de Inversión Regional', 8900000, 38, 0.48, 338200000)
ON CONFLICT DO NOTHING;
