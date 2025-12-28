-- Seed glossary terms
INSERT INTO glossary_terms (term, definition, eli5_analogy, category) VALUES
('IHSG', 'Indeks Harga Saham Gabungan', 'Nilai rata-rata semua saham di BEI, kayak nilai rapor kelas', 'general'),
('ARA', 'Auto Reject Atas', 'Batas naik maksimal harga saham per hari, biar gak gila-gilaan', 'general'),
('ARB', 'Auto Reject Bawah', 'Batas turun maksimal, perlindungan biar gak anjlok seketika', 'general'),
('Lot', '1 Lot = 100 lembar saham', 'Paket minimal beli saham, kayak beli gorengan minimal 1 bungkus', 'general'),
('PER', 'Price to Earnings Ratio', 'Berapa tahun balik modal dari laba. Makin kecil makin cepet balik modal', 'fundamental'),
('PBV', 'Price to Book Value', 'Harga saham dibanding nilai bukunya. Kayak beli barang second, mahal atau murah dari harga asli', 'fundamental'),
('ROE', 'Return on Equity', 'Seberapa jago perusahaan pake duit investor buat cari untung', 'fundamental'),
('DER', 'Debt to Equity Ratio', 'Perbandingan utang vs modal. Makin kecil makin sehat', 'fundamental'),
('Dividen', 'Pembagian laba ke pemegang saham', 'Bonus tahunan buat pemilik saham, kayak THR', 'fundamental'),
('Blue Chip', 'Saham perusahaan besar & stabil', 'Saham pemain utama, kayak pemain bintang di klub bola', 'general')
ON CONFLICT (term) DO NOTHING;
