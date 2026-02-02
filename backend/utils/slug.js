const slugify = require('slugify');

/**
 * Kurs başlığından URL dostu bir slug üretir.
 * Aynı başlıktan birden fazla kurs üretildiğinde
 * benzersizliği sağlamak için dışarıdan ek suffix verilebilir.
 *
 * Not: Burada sadece temel slugify işlemi yapıyoruz.
 * Benzersizliği sağlayan kontrol Course modelinin içinde kalıyor.
 */
function generateSlug(title) {
    if (!title) return null;

    return slugify(title, {
        lower: true,
        strict: true,
    });
}

module.exports = {
    generateSlug,
};


