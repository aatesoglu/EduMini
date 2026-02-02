const { Course, Announcement } = require('../models');

// Helper to format date to YYYY-MM-DD
const formatDate = (d) => {
  if (!d) return new Date().toISOString().split('T')[0];
  return new Date(d).toISOString().split('T')[0];
};

exports.getSitemap = async (req, res, next) => {
  try {
    // Prefer explicit FRONTEND_URL if set (e.g. http://localhost:5173)
    // Otherwise prefer proxy headers (x-forwarded-host / x-forwarded-proto) if present
    // Fall back to request host (which will usually be backend host like localhost:5000)
    const forwardedHost = req.headers['x-forwarded-host'];
    const forwardedProto = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = process.env.FRONTEND_URL || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : `${req.protocol}://${req.get('host')}`);

    // Static frontend routes to include
    const staticPaths = ['/', '/courses', '/login', '/register', '/contact', '/profile', '/payment'];

    // Fetch published courses
    const courses = await Course.findAll({
      where: { isPublished: true },
      attributes: ['id', 'slug', 'updatedAt']
    });

    let urls = [];

    // Add static urls
    for (const p of staticPaths) {
      urls.push({ loc: `${baseUrl}${p}`, lastmod: formatDate() });
    }

    // Add courses
    for (const c of courses) {
      // Use id-based path because frontend uses /courses/:id
      const path = `/courses/${c.id}`;
      urls.push({ loc: `${baseUrl}${path}`, lastmod: formatDate(c.updatedAt) });
    }

    // Add announcements listing and each active announcement (if any)
    const announcements = await Announcement.findAll({ where: { active: true }, attributes: ['id', 'updatedAt'] });
    if (announcements && announcements.length > 0) {
      // Add listing page
      urls.push({ loc: `${baseUrl}/announcements`, lastmod: formatDate() });
      for (const a of announcements) {
        const apath = `/announcements/${a.id}`;
        urls.push({ loc: `${baseUrl}${apath}`, lastmod: formatDate(a.updatedAt) });
      }
    }

    // Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const u of urls) {
      xml += `  <url>\n`;
      xml += `    <loc>${u.loc}</loc>\n`;
      if (u.lastmod) xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (err) {
    next(err);
  }
};
